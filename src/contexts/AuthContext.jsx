import { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: sessionStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.verifyToken();
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user: response.data.user, token },
          });
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (error) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          dispatch({ type: "AUTH_FAILURE", payload: error.response?.data?.message || "Authentication failed" });
        }
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: null });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, token },
      });
      
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      sessionStorage.removeItem("user");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signup = async (userData) => {
    dispatch({ type: "AUTH_START" });
    try {
      const response = await authAPI.signup(userData);
      const { user, token } = response.data;
      
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, token },
      });
      
      toast.success(`Welcome to SubSentry, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      sessionStorage.removeItem("user");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      dispatch({ type: "UPDATE_USER", payload: response.data.user });
      sessionStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success("Password changed successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      toast.success("Password reset email sent");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset email";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, passwordData) => {
    try {
      await authAPI.resetPassword(token, passwordData);
      toast.success("Password reset successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
