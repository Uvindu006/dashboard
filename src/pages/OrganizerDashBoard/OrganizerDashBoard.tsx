import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "../../components/OrganizerDashBoard/Sidebar";
import { Header } from "../../components/OrganizerDashBoard/Header";

import OverviewPage from "./OverviewPage";
import HeatmapsPage from "./HeatmapsPage";
import FeedbackPage from "./FeedbackPage";
import ExportPage from "./ExportPage";
import BuildingsPage from "./BuildingsPage";
import EventsPage from "./EventsPage";

interface OrganizerDashBoardProps {
  onLogout: () => void;
}

function OrganizerDashBoard({ onLogout }: OrganizerDashBoardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          eventInfo={{
            title: "EngEX 2025",
            date: "23 Sep 2025",
            location: "University of Peradeniya",
          }}
          userInfo={{
            name: "Organizer",
            role: "Admin",
          }}
          onLogout={onLogout}
        />

        {/* Routes */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            {/* Default → redirect to /overview */}
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="heatmaps" element={<HeatmapsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="buildings" element={<BuildingsPage />} />
            <Route path="events" element={<EventsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default OrganizerDashBoard;
