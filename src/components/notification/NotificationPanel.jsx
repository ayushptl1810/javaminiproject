import { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { clsx } from "clsx";

const NotificationPanel = () => {
  const {
    notifications,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  const [filter, setFilter] = useState("all");

  // Ensure notifications is an array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = notificationsArray.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  // Debug logging
  console.log("Filter:", filter);
  console.log("Total notifications:", notificationsArray.length);
  console.log("Filtered notifications:", filteredNotifications.length);
  console.log(
    "Unread count:",
    notificationsArray.filter((n) => !n.read).length
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "urgent":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      case "reminder":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "success":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/20";
      default:
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 "
        onClick={() => setIsOpen(false)}
      />
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "read", label: "Read" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={clsx(
                    "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                    filter === key
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={markAllAsRead}
              disabled={notificationsArray.every((n) => n.read)}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={clsx(
                      "p-4 border-l-4 transition-colors",
                      getNotificationColor(notification.type),
                      !notification.read && "bg-gray-50 dark:bg-gray-700/50"
                    )}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={clsx(
                              "text-sm font-medium",
                              notification.read
                                ? "text-gray-600 dark:text-gray-400"
                                : "text-gray-900 dark:text-white"
                            )}
                          >
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Mark as read"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
