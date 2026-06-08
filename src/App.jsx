import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
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
    </AuthProvider>
  );
}

