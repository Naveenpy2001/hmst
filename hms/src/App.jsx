import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/MainPage";
import RegisterForm from "./pages/auth/Register";
import LoginForm from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import { useEffect, useState } from "react";
import { setSessionExpiredHandler } from "./services/api";
import SessionExpired from "./services/SessionExpired";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminDashboard from "./pages/admin/DashboardAdmin";
import DashboardAdmin from "./pages/admin/DashboardAdmin";


function App() {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  useEffect(() => {
    setSessionExpiredHandler(() => () => setIsSessionExpired(true));
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />  
        {isSessionExpired && <SessionExpired />}
      </Routes>
    </>
  );
}

export default App;
