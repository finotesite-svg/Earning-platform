import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  LayoutDashboard,
  CheckSquare,
  LifeBuoy,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  UserCircle,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#1C2541] border-b border-slate-700/50 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link
              to={user?.role === "admin" ? "/admin" : "/dashboard"}
              className="text-xl font-bold text-white flex items-center"
            >
              <span className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-[#00A86B] rounded-xl flex items-center justify-center mr-2.5 font-extrabold shadow-inner">
                EP
              </span>
              Earning Platform
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/dashboard") ? "bg-[#00A86B] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/40"}`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Link>
              <Link
                to="/tasks"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/tasks") ? "bg-[#00A86B] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/40"}`}
              >
                <CheckSquare className="w-4 h-4 mr-2" /> Tasks
              </Link>
              <Link
                to="/support"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/support") ? "bg-[#00A86B] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/40"}`}
              >
                <LifeBuoy className="w-4 h-4 mr-2" /> Support
              </Link>
              <Link
                to="/wallet"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/wallet") ? "bg-[#00A86B] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/40"}`}
              >
                <Wallet className="w-4 h-4 mr-2" /> Wallet
              </Link>
              <Link
                to="/referrals"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/referrals") ? "bg-[#00A86B] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/40"}`}
              >
                <Users className="w-4 h-4 mr-2" /> Referrals
              </Link>
              <Link
                to="/profile"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/profile") ? "bg-[#00A86B] text-white shadow" : "text-slate-300 hover:text-white hover:bg-slate-800/40"}`}
              >
                <UserCircle className="w-4 h-4 mr-2" /> Profile
              </Link>

              {/* Admin Links */}
              {user?.role === "admin" && <div className="flex items-center space-x-1 pl-4 border-l border-slate-700/60 ml-2">
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${isActive("/admin") ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                >
                  Admin
                </Link>
                <Link
                  to="/admin/tasks"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${isActive("/admin/tasks") ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                >
                  Tasks
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/admin/users") ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                >
                  <Users className="w-4 h-4 mr-1.5" /> Users
                </Link>
                <Link
                  to="/admin/submissions"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/admin/submissions") ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                >
                  <ClipboardCheck className="w-4 h-4 mr-1.5" /> Submissions
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition flex items-center ${isActive("/admin/settings") ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                >
                  <Settings className="w-4 h-4 mr-1.5" /> Settings
                </Link>
                <Link
                  to="/admin/withdrawals"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${isActive("/admin/withdrawals") ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-800/40"}`}
                >
                  Payouts
                </Link>
              </div>}
            </div>
          </div>

          {/* User Profile & Logout (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center bg-[#0B132B] px-3.5 py-2 rounded-xl border border-slate-700/60 text-sm text-slate-300">
              <span className="font-semibold text-white">
                {user?.phone || "Account"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition cursor-pointer border border-red-500/20"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/50"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B132B] border-b border-slate-700/60 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold ${isActive("/dashboard") ? "bg-[#00A86B] text-white" : "text-slate-300"}`}
          >
            Dashboard
          </Link>
          <Link
            to="/tasks"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold ${isActive("/tasks") ? "bg-[#00A86B] text-white" : "text-slate-300"}`}
          >
            Tasks & Activities
          </Link>
          <Link
            to="/support"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold ${isActive("/support") ? "bg-[#00A86B] text-white" : "text-slate-300"}`}
          >
            Support
          </Link>
          <Link
            to="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold ${isActive("/wallet") ? "bg-[#00A86B] text-white" : "text-slate-300"}`}
          >
            Wallet
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold ${isActive("/profile") ? "bg-[#00A86B] text-white" : "text-slate-300"}`}
          >
            Profile
          </Link>
          <Link
            to="/referrals"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-3 rounded-xl text-sm font-semibold ${isActive("/referrals") ? "bg-[#00A86B] text-white" : "text-slate-300"}`}
          >
            Referrals
          </Link>
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {user?.role === "admin" && <>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold ${isActive("/admin") ? "bg-purple-600 text-white" : "text-slate-400"}`}
            >
              Admin Dashboard
            </Link>
            <Link
              to="/admin/tasks"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold ${isActive("/admin/tasks") ? "bg-purple-600 text-white" : "text-slate-400"}`}
            >
              Admin Tasks
            </Link>
            <Link
              to="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold ${isActive("/admin/users") ? "bg-purple-600 text-white" : "text-slate-400"}`}
            >
              Admin Users
            </Link>
            <Link
              to="/admin/submissions"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold ${isActive("/admin/submissions") ? "bg-purple-600 text-white" : "text-slate-400"}`}
            >
              Admin Submissions
            </Link>
            <Link
              to="/admin/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold ${isActive("/admin/settings") ? "bg-purple-600 text-white" : "text-slate-400"}`}
            >
              Admin Settings
            </Link>
            <Link
              to="/admin/withdrawals"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-xs font-semibold ${isActive("/admin/withdrawals") ? "bg-purple-600 text-white" : "text-slate-400"}`}
            >
              Admin Payouts
            </Link>
            </>}
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">
              {user?.phone || "Account"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 text-red-400 px-4 py-2 rounded-xl text-xs font-semibold flex items-center"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
