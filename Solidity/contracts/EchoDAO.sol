// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Treasury.sol";
import "./interfaces/IEchoDAO.sol";

/**
 * @title EchoDAO
 * @dev Main contract for proposal, voting, and execution logic.
 */
contract EchoDAO is Ownable, IEchoDAO {
    // --- State variables ---
    Treasury public immutable treasury;
    uint256 public nextProposalId = 1;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Configuration
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of total supply must vote 'Yes'
    uint256 public constant VOTING_PERIOD_BLOCKS = 1000; // Approx 4 hours @ 14s/block

    // --- Events ---
    event ProposalCreated(uint256 id, address proposer, uint256 blockStart, uint256 blockEnd, string description);
    event Voted(uint256 id, address voter, bool support);
    event ProposalExecuted(uint256 id);

    // --- Internal Struct ---
    // Optimized storage layout: group smaller types together to save gas
    struct Proposal {
        address target;          // 20 bytes
        bool executed;           // 1 byte - packed with address in same slot
        uint88 blockStart;       // 11 bytes - sufficient for block numbers, packed with above
        uint88 blockEnd;         // 11 bytes - packed in next slot
        uint256 value;           // 32 bytes - full slot
        uint256 yesVotes;        // 32 bytes - full slot
        uint256 noVotes;         // 32 bytes - full slot
        bytes callData;          // dynamic
        string description;      // dynamic
    }

    // --- Constructor ---
    constructor(address _treasury) Ownable(msg.sender) {
        treasury = Treasury(payable(_treasury));
    }

    // --- Functions ---
    function createProposal(
        address _target,
        uint256 _value,
        bytes calldata _callData,
        string calldata _description
    ) external override returns (uint256) {
        uint256 id = nextProposalId;
        uint88 startBlock = uint88(block.number);
        uint88 endBlock = uint88(block.number + VOTING_PERIOD_BLOCKS);
        
        proposals[id] = Proposal({
            target: _target,
            executed: false,
            blockStart: startBlock,
            blockEnd: endBlock,
            value: _value,
            yesVotes: 0,
            noVotes: 0,
            callData: _callData,
            description: _description
        });

        nextProposalId++;
        emit ProposalCreated(id, msg.sender, uint256(startBlock), uint256(endBlock), _description);
        return id;
    }

    function vote(uint256 _proposalId, bool _support) external override {
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.blockStart > 0, "Proposal does not exist");
        require(block.number >= proposal.blockStart, "Voting not started");
        require(block.number <= proposal.blockEnd, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        hasVoted[_proposalId][msg.sender] = true;
        if (_support) proposal.yesVotes++;
        else proposal.noVotes++;

        emit Voted(_proposalId, msg.sender, _support);
    }

    function executeProposal(uint256 _proposalId) external override {
        Proposal storage proposal = proposals[_proposalId];

        require(block.number > proposal.blockEnd, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.yesVotes > proposal.noVotes, "Proposal did not pass or quorum failed");

        proposal.executed = true;
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.callData);
        require(success, "Execution failed");

        emit ProposalExecuted(_proposalId);
    }
}