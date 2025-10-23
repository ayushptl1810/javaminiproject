import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Calendar, DollarSign, Tag, Repeat, Link as LinkIcon } from "lucide-react";
import { subscriptionAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SubscriptionModal = ({ isOpen, onClose, onSuccess, subscription = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [billingCycles] = useState([
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "semi-annual", label: "Semi-Annual" },
    { value: "annual", label: "Annual" },
    { value: "custom", label: "Custom" },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      billingCycle: "monthly",
      startDate: new Date(),
      autoRenewal: true,
      notes: "",
      paymentMethod: "",
      portalLink: "",
    },
  });

  const billingCycle = watch("billingCycle");
  const startDate = watch("startDate");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (subscription) {
        // Populate form with subscription data for editing
        Object.keys(subscription).forEach((key) => {
          if (key === "startDate" || key === "nextRenewalDate") {
            setValue(key, new Date(subscription[key]));
          } else {
            setValue(key, subscription[key]);
          }
        });
      } else {
        reset();
      }
    }
  }, [isOpen, subscription, setValue, reset]);

  const fetchCategories = async () => {
    try {
      // In a real app, this would fetch from API
      setCategories([
        "Streaming",
        "Software",
        "Cloud Services",
        "Gym/Fitness",
        "News/Magazines",
        "Gaming",
        "Music",
        "Productivity",
        "Security",
        "Other",
      ]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const calculateNextRenewalDate = (startDate, cycle) => {
    const date = new Date(startDate);
    switch (cycle) {
      case "monthly":
        return new Date(date.setMonth(date.getMonth() + 1));
      case "quarterly":
        return new Date(date.setMonth(date.getMonth() + 3));
      case "semi-annual":
        return new Date(date.setMonth(date.getMonth() + 6));
      case "annual":
        return new Date(date.setFullYear(date.getFullYear() + 1));
      default:
        return new Date(date.setMonth(date.getMonth() + 1));
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const subscriptionData = {
        ...data,
        nextRenewalDate: calculateNextRenewalDate(data.startDate, data.billingCycle),
        amount: parseFloat(data.amount),
      };

      if (subscription) {
        // Update existing subscription
        await subscriptionAPI.update(subscription.id, subscriptionData);
        toast.success("Subscription updated successfully!");
      } else {
        // Create new subscription
        await subscriptionAPI.create(subscriptionData);
        toast.success("Subscription added successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save subscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {subscription ? "Edit Subscription" : "Add New Subscription"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Subscription Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subscription Name *
                  </label>
                  <input
                    {...register("name", { required: "Subscription name is required" })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Amount and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register("amount", { 
                          required: "Amount is required",
                          min: { value: 0.01, message: "Amount must be greater than 0" }
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      {...register("category", { required: "Category is required" })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Billing Cycle and Start Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Billing Cycle *
                    </label>
                    <select
                      {...register("billingCycle", { required: "Billing cycle is required" })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {billingCycles.map((cycle) => (
                        <option key={cycle.value} value={cycle.value}>
                          {cycle.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date *
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setValue("startDate", date)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                </div>

                {/* Payment Method and Portal Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Method
                    </label>
                    <input
                      {...register("paymentMethod")}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Credit Card ending in 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Portal Link
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register("portalLink")}
                        type="url"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Renewal Toggle */}
                <div className="flex items-center">
                  <input
                    {...register("autoRenewal")}
                    type="checkbox"
                    id="autoRenewal"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoRenewal" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Auto-renewal enabled
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes about this subscription..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : (subscription ? "Update" : "Add")} Subscription
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
