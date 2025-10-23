import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { notificationAPI } from "../services/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Set up real-time notifications (WebSocket or polling)
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      // Handle backend response format: { data: { data: [...] } }
      let notificationsArray = [];
      if (response?.data?.data) {
        notificationsArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        notificationsArray = response.data;
      }
      setNotifications(notificationsArray);
      setUnreadCount(notificationsArray.filter(n => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Re-fetch notifications to ensure consistency
      setTimeout(() => {
        fetchNotifications();
      }, 100);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Re-fetch notifications to ensure consistency
      setTimeout(() => {
        fetchNotifications();
      }, 100);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const showBrowserNotification = (title, options = {}) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => {
      // Check if notification with same ID already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) {
        return prev; // Don't add duplicate
      }
      return [notification, ...prev];
    });
    
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Show browser notification for important alerts
    if (notification.type === "urgent" || notification.type === "reminder") {
      showBrowserNotification(notification.title, {
        body: notification.message,
        tag: notification.id,
      });
    }
  };

  const value = {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    showBrowserNotification,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
