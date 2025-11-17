import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

const CustomCalendar = ({
  subscriptions = [],
  onDateClick,
  onAddSubscription,
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day

  // Get calendar data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get subscriptions for a specific date
  const getSubscriptionsForDate = (date) => {
    return subscriptions.filter((sub) => {
      const startDate = new Date(sub.startDate);
      const renewalDate = new Date(sub.nextRenewalDate);
      return isSameDay(startDate, date) || isSameDay(renewalDate, date);
    });
  };

  // Get events for a specific date (start dates, renewal dates, etc.)
  const getEventsForDate = (date) => {
    const events = [];
    
    subscriptions.forEach((sub) => {
      const startDate = new Date(sub.startDate);
      const renewalDate = new Date(sub.nextRenewalDate);
      
      if (isSameDay(startDate, date)) {
        events.push({
          type: "start",
          subscription: sub,
          color: "bg-green-500",
          label: "Start",
        });
      }
      
      if (isSameDay(renewalDate, date)) {
        events.push({
          type: "renewal",
          subscription: sub,
          color: "bg-red-500",
          label: "Renewal",
        });
      }
    });
    
    return events;
  };

  const handleDateClick = (date) => {
    if (onDateClick) {
      onDateClick(date, getSubscriptionsForDate(date));
    }
  };

  const handleAddSubscription = () => {
    if (onAddSubscription) {
      onAddSubscription();
    }
  };

  return (
    <div className={`card-base ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-slate-200">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
          <button
            onClick={handleAddSubscription}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const events = getEventsForDate(day);
            const hasEvents = events.length > 0;

            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border border-slate-800/50 cursor-pointer transition-colors
                  ${isCurrentMonth ? "bg-slate-900/40" : "bg-slate-900/20"}
                  ${isTodayDate ? "bg-blue-500/10 border-blue-500/30" : ""}
                  ${hasEvents ? "bg-emerald-500/5" : ""}
                  hover:bg-slate-800/50
                `}
                onClick={() => handleDateClick(day)}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-sm font-medium
                      ${isCurrentMonth ? "text-slate-200" : "text-slate-500"}
                      ${isTodayDate ? "text-blue-400 font-bold" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {hasEvents && (
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`
                        text-xs px-2 py-1 rounded text-white truncate
                        ${event.color}
                      `}
                      title={`${event.subscription.name} - ${event.label}`}
                    >
                      {event.subscription.name}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="text-xs text-slate-500">
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-slate-800/50">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-slate-400">Start Date</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-rose-500 rounded"></div>
            <span className="text-slate-400">Renewal Date</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500/30 border border-blue-500/50 rounded"></div>
            <span className="text-slate-400">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCalendar;
