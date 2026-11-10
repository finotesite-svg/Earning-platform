import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/user/Dashboard";
import Tasks from "./pages/user/Tasks";
import Support from "./pages/user/Support";
import Profile from "./pages/user/Profile";
import Referrals from "./pages/user/Referrals";
import Wallet from "./pages/user/Wallet";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTasks from "./pages/admin/ManageTasks";
import ManageUsers from "./pages/admin/ManageUsers";
import SubmissionsReview from "./pages/admin/SubmissionsReview";
import SystemSettings from "./pages/admin/SystemSettings";
import Withdrawals from "./pages/admin/Withdrawals";
import { useAuth } from "./context/useAuth";

const userOnly = (page) => (
  <ProtectedRoute allowedRoles={["user", "admin"]}>{page}</ProtectedRoute>
);
const adminOnly = (page) => (
  <ProtectedRoute allowedRoles={["admin"]}>{page}</ProtectedRoute>
);

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={userOnly(<Dashboard />)}
        />

        {/* User Routes */}
        <Route path="/tasks" element={userOnly(<Tasks />)} />
        <Route path="/support" element={userOnly(<Support />)} />
        <Route path="/wallet" element={userOnly(<Wallet />)} />
        <Route path="/profile" element={userOnly(<Profile />)} />
        <Route path="/referrals" element={userOnly(<Referrals />)} />

        {/* Admin Routes */}
        <Route path="/admin" element={adminOnly(<AdminDashboard />)} />
        <Route path="/admin/tasks" element={adminOnly(<ManageTasks />)} />
        <Route path="/admin/users" element={adminOnly(<ManageUsers />)} />
        <Route
          path="/admin/submissions"
          element={adminOnly(<SubmissionsReview />)}
        />
        <Route path="/admin/settings" element={adminOnly(<SystemSettings />)} />
        <Route path="/admin/withdrawals" element={adminOnly(<Withdrawals />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
