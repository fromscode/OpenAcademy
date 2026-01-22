// DEVELOPMENT ONLY - Mock data for testing and development
// TODO: Remove this file when backend is implemented
// This file contains temporary mock data and should not be used in production

// Mock users for development/testing (REMOVE WHEN BACKEND IS READY)
export const mockUsers = [];

export const mockTeachers = [
  {
    id: 1,
    name: "Sarah Wilson",
    email: "sarah.wilson@teacher.openacademy.com",
    teacherId: "TCH001",
    phone: "+1 234-567-9001",
    department: "Computer Science",
    specialization: "Web Development",
    experience: "8 years",
    qualification: "Master of Computer Science",
    joinDate: "2020-08-15",
    status: "active",
    courses: [1, 2],
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: 2,
    name: "Robert Brown",
    email: "robert.brown@teacher.openacademy.com",
    teacherId: "TCH002",
    phone: "+1 234-567-9002",
    department: "Mathematics",
    specialization: "Applied Mathematics",
    experience: "12 years",
    qualification: "PhD in Mathematics",
    joinDate: "2018-01-10",
    status: "active",
    courses: [3],
    avatar:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];

export const mockCourses = [
  {
    id: 1,
    title: "Introduction to Web Development",
    code: "CS101",
    courseCode: "CS101",
    description:
      "Learn the basics of HTML, CSS, and JavaScript to build modern web applications.",
    teacherId: 1,
    teacherName: "Sarah Wilson",
    instructorId: 1,
    instructorName: "Sarah Wilson",
    credits: 3,
    duration: "16 weeks",
    schedule: "Mon, Wed, Fri - 10:00 AM",
    students: [1, 2],
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-05-15",
  },
  {
    id: 2,
    title: "Advanced JavaScript",
    code: "CS201",
    courseCode: "CS201",
    description:
      "Deep dive into JavaScript frameworks, async programming, and modern development practices.",
    teacherId: 1,
    teacherName: "Sarah Wilson",
    instructorId: 1,
    instructorName: "Sarah Wilson",
    credits: 4,
    duration: "16 weeks",
    schedule: "Tue, Thu - 2:00 PM",
    students: [1, 3],
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-05-15",
  },
  {
    id: 3,
    title: "Calculus I",
    code: "MATH101",
    courseCode: "MATH101",
    description: "Fundamental concepts of differential and integral calculus.",
    teacherId: 2,
    teacherName: "Robert Brown",
    instructorId: 2,
    instructorName: "Robert Brown",
    credits: 4,
    duration: "16 weeks",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    students: [2, 3],
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-05-15",
  },
];

export const mockAssignments = [
  {
    id: 1,
    title: "Build a Portfolio Website",
    description:
      "Create a personal portfolio website using HTML, CSS, and JavaScript.",
    courseId: 1,
    courseName: "Introduction to Web Development",
    teacherId: 1,
    dueDate: "2024-02-15",
    totalPoints: 100,
    status: "active",
    createdDate: "2024-01-20",
  },
  {
    id: 2,
    title: "JavaScript Functions Exercise",
    description:
      "Complete the JavaScript functions worksheet with proper documentation.",
    courseId: 2,
    courseName: "Advanced JavaScript",
    teacherId: 1,
    dueDate: "2024-02-20",
    totalPoints: 50,
    status: "active",
    createdDate: "2024-01-22",
  },
  {
    id: 3,
    title: "Derivative Problems Set",
    description:
      "Solve the provided calculus problems focusing on derivatives.",
    courseId: 3,
    courseName: "Calculus I",
    teacherId: 2,
    dueDate: "2024-02-18",
    totalPoints: 75,
    status: "active",
    createdDate: "2024-01-21",
  },
];

export const mockSubmissions = [
  {
    id: 1,
    assignmentId: 1,
    studentId: 1,
    studentName: "Mike Johnson",
    submissionDate: "2024-02-14",
    status: "graded",
    grade: 85,
    feedback:
      "Great work! The design is clean and the code is well-structured.",
    fileUrl: "#",
  },
  {
    id: 2,
    assignmentId: 2,
    studentId: 1,
    studentName: "Mike Johnson",
    submissionDate: "2024-02-19",
    status: "submitted",
    grade: null,
    feedback: null,
    fileUrl: "#",
  },
];

export const mockMessages = [
  {
    id: 1,
    senderId: 1,
    senderName: "Mike Johnson",
    receiverId: 2,
    receiverName: "Sarah Wilson",
    message: "Hi Professor, I have a question about the assignment.",
    timestamp: "2024-01-25T10:30:00Z",
    read: true,
  },
  {
    id: 2,
    senderId: 2,
    senderName: "Sarah Wilson",
    receiverId: 1,
    receiverName: "Mike Johnson",
    message: "Sure! What would you like to know?",
    timestamp: "2024-01-25T10:35:00Z",
    read: true,
  },
];



// Mock schedule for students
export const mockSchedule = [
  {
    id: 1,
    studentId: 1,
    courseId: 1,
    courseName: "Introduction to Web Development",
    courseCode: "CS101",
    teacherName: "Sarah Wilson",
    room: "Room 301",
    building: "Computer Science Building",
    days: ["Monday", "Wednesday", "Friday"],
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    color: "#3B82F6", // blue
  },
  {
    id: 2,
    studentId: 1,
    courseId: 2,
    courseName: "Advanced JavaScript",
    courseCode: "CS201",
    teacherName: "Sarah Wilson",
    room: "Room 205",
    building: "Computer Science Building",
    days: ["Tuesday", "Thursday"],
    startTime: "2:00 PM",
    endTime: "3:30 PM",
    color: "#8B5CF6", // purple
  },
  {
    id: 3,
    studentId: 1,
    courseId: 3,
    courseName: "Calculus I",
  grade: null,
    maxGrade: 50,
    feedback: null,
  },
  {
    id: 3,
    assignmentId: 3,
    studentId: 1,
    title: "Derivative Problems Set",
    description:
      "Solve the provided calculus problems focusing on derivatives.",
