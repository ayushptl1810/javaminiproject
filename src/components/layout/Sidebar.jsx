import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Calendar, 
  BarChart3, 
  FileText, 
  User,
  Menu,
  X,
  Home
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { clsx } from "clsx";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotification();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Analysis", href: "/analysis", icon: BarChart3 },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
        >
          {isCollapsed ? (
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 bg-slate-900/80 backdrop-blur-sm border-r border-slate-800/50 shadow-lg transition-all duration-300 lg:translate-x-0",
          isCollapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:static lg:inset-0 lg:w-64 lg:shadow-none"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 font-bold text-lg">S</span>
              </div>
              <span className="ml-3 text-xl font-bold text-slate-200">
                SubSentry
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-1 rounded-lg hover:bg-slate-800/50"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-800/50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-800/60 border border-slate-700/30 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-200">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800/60 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/40 hover:text-slate-200"
                  )
                }
                onClick={() => setIsCollapsed(true)} // Close mobile menu on navigation
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Profile Link */}
          <div className="p-4 border-t border-slate-800/50">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                clsx(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-slate-800/60 text-blue-400 border border-blue-500/30"
                    : "text-slate-300 hover:bg-slate-800/40 hover:text-slate-200"
                )
              }
              onClick={() => setIsCollapsed(true)}
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;
