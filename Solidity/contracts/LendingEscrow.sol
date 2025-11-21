// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LendingEscrow
 * @dev P2P micro-lending platform with escrow, interest, incentives, and penalties
 */
contract LendingEscrow is Ownable, ReentrancyGuard {
    // --- Constants ---
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 1; // 1% platform fee
    uint256 public constant BASE_INTEREST_RATE = 5; // 5% base annual interest
    uint256 public constant EARLY_REPAYMENT_DISCOUNT = 10; // 10% discount on interest
    uint256 public constant LATE_PAYMENT_PENALTY = 15; // 15% penalty for late payment
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // --- State Variables ---
    uint256 public nextLoanId = 1;
    uint256 public totalPlatformFees;
    
    // --- Enums ---
    enum LoanStatus {
        Requested,      // Borrower created request
        Funded,         // Lender funded the loan
        Active,         // Loan disbursed to borrower
        Repaid,         // Fully repaid with interest
        Defaulted,      // Borrower defaulted
        Cancelled       // Cancelled before funding
    }
    
    // --- Structs ---
    struct Loan {
        address borrower;
        address lender;
        uint256 principal;          // Loan amount
        uint256 interestRate;       // Annual interest rate (percentage)
        uint256 duration;           // Loan duration in seconds
        uint256 lockInPeriod;       // Lock-in period before early repayment allowed
        uint256 requestTime;        // When loan was requested
        uint256 fundedTime;         // When loan was funded
        uint256 disbursedTime;      // When loan was disbursed to borrower
        uint256 repaidAmount;       // Amount repaid so far
        uint256 riskScore;          // Risk score (0-100, lower is better)
        LoanStatus status;
        string purpose;             // Loan purpose description
        bool incentiveEarned;       // Whether borrower earned early repayment incentive
    }
    
    struct BorrowerProfile {
        uint256 totalLoans;
        uint256 activeLoans;
        uint256 completedLoans;
        uint256 defaultedLoans;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 reputationScore;    // 0-1000, higher is better
    }
    
    struct LenderProfile {
        uint256 totalLoans;
        uint256 activeLoans;
        uint256 totalLent;
        uint256 totalReturned;
        uint256 totalInterestEarned;
    }
    
    // --- Mappings ---
    mapping(uint256 => Loan) public loans;
    mapping(address => BorrowerProfile) public borrowerProfiles;
    mapping(address => LenderProfile) public lenderProfiles;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    
    // --- Events ---
    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 interestRate,
        uint256 duration,
        uint256 riskScore
    );
    
    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );
    
    event LoanDisbursed(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );
    
    event LoanRepayment(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 totalRepaid
    );
    
    event LoanFullyRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 totalAmount,
        bool incentiveEarned
    );
    
    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 outstandingAmount
    );
    
    event LoanCancelled(
        uint256 indexed loanId,
        address indexed borrower
    );
    
    // --- Constructor ---
    constructor() Ownable(msg.sender) {}
    
    // --- Core Functions ---
    
    /**
     * @dev Borrower requests a loan
     */
    function requestLoan(
        uint256 _principal,
        uint256 _duration,
        uint256 _lockInPeriod,
        string calldata _purpose
    ) external returns (uint256) {
        require(_principal > 0, "Principal must be positive");
        require(_duration > 0, "Duration must be positive");
        require(_lockInPeriod <= _duration, "Lock-in cannot exceed duration");
        
        uint256 loanId = nextLoanId++;
        uint256 riskScore = _calculateRiskScore(msg.sender);
        uint256 interestRate = _calculateInterestRate(riskScore);
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            principal: _principal,
            interestRate: interestRate,
            duration: _duration,
            lockInPeriod: _lockInPeriod,
            requestTime: block.timestamp,
            fundedTime: 0,
            disbursedTime: 0,
            repaidAmount: 0,
            riskScore: riskScore,
            status: LoanStatus.Requested,
            purpose: _purpose,
            incentiveEarned: false
        });
        
        borrowerLoans[msg.sender].push(loanId);
        borrowerProfiles[msg.sender].totalLoans++;
        
        emit LoanRequested(loanId, msg.sender, _principal, interestRate, _duration, riskScore);
        return loanId;
    }
    
    /**
     * @dev Lender funds a loan request
     */
    function fundLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Requested, "Loan not available for funding");
        require(msg.value == loan.principal, "Must send exact principal amount");
        require(msg.sender != loan.borrower, "Cannot fund own loan");
        
        loan.lender = msg.sender;
        loan.fundedTime = block.timestamp;
        loan.status = LoanStatus.Funded;
        
        lenderLoans[msg.sender].push(_loanId);
        lenderProfiles[msg.sender].totalLoans++;
        lenderProfiles[msg.sender].activeLoans++;
        lenderProfiles[msg.sender].totalLent += loan.principal;
        
        emit LoanFunded(_loanId, msg.sender, msg.value);
        
        // Automatically disburse to borrower
        _disburseLoan(_loanId);
    }
    
    /**
     * @dev Internal function to disburse loan to borrower
     */
    function _disburseLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Funded, "Loan not funded");
        
        // Calculate and deduct platform fee
        uint256 platformFee = (loan.principal * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 amountToBorrower = loan.principal - platformFee;
        
        totalPlatformFees += platformFee;
        
        loan.disbursedTime = block.timestamp;
        loan.status = LoanStatus.Active;
        
        borrowerProfiles[loan.borrower].activeLoans++;
        borrowerProfiles[loan.borrower].totalBorrowed += loan.principal;
        
        // Transfer to borrower
        (bool success, ) = loan.borrower.call{value: amountToBorrower}("");
        require(success, "Transfer to borrower failed");
        
        emit LoanDisbursed(_loanId, loan.borrower, amountToBorrower);
    }
    
    /**
     * @dev Borrower repays loan (partial or full)
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(msg.value > 0, "Repayment amount must be positive");
        
        uint256 totalOwed = calculateTotalOwed(_loanId);
        uint256 remainingOwed = totalOwed - loan.repaidAmount;
        require(msg.value <= remainingOwed, "Repayment exceeds amount owed");
        
        loan.repaidAmount += msg.value;
        
        emit LoanRepayment(_loanId, msg.sender, msg.value, loan.repaidAmount);
        
        // Check if loan is fully repaid
        if (loan.repaidAmount >= totalOwed) {
            _completeLoanRepayment(_loanId);
        }
    }
    
    /**
     * @dev Complete loan repayment and transfer to lender
     */
    function _completeLoanRepayment(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        
        // Check for early repayment incentive
        uint256 lockInEnd = loan.disbursedTime + loan.lockInPeriod;
        uint256 durationEnd = loan.disbursedTime + loan.duration;
        
        if (block.timestamp < lockInEnd) {
            // Repaid during lock-in period - incentive earned
            loan.incentiveEarned = true;
        }
        
        loan.status = LoanStatus.Repaid;
        
        // Update profiles
        borrowerProfiles[loan.borrower].activeLoans--;
        borrowerProfiles[loan.borrower].completedLoans++;
        borrowerProfiles[loan.borrower].totalRepaid += loan.repaidAmount;
        borrowerProfiles[loan.borrower].reputationScore += 10; // Increase reputation
        
        lenderProfiles[loan.lender].activeLoans--;
        lenderProfiles[loan.lender].totalReturned += loan.repaidAmount;
        
        uint256 interestEarned = loan.repaidAmount - loan.principal;
        lenderProfiles[loan.lender].totalInterestEarned += interestEarned;
        
        // Transfer repaid amount to lender
        (bool success, ) = loan.lender.call{value: loan.repaidAmount}("");
        require(success, "Transfer to lender failed");
        
        emit LoanFullyRepaid(_loanId, loan.borrower, loan.repaidAmount, loan.incentiveEarned);
    }
    
    /**
     * @dev Mark loan as defaulted (callable by lender or owner after duration)
     */
    function markAsDefaulted(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(
            msg.sender == loan.lender || msg.sender == owner(),
            "Only lender or owner can mark as defaulted"
        );
        
        uint256 deadline = loan.disbursedTime + loan.duration;
        require(block.timestamp > deadline, "Loan duration not expired");
        
        uint256 totalOwed = calculateTotalOwed(_loanId);
        uint256 remainingOwed = totalOwed - loan.repaidAmount;
        
        loan.status = LoanStatus.Defaulted;
        
        // Update profiles
        borrowerProfiles[loan.borrower].activeLoans--;
        borrowerProfiles[loan.borrower].defaultedLoans++;
        borrowerProfiles[loan.borrower].reputationScore = 
            borrowerProfiles[loan.borrower].reputationScore > 50 ? 
            borrowerProfiles[loan.borrower].reputationScore - 50 : 0;
        
        lenderProfiles[loan.lender].activeLoans--;
        
        // If any partial repayment, transfer to lender
        if (loan.repaidAmount > 0) {
            lenderProfiles[loan.lender].totalReturned += loan.repaidAmount;
            (bool success, ) = loan.lender.call{value: loan.repaidAmount}("");
            require(success, "Transfer to lender failed");
        }
        
        emit LoanDefaulted(_loanId, loan.borrower, remainingOwed);
    }
    
    /**
     * @dev Borrower cancels loan request before funding
     */
    function cancelLoanRequest(uint256 _loanId) external {
        Loan storage loan = loans[_loanId];
        require(msg.sender == loan.borrower, "Only borrower can cancel");
        require(loan.status == LoanStatus.Requested, "Can only cancel unfunded loans");
        
        loan.status = LoanStatus.Cancelled;
        borrowerProfiles[loan.borrower].totalLoans--;
        
        emit LoanCancelled(_loanId, msg.sender);
    }
    
    // --- View Functions ---
    
    /**
     * @dev Calculate total amount owed (principal + interest + penalties)
     */
    function calculateTotalOwed(uint256 _loanId) public view returns (uint256) {
        Loan storage loan = loans[_loanId];
        require(loan.status != LoanStatus.Requested && loan.status != LoanStatus.Cancelled, "Loan not active");
        
        // Calculate base interest
        uint256 timeElapsed = block.timestamp - loan.disbursedTime;
        uint256 baseInterest = (loan.principal * loan.interestRate * timeElapsed) / (100 * SECONDS_PER_YEAR);
        
        uint256 totalOwed = loan.principal + baseInterest;
        
        // Apply early repayment discount if within lock-in period
        uint256 lockInEnd = loan.disbursedTime + loan.lockInPeriod;
        if (block.timestamp < lockInEnd && loan.status == LoanStatus.Active) {
            uint256 discount = (baseInterest * EARLY_REPAYMENT_DISCOUNT) / 100;
            totalOwed -= discount;
        }
        
        // Apply late payment penalty if past duration
        uint256 durationEnd = loan.disbursedTime + loan.duration;
        if (block.timestamp > durationEnd && loan.status == LoanStatus.Active) {
            uint256 penalty = (loan.principal * LATE_PAYMENT_PENALTY) / 100;
            totalOwed += penalty;
        }
        
        return totalOwed;
    }
    
    /**
     * @dev Calculate risk score for borrower (0-100, lower is better)
     */
    function _calculateRiskScore(address _borrower) internal view returns (uint256) {
        BorrowerProfile storage profile = borrowerProfiles[_borrower];
        
        // New borrower gets median risk score
        if (profile.totalLoans == 0) {
            return 50;
        }
        
        // Calculate based on history
        uint256 defaultRate = (profile.defaultedLoans * 100) / profile.totalLoans;
        uint256 completionRate = (profile.completedLoans * 100) / profile.totalLoans;
        
        // Risk score: higher default rate = higher risk, higher completion rate = lower risk
        uint256 riskScore = defaultRate + (100 - completionRate);
        
        // Factor in reputation score (0-1000)
        if (profile.reputationScore > 500) {
            riskScore = riskScore > 20 ? riskScore - 20 : 0;
        }
        
        return riskScore > 100 ? 100 : riskScore;
    }
    
    /**
     * @dev Calculate interest rate based on risk score
     */
    function _calculateInterestRate(uint256 _riskScore) internal pure returns (uint256) {
        // Base rate 5% + risk-adjusted rate (0-10%)
        uint256 riskPremium = (_riskScore * 10) / 100;
        return BASE_INTEREST_RATE + riskPremium;
    }
    
    /**
     * @dev Get borrower's loan IDs
     */
    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }
    
    /**
     * @dev Get lender's loan IDs
     */
    function getLenderLoans(address _lender) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }
    
    /**
     * @dev Get all active loan requests available for funding
     */
    function getActiveLoanRequests() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Count active requests
        for (uint256 i = 1; i < nextLoanId; i++) {
            if (loans[i].status == LoanStatus.Requested) {
                count++;
            }
        }
        
        // Populate array
        uint256[] memory activeLoanIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextLoanId; i++) {
            if (loans[i].status == LoanStatus.Requested) {
                activeLoanIds[index] = i;
                index++;
            }
        }
        
        return activeLoanIds;
    }
    
    /**
     * @dev Owner withdraws platform fees
     */
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No fees to withdraw");
        
        totalPlatformFees = 0;
        
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Fee withdrawal failed");
    }
    
    /**
     * @dev Fallback to receive ETH
     */
    receive() external payable {}
}
