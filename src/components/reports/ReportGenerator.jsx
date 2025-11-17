import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, FileText, Calendar, Filter, Download } from "lucide-react";
import { reportAPI, settingsAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReportGenerator = ({ isOpen, onClose, template, onSuccess, userId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm({
    defaultValues: {
      name: template?.title || "",
      type: "summary",
      dateRange: "custom",
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
      categories: [],
      format: "pdf",
      includeCharts: true,
      includeInsights: true,
      scheduleFrequency: "none",
      scheduleDay: 1,
      emailDelivery: false,
    },
  });

  const reportType = watch("type");
  const dateRange = watch("dateRange");
  const startDateValue = watch("startDate");
  const endDateValue = watch("endDate");

  // Reset to step 1 whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (template?.title) {
      setValue("name", template.title);
    }
  }, [template, setValue]);

  const reportTypes = [
    {
      value: "summary",
      label: "Summary Report",
      description: "High-level overview with key highlights",
    },
    {
      value: "category",
      label: "Category Report",
      description: "Compare spend across subscription categories",
    },
    {
      value: "trend",
      label: "Trend Report",
      description: "Explain spending patterns over time",
    },
  ];

  const dateRangeOptions = [
    { value: "custom", label: "Custom Range" },
    { value: "lastMonth", label: "Last Month" },
    { value: "last3Months", label: "Last 3 Months" },
    { value: "last6Months", label: "Last 6 Months" },
    { value: "lastYear", label: "Last Year" },
    { value: "allTime", label: "All Time" },
  ];

  const formatOptions = [
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel" },
    { value: "csv", label: "CSV" },
    { value: "json", label: "JSON" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userId || !isOpen) return;
      try {
        const response = await settingsAPI.getCategories({ userId });
        const payload = response?.data?.data ?? response?.data ?? [];
        setAvailableCategories(
          Array.isArray(payload) && payload.length > 0 ? payload : []
        );
      } catch (error) {
        setAvailableCategories([]);
      }
    };
    fetchCategories();
  }, [userId, isOpen]);

  const fallbackCategories = [
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
  ];
  const categories =
    availableCategories.length > 0 ? availableCategories : fallbackCategories;

  const toIsoString = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  };

  const onSubmit = async (data) => {
    // Only allow submission on step 2
    console.log("onSubmit called, currentStep:", currentStep);
    if (currentStep !== 2) {
      console.log("Preventing submission - not on step 2");
      return;
    }

    console.log("Proceeding with report generation on step 2");
    setIsGenerating(true);
    try {
      const reportPayload = {
        ...data,
        startDate: toIsoString(data.startDate),
        endDate: toIsoString(data.endDate),
        categories:
          data.categories && data.categories.length > 0
            ? data.categories
            : categories,
      };

      if (!reportPayload.name || !reportPayload.name.trim()) {
        throw new Error("Please provide a report name.");
      }
      if (!reportPayload.startDate || !reportPayload.endDate) {
        throw new Error("Please select a valid date range.");
      }

      console.log("Generating report with payload:", reportPayload);
      const response = await reportAPI.generate(reportPayload, { userId });
      console.log("Report response:", response);
      const generatedReport = response?.data?.data ?? response?.data;

      if (!generatedReport?.id) {
        throw new Error("Report generation did not return an identifier");
      }

      toast.success("Report generated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Report generation error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to generate report";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  if (!isOpen || !userId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black/70 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Form onSubmit triggered, currentStep:", currentStep);
              if (currentStep !== 2) {
                console.log("Form submission blocked - not on step 2");
                return false;
              }
              console.log("Form submission allowed - on step 2");
              handleSubmit(onSubmit)(e);
            }}
            onKeyDown={(e) => {
              // Prevent Enter key from submitting form on step 1
              if (e.key === "Enter" && currentStep !== 2) {
                console.log("Enter key blocked on step", currentStep);
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Generate Report
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="mb-6 space-y-3">
                <div className="grid grid-cols-2 items-center text-center">
                  {["Report Type", "Options"].map((label, index) => (
                    <div
                      key={label}
                      className="flex flex-col items-center w-full"
                    >
                      <div className="flex items-center w-full">
                        {index === 0 ? (
                          <div className="flex-1" />
                        ) : (
                          <div
                            className={`flex-1 h-0.5 ${
                              index <= currentStep - 1
                                ? "bg-blue-600"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        )}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mx-3 ${
                            index + 1 <= currentStep
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index === 1 ? (
                          <div className="flex-1" />
                        ) : (
                          <div
                            className={`flex-1 h-0.5 ${
                              index + 1 < currentStep
                                ? "bg-blue-600"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        )}
                      </div>
                      <span className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Report Type */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Name
                    </label>
                    <input
                      {...register("name", {
                        required: "Report name is required",
                      })}
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && currentStep !== 2) {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter report name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Type
                    </label>
                    <div className="space-y-2">
                      {reportTypes.map((type) => (
                        <div key={type.value} className="flex items-center">
                          <input
                            {...register("type")}
                            type="radio"
                            value={type.value}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {type.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Options */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                    <select
                      {...register("dateRange")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {dateRangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {dateRange === "custom" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <Controller
                          control={control}
                          name="startDate"
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              dateFormat="MMM dd, yyyy"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <Controller
                          control={control}
                          name="endDate"
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              dateFormat="MMM dd, yyyy"
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categories (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center">
                          <input
                            {...register("categories")}
                            type="checkbox"
                            value={category}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Export Format
                    </label>
                    <select
                      {...register("format")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {formatOptions.map((format) => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        {...register("includeCharts")}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Include Charts and Graphs
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        {...register("includeInsights")}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Include AI Insights
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden submit button - always present but disabled on step 1 to prevent auto-submit */}
            <button
              type="submit"
              disabled={currentStep !== 2 || isGenerating}
              style={{ display: "none" }}
              aria-hidden="true"
            />

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Next button clicked on step", currentStep);
                    nextStep();
                  }}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      "Generate Report button clicked on step",
                      currentStep
                    );
                    if (currentStep === 2) {
                      handleSubmit(onSubmit)(e);
                    }
                  }}
                  disabled={isGenerating}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              )}

              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Previous
                </button>
              )}

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

export default ReportGenerator;
