import { useState } from "react";
import { X, Plus, Trash2, BarChart3 } from "lucide-react";
import { useQuery } from "react-query";
import { subscriptionAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const ComparisonTool = ({ isOpen, onClose }) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  
  const { data: subscriptions, isLoading } = useQuery(
    "subscriptions",
    () => subscriptionAPI.getAll(),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: [...] } }
        if (data?.data?.data) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      },
    }
  );

  const addSubscription = (subscription) => {
    if (!selectedSubscriptions.find(sub => sub.id === subscription.id)) {
      setSelectedSubscriptions([...selectedSubscriptions, subscription]);
    }
  };

  const removeSubscription = (subscriptionId) => {
    setSelectedSubscriptions(selectedSubscriptions.filter(sub => sub.id !== subscriptionId));
  };

  const calculateTotals = () => {
    const totalMonthly = selectedSubscriptions.reduce((sum, sub) => {
      const multiplier = sub.billingCycle === "monthly" ? 1 :
                        sub.billingCycle === "quarterly" ? 1/3 :
                        sub.billingCycle === "semi-annual" ? 1/6 :
                        sub.billingCycle === "annual" ? 1/12 : 1;
      return sum + (sub.amount * multiplier);
    }, 0);
    
    const totalAnnual = selectedSubscriptions.reduce((sum, sub) => {
      const multiplier = sub.billingCycle === "monthly" ? 12 :
                        sub.billingCycle === "quarterly" ? 4 :
                        sub.billingCycle === "semi-annual" ? 2 :
                        sub.billingCycle === "annual" ? 1 : 12;
      return sum + (sub.amount * multiplier);
    }, 0);

    return { totalMonthly, totalAnnual };
  };

  if (!isOpen) return null;

  const { totalMonthly, totalAnnual } = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Compare Subscriptions
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Subscriptions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available Subscriptions
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : (
                    subscriptions?.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {subscription.name}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {subscription.category} • ${subscription.amount}/{subscription.billingCycle}
                          </p>
                        </div>
                        <button
                          onClick={() => addSubscription(subscription)}
                          disabled={selectedSubscriptions.find(sub => sub.id === subscription.id)}
                          className="p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Subscriptions */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected for Comparison ({selectedSubscriptions.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSubscriptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select subscriptions to compare</p>
                    </div>
                  ) : (
                    selectedSubscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                            {subscription.name}
                          </h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {subscription.category} • ${subscription.amount}/{subscription.billingCycle}
                          </p>
                        </div>
                        <button
                          onClick={() => removeSubscription(subscription.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Comparison Summary */}
                {selectedSubscriptions.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Comparison Summary
                    </h5>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span className="font-medium">${totalMonthly.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Cost:</span>
                        <span className="font-medium">${totalAnnual.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average per Subscription:</span>
                        <span className="font-medium">
                          ${(totalMonthly / selectedSubscriptions.length).toFixed(2)}/month
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;
