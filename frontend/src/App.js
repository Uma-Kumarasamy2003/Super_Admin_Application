import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  
import "./index.css";

import Admin from "./components/pages/Admin";
import Cases from "./components/pages/Cases";
import ScanCenters from "./components/pages/Scancenters";
import Doctors from "./components/pages/Doctors";
import AdminFeatures from "./components/pages/AdminFeatures";
import DoctorFeatures from "./components/pages/DoctorFeatures";
import MetaData from "./components/pages/MetaData";
import SuperAdminLogin from "./components/SuperAdminLogin";
import DashboardLayout from "./components/layoutt/DashboardLayout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/scancenters" element={<ScanCenters />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/adminfeatures" element={<AdminFeatures />} />
          <Route path="/doctorfeatures" element={<DoctorFeatures />} />
          <Route path="/metadata" element={<MetaData />} />
        </Route>

        {/* Route outside the layout */}
        <Route path="/login" element={<SuperAdminLogin />} />
      </Routes>
    </Router>
  );
};

export default App;
