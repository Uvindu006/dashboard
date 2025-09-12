import React, { useState } from "react";
import "./LoginPage.css";

interface LoginPageProps {
  onLogin: () => void;
  goToRegister: () => void; // Added goToRegister prop
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, goToRegister }) => {
  const [email, setEmail] = useState(""); // Email state
  const [password, setPassword] = useState(""); // Password state
  const [loading, setLoading] = useState(false); // Loading state for the button

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true while navigating

    // Instead of validating, just navigate directly to the dashboard
    localStorage.setItem("authToken", "dummy-token"); // Set a dummy token for now
    localStorage.setItem("authUser", JSON.stringify({ email })); // Store email as the auth user

    // Trigger the onLogin function to notify the parent component
    onLogin(); // Notify parent that login is successful

    // After login, route to the dashboard
    // Here, we assume onLogin() will handle the navigation logic
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
            onClick={goToRegister}
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
