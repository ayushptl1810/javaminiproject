import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  BarChart3,
  FileText,
  Bell,
  Target,
  Zap
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const steps = [
    {
      title: "Welcome to SubSentry!",
      description: "Let's get you set up with your subscription tracking journey.",
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            SubSentry will help you track, manage, and optimize your subscription spending. 
            Let's set up your account with some quick preferences.
          </p>
        </div>
      ),
    },
    {
      title: "What are your goals?",
      description: "Select your primary objectives to personalize your experience.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "track-spending",
                title: "Track Spending",
                description: "Monitor where my money goes each month",
                icon: Target,
              },
              {
                id: "save-money",
                title: "Save Money",
                description: "Identify opportunities to reduce costs",
                icon: Zap,
              },
              {
                id: "avoid-overpaying",
                title: "Avoid Overpaying",
                description: "Never miss a renewal or pay for unused services",
                icon: CheckCircle,
              },
              {
                id: "organize-subscriptions",
                title: "Stay Organized",
                description: "Keep all my subscriptions in one place",
                icon: Calendar,
              },
              {
                id: "get-insights",
                title: "Get Insights",
                description: "Understand my spending patterns and trends",
                icon: BarChart3,
              },
              {
                id: "generate-reports",
                title: "Generate Reports",
                description: "Create reports for budgeting and tax purposes",
                icon: FileText,
              },
            ].map((goal) => (
              <div
                key={goal.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedGoals.includes(goal.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                onClick={() => {
                  if (selectedGoals.includes(goal.id)) {
                    setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                  } else {
                    setSelectedGoals([...selectedGoals, goal.id]);
                  }
                }}
              >
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-md ${
                    selectedGoals.includes(goal.id)
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    <goal.icon className={`h-5 w-5 ${
                      selectedGoals.includes(goal.id)
                        ? "text-blue-600"
                        : "text-gray-600 dark:text-gray-400"
                    }`} />
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    {goal.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {goal.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Enable Notifications",
      description: "Stay informed about your subscription renewals and important updates.",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Enable Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get notified about upcoming renewals, payment due dates, and important updates.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Browser Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show notifications in your browser
                </p>
              </div>
              <button
                onClick={() => {
                  if ("Notification" in window) {
                    Notification.requestPermission();
                    addNotification({
                      id: "notification-enabled",
                      type: "success",
                      title: "Notifications Enabled",
                      message: "You'll now receive browser notifications for important updates.",
                      read: false,
                      createdAt: new Date().toISOString(),
                    });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Enable
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive email updates and summaries
                </p>
              </div>
              <button
                onClick={() => {
                  addNotification({
                    id: "email-enabled",
                    type: "success",
                    title: "Email Notifications Enabled",
                    message: "You'll receive email notifications for subscription updates.",
                    read: false,
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "You're all set!",
      description: "Your SubSentry account is ready to help you manage your subscriptions.",
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You're ready to start tracking your subscriptions. Here's what you can do next:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Add Subscriptions
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Start by adding your first subscription
              </p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                View Calendar
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                See your renewals on the calendar
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Analyze Spending
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Get insights into your spending
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setIsLoading(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return selectedGoals.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {steps[currentStep].description}
            </p>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Setting up...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
