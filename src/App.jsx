import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import AssessmentEntry from './pages/AssessmentEntry';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import DetailedReview from './pages/DetailedReview';
import CertificateView from './pages/CertificateView';
import Verify from './pages/Verify';
import History from './pages/History';

export default function App() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assessment" element={<AssessmentEntry />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/review" element={<DetailedReview />} />
          <Route path="/review/:attemptId" element={<DetailedReview />} />
          <Route path="/certificate/:id" element={<CertificateView />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
