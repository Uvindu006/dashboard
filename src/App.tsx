import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate for navigation
import "./LoginPage.css";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import OrganizerDashBoard from "./OrganizerDashBoard";

interface LoginPageProps {
  onLogin: () => void; // Prop to notify parent component about successful login
  goToRegister: () => void; // Prop to navigate to the register page
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, goToRegister }) => {
  const [email, setEmail] = useState(""); // Email state
  const [password, setPassword] = useState(""); // Password state
  const [loading, setLoading] = useState(false); // Loading state for the button

  const navigate = useNavigate(); // useNavigate hook for navigation

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login button clicked"); // Debug: check if button is clicked
    setLoading(true); // Set loading to true while navigating

    // Instead of validating, just navigate directly to the dashboard
    console.log("Setting dummy data in localStorage"); // Debug: check localStorage setting
    localStorage.setItem("authToken", "dummy-token"); // Set a dummy token for now
    localStorage.setItem("authUser", JSON.stringify({ email })); // Store email as the auth user

    // Trigger the onLogin function to notify the parent component
    console.log("Triggering onLogin function"); // Debug: check if onLogin is triggered
    onLogin(); // Notify parent that login is successful

    // After login, route to the dashboard
    console.log("Navigating to dashboard"); // Debug: check navigation
    navigate("/dashboard"); // Navigate to the dashboard route
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <p className="login-subtitle">Welcome back! Please login to continue.</p>

        {/* The login form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Button */}
        <div className="register-section">
          <p>Don't have an account?</p>
          <button
            className="register-button"
            onClick={goToRegister} // This triggers the goToRegister function passed from the parent component
            type="button"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
