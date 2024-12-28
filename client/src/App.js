import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RegistrationComponent from "./components/auth/RegistrationComponent";
import LoginComponent from "./components/auth/LoginComponent";
import AppComponent from "./components/app/AppComponent";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/registration" element={<RegistrationComponent />} />
        <Route path="/app" element={<AppComponent />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
