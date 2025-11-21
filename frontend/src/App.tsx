import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CreateProposalPage from './pages/CreateProposalPage';
import ActiveProposalsPage from './pages/ActiveProposalsPage';
import ProposalHistoryPage from './pages/ProposalHistoryPage';
import FundRedistributionPage from './pages/FundRedistributionPage';
import TechnologyStackPage from './pages/TechnologyStackPage';
import BorrowPage from './pages/BorrowPage';
import LendPage from './pages/LendPage';
import LoanDashboardPage from './pages/LoanDashboardPage';
import CosmicBackground from './components/CosmicBackground';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <CosmicBackground />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-proposal" element={<CreateProposalPage />} />
          <Route path="/active-proposals" element={<ActiveProposalsPage />} />
          <Route path="/proposal-history" element={<ProposalHistoryPage />} />
          <Route path="/fund-redistribution" element={<FundRedistributionPage />} />
          <Route path="/technology-stack" element={<TechnologyStackPage />} />
          <Route path="/borrow" element={<BorrowPage />} />
          <Route path="/lend" element={<LendPage />} />
          <Route path="/loan-dashboard" element={<LoanDashboardPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;