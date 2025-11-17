import { useState, useEffect } from "react";
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
import { useAuth } from "../contexts/AuthContext";

const Reports = () => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  // Fetch reports
  const {
    data: reports,
    isLoading,
    refetch,
  } = useQuery(["reports", userId], () => reportAPI.getReports({ userId }), {
    enabled: !!userId,
    select: (data) => {
      if (data?.data?.data) return data.data.data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return [];
    },
  });

  // Fetch scheduled reports
  const {
    data: scheduledReports,
    refetch: refetchScheduled,
    isLoading: scheduledLoading,
  } = useQuery(
    ["scheduled-reports", userId],
    () => reportAPI.getScheduledReports({ userId }),
    {
      enabled: !!userId,
      select: (data) => {
        // Handle backend response format: { data: { data: [...] } }
        if (data?.data?.data) return data.data.data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      },
    }
  );

  useEffect(() => {
    if (!userId) return;
    const handler = () => {
      refetch();
      refetchScheduled();
    };
    window.addEventListener("subscriptions:changed", handler);
    return () => window.removeEventListener("subscriptions:changed", handler);
  }, [userId, refetch, refetchScheduled]);

  const handleDownloadReport = async (reportId, format = "pdf") => {
    try {
      const response = await reportAPI.downloadReport(reportId, format, {
        userId,
      });
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
      await reportAPI.deleteReport(reportId, { userId });
      refetch();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await reportAPI.deleteSchedule(scheduleId, { userId });
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

  if (authLoading || isLoading || scheduledLoading || !userId) {
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
          <h1 className="text-2xl font-bold text-slate-200">
            Reports
          </h1>
          <p className="text-slate-400">
            Generate and manage subscription reports
          </p>
        </div>
        <button
          onClick={() => setIsGeneratorOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Report Templates */}
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          Quick Report Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Monthly Summary",
              description:
                "Overview of all subscriptions and spending for the current month",
              icon: Calendar,
              color: "text-blue-400 bg-blue-500/20",
            },
            {
              title: "Category Breakdown",
              description: "Detailed analysis by subscription category",
              icon: Filter,
              color: "text-emerald-400 bg-emerald-500/20",
            },
            {
              title: "Annual Projection",
              description: "Projected costs and trends for the next 12 months",
              icon: FileText,
              color: "text-violet-400 bg-violet-500/20",
            },
          ].map((template, index) => (
            <div
              key={index}
              className="p-4 border border-slate-800/50 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 hover:border-slate-700/50 cursor-pointer transition-colors"
              onClick={() => {
                setPreviewTemplate(template);
                setIsPreviewOpen(true);
              }}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${template.color}`}>
                  <template.icon className="h-5 w-5" />
                </div>
                <h4 className="ml-3 text-sm font-medium text-slate-200">
                  {template.title}
                </h4>
              </div>
              <p className="text-sm text-slate-400">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card-base p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          Recent Reports
        </h3>
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800/50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-slate-200">
                      {report.name}
                    </h4>
                    <p className="text-sm text-slate-400">
                      Generated on{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition"
                    title="View Report"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 rounded-lg transition"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800/50 rounded-lg transition"
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
            <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500">
              No reports generated yet
            </p>
          </div>
        )}
      </div>

      {/* Scheduled Reports */}
      {scheduledReports && scheduledReports.length > 0 && (
        <div className="card-base p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            Scheduled Reports
          </h3>
          <div className="space-y-3">
            {scheduledReports.map((scheduled) => (
              <div
                key={scheduled.id}
                className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800/50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-slate-200">
                      {scheduled.name}
                    </h4>
                    <p className="text-sm text-slate-400">
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
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800/50 rounded-lg transition"
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
        userId={userId}
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
