import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CosmicBackground from './components/CosmicBackground';

// Lazy load secondary pages to reduce initial bundle size
const CreateProposalPage = lazy(() => import('./pages/CreateProposalPage'));
const ActiveProposalsPage = lazy(() => import('./pages/ActiveProposalsPage'));
const ProposalHistoryPage = lazy(() => import('./pages/ProposalHistoryPage'));
const FundRedistributionPage = lazy(() => import('./pages/FundRedistributionPage'));
const TechnologyStackPage = lazy(() => import('./pages/TechnologyStackPage'));

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-gray-400">Loading page...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <CosmicBackground />
        <Header />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-proposal" element={<CreateProposalPage />} />
            <Route path="/active-proposals" element={<ActiveProposalsPage />} />
            <Route path="/proposal-history" element={<ProposalHistoryPage />} />
            <Route path="/fund-redistribution" element={<FundRedistributionPage />} />
            <Route path="/technology-stack" element={<TechnologyStackPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
}

export default App;