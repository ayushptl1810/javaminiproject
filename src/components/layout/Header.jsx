import { useState } from "react";
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  User,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNotification } from "../../contexts/NotificationContext";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, setIsOpen } = useNotification();

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-800/50 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-900/40 text-slate-200"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-slate-400" />
              ) : (
                <Sun className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-8 h-8 bg-slate-800/60 border border-slate-700/30 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                <span className="hidden md:block text-sm font-medium text-slate-300">
                  {user?.name || "User"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-800/50 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-slate-800/50">
                      <p className="text-sm font-medium text-slate-200">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                    
                    <a
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
