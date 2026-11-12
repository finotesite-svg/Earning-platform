import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  LayoutDashboard,
  CheckSquare,
  LifeBuoy,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  Wallet,
  UserCircle,
  CircleDollarSign,
  BarChart3,
} from "lucide-react";

const userLinks = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/support", label: "Support", icon: LifeBuoy },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/submissions", label: "Submissions", icon: ClipboardCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/withdrawals", label: "Payouts", icon: Wallet },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

function NavigationLink({ link, onClick, admin = false }) {
  const Icon = link.icon;

  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive
          ? admin
            ? "bg-purple-600 text-white shadow-lg shadow-purple-950/20"
            : "bg-[#00A86B] text-white shadow-lg shadow-emerald-950/20"
          : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
        }`
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{link.label}</span>
    </NavLink>
  );
}

function MobileNavigationLink({ link, admin = false, onClick }) {
  const Icon = link.icon;

  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition md:min-w-0 md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm ${isActive
          ? admin
            ? "bg-purple-600 text-white"
            : "bg-[#00A86B] text-white"
          : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="max-w-[4.5rem] truncate">{link.label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const isAdmin = String(user?.role).toLowerCase() === "admin";

  useEffect(() => {
    document.body.classList.toggle("app-with-sidebar", isAdmin);
    document.body.classList.toggle("app-with-bottom-nav", Boolean(user));
    return () => {
      document.body.classList.remove("app-with-sidebar");
      document.body.classList.remove("app-with-bottom-nav");
    };
  }, [isAdmin, user]);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  const brandPath = isAdmin ? "/admin" : "/dashboard";
  const visibleUserLinks = isAdmin ? [] : userLinks;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-700/60 bg-[#1C2541] px-4 shadow-md md:hidden">
        <Link
          to={brandPath}
          className="flex items-center gap-2.5 text-lg font-bold text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 font-extrabold text-[#00A86B]">
            MA
          </span>
          <span className="truncate">Master business</span>
        </Link>
      </header>

      {isAdmin && (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-700/60 bg-[#1C2541] md:flex">
          <div className="border-b border-slate-700/60 p-5">
            <Link to={brandPath} className="flex items-center gap-3 text-lg font-bold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 font-extrabold text-[#00A86B]">
                MA
              </span>
              <span>Master business</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Primary navigation">
            {visibleUserLinks.length > 0 && (
              <>
                {/* <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Workspace
              </p> */}
                {visibleUserLinks.map((link) => (
                  <NavigationLink key={link.to} link={link} />
                ))}
              </>
            )}

            {user?.role === "admin" && (
              <>
                <p className="border-t border-slate-700/60 px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Admin
                </p>
                {adminLinks.map((link) => (
                  <NavigationLink key={link.to} link={link} admin />
                ))}
              </>
            )}
          </nav>

          <div className="border-t border-slate-700/60 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#0B132B]/70 px-3 py-2.5">
              <CircleDollarSign className="h-5 w-5 shrink-0 text-[#00A86B]" />
              <span className="truncate text-xs font-semibold text-slate-300">
                {user?.phone || "Account"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>
      )}

      <nav
        className={`fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-slate-700/60 bg-[#1C2541]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-2xl backdrop-blur md:justify-center md:px-6 md:py-2 ${isAdmin ? "md:hidden" : ""
          }`}
        aria-label="Mobile navigation"
      >
        {visibleUserLinks.map((link) => (
          <MobileNavigationLink key={link.to} link={link} />
        ))}
        {isAdmin &&
          adminLinks.map((link) => (
            <MobileNavigationLink key={link.to} link={link} admin />
          ))}
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/10 md:min-w-0 md:flex-row md:gap-2 md:px-4 md:py-3 md:text-sm"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}
