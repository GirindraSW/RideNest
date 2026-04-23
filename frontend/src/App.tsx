import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AddServicePage from "./pages/provider/AddServicePage";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Halaman khusus Provider */}
        <Route
          path="/provider/services"
          element={
            <ProtectedRoute allowedRoles={["PROVIDER"]}>
              <AddServicePage />
            </ProtectedRoute>
          }
        />

        {/* Homepage sementara */}
        <Route path="/" element={<div className="p-10 text-xl">Home Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;