import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Clock, DollarSign, User } from 'lucide-react';
import Button from '../components/Button';

interface LoanRequest {
  id: number;
  borrower: string;
  principal: string;
  interestRate: number;
  duration: number;
  lockInPeriod: number;
  riskScore: number;
  purpose: string;
  requestTime: number;
}

const LendPage = () => {
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low-risk' | 'medium-risk' | 'high-risk'>('all');

  useEffect(() => {
    loadLoanRequests();
  }, []);

  const loadLoanRequests = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect to smart contract
      // Simulate loan requests
      const mockLoans: LoanRequest[] = [
        {
          id: 1,
          borrower: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          principal: '1.5',
          interestRate: 8,
          duration: 180,
          lockInPeriod: 30,
          riskScore: 35,
          purpose: 'Small business inventory purchase',
          requestTime: Date.now() - 3600000
        },
        {
          id: 2,
          borrower: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          principal: '0.5',
          interestRate: 12,
          duration: 90,
          lockInPeriod: 15,
          riskScore: 55,
          purpose: 'Emergency medical expenses',
          requestTime: Date.now() - 7200000
        },
        {
          id: 3,
          borrower: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          principal: '2.0',
          interestRate: 7,
          duration: 365,
          lockInPeriod: 60,
          riskScore: 25,
          purpose: 'Education and training courses',
          requestTime: Date.now() - 10800000
        }
      ];
      setLoanRequests(mockLoans);
    } catch (error) {
      console.error('Error loading loan requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundLoan = async (loan: LoanRequest) => {
    try {
      // TODO: Connect to smart contract
      console.log('Funding loan:', loan.id);
      alert(`Successfully funded loan #${loan.id}`);
      loadLoanRequests();
    } catch (error) {
      console.error('Error funding loan:', error);
      alert('Failed to fund loan');
    }
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (score < 60) return { label: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const calculateEstimatedReturn = (loan: LoanRequest) => {
    const principal = parseFloat(loan.principal);
    const durationYears = loan.duration / 365;
    const interest = (principal * loan.interestRate * durationYears) / 100;
    return (principal + interest).toFixed(4);
  };

  const filteredLoans = loanRequests.filter(loan => {
    if (filter === 'all') return true;
    if (filter === 'low-risk') return loan.riskScore < 30;
    if (filter === 'medium-risk') return loan.riskScore >= 30 && loan.riskScore < 60;
    if (filter === 'high-risk') return loan.riskScore >= 60;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0628] via-[#1a0b3e] to-[#0d0628] pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Fund Loans & Earn Interest
            </h1>
            <p className="text-gray-400 text-lg">
              Browse loan requests and fund borrowers to earn competitive returns
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Avg. Return</h3>
              <p className="text-2xl font-bold text-cyan-400">8-12%</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <DollarSign className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Total Lent</h3>
              <p className="text-2xl font-bold text-purple-400">127.5 ETH</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <Shield className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Active Loans</h3>
              <p className="text-2xl font-bold text-green-400">23</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
              <Clock className="w-8 h-8 text-orange-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Avg. Duration</h3>
              <p className="text-2xl font-bold text-orange-400">6 Months</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All Loans
            </button>
            <button
              onClick={() => setFilter('low-risk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'low-risk'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Low Risk
            </button>
            <button
              onClick={() => setFilter('medium-risk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'medium-risk'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Medium Risk
            </button>
            <button
              onClick={() => setFilter('high-risk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'high-risk'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              High Risk
            </button>
          </div>

          {/* Loan Requests List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading loan requests...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/30 border border-gray-700/30 rounded-2xl">
              <p className="text-gray-400 text-lg">No loan requests available</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredLoans.map((loan) => {
                const risk = getRiskLabel(loan.riskScore);
                return (
                  <motion.div
                    key={loan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-gray-500 font-mono">Loan #{loan.id}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
                            {risk.label}
                          </span>
                          <span className="text-gray-500 text-sm">
                            Risk Score: {loan.riskScore}/100
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400 font-mono text-sm">
                            {loan.borrower.slice(0, 10)}...{loan.borrower.slice(-8)}
                          </span>
                        </div>

                        <p className="text-white mb-4">{loan.purpose}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-gray-500 text-sm">Amount</p>
                            <p className="text-white font-semibold">{loan.principal} ETH</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Interest Rate</p>
                            <p className="text-white font-semibold">{loan.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Duration</p>
                            <p className="text-white font-semibold">{loan.duration} days</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-sm">Expected Return</p>
                            <p className="text-green-400 font-semibold">{calculateEstimatedReturn(loan)} ETH</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          onClick={() => handleFundLoan(loan)}
                          className="whitespace-nowrap"
                        >
                          Fund Loan
                        </Button>
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* How Lending Works */}
          <div className="mt-12 bg-gradient-to-br from-gray-900/30 to-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">How Lending Works</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-3">For Lenders</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Browse available loan requests</li>
                  <li>• Review risk scores and borrower profiles</li>
                  <li>• Fund loans with one click</li>
                  <li>• Earn interest automatically on repayment</li>
                  <li>• Track all your loans in dashboard</li>
                </ul>
              </div>
              <div>
                <h4 className="text-purple-400 font-semibold mb-3">Risk Management</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Transparent risk scoring (0-100)</li>
                  <li>• Higher risk = higher interest rates</li>
                  <li>• Borrower reputation tracking</li>
                  <li>• Loan default penalties</li>
                  <li>• Platform fee: 1% on disbursement</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLoan(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Loan Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Loan ID</p>
                  <p className="text-white font-mono">#{selectedLoan.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Risk Score</p>
                  <p className="text-white">{selectedLoan.riskScore}/100</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Borrower</p>
                  <p className="text-white font-mono text-sm">{selectedLoan.borrower}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Requested</p>
                  <p className="text-white">{new Date(selectedLoan.requestTime).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Purpose</p>
                <p className="text-white">{selectedLoan.purpose}</p>
              </div>
              <div className="flex gap-4 mt-6">
                <Button variant="primary" onClick={() => handleFundLoan(selectedLoan)} className="flex-1">
                  Fund Loan
                </Button>
                <Button variant="secondary" onClick={() => setSelectedLoan(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LendPage;
