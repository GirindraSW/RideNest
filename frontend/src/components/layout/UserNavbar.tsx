import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Car, LogOut, LayoutDashboard, CalendarCheck } from "lucide-react";

export default function UserNavbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">RideNest</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/browse"
            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            Cari Kendaraan
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated() && user ? (
            <>
              {user.role === "PROVIDER" ? (
                <Link to="/provider/services">
                  <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/bookings">
                  <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex">
                    <CalendarCheck className="w-4 h-4" />
                    Booking Saya
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-slate-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block text-sm">
                  {user.name.split(" ")[0]}
                </span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Daftar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
