# 🚀 P2P Lending Platform Deployment Guide

This guide walks through deploying the P2P micro-lending platform on Celo blockchain.

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- MetaMask browser extension
- Celo Alfajores testnet CELO tokens
- Git

## 🔧 1. Environment Setup

### Backend Environment Variables

Create `.env` file in the `Backend` directory:

```bash
# Celo Network
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://alfajores-forno.celo-testnet.org

# Contract Addresses (update after deployment)
LENDING_CONTRACT_ADDRESS=
DAO_CONTRACT=0x8db40a9d69cA368Df80A4966C082a4FD3F16802A
TREASURY_CONTRACT_ADDRESS=0x597B72F9A9782bb2A4c67910b3A5260CC253783b

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### Solidity Environment Variables

Create `.env` file in the `Solidity` directory:

```bash
PRIVATE_KEY=your_wallet_private_key
```

## 📦 2. Install Dependencies

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd Backend
pip install -r requirements.txt
```

### Smart Contracts

```bash
cd Solidity
npm install
```

## 🏗️ 3. Deploy Smart Contracts

### Compile Contracts

```bash
cd Solidity
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

Expected output: All tests should pass ✅

### Deploy to Alfajores Testnet

```bash
npx hardhat run scripts/deploy.js --network alfajores
```

Expected output:
```
Deploying contracts with account: 0x...
Treasury deployed to: 0x...
EchoDAO deployed to: 0x...
✅ Ownership transferred successfully.
LendingEscrow deployed to: 0x...
```

**Important:** Copy the `LendingEscrow` contract address and update it in:
1. `Backend/.env` → `LENDING_CONTRACT_ADDRESS`
2. `frontend/src/config/api.ts` (if exists)

### Verify Contracts on Celoscan

```bash
npx hardhat verify --network alfajores <LENDING_CONTRACT_ADDRESS>
```

## 🖥️ 4. Start Backend Server

```bash
cd Backend
uvicorn app:app --reload
```

Backend will be available at `http://localhost:8000`

Test the API:
```bash
curl http://localhost:8000/lending/stats
```

## 🎨 5. Start Frontend

### Development Mode

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🔗 6. Configure MetaMask

### Add Celo Alfajores Testnet

1. Open MetaMask
2. Click Networks → Add Network
3. Enter details:
   - **Network Name:** Celo Alfajores Testnet
   - **RPC URL:** https://alfajores-forno.celo-testnet.org
   - **Chain ID:** 44787 (0xaef3)
   - **Currency Symbol:** CELO
   - **Block Explorer:** https://alfajores.celoscan.io/

### Get Test CELO

Visit [Celo Faucet](https://faucet.celo.org/) and request test CELO tokens.

## 🧪 7. Test the Platform

### Test Loan Request Flow

1. Navigate to http://localhost:5173/borrow
2. Connect your wallet
3. Fill out the loan request form:
   - Amount: 1.0 ETH
   - Duration: 180 days
   - Lock-in Period: 30 days
   - Purpose: "Business expansion"
4. Submit the request
5. Confirm transaction in MetaMask

### Test Loan Funding Flow

1. Use a different MetaMask account
2. Navigate to http://localhost:5173/lend
3. Browse active loan requests
4. Click "Fund Loan" on a request
5. Confirm transaction in MetaMask

### Test Loan Repayment Flow

1. Switch back to borrower account
2. Navigate to http://localhost:5173/loan-dashboard
3. Select "Borrowed Loans" tab
4. Click "Make Payment" on an active loan
5. Enter repayment amount
6. Confirm transaction in MetaMask

## 📊 8. Monitor Transactions

View all transactions on [Celoscan Alfajores](https://alfajores.celoscan.io/):

- Search by your wallet address
- View contract interactions
- Check gas fees and status

## 🔍 9. Verify Integration

### Check Backend Endpoints

```bash
# Get active loan requests
curl http://localhost:8000/lending/active-requests

# Get borrower profile
curl http://localhost:8000/lending/borrower/0xYOUR_ADDRESS/profile

# Get platform stats
curl http://localhost:8000/lending/stats
```

### Check Smart Contract Functions

Using Hardhat console:

```bash
npx hardhat console --network alfajores
```

```javascript
const LendingEscrow = await ethers.getContractFactory("LendingEscrow");
const lending = await LendingEscrow.attach("LENDING_CONTRACT_ADDRESS");

// Check next loan ID
await lending.nextLoanId();

// Get active loan requests
await lending.getActiveLoanRequests();

// Get platform fees
await lending.totalPlatformFees();
```

## 🚨 10. Troubleshooting

### Smart Contract Deployment Fails

- **Error:** "insufficient funds"
  - **Solution:** Get more test CELO from faucet
  
- **Error:** "nonce too low"
  - **Solution:** Reset MetaMask account or wait for pending transactions

### Frontend Cannot Connect to Contract

- **Solution:** Verify contract address is correctly set in backend `.env`
- **Solution:** Check MetaMask is on Alfajores network

### Backend API Errors

- **Error:** "Contract not configured"
  - **Solution:** Update `LENDING_CONTRACT_ADDRESS` in Backend/.env

- **Error:** "Cannot read properties of undefined"
  - **Solution:** Verify Web3 provider is connecting to correct RPC URL

### Transaction Fails

- **Error:** "execution reverted"
  - **Solution:** Check contract state (e.g., loan already funded, insufficient balance)
  
- **Error:** "gas estimation failed"
  - **Solution:** Increase gas limit or check if function conditions are met

## 📈 11. Mainnet Deployment Checklist

Before deploying to Celo mainnet:

- [ ] Complete security audit of smart contracts
- [ ] Test all user flows on testnet
- [ ] Verify gas optimization
- [ ] Set up monitoring and alerts
- [ ] Prepare emergency pause mechanism
- [ ] Test with real CELO (small amounts first)
- [ ] Update frontend with mainnet contract addresses
- [ ] Update documentation
- [ ] Prepare announcement and user guide

## 🔐 12. Security Best Practices

1. **Never commit private keys** to version control
2. **Use hardware wallet** for mainnet deployment
3. **Implement timelock** for critical functions
4. **Set up multi-sig wallet** for contract ownership
5. **Monitor contract events** in real-time
6. **Have emergency response plan** ready
7. **Regular security audits** of smart contracts
8. **Rate limit API endpoints** to prevent abuse
9. **Implement circuit breakers** for unusual activity
10. **Keep dependencies updated** and patched

## 📚 13. Additional Resources

- [Celo Documentation](https://docs.celo.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Celoscan Explorer](https://alfajores.celoscan.io/)

## 🆘 14. Support

For issues and questions:

1. Check [GitHub Issues](https://github.com/soumyadeepsarkar-2004/Echo_DAO/issues)
2. Review this deployment guide
3. Check contract events on Celoscan
4. Verify all environment variables are set correctly
5. Test in isolation (backend, frontend, contracts separately)

## 🎉 Success!

If you've completed all steps, you should have:

✅ Smart contracts deployed on Celo Alfajores
✅ Backend API running and connected to contracts
✅ Frontend application accessible and functional
✅ MetaMask connected to Alfajores network
✅ Able to request loans, fund loans, and repay loans
✅ Transactions visible on Celoscan

**Congratulations! Your P2P lending platform is live! 🚀**
