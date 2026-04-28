import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BrowsePage from "./pages/BrowsePage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AddServicePage from "./pages/provider/AddServicePage";
import SchedulePage from "./pages/provider/SchedulePage";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />

        {/* Provider */}
        <Route
          path="/provider/services"
          element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <AddServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/services/:serviceId/schedule"
          element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
