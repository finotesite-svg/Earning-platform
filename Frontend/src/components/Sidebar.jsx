import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTodo, Wallet, Users, UserCircle } from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/referrals", label: "Referrals", icon: Users },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-700/60 bg-[#1C2541] p-4">
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[#00A86B]/15 text-[#00A86B]"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
