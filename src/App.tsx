import React from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import LoginPage from "./pages/OrganizerDashBoard/LoginPage";
import RegisterPage from "./pages/OrganizerDashBoard/RegisterPage";
import Dashboard from "./pages/OrganizerDashBoard/Dashboard";

const LoginWrapper = () => {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLogin={() => navigate("/dashboard")}
      goToRegister={() => navigate("/register")} // Passing goToRegister
    />
  );
};

const RegisterWrapper = () => {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onRegister={() => navigate("/login")}
      goToLogin={() => navigate("/login")}
    />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
