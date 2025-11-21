import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import Button from '../components/Button';

interface Loan {
  id: number;
  borrower: string;
  lender: string;
  principal: string;
  interestRate: number;
  duration: number;
  disbursedTime: number;
  repaidAmount: string;
  status: 'Active' | 'Repaid' | 'Defaulted';
  totalOwed: string;
  incentiveEarned: boolean;
}

const LoanDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'borrower' | 'lender'>('borrower');
  const [borrowedLoans, setBorrowedLoans] = useState<Loan[]>([]);
  const [lentLoans, setLentLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect to smart contract
      // Simulate borrowed loans
      const mockBorrowedLoans: Loan[] = [
        {
          id: 1,
          borrower: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          lender: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          principal: '1.5',
          interestRate: 8,
          duration: 180,
          disbursedTime: Date.now() - 30 * 24 * 3600000,
          repaidAmount: '0.5',
          status: 'Active',
          totalOwed: '1.62',
          incentiveEarned: false
        }
      ];

      const mockLentLoans: Loan[] = [
        {
          id: 2,
          borrower: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
          lender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          principal: '0.8',
          interestRate: 10,
          duration: 90,
          disbursedTime: Date.now() - 90 * 24 * 3600000,
          repaidAmount: '0.88',
          status: 'Repaid',
          totalOwed: '0.88',
          incentiveEarned: true
        }
      ];

      setBorrowedLoans(mockBorrowedLoans);
      setLentLoans(mockLentLoans);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepayment = async (loanId: number) => {
    try {
      // TODO: Connect to smart contract
      console.log('Repaying loan:', loanId, 'Amount:', repaymentAmount);
      alert('Repayment successful!');
      loadLoans();
      setSelectedLoan(null);
    } catch (error) {
      console.error('Error repaying loan:', error);
      alert('Repayment failed');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'Repaid':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'Defaulted':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-blue-400 bg-blue-500/20';
      case 'Repaid':
        return 'text-green-400 bg-green-500/20';
      case 'Defaulted':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const calculateProgress = (loan: Loan) => {
    const repaid = parseFloat(loan.repaidAmount);
    const owed = parseFloat(loan.totalOwed);
    return (repaid / owed) * 100;
  };

  const calculateTimeRemaining = (loan: Loan) => {
    const deadline = loan.disbursedTime + loan.duration * 24 * 3600000;
    const remaining = deadline - Date.now();
    const days = Math.floor(remaining / (24 * 3600000));
    return days > 0 ? `${days} days` : 'Overdue';
  };

  const currentLoans = activeTab === 'borrower' ? borrowedLoans : lentLoans;

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
              Loan Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your borrowed and lent loans
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('borrower')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'borrower'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Borrowed Loans
            </button>
            <button
              onClick={() => setActiveTab('lender')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'lender'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Lent Loans
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
              <DollarSign className="w-8 h-8 text-cyan-400 mb-2" />
              <h3 className="text-gray-400 text-sm mb-1">Total Active</h3>
              <p className="text-2xl font-bold text-white">
                {activeTab === 'borrower' 
                  ? `${borrowedLoans.filter(l => l.status === 'Active').length} Loans`
                  : `${lentLoans.filter(l => l.status === 'Active').length} Loans`
                }
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="text-gray-400 text-sm mb-1">Completed</h3>
              <p className="text-2xl font-bold text-white">
                {activeTab === 'borrower'
                  ? borrowedLoans.filter(l => l.status === 'Repaid').length
                  : lentLoans.filter(l => l.status === 'Repaid').length
                }
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-gray-400 text-sm mb-1">Total Volume</h3>
              <p className="text-2xl font-bold text-white">
                {activeTab === 'borrower' ? '1.5' : '0.8'} ETH
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
              <AlertTriangle className="w-8 h-8 text-orange-400 mb-2" />
              <h3 className="text-gray-400 text-sm mb-1">Reputation</h3>
              <p className="text-2xl font-bold text-white">850/1000</p>
            </div>
          </div>

          {/* Loans List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading loans...</p>
            </div>
          ) : currentLoans.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/30 border border-gray-700/30 rounded-2xl">
              <p className="text-gray-400 text-lg">
                No {activeTab === 'borrower' ? 'borrowed' : 'lent'} loans found
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentLoans.map((loan) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-gray-500 font-mono">Loan #{loan.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          {loan.status}
                        </span>
                        {loan.incentiveEarned && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            🎉 Early Repayment Bonus
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-500 text-sm">Principal</p>
                          <p className="text-white font-semibold">{loan.principal} ETH</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Interest Rate</p>
                          <p className="text-white font-semibold">{loan.interestRate}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Total Owed</p>
                          <p className="text-white font-semibold">{loan.totalOwed} ETH</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Time Remaining</p>
                          <p className="text-white font-semibold">{calculateTimeRemaining(loan)}</p>
                        </div>
                      </div>

                      {loan.status === 'Active' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Repayment Progress</span>
                            <span className="text-gray-400 text-sm">
                              {loan.repaidAmount} / {loan.totalOwed} ETH
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${calculateProgress(loan)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {activeTab === 'borrower' && loan.status === 'Active' && (
                      <Button
                        variant="primary"
                        onClick={() => setSelectedLoan(loan)}
                        className="lg:mt-0"
                      >
                        Make Payment
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Repayment Modal */}
      {selectedLoan && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLoan(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Make Repayment</h3>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loan ID:</span>
                    <span className="text-white font-mono">#{selectedLoan.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Already Repaid:</span>
                    <span className="text-white">{selectedLoan.repaidAmount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining:</span>
                    <span className="text-white">
                      {(parseFloat(selectedLoan.totalOwed) - parseFloat(selectedLoan.repaidAmount)).toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Repayment Amount (ETH)
                </label>
                <input
                  type="number"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  max={(parseFloat(selectedLoan.totalOwed) - parseFloat(selectedLoan.repaidAmount)).toString()}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="0.00"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Enter amount to repay (partial or full)
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="primary"
                  onClick={() => handleRepayment(selectedLoan.id)}
                  disabled={!repaymentAmount || parseFloat(repaymentAmount) <= 0}
                  className="flex-1"
                >
                  Confirm Payment
                </Button>
                <Button variant="secondary" onClick={() => setSelectedLoan(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoanDashboardPage;
