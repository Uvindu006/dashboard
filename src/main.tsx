import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/OrganizerDashBoard/App"; // new root wrapper
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/Eng_ex2025">
      <App />
    </BrowserRouter>
  </StrictMode>
);

