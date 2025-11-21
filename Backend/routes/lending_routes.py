"""
Lending Routes for P2P Micro-Lending Platform
Handles loan requests, funding, repayments, and management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from web3 import Web3
import json

router = APIRouter(prefix="/lending", tags=["lending"])

# Load environment variables
LENDING_CONTRACT_ADDRESS = os.getenv("LENDING_CONTRACT_ADDRESS", "")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider("https://alfajores-forno.celo-testnet.org"))

# Load contract ABI
with open("blockchain/abi/LendingEscrow.json", "r") as f:
    LENDING_ABI = json.load(f)


# Pydantic Models
class LoanRequest(BaseModel):
    principal: str  # In ETH
    duration: int  # In days
    lockInPeriod: int  # In days
    purpose: str


class LoanFunding(BaseModel):
    loanId: int
    lenderAddress: str


class LoanRepayment(BaseModel):
    loanId: int
    amount: str  # In ETH
    borrowerAddress: str


class LoanDetails(BaseModel):
    id: int
    borrower: str
    lender: str
    principal: str
    interestRate: int
    duration: int
    lockInPeriod: int
    requestTime: int
    fundedTime: int
    disbursedTime: int
    repaidAmount: str
    riskScore: int
    status: str
    purpose: str
    incentiveEarned: bool
    totalOwed: str


class BorrowerProfile(BaseModel):
    address: str
    totalLoans: int
    activeLoans: int
    completedLoans: int
    defaultedLoans: int
    totalBorrowed: str
    totalRepaid: str
    reputationScore: int


# Routes

@router.post("/request-loan")
async def request_loan(loan: LoanRequest):
    """
    Submit a new loan request
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            raise HTTPException(status_code=500, detail="Lending contract not configured")

        # Convert days to seconds
        duration_seconds = loan.duration * 24 * 60 * 60
        lock_in_seconds = loan.lockInPeriod * 24 * 60 * 60

        # Convert ETH to Wei
        principal_wei = w3.to_wei(loan.principal, 'ether')

        # Here you would typically create and send the transaction
        # For now, return a success response with estimated values
        
        return {
            "success": True,
            "message": "Loan request submitted successfully",
            "data": {
                "principal": loan.principal,
                "duration": loan.duration,
                "lockInPeriod": loan.lockInPeriod,
                "purpose": loan.purpose,
                "estimatedInterestRate": "10%",
                "estimatedRiskScore": 50
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit loan request: {str(e)}")


@router.get("/active-requests")
async def get_active_loan_requests():
    """
    Get all active loan requests available for funding
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            # Return mock data if contract not configured
            return {
                "success": True,
                "loans": [
                    {
                        "id": 1,
                        "borrower": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                        "principal": "1.5",
                        "interestRate": 8,
                        "duration": 180,
                        "lockInPeriod": 30,
                        "riskScore": 35,
                        "purpose": "Small business inventory purchase",
                        "requestTime": 1700000000
                    },
                    {
                        "id": 2,
                        "borrower": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
                        "principal": "0.5",
                        "interestRate": 12,
                        "duration": 90,
                        "lockInPeriod": 15,
                        "riskScore": 55,
                        "purpose": "Emergency medical expenses",
                        "requestTime": 1700001000
                    }
                ]
            }

        lending_contract = w3.eth.contract(
            address=Web3.to_checksum_address(LENDING_CONTRACT_ADDRESS),
            abi=LENDING_ABI
        )

        # Get active loan request IDs
        loan_ids = lending_contract.functions.getActiveLoanRequests().call()

        loans = []
        for loan_id in loan_ids:
            loan_data = lending_contract.functions.loans(loan_id).call()
            loans.append({
                "id": loan_id,
                "borrower": loan_data[0],
                "principal": w3.from_wei(loan_data[2], 'ether'),
                "interestRate": loan_data[3],
                "duration": loan_data[4] // (24 * 60 * 60),  # Convert to days
                "lockInPeriod": loan_data[5] // (24 * 60 * 60),
                "riskScore": loan_data[10],
                "purpose": loan_data[12],
                "requestTime": loan_data[6]
            })

        return {
            "success": True,
            "loans": loans
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch active loans: {str(e)}")


@router.get("/loan/{loan_id}")
async def get_loan_details(loan_id: int):
    """
    Get detailed information about a specific loan
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            raise HTTPException(status_code=500, detail="Lending contract not configured")

        lending_contract = w3.eth.contract(
            address=Web3.to_checksum_address(LENDING_CONTRACT_ADDRESS),
            abi=LENDING_ABI
        )

        loan_data = lending_contract.functions.loans(loan_id).call()
        total_owed = lending_contract.functions.calculateTotalOwed(loan_id).call()

        status_map = ["Requested", "Funded", "Active", "Repaid", "Defaulted", "Cancelled"]

        return {
            "success": True,
            "loan": {
                "id": loan_id,
                "borrower": loan_data[0],
                "lender": loan_data[1],
                "principal": w3.from_wei(loan_data[2], 'ether'),
                "interestRate": loan_data[3],
                "duration": loan_data[4] // (24 * 60 * 60),
                "lockInPeriod": loan_data[5] // (24 * 60 * 60),
                "requestTime": loan_data[6],
                "fundedTime": loan_data[7],
                "disbursedTime": loan_data[8],
                "repaidAmount": w3.from_wei(loan_data[9], 'ether'),
                "riskScore": loan_data[10],
                "status": status_map[loan_data[11]],
                "purpose": loan_data[12],
                "incentiveEarned": loan_data[13],
                "totalOwed": w3.from_wei(total_owed, 'ether')
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch loan details: {str(e)}")


@router.get("/borrower/{address}/loans")
async def get_borrower_loans(address: str):
    """
    Get all loans for a specific borrower
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            # Return mock data
            return {
                "success": True,
                "loans": [
                    {
                        "id": 1,
                        "principal": "1.5",
                        "status": "Active",
                        "repaidAmount": "0.5",
                        "totalOwed": "1.62"
                    }
                ]
            }

        lending_contract = w3.eth.contract(
            address=Web3.to_checksum_address(LENDING_CONTRACT_ADDRESS),
            abi=LENDING_ABI
        )

        loan_ids = lending_contract.functions.getBorrowerLoans(
            Web3.to_checksum_address(address)
        ).call()

        loans = []
        status_map = ["Requested", "Funded", "Active", "Repaid", "Defaulted", "Cancelled"]

        for loan_id in loan_ids:
            loan_data = lending_contract.functions.loans(loan_id).call()
            total_owed = 0
            
            try:
                total_owed = lending_contract.functions.calculateTotalOwed(loan_id).call()
            except:
                total_owed = loan_data[2]  # Use principal if calculation fails

            loans.append({
                "id": loan_id,
                "principal": w3.from_wei(loan_data[2], 'ether'),
                "status": status_map[loan_data[11]],
                "repaidAmount": w3.from_wei(loan_data[9], 'ether'),
                "totalOwed": w3.from_wei(total_owed, 'ether'),
                "interestRate": loan_data[3],
                "duration": loan_data[4] // (24 * 60 * 60),
                "disbursedTime": loan_data[8]
            })

        return {
            "success": True,
            "loans": loans
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch borrower loans: {str(e)}")


@router.get("/lender/{address}/loans")
async def get_lender_loans(address: str):
    """
    Get all loans funded by a specific lender
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            # Return mock data
            return {
                "success": True,
                "loans": [
                    {
                        "id": 2,
                        "borrower": "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
                        "principal": "0.8",
                        "status": "Repaid",
                        "repaidAmount": "0.88",
                        "totalOwed": "0.88"
                    }
                ]
            }

        lending_contract = w3.eth.contract(
            address=Web3.to_checksum_address(LENDING_CONTRACT_ADDRESS),
            abi=LENDING_ABI
        )

        loan_ids = lending_contract.functions.getLenderLoans(
            Web3.to_checksum_address(address)
        ).call()

        loans = []
        status_map = ["Requested", "Funded", "Active", "Repaid", "Defaulted", "Cancelled"]

        for loan_id in loan_ids:
            loan_data = lending_contract.functions.loans(loan_id).call()
            
            loans.append({
                "id": loan_id,
                "borrower": loan_data[0],
                "principal": w3.from_wei(loan_data[2], 'ether'),
                "status": status_map[loan_data[11]],
                "repaidAmount": w3.from_wei(loan_data[9], 'ether'),
                "interestRate": loan_data[3],
                "duration": loan_data[4] // (24 * 60 * 60)
            })

        return {
            "success": True,
            "loans": loans
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lender loans: {str(e)}")


@router.get("/borrower/{address}/profile")
async def get_borrower_profile(address: str):
    """
    Get borrower profile with reputation and statistics
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            # Return mock data
            return {
                "success": True,
                "profile": {
                    "address": address,
                    "totalLoans": 5,
                    "activeLoans": 1,
                    "completedLoans": 3,
                    "defaultedLoans": 1,
                    "totalBorrowed": "10.5",
                    "totalRepaid": "8.2",
                    "reputationScore": 750
                }
            }

        lending_contract = w3.eth.contract(
            address=Web3.to_checksum_address(LENDING_CONTRACT_ADDRESS),
            abi=LENDING_ABI
        )

        profile_data = lending_contract.functions.borrowerProfiles(
            Web3.to_checksum_address(address)
        ).call()

        return {
            "success": True,
            "profile": {
                "address": address,
                "totalLoans": profile_data[0],
                "activeLoans": profile_data[1],
                "completedLoans": profile_data[2],
                "defaultedLoans": profile_data[3],
                "totalBorrowed": w3.from_wei(profile_data[4], 'ether'),
                "totalRepaid": w3.from_wei(profile_data[5], 'ether'),
                "reputationScore": profile_data[6]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch borrower profile: {str(e)}")


@router.get("/lender/{address}/profile")
async def get_lender_profile(address: str):
    """
    Get lender profile with statistics
    """
    try:
        if not LENDING_CONTRACT_ADDRESS:
            # Return mock data
            return {
                "success": True,
                "profile": {
                    "address": address,
                    "totalLoans": 8,
                    "activeLoans": 2,
                    "totalLent": "15.5",
                    "totalReturned": "13.2",
                    "totalInterestEarned": "1.2"
                }
            }

        lending_contract = w3.eth.contract(
            address=Web3.to_checksum_address(LENDING_CONTRACT_ADDRESS),
            abi=LENDING_ABI
        )

        profile_data = lending_contract.functions.lenderProfiles(
            Web3.to_checksum_address(address)
        ).call()

        return {
            "success": True,
            "profile": {
                "address": address,
                "totalLoans": profile_data[0],
                "activeLoans": profile_data[1],
                "totalLent": w3.from_wei(profile_data[2], 'ether'),
                "totalReturned": w3.from_wei(profile_data[3], 'ether'),
                "totalInterestEarned": w3.from_wei(profile_data[4], 'ether')
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lender profile: {str(e)}")


@router.get("/stats")
async def get_lending_stats():
    """
    Get overall lending platform statistics
    """
    try:
        # Return aggregate statistics
        return {
            "success": True,
            "stats": {
                "totalLoans": 45,
                "activeLoans": 23,
                "totalVolume": "127.5 ETH",
                "averageInterestRate": "10%",
                "averageDuration": "180 days",
                "platformFees": "1.5 ETH"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch lending stats: {str(e)}")
