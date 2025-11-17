import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Calendar, DollarSign, Camera, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { subscriptionAPI, notificationAPI } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [activeSubscriptions, setActiveSubscriptions] = useState(null);
  const [isFetchingSubscriptions, setIsFetchingSubscriptions] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    browserNotifications: true,
    renewalReminders: true,
    weeklySummary: false,
    reminderDays: 2,
  });
  const [isLoadingNotificationPrefs, setIsLoadingNotificationPrefs] =
    useState(true);
  const [isSavingNotificationPrefs, setIsSavingNotificationPrefs] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      defaultCurrency: user?.defaultCurrency || "USD",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchActiveSubscriptions = async () => {
      setIsFetchingSubscriptions(true);
      try {
        if (!user?.id) return;
        const response = await subscriptionAPI.getAll({ userId: user.id });
        const payload = response?.data;
        const subscriptions = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        const activeCount = subscriptions.filter((sub) =>
          sub?.status ? sub.status.toLowerCase() === "active" : true
        ).length;
        if (isMounted) {
          setActiveSubscriptions(activeCount);
        }
      } catch (error) {
        if (isMounted) {
          setActiveSubscriptions(null);
          toast.error("Couldn't load subscription stats");
        }
      } finally {
        if (isMounted) {
          setIsFetchingSubscriptions(false);
        }
      }
    };

    if (user?.id) {
      fetchActiveSubscriptions();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchPreferences = async () => {
      setIsLoadingNotificationPrefs(true);
      try {
        if (!user?.id) return;
        const response = await notificationAPI.getPreferences({
          userId: user.id,
        });
        const payload = response?.data?.data ?? response?.data ?? {};
        const normalized = {
          emailNotifications:
            typeof payload.emailNotifications === "boolean"
              ? payload.emailNotifications
              : true,
          browserNotifications:
            typeof payload.browserNotifications === "boolean"
              ? payload.browserNotifications
              : true,
          renewalReminders:
            typeof payload.renewalReminders === "boolean"
              ? payload.renewalReminders
              : true,
          weeklySummary:
            typeof payload.weeklySummary === "boolean"
              ? payload.weeklySummary
              : false,
          reminderDays:
            typeof payload.reminderDays === "number" ? payload.reminderDays : 2,
        };
        if (isMounted) {
          setNotificationPreferences(normalized);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Couldn't load notification preferences");
        }
      } finally {
        if (isMounted) {
          setIsLoadingNotificationPrefs(false);
        }
      }
    };

    if (user?.id) {
      fetchPreferences();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile({ ...data, avatar });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const currencies = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "JPY", label: "JPY - Japanese Yen" },
  ];

  const handlePreferenceToggle = (key) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveNotificationPreferences = async () => {
    setIsSavingNotificationPrefs(true);
    try {
      if (!user?.id) return;
      await notificationAPI.updatePreferences(notificationPreferences, {
        userId: user.id,
      });
      toast.success("Notification preferences updated");
    } catch (error) {
      toast.error("Failed to update notification preferences");
    } finally {
      setIsSavingNotificationPrefs(false);
    }
  };

  const preferenceItems = [
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive email notifications for subscription renewals",
    },
    {
      key: "browserNotifications",
      title: "Browser Notifications",
      description: "Show browser notifications for urgent alerts",
    },
    {
      key: "renewalReminders",
      title: "Renewal Reminders",
      description: "Get reminded before subscription renewals",
    },
    {
      key: "weeklySummary",
      title: "Weekly Summary",
      description: "Receive a weekly summary of your subscription activity",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-200">
          Profile
        </h1>
        <p className="text-slate-400">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <div className="card-base p-6 shimmer-hover">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              Profile Picture
            </h3>
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-slate-800/60 border-2 border-slate-700/50 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-blue-500/20">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-500/80 backdrop-blur-sm border border-blue-400/50 text-white p-2 rounded-full cursor-pointer hover:bg-blue-500 hover:border-blue-300 transition-all shadow-lg">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Click the camera icon to upload a new profile picture
              </p>
            </div>
          </div>

          {/* Account Stats */}
          <div className="card-base p-6 mt-6 shimmer-hover">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg bg-slate-800/40 border border-slate-800/50">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-slate-400">
                    Member since
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-slate-800/40 border border-slate-800/50">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-slate-400">
                    Active subscriptions
                  </p>
                  <p className="text-sm font-medium text-slate-200">
                    {isFetchingSubscriptions
                      ? "Loading..."
                      : activeSubscriptions ?? "Unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card-base p-6 shimmer-hover">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">
              Personal Information
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      {...register("name", { required: "Name is required" })}
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-800/50 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-900/40 text-slate-200 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-rose-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      type="email"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-800/50 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-900/40 text-slate-200 transition-all"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-rose-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  {...register("bio")}
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-800/50 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-900/40 text-slate-200 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Default Currency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-slate-500" />
                  </div>
                  <select
                    {...register("defaultCurrency")}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-800/50 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500/50 focus:border-blue-500/50 bg-slate-900/40 text-slate-200 transition-all"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary shimmer-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="card-base p-6 mt-6 shimmer-hover">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Notification Preferences
                </h3>
                <p className="text-sm text-slate-400">
                  Choose how you want to stay informed about your subscriptions
                </p>
              </div>
              {isLoadingNotificationPrefs && <LoadingSpinner size="sm" />}
            </div>
            <div className="space-y-4">
              {preferenceItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between border border-slate-800/50 rounded-lg p-4 bg-slate-800/40 hover:bg-slate-800/50 transition-all"
                >
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-500 focus:ring-blue-500/50 border-slate-700 rounded cursor-pointer bg-slate-900/40 checked:bg-blue-500/80 checked:border-blue-500/50"
                    checked={Boolean(notificationPreferences[item.key])}
                    onChange={() => handlePreferenceToggle(item.key)}
                    disabled={
                      isLoadingNotificationPrefs || isSavingNotificationPrefs
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={saveNotificationPreferences}
                disabled={
                  isSavingNotificationPrefs || isLoadingNotificationPrefs
                }
                className="btn-primary shimmer-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingNotificationPrefs ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Notification Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
