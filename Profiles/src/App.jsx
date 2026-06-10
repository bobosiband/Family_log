import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import BrowseProfiles from "./pages/BrowseProfiles";
import UserProfile from "./pages/UserProfiles";
import Messages from "./pages/Messages";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ flex: 1 }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const hideSidebar = ["/login", "/register"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="appShell">
      {!hideSidebar && <Navbar />}
      <div className={hideSidebar ? "contentFull" : "contentWithSidebar"} style={{ display: "flex", flexDirection: "column" }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AnimatedPage><Profile /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <AnimatedPage><ProfileEdit /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <ProtectedRoute>
                  <AnimatedPage><BrowseProfiles /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse/:username"
              element={
                <ProtectedRoute>
                  <AnimatedPage><UserProfile /></AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <AnimatedPage><Messages /></AnimatedPage>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
