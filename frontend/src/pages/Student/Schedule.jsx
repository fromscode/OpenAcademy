import { useState } from "react";
import { Calendar, Clock, MapPin, User, BookOpen } from "lucide-react";

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState("Monday");

  // No schedule - will be loaded from backend API
  const studentSchedule = [];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Get classes for selected day
  const getClassesForDay = (day) => {
    return studentSchedule.filter((item) => item.days.includes(day));
  };

  const selectedClasses = getClassesForDay(selectedDay);

  // Convert 12-hour time to minutes for sorting
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
    if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
  };

  // Sort classes by start time
  const sortedClasses = [...selectedClasses].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Schedule
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your weekly class schedule
          </p>
        </div>

        {/* Week Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Week at a Glance
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => {
              const dayClasses = getClassesForDay(day);
              const isToday =
                day ===
                new Date().toLocaleDateString("en-US", { weekday: "long" });

              return (
                <div
                  key={day}
                  className={`text-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedDay === day
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : isToday
                      ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <p
                    className={`text-xs font-medium mb-2 ${
                      selectedDay === day
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {day.substring(0, 3)}
                  </p>
                  <div className="space-y-1">
                    {dayClasses.length > 0 ? (
                      <>
                        <div
                          className="h-1 rounded-full mx-auto"
                          style={{
                            width: "80%",
                            backgroundColor: dayClasses[0]?.color || "#3B82F6",
                          }}
                        />
                        {dayClasses.length > 1 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{dayClasses.length - 1}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        -
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {selectedDay}&apos;s Schedule
          </h2>

          {sortedClasses.length > 0 ? (
            <div className="space-y-4">
              {sortedClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="relative border-l-4 pl-6 pb-6 last:pb-0"
                  style={{ borderColor: classItem.color }}
                >
                  {/* Time Badge */}
                  <div className="absolute -left-2 top-0 bg-white dark:bg-gray-800 px-2">
                    <div
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm"
                      style={{ backgroundColor: classItem.color }}
                    >
                      {classItem.startTime}
                    </div>
                  </div>

                  {/* Class Card */}
                  <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {classItem.courseName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {classItem.courseCode}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {classItem.startTime} - {classItem.endTime}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        <span>{classItem.teacherName}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{classItem.room}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{classItem.building}</span>
                      </div>
                    </div>

                    {/* Days indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Repeats:
                        </span>
                        <div className="flex gap-1">
                          {classItem.days.map((day) => (
                            <span
                              key={day}
                              className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            >
                              {day.substring(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Classes Scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don&apos;t have any classes scheduled for {selectedDay}.
              </p>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Classes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {studentSchedule.length}
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Class Days
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {new Set(studentSchedule.flatMap((item) => item.days)).size}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Today&apos;s Classes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {
                    getClassesForDay(
                      new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                      })
                    ).length
                  }
                </p>
              </div>
              <Clock className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
