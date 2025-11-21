import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Lock, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

const BorrowPage = () => {
  const [formData, setFormData] = useState({
    amount: '',
    duration: '365',
    lockInPeriod: '30',
    purpose: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Connect to smart contract
      console.log('Loan request:', formData);
      
      // Simulate risk score calculation
      setRiskScore(50);
      
      alert('Loan request submitted successfully!');
    } catch (error) {
      console.error('Error submitting loan request:', error);
      alert('Failed to submit loan request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedInterest = () => {
    const principal = parseFloat(formData.amount) || 0;
    const durationDays = parseInt(formData.duration) || 365;
    const estimatedRate = 10; // Base rate + risk premium
    const interest = (principal * estimatedRate * durationDays) / (365 * 100);
    return interest.toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0628] via-[#1a0b3e] to-[#0d0628] pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Request a Loan
            </h1>
            <p className="text-gray-400 text-lg">
              Access micro-loans with transparent terms and competitive rates
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
              <DollarSign className="w-8 h-8 text-cyan-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Flexible Amounts</h3>
              <p className="text-gray-400 text-sm">Request loans from 0.1 to 10 ETH</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <Clock className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Custom Duration</h3>
              <p className="text-gray-400 text-sm">Choose repayment timeline that suits you</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <Lock className="w-8 h-8 text-green-400 mb-2" />
              <h3 className="text-white font-semibold mb-1">Early Repayment</h3>
              <p className="text-gray-400 text-sm">Get 10% discount on interest</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Loan Amount (ETH) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.1"
                  max="10"
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="1.0"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Loan Duration (Days) *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="30">30 Days (1 Month)</option>
                  <option value="90">90 Days (3 Months)</option>
                  <option value="180">180 Days (6 Months)</option>
                  <option value="365">365 Days (1 Year)</option>
                </select>
              </div>

              {/* Lock-in Period */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Lock-in Period (Days) *
                </label>
                <select
                  name="lockInPeriod"
                  value={formData.lockInPeriod}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="0">No Lock-in</option>
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                </select>
                <p className="text-gray-500 text-sm mt-1">
                  Repay within lock-in period for 10% interest discount
                </p>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Loan Purpose *
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Describe what you'll use this loan for..."
                />
              </div>

              {/* Estimated Details */}
              {formData.amount && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold mb-2">Estimated Loan Terms</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">
                          Principal: <span className="text-white font-medium">{formData.amount} ETH</span>
                        </p>
                        <p className="text-gray-300">
                          Estimated Interest Rate: <span className="text-white font-medium">~10%</span>
                        </p>
                        <p className="text-gray-300">
                          Estimated Interest: <span className="text-white font-medium">{calculateEstimatedInterest()} ETH</span>
                        </p>
                        <p className="text-gray-300">
                          Total Repayment: <span className="text-white font-medium">
                            {(parseFloat(formData.amount) + parseFloat(calculateEstimatedInterest())).toFixed(4)} ETH
                          </span>
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          * Actual rate depends on your risk score
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Loan Request'}
              </Button>
            </form>
          </div>

          {/* How It Works */}
          <div className="mt-8 bg-gradient-to-br from-gray-900/30 to-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
            <h3 className="text-white font-bold text-xl mb-4">How It Works</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-white font-medium">Submit Your Request</p>
                  <p className="text-gray-400 text-sm">Fill out the form with your loan details</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-white font-medium">Get Risk Score</p>
                  <p className="text-gray-400 text-sm">Your transparent risk score determines your interest rate</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-white font-medium">Lender Funds Loan</p>
                  <p className="text-gray-400 text-sm">Wait for a lender to fund your request</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="text-white font-medium">Receive Funds</p>
                  <p className="text-gray-400 text-sm">Funds are automatically released to your wallet (minus 1% platform fee)</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BorrowPage;
