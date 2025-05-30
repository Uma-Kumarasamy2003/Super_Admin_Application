// src/components/layoutt/DashboardLayout.js
// src/components/layoutt/DashboardLayout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout-container">
      <Sidebar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        collapsed={!sidebarOpen}
      />
      <main
        className={`main-content ${
          sidebarOpen ? "with-sidebar" : "full-width"
        }`}
      >
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
