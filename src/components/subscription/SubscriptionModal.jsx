import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { subscriptionAPI } from "../../services/api";
import { toast } from "react-hot-toast";

const SubscriptionModal = ({
  isOpen,
  onClose,
  onSuccess,
  subscription = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      amount: "",
      category: "",
      billingCycle: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      autoRenewal: true,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (subscription) {
        // Populate form with subscription data for editing
        setValue("name", subscription.name || "");
        setValue("amount", subscription.amount || "");
        setValue("category", subscription.category || "");
        setValue("billingCycle", subscription.billingCycle || "monthly");
        setValue(
          "startDate",
          subscription.startDate
            ? new Date(subscription.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
        setValue(
          "autoRenewal",
          subscription.autoRenewal !== undefined
            ? subscription.autoRenewal
            : true
        );
        setValue("notes", subscription.notes || "");
      } else {
        reset();
      }
    }
  }, [isOpen, subscription, setValue, reset]);

  const calculateNextRenewalDate = (startDate, cycle) => {
    const date = new Date(startDate);
    const newDate = new Date(date);
    switch (cycle) {
      case "monthly":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "quarterly":
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case "semi-annual":
        newDate.setMonth(newDate.getMonth() + 6);
        break;
      case "annual":
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      default:
        newDate.setMonth(newDate.getMonth() + 1);
    }
    return newDate;
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const subscriptionData = {
        ...data,
        nextRenewalDate: calculateNextRenewalDate(
          data.startDate,
          data.billingCycle
        ),
        amount: parseFloat(data.amount),
      };

      if (subscription) {
        await subscriptionAPI.update(subscription.id, subscriptionData);
        toast.success("Subscription updated successfully!");
      } else {
        await subscriptionAPI.create(subscriptionData);
        toast.success("Subscription added successfully!");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {subscription ? "Edit Subscription" : "Add Subscription"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subscription Name *
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Netflix"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount *
                </label>
                <input
                  {...register("amount", {
                    required: "Amount is required",
                    min: 0.01,
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select category</option>
                  <option value="Streaming">Streaming</option>
                  <option value="Software">Software</option>
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="Gym/Fitness">Gym/Fitness</option>
                  <option value="News/Magazines">News/Magazines</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Music">Music</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Billing Cycle *
                </label>
                <select
                  {...register("billingCycle", {
                    required: "Billing cycle is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <input
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              {/* Auto Renewal */}
              <div className="flex items-center">
                <input
                  {...register("autoRenewal")}
                  type="checkbox"
                  id="autoRenewal"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoRenewal"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : subscription ? "Update" : "Add"}{" "}
                Subscription
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
