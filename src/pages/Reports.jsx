import { useState } from "react";
import { useQuery } from "react-query";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  Eye,
  Trash2,
  Clock,
} from "lucide-react";
import { reportAPI } from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ReportGenerator from "../components/reports/ReportGenerator";
import ReportTemplatePreview from "../components/reports/ReportTemplatePreview";

const Reports = () => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Fetch reports
  const {
    data: reports,
    isLoading,
    refetch,
  } = useQuery("reports", () => reportAPI.getReports(), {
    select: (data) => {
      // Handle backend response format: { data: { data: [...] } }
      if (data?.data?.data) return data.data.data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });

  // Fetch scheduled reports
  const { data: scheduledReports, refetch: refetchScheduled } = useQuery(
    "scheduled-reports",
    () => reportAPI.getScheduledReports(),
    {
      select: (data) => {
        // Handle backend response format: { data: { data: [...] } }
        if (data?.data?.data) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      },
    }
  );

  const handleDownloadReport = async (reportId, format = "pdf") => {
    try {
      const response = await reportAPI.downloadReport(reportId, format);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      await reportAPI.deleteReport(reportId);
      refetch();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await reportAPI.deleteSchedule(scheduleId);
      refetchScheduled();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const handleUseTemplate = (template) => {
    setSelectedReport(template);
    setIsPreviewOpen(false);
    setIsGeneratorOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and manage subscription reports
          </p>
        </div>
        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Report Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Report Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Monthly Summary",
              description:
                "Overview of all subscriptions and spending for the current month",
              icon: Calendar,
              color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
            },
            {
              title: "Category Breakdown",
              description: "Detailed analysis by subscription category",
              icon: Filter,
              color: "text-green-600 bg-green-100 dark:bg-green-900/20",
            },
            {
              title: "Annual Projection",
              description: "Projected costs and trends for the next 12 months",
              icon: FileText,
              color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
            },
          ].map((template, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => {
                setPreviewTemplate(template);
                setIsPreviewOpen(true);
              }}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-md ${template.color}`}>
                  <template.icon className="h-5 w-5" />
                </div>
                <h4 className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                  {template.title}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Reports
        </h3>
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generated on{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View Report"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="p-2 text-blue-600 hover:text-blue-700"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                    title="Delete Report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No reports generated yet
            </p>
          </div>
        )}
      </div>

      {/* Scheduled Reports */}
      {scheduledReports && scheduledReports.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Scheduled Reports
          </h3>
          <div className="space-y-3">
            {scheduledReports.map((scheduled) => (
              <div
                key={scheduled.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-900/20">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {scheduled.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Runs {scheduled.frequency} • Next:{" "}
                      {new Date(scheduled.nextRun).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleDownloadReport(scheduled.reportId || scheduled.id)
                    }
                    disabled={!scheduled.reportId}
                    className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      scheduled.reportId
                        ? "Download Latest Report"
                        : "No report available yet"
                    }
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(scheduled.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                    title="Delete Schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Generator Modal */}
      <ReportGenerator
        isOpen={isGeneratorOpen}
        onClose={() => {
          setIsGeneratorOpen(false);
          setSelectedReport(null);
        }}
        template={selectedReport}
        onSuccess={() => {
          refetch();
          setIsGeneratorOpen(false);
          setSelectedReport(null);
        }}
      />
      <ReportTemplatePreview
        isOpen={isPreviewOpen}
        template={previewTemplate}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewTemplate(null);
        }}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
};

export default Reports;
