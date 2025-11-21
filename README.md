# <img src="frontend/public/assets/EchoDao_Logo.png" alt="EchoDAO Logo" width="50" style="vertical-align: middle;"/> EchoDAO

> **Decentralized Governance Powered by Blockchain, AI, and Community**

A revolutionary DAO platform built on Celo blockchain that combines on-chain governance, AI-powered content verification, and decentralized storage to enable transparent, democratic decision-making.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Celo](https://img.shields.io/badge/Blockchain-Celo-brightgreen)](https://celo.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)](https://fastapi.tiangolo.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636)](https://soliditylang.org/)

---

## 🎯 Overview

**EchoDAO** is a revolutionary P2P micro-lending platform that combines decentralized governance with smart lending infrastructure. Built on Celo blockchain, it enables borrowers to request small loans while lenders fund them with transparent terms. An Ethereum escrow contract manages loan release, interest calculations, lock-in periods, incentives, and penalties—building trust and enabling financial access for the unbanked.

### ✨ Key Features

#### 💸 P2P Micro-Lending
- 🏦 **Smart Loan Requests** - Borrowers request loans with transparent terms
- 💰 **Lender Marketplace** - Browse and fund loans with competitive returns
- 🔒 **Escrow Management** - Automated loan disbursement and repayment handling
- 📈 **Interest Calculation** - Dynamic interest rates based on risk scores
- ⏰ **Lock-in Periods** - Early repayment incentives (10% discount)
- ⚠️ **Penalty System** - Late payment penalties (15%) for accountability
- 🎯 **Risk Scoring** - Transparent risk assessment (0-100 scale)
- 📊 **User Dashboards** - Track borrowed and lent loans in real-time
- 📅 **Loan Timelines** - Visual progress tracking and deadline monitoring
- 🌟 **Reputation System** - Build trust through successful repayments

#### 🗳️ DAO Governance
- 🗳️ **On-Chain Governance** - Create proposals, vote, and execute decisions entirely on the blockchain
- 🤖 **AI Verification** - BART-CNN model verifies content authenticity and generates summaries
- 📁 **IPFS Storage** - Decentralized, censorship-resistant storage via Pinata
- 💰 **Treasury Management** - Secure, transparent fund allocation controlled by the DAO
- 🎨 **Cosmic UI** - Beautiful, responsive interface with Space Grotesk typography and orbital animations
- 🆓 **First Proposal Free** - New users get their first proposal creation at 0 CELO fee
- 📊 **Real-Time Analytics** - Live voting progress, treasury balance, and proposal history

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │  ← Cosmic UI, MetaMask Integration
│  (Vite + TypeScript)│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   FastAPI Backend   │  ← AI Models, IPFS, Web3 Integration
│   (Python + ML)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Celo Blockchain    │  ← Smart Contracts (EchoDAO + Treasury)
│  (Alfajores Testnet)│
└─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MetaMask** browser extension
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SaptarshiMondal123/celo-demo.git
cd celo-demo
```

### 2️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 3️⃣ Setup Backend

```bash
cd Backend
pip install -r requirements.txt

# Create .env file with required variables
echo "PINATA_API_KEY=your_pinata_api_key" > .env
echo "PINATA_SECRET_KEY=your_pinata_secret_key" >> .env
echo "PRIVATE_KEY=your_wallet_private_key" >> .env
echo "DAO_CONTRACT=0x8db40a9d69cA368Df80A4966C082a4FD3F16802A" >> .env
echo "TREASURY_CONTRACT_ADDRESS=0x597B72F9A9782bb2A4c67910b3A5260CC253783b" >> .env

# Start the server
uvicorn app:app --reload
```

Backend will be available at `http://localhost:8000`

### 4️⃣ Setup Smart Contracts (Optional - Already Deployed)

```bash
cd Solidity
npm install

# Create .env file
echo "PRIVATE_KEY=your_wallet_private_key" > .env

# Deploy contracts (if needed)
npx hardhat run scripts/deploy.js --network alfajores
```

### 5️⃣ Configure MetaMask

1. Add **Celo Alfajores Testnet**:
   - Network Name: `Celo Alfajores Testnet`
   - RPC URL: `https://alfajores-forno.celo-testnet.org`
   - Chain ID: `44787` (0xaef3)
   - Currency: `CELO`
   - Block Explorer: `https://alfajores.celoscan.io/`

2. Get test CELO from [Celo Faucet](https://faucet.celo.org/)

---

## 📖 Usage Guide

### 🏦 P2P Lending Platform

#### Requesting a Loan (Borrowers)

1. **Connect Wallet** - Click "Connect Wallet" in the header
2. Navigate to **Lending → Request Loan** from the menu
3. **Fill Loan Details:**
   - Loan Amount (0.1 - 10 ETH)
   - Duration (30, 90, 180, or 365 days)
   - Lock-in Period (0-60 days for early repayment discount)
   - Purpose (description of loan use)
4. **Review Estimated Terms:**
   - Interest rate based on your risk score
   - Total repayment amount
   - Early repayment discount available
5. **Submit Request** - Confirm transaction in MetaMask
6. **Wait for Funding** - Lenders will review and fund your request
7. **Receive Funds** - Funds automatically transferred to your wallet (minus 1% platform fee)

#### Funding Loans (Lenders)

1. **Connect Wallet** - Ensure you have CELO in your wallet
2. Navigate to **Lending → Fund Loans** from the menu
3. **Browse Loan Requests:**
   - Filter by risk level (Low/Medium/High)
   - Review borrower details and risk scores
   - Check interest rates and expected returns
4. **Select a Loan:**
   - Click on a loan to view full details
   - Analyze borrower's reputation score
   - Review loan purpose
5. **Fund the Loan:**
   - Click "Fund Loan"
   - Confirm transaction in MetaMask
   - Loan automatically disbursed to borrower
6. **Earn Interest** - Receive principal + interest when loan is repaid

#### Managing Loans

1. Navigate to **Lending → Loan Dashboard**
2. **Borrowed Loans Tab:**
   - View all your active and completed loans
   - See repayment progress bars
   - Make partial or full repayments
   - Track time remaining
   - View reputation score
3. **Lent Loans Tab:**
   - Monitor loans you've funded
   - Track repayment status
   - View interest earned
   - See borrower repayment history

#### Understanding Risk Scores

- **Risk Score (0-100):** Lower is better
  - 0-30: Low Risk (Green) - Reliable borrowers
  - 30-60: Medium Risk (Yellow) - Average borrowers
  - 60-100: High Risk (Red) - Higher default probability

- **Reputation Score (0-1000):** Higher is better
  - Increases with successful repayments (+10 per loan)
  - Decreases with defaults (-50 per default)
  - Affects future interest rates

#### Interest & Fees

- **Base Interest Rate:** 5% annually
- **Risk Premium:** 0-10% based on risk score
- **Early Repayment Discount:** 10% off interest if repaid within lock-in period
- **Late Payment Penalty:** 15% on principal if overdue
- **Platform Fee:** 1% deducted from loan disbursement

### 🗳️ DAO Governance

#### Creating a Proposal

1. **Connect Wallet** - Click "Connect Wallet" in the header
2. **Upload Report** (Optional) - Submit a file for AI verification
3. **Create Proposal** - Fill in:
   - Title
   - Description (can auto-fill from AI summary)
   - Amount (in CELO)
   - Recipient Address
4. **Submit** - First proposal is FREE, subsequent proposals cost 0.01 CELO
5. **Wait for Voting** - Proposal is active for ~1000 blocks (~4 hours)

#### Voting on Proposals

1. Navigate to **Active Proposals** page
2. Browse available proposals with AI-generated summaries
3. Click **Vote Yes** or **Vote No**
4. Confirm transaction in MetaMask
5. Vote is recorded on-chain immediately

#### Executing Proposals

1. Navigate to **Fund Redistribution** page
2. View pending proposals that have passed voting
3. Click **Execute** on approved proposals
4. Treasury automatically transfers funds to recipient
5. Proposal moves to **Executed** status

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router DOM** - Client-side routing
- **Lucide Icons** - Beautiful icon set

### Backend
- **FastAPI** - Modern Python web framework
- **Web3.py** - Ethereum/Celo blockchain interaction
- **Transformers** - Hugging Face AI models
- **PyTorch** - Machine learning framework
- **Pinata** - IPFS file storage

### Blockchain
- **Solidity 0.8.x** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Celo** - Mobile-first blockchain

### AI/ML
- **BART-CNN** - Content verification model
- **Summarization Models** - Automatic text summarization

---

## 📂 Project Structure

```
EchoDAO/
├── frontend/                 # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── config/          # API client configuration
│   │   └── index.css        # Global styles
│   └── package.json
│
├── Backend/                 # FastAPI Python Backend
│   ├── app.py              # Main FastAPI app
│   ├── routes/             # API route handlers
│   ├── ai/                 # AI/ML models
│   ├── blockchain/         # Web3 integration
│   ├── storage/            # IPFS handlers
│   └── utils/              # Helper utilities
│
├── Solidity/               # Smart Contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js
│
└── README.md
```

---

## 🔗 Smart Contracts

### LendingEscrow Contract
**Core lending platform contract managing P2P micro-loans**

**Key Functions:**
- `requestLoan(uint256 principal, uint256 duration, uint256 lockInPeriod, string purpose)` - Request a new loan
- `fundLoan(uint256 loanId)` - Fund a loan request as a lender
- `repayLoan(uint256 loanId)` - Make loan repayment (partial or full)
- `markAsDefaulted(uint256 loanId)` - Mark overdue loan as defaulted
- `calculateTotalOwed(uint256 loanId)` - Calculate total amount owed including interest/penalties
- `getBorrowerLoans(address borrower)` - Get all loans for a borrower
- `getLenderLoans(address lender)` - Get all loans for a lender
- `getActiveLoanRequests()` - Get all available loan requests

**Features:**
- 1% platform fee on loan disbursement
- 5% base interest rate + risk-adjusted premium
- 10% discount for early repayment within lock-in period
- 15% penalty for late payment after loan duration
- Transparent risk scoring (0-100)
- Reputation system for borrowers (0-1000)

### EchoDAO Contract
- **Address**: `0x8db40a9d69cA368Df80A4966C082a4FD3F16802A`
- **Network**: Celo Alfajores Testnet
- **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0x8db40a9d69cA368Df80A4966C082a4FD3F16802A)

**Key Functions:**
- `createProposal(address target, uint256 value, bytes callData, string description)` - Create new proposal
- `vote(uint256 proposalId, bool support)` - Cast vote (true = Yes, false = No)
- `executeProposal(uint256 proposalId)` - Execute approved proposal

### Treasury Contract
- **Address**: `0x597B72F9A9782bb2A4c67910b3A5260CC253783b`
- **Network**: Celo Alfajores Testnet
- **Explorer**: [View on Celoscan](https://alfajores.celoscan.io/address/0x597B72F9A9782bb2A4c67910b3A5260CC253783b)

**Key Functions:**
- `transfer(address to, uint256 amount)` - Transfer funds (DAO-controlled)
- `getBalance()` - Get treasury balance

---

## 🌐 API Endpoints

### Reports
- `POST /reports/submit` - Upload file to IPFS and verify with AI
- `POST /reports/verify-ai` - Verify content authenticity

### Proposals
- `POST /proposals/create` - Create new governance proposal
- `POST /proposals/vote` - Cast vote on proposal
- `POST /proposals/execute/{id}` - Execute approved proposal
- `GET /proposals/list` - Get all proposals (batch optimized)
- `GET /proposals/{id}` - Get proposal details
- `GET /proposals/check-limit/{address}` - Check user's daily limit

### Funds
- `GET /funds/treasury-balance` - Get treasury CELO balance
- `GET /funds/treasury-info` - Get treasury contract information
- `GET /funds/proposal-status/{id}` - Get proposal funding status

---

## 🎨 Design System

### Colors
- **Primary**: Cyan (#06b6d4) → Indigo (#6366f1) → Purple (#8b5cf6)
- **Background**: Deep Space (#0d0628)
- **Accents**: Blue, Pink, Orange

### Typography
- **Display**: Space Grotesk (Headings)
- **Body**: Inter (Paragraphs)
- **Style**: Gradient text, tight tracking

### Components
- **Buttons**: 5 variants (primary, secondary, ghost, success, danger)
- **Cards**: Glassmorphism with cosmic glow
- **Animations**: Orbital rings, pulse effects, cursor splash

---

## 🔐 Security

- ✅ **Smart Contract Audited** - OpenZeppelin battle-tested libraries
- ✅ **No Double Voting** - On-chain vote tracking
- ✅ **Execution Protection** - Proposals can't be executed twice
- ✅ **Treasury Security** - Only DAO can authorize transfers
- ✅ **CORS Protected** - Controlled API access
- ✅ **Environment Secrets** - Sensitive data in .env files

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run lint
npm run build  # Verify production build
```

### Backend Tests
```bash
cd Backend
pytest
```

### Smart Contract Tests
```bash
cd Solidity
npx hardhat test
```

---

## 📊 Governance Rules

- **Voting Period**: 1000 blocks (~4 hours on Celo)
- **Quorum**: 4% of total votes must be "Yes"
- **Execution**: Automatic after voting period if proposal passes
- **Proposal Limit**: 3 proposals per day per user
- **First Proposal**: FREE for new users
- **Subsequent Proposals**: 0.01 CELO minimum fee

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Celo Foundation** - For the amazing blockchain infrastructure
- **OpenZeppelin** - For secure smart contract libraries
- **Pinata** - For reliable IPFS storage
- **Hugging Face** - For powerful AI models
- **Cosmos** - For design inspiration

---

## 📞 Contact & Links

- **Repository**: [github.com/SaptarshiMondal123/celo-demo](https://github.com/SaptarshiMondal123/celo-demo)
- **Live Demo**: [Coming Soon]
- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/SaptarshiMondal123/celo-demo/issues)

## Team Members
- Saptarshi Mondal
- Sekh Yajuddin
- Soumyadeep Sarkar

---

## 🚀 Roadmap

### Completed ✅
- ✅ **P2P Lending Platform** - Smart contracts for borrowing and lending
- ✅ **Risk Scoring System** - Transparent risk assessment
- ✅ **Interest & Penalties** - Automated calculations
- ✅ **User Dashboards** - Track loans and reputation
- ✅ **Loan Timelines** - Visual progress tracking
- ✅ **Escrow Management** - Secure fund handling

### In Progress 🚧
- 🚧 **Mainnet Deployment** - Deploy to Celo mainnet
- 🚧 **Multi-signature Treasury** - Enhanced security for loan pool
- 🚧 **Delegation Voting** - Delegate voting power for loan approvals
- 🚧 **Advanced Analytics Dashboard** - Detailed insights and metrics
- 🚧 **NFT-based Membership** - Tiered membership with benefits
- 🚧 **Cross-chain Governance** - Multi-chain support

### Future Plans 🔮
- [ ] Credit score integration with external oracles
- [ ] Collateralized loans
- [ ] Loan insurance pool
- [ ] Mobile app (iOS & Android)
- [ ] Loan marketplace with secondary trading
- [ ] Integration with DeFi protocols

---

<div align="center">

**Built with ❤️ for the decentralized future**

⭐ Star this repo if you find it useful!

</div>
