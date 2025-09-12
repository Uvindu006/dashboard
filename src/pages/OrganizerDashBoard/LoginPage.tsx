import React, { useState } from "react";
import "./RegisterPage.css";

interface LoginPageProps {
  onLogin: () => void;
  goToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, goToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // Dummy login logic
    localStorage.setItem("authToken", "dummy-token");
    localStorage.setItem("authUser", JSON.stringify({ email }));
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 500);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Sign In</h2>
        <p className="register-subtitle">Welcome back! Please login to your account.</p>
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="login-section">
          <p style={{ margin: "16px 0 8px 0" }}>Don't have an account?</p>
          <button
            className="login-button"
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