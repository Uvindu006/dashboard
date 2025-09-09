import React, { useEffect, useState } from "react";
import OrganizerDashBoard from "./OrganizerDashBoard";
import LoginPage from "./LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <OrganizerDashBoard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
