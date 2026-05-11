import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import BrowsePage from "./pages/BrowsePage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import BookingsPage from "./pages/BookingsPage";
import ProfilePage from "./pages/ProfilePage";
import AddServicePage from "./pages/provider/AddServicePage";
import EditServicePage from "./pages/provider/EditServicePage";
import SchedulePage from "./pages/provider/SchedulePage";
import ProviderDashboardPage from "./pages/provider/ProviderDashboardPage";
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

        {/* User */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["USER", "PROVIDER"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Provider */}
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <ProviderDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/services"
          element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <AddServicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/services/:serviceId/edit"
          element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <EditServicePage />
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
