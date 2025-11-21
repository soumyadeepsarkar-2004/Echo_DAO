const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LendingEscrow", function () {
    let LendingEscrow;
    let lendingEscrow;
    let owner;
    let borrower;
    let lender;
    let addr1;

    const ONE_ETH = ethers.parseEther("1.0");
    const HALF_ETH = ethers.parseEther("0.5");
    const ONE_YEAR = 365 * 24 * 60 * 60; // seconds
    const ONE_MONTH = 30 * 24 * 60 * 60; // seconds

    beforeEach(async function () {
        [owner, borrower, lender, addr1] = await ethers.getSigners();

        LendingEscrow = await ethers.getContractFactory("LendingEscrow");
        lendingEscrow = await LendingEscrow.deploy();
    });

    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await lendingEscrow.owner()).to.equal(owner.address);
        });

        it("Should initialize nextLoanId to 1", async function () {
            expect(await lendingEscrow.nextLoanId()).to.equal(1);
        });
    });

    describe("Loan Request", function () {
        it("Should allow borrower to request a loan", async function () {
            const tx = await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );

            await expect(tx)
                .to.emit(lendingEscrow, "LoanRequested")
                .withArgs(1, borrower.address, ONE_ETH, 55, ONE_YEAR, 50);

            const loan = await lendingEscrow.loans(1);
            expect(loan.borrower).to.equal(borrower.address);
            expect(loan.principal).to.equal(ONE_ETH);
            expect(loan.status).to.equal(0); // Requested
        });

        it("Should reject loan request with zero principal", async function () {
            await expect(
                lendingEscrow.connect(borrower).requestLoan(
                    0,
                    ONE_YEAR,
                    ONE_MONTH,
                    "Test loan"
                )
            ).to.be.revertedWith("Principal must be positive");
        });

        it("Should reject loan request with zero duration", async function () {
            await expect(
                lendingEscrow.connect(borrower).requestLoan(
                    ONE_ETH,
                    0,
                    ONE_MONTH,
                    "Test loan"
                )
            ).to.be.revertedWith("Duration must be positive");
        });

        it("Should reject loan request with lock-in exceeding duration", async function () {
            await expect(
                lendingEscrow.connect(borrower).requestLoan(
                    ONE_ETH,
                    ONE_MONTH,
                    ONE_YEAR,
                    "Test loan"
                )
            ).to.be.revertedWith("Lock-in cannot exceed duration");
        });

        it("Should update borrower profile", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Test loan"
            );

            const profile = await lendingEscrow.borrowerProfiles(borrower.address);
            expect(profile.totalLoans).to.equal(1);
        });
    });

    describe("Loan Funding", function () {
        let loanId;

        beforeEach(async function () {
            const tx = await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );
            const receipt = await tx.wait();
            loanId = 1;
        });

        it("Should allow lender to fund a loan", async function () {
            const tx = await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });

            await expect(tx)
                .to.emit(lendingEscrow, "LoanFunded")
                .withArgs(loanId, lender.address, ONE_ETH);

            const loan = await lendingEscrow.loans(loanId);
            expect(loan.lender).to.equal(lender.address);
            expect(loan.status).to.equal(2); // Active
        });

        it("Should automatically disburse loan to borrower after funding", async function () {
            const borrowerBalanceBefore = await ethers.provider.getBalance(borrower.address);

            await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });

            const borrowerBalanceAfter = await ethers.provider.getBalance(borrower.address);
            const platformFee = ONE_ETH * BigInt(1) / BigInt(100); // 1% fee
            const expectedAmount = ONE_ETH - platformFee;

            expect(borrowerBalanceAfter - borrowerBalanceBefore).to.equal(expectedAmount);
        });

        it("Should reject funding with incorrect amount", async function () {
            await expect(
                lendingEscrow.connect(lender).fundLoan(loanId, {
                    value: HALF_ETH
                })
            ).to.be.revertedWith("Must send exact principal amount");
        });

        it("Should reject borrower funding their own loan", async function () {
            await expect(
                lendingEscrow.connect(borrower).fundLoan(loanId, {
                    value: ONE_ETH
                })
            ).to.be.revertedWith("Cannot fund own loan");
        });

        it("Should update lender profile", async function () {
            await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });

            const profile = await lendingEscrow.lenderProfiles(lender.address);
            expect(profile.totalLoans).to.equal(1);
            expect(profile.activeLoans).to.equal(1);
            expect(profile.totalLent).to.equal(ONE_ETH);
        });
    });

    describe("Loan Repayment", function () {
        let loanId;

        beforeEach(async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );
            loanId = 1;

            await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });
        });

        it("Should allow borrower to make partial repayment", async function () {
            const repaymentAmount = HALF_ETH;

            const tx = await lendingEscrow.connect(borrower).repayLoan(loanId, {
                value: repaymentAmount
            });

            await expect(tx)
                .to.emit(lendingEscrow, "LoanRepayment")
                .withArgs(loanId, borrower.address, repaymentAmount, repaymentAmount);

            const loan = await lendingEscrow.loans(loanId);
            expect(loan.repaidAmount).to.equal(repaymentAmount);
            expect(loan.status).to.equal(2); // Still Active
        });

        it("Should allow borrower to repay full loan", async function () {
            // Fast forward time to accrue some interest
            await time.increase(ONE_MONTH);

            const totalOwed = await lendingEscrow.calculateTotalOwed(loanId);

            const tx = await lendingEscrow.connect(borrower).repayLoan(loanId, {
                value: totalOwed
            });

            await expect(tx)
                .to.emit(lendingEscrow, "LoanFullyRepaid");

            const loan = await lendingEscrow.loans(loanId);
            expect(loan.status).to.equal(3); // Repaid
        });

        it("Should grant early repayment incentive", async function () {
            // Repay within lock-in period
            const totalOwed = await lendingEscrow.calculateTotalOwed(loanId);

            await lendingEscrow.connect(borrower).repayLoan(loanId, {
                value: totalOwed
            });

            const loan = await lendingEscrow.loans(loanId);
            expect(loan.incentiveEarned).to.equal(true);
        });

        it("Should update borrower reputation on successful repayment", async function () {
            const totalOwed = await lendingEscrow.calculateTotalOwed(loanId);

            await lendingEscrow.connect(borrower).repayLoan(loanId, {
                value: totalOwed
            });

            const profile = await lendingEscrow.borrowerProfiles(borrower.address);
            expect(profile.completedLoans).to.equal(1);
            expect(profile.reputationScore).to.equal(10);
        });

        it("Should transfer repaid amount to lender", async function () {
            const totalOwed = await lendingEscrow.calculateTotalOwed(loanId);
            const lenderBalanceBefore = await ethers.provider.getBalance(lender.address);

            await lendingEscrow.connect(borrower).repayLoan(loanId, {
                value: totalOwed
            });

            const lenderBalanceAfter = await ethers.provider.getBalance(lender.address);
            expect(lenderBalanceAfter - lenderBalanceBefore).to.equal(totalOwed);
        });

        it("Should reject repayment from non-borrower", async function () {
            await expect(
                lendingEscrow.connect(addr1).repayLoan(loanId, {
                    value: HALF_ETH
                })
            ).to.be.revertedWith("Only borrower can repay");
        });
    });

    describe("Interest Calculation", function () {
        let loanId;

        beforeEach(async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );
            loanId = 1;

            await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });
        });

        it("Should calculate interest correctly over time", async function () {
            await time.increase(ONE_YEAR / 2); // 6 months

            const totalOwed = await lendingEscrow.calculateTotalOwed(loanId);
            const loan = await lendingEscrow.loans(loanId);

            // Expected: principal + (principal * rate * time / 100 / year)
            // With 5.5% rate and 6 months: 1 ETH + (1 * 5.5 * 0.5) = 1.0275 ETH
            expect(totalOwed).to.be.gt(ONE_ETH);
        });

        it("Should apply early repayment discount within lock-in", async function () {
            const immediateOwed = await lendingEscrow.calculateTotalOwed(loanId);

            // Should have minimal interest but with discount
            expect(immediateOwed).to.be.closeTo(ONE_ETH, HALF_ETH);
        });

        it("Should apply late payment penalty after duration", async function () {
            await time.increase(ONE_YEAR + 1);

            const totalOwed = await lendingEscrow.calculateTotalOwed(loanId);
            const loan = await lendingEscrow.loans(loanId);

            // Should include 15% penalty on principal
            const penalty = ONE_ETH * BigInt(15) / BigInt(100);
            expect(totalOwed).to.be.gt(ONE_ETH + penalty);
        });
    });

    describe("Default Handling", function () {
        let loanId;

        beforeEach(async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_MONTH,
                0,
                "Short term loan"
            );
            loanId = 1;

            await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });
        });

        it("Should allow marking loan as defaulted after duration", async function () {
            await time.increase(ONE_MONTH + 1);

            const tx = await lendingEscrow.connect(lender).markAsDefaulted(loanId);

            await expect(tx)
                .to.emit(lendingEscrow, "LoanDefaulted");

            const loan = await lendingEscrow.loans(loanId);
            expect(loan.status).to.equal(4); // Defaulted
        });

        it("Should penalize borrower reputation on default", async function () {
            await time.increase(ONE_MONTH + 1);

            await lendingEscrow.connect(lender).markAsDefaulted(loanId);

            const profile = await lendingEscrow.borrowerProfiles(borrower.address);
            expect(profile.defaultedLoans).to.equal(1);
        });

        it("Should not allow marking as defaulted before duration expires", async function () {
            await expect(
                lendingEscrow.connect(lender).markAsDefaulted(loanId)
            ).to.be.revertedWith("Loan duration not expired");
        });

        it("Should only allow lender or owner to mark as defaulted", async function () {
            await time.increase(ONE_MONTH + 1);

            await expect(
                lendingEscrow.connect(addr1).markAsDefaulted(loanId)
            ).to.be.revertedWith("Only lender or owner can mark as defaulted");
        });
    });

    describe("Loan Cancellation", function () {
        let loanId;

        beforeEach(async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );
            loanId = 1;
        });

        it("Should allow borrower to cancel unfunded loan", async function () {
            const tx = await lendingEscrow.connect(borrower).cancelLoanRequest(loanId);

            await expect(tx)
                .to.emit(lendingEscrow, "LoanCancelled")
                .withArgs(loanId, borrower.address);

            const loan = await lendingEscrow.loans(loanId);
            expect(loan.status).to.equal(5); // Cancelled
        });

        it("Should not allow cancelling funded loan", async function () {
            await lendingEscrow.connect(lender).fundLoan(loanId, {
                value: ONE_ETH
            });

            await expect(
                lendingEscrow.connect(borrower).cancelLoanRequest(loanId)
            ).to.be.revertedWith("Can only cancel unfunded loans");
        });

        it("Should only allow borrower to cancel", async function () {
            await expect(
                lendingEscrow.connect(addr1).cancelLoanRequest(loanId)
            ).to.be.revertedWith("Only borrower can cancel");
        });
    });

    describe("Risk Score and Interest Rate", function () {
        it("Should assign median risk score to new borrower", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "First loan"
            );

            const loan = await lendingEscrow.loans(1);
            expect(loan.riskScore).to.equal(50);
        });

        it("Should calculate interest rate based on risk score", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "First loan"
            );

            const loan = await lendingEscrow.loans(1);
            // Base 5% + risk-adjusted (50 * 10 / 100 = 5%) = 10%
            expect(loan.interestRate).to.be.closeTo(10, 5);
        });
    });

    describe("View Functions", function () {
        it("Should return borrower's loan IDs", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Loan 1"
            );
            await lendingEscrow.connect(borrower).requestLoan(
                HALF_ETH,
                ONE_MONTH,
                0,
                "Loan 2"
            );

            const loanIds = await lendingEscrow.getBorrowerLoans(borrower.address);
            expect(loanIds.length).to.equal(2);
            expect(loanIds[0]).to.equal(1);
            expect(loanIds[1]).to.equal(2);
        });

        it("Should return active loan requests", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Loan 1"
            );
            await lendingEscrow.connect(addr1).requestLoan(
                HALF_ETH,
                ONE_MONTH,
                0,
                "Loan 2"
            );

            const activeLoans = await lendingEscrow.getActiveLoanRequests();
            expect(activeLoans.length).to.equal(2);
        });
    });

    describe("Platform Fees", function () {
        it("Should collect platform fees on loan disbursement", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );

            await lendingEscrow.connect(lender).fundLoan(1, {
                value: ONE_ETH
            });

            const platformFees = await lendingEscrow.totalPlatformFees();
            const expectedFee = ONE_ETH * BigInt(1) / BigInt(100);
            expect(platformFees).to.equal(expectedFee);
        });

        it("Should allow owner to withdraw platform fees", async function () {
            await lendingEscrow.connect(borrower).requestLoan(
                ONE_ETH,
                ONE_YEAR,
                ONE_MONTH,
                "Business expansion"
            );

            await lendingEscrow.connect(lender).fundLoan(1, {
                value: ONE_ETH
            });

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            const tx = await lendingEscrow.connect(owner).withdrawPlatformFees();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
            const expectedFee = ONE_ETH * BigInt(1) / BigInt(100);

            expect(ownerBalanceAfter - ownerBalanceBefore + gasUsed).to.equal(expectedFee);
        });
    });
});
