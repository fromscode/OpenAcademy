// Chat API service for OpenAcademy
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("openacademy_token");
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(error.message || "API request failed");
  }

  // Check if response has content
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  // Handle text response
  const text = await response.text();
  if (!text) {
    return { success: true };
  }

  // Try to parse as JSON, if it fails return as text in an object
  try {
    return JSON.parse(text);
  } catch {
    return { message: text, success: true };
  }
};

// ===================================================================
// CHAT GROUPS API
// ===================================================================
export const chatGroupsAPI = {
  // Get all groups (for admin)
  getAllGroups: async () => {
    const response = await fetch(`${BASE_URL}/chat/groups/all-groups`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get groups where user is a member
  getUserGroups: async (userId) => {
    const response = await fetch(`${BASE_URL}/chat/groups/user/${userId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get group by ID
  getGroupById: async (groupId) => {
    const response = await fetch(`${BASE_URL}/chat/groups/${groupId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create a new group
  createGroup: async (groupName, ownerId) => {
    const response = await fetch(
      `${BASE_URL}/chat/groups/create/${groupName}/${ownerId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Join a group
  joinGroup: async (groupId, userId) => {
    const response = await fetch(
      `${BASE_URL}/chat/groups/join/${groupId}/${userId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Add member to group
  addMember: async (groupId, userId, role = "MEMBER") => {
    const response = await fetch(
      `${BASE_URL}/chat/groups/add-member/${groupId}/${userId}/${role}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Remove member from group
  removeMember: async (groupId, userId) => {
    const response = await fetch(
      `${BASE_URL}/chat/groups/remove-member/${groupId}/${userId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Get group members
  getGroupMembers: async (groupId) => {
    const response = await fetch(`${BASE_URL}/chat/groups/${groupId}/members`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get group member count
  getGroupMemberCount: async (groupId) => {
    const response = await fetch(`${BASE_URL}/chat/groups/count/${groupId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// ===================================================================
// CHAT MESSAGES API
// ===================================================================
export const chatMessagesAPI = {
  // Get all messages from a group (with userId for membership check)
  getGroupMessages: async (groupId, userId) => {
    if (typeof groupId !== "number") {
      throw new Error("groupId must be a number");
    }
    if (typeof userId !== "number") {
      throw new Error("userId must be a number");
    }

    const response = await fetch(
      `${BASE_URL}/chat/messages/group/${groupId}/${userId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Send message to a group
  sendMessage: async (messageData) => {
    const response = await fetch(`${BASE_URL}/chat/messages/send`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },
};

// ===================================================================
// COMBINED CHAT API
// ===================================================================
export const chatAPI = {
  groups: chatGroupsAPI,
  messages: chatMessagesAPI,
};

export default chatAPI;
