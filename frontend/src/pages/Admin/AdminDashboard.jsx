import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Calendar,
  Award,
  Clock
} from 'lucide-react';
import { mockStudents, mockTeachers, mockCourses, mockAssignments } from '../../data/mockData';

const AdminDashboard = () => {
  const stats = [
    {
      name: 'Total Students',
      value: mockStudents.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Total Teachers',
      value: mockTeachers.length,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      name: 'Active Courses',
      value: mockCourses.length,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Assignments',
      value: mockAssignments.length,
      icon: FileText,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'increase'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'student_enrolled',
      message: 'New student Emily Davis enrolled in Web Development course',
      time: '2 hours ago',
      icon: Users
    },
    {
      id: 2,
      type: 'assignment_created',
      message: 'Assignment "Portfolio Website" created by Sarah Wilson',
      time: '4 hours ago',
      icon: FileText
    },
    {
      id: 3,
      type: 'course_updated',
      message: 'Course "Advanced JavaScript" schedule updated',
      time: '6 hours ago',
      icon: BookOpen
    },
    {
      id: 4,
      type: 'teacher_joined',
      message: 'New teacher Robert Brown joined Mathematics department',
      time: '1 day ago',
      icon: UserCheck
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Faculty Meeting',
      date: '2024-02-01',
      time: '10:00 AM',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Assignment Deadline - Web Development',
      date: '2024-02-15',
      time: '11:59 PM',
      type: 'deadline'
    },
    {
      id: 3,
      title: 'Mid-term Examinations Begin',
      date: '2024-02-20',
      time: '9:00 AM',
      type: 'exam'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening at OpenAcademy today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/students"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <Users className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Manage Students</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add, edit, or view student profiles</p>
          </Link>
          
          <Link
            to="/admin/teachers"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <UserCheck className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Manage Teachers</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add, edit, or view teacher profiles</p>
          </Link>
          
          <Link
            to="/admin/courses"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <BookOpen className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Manage Courses</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage course offerings</p>
          </Link>
          
          <Link
            to="/admin/reports"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <TrendingUp className="h-8 w-8 text-primary-600 mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">View Reports</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Academic performance analytics</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => {
                const Icon = activity.icon;
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary-600" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-gray-300">{activity.message}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.date} at {event.time}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;