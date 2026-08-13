import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/AuthScreen";
import { BottomNav } from "@/components/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";
import Discover from "@/pages/Discover";
import UploadPage from "@/pages/UploadPage";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import ChallengeDetail from "@/pages/ChallengeDetail";

function Shell() {
  return (
    <div className="grain relative mx-auto min-h-screen w-full max-w-md bg-[#050505] pb-28">
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/challenge/:id" element={<ChallengeDetail />} />
      </Routes>
      </ErrorBoundary>
      <BottomNav />
    </div>
  );
}

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <span className="font-display text-3xl font-black tracking-tighter text-[#FFE800] animate-pulse">
          TCHAK 🔥
        </span>
      </div>
    );
  }
  if (!user) return <AuthScreen />;
  return <Shell />;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppInner />
          <Toaster position="top-center" theme="dark" richColors />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
