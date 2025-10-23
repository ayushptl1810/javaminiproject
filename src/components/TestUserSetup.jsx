import { useState } from "react";
import { User, Play, RotateCcw, Info } from "lucide-react";
import { TEST_USER_CREDENTIALS, setupDemoData, clearDemoData, isDemoMode } from "../utils/testData";

const TestUserSetup = () => {
  const [isSetup, setIsSetup] = useState(isDemoMode());

  const handleSetupDemo = () => {
    setupDemoData();
    setIsSetup(true);
    // Auto-login with test credentials
    localStorage.setItem("token", "demo-token-12345");
    window.location.reload();
  };

  const handleClearDemo = () => {
    clearDemoData();
    localStorage.removeItem("token");
    setIsSetup(false);
    window.location.reload();
  };

  if (isSetup) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center mb-2">
          <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
            Demo Mode Active
          </h3>
        </div>
        <p className="text-xs text-green-700 dark:text-green-300 mb-3">
          You're logged in as <strong>{TEST_USER_CREDENTIALS.email}</strong> with demo data.
        </p>
        <button
          onClick={handleClearDemo}
          className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset Demo
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center mb-2">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Quick Demo Setup
        </h3>
      </div>
      <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
        Set up demo data and login automatically with test credentials.
      </p>
      <div className="space-y-2">
        <button
          onClick={handleSetupDemo}
          className="w-full inline-flex items-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
        >
          <Play className="h-3 w-3 mr-1" />
          Start Demo
        </button>
        <div className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Test Login:</strong><br />
          Email: {TEST_USER_CREDENTIALS.email}<br />
          Password: {TEST_USER_CREDENTIALS.password}
        </div>
      </div>
    </div>
  );
};

export default TestUserSetup;
