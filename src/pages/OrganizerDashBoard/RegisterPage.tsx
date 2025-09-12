import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

interface RegisterPageProps {
  onRegister: () => void;
  goToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, goToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auths/register", {
        email,
        password,
      });

      if (response.status === 201) {
        onRegister();
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage("Registration failed. Try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Register</h2>
        <p className="login-subtitle">Create your account.</p>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleRegister} className="login-form">
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <button className="switch-button" onClick={goToLogin}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;