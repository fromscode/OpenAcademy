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
  return response.json();
};

// ===================================================================
// CHAT GROUPS API
// ===================================================================
export const chatGroupsAPI = {
  // Get all groups
  getAllGroups: async () => {
    const response = await fetch(`${BASE_URL}/chat/groups/all-groups`, {
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
      `${BASE_URL}/chat/groups/remove-member/${groupId}/${userId}/`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// ===================================================================
// CHAT MESSAGES API
// ===================================================================
export const chatMessagesAPI = {
  // Get all messages from a group
  getGroupMessages: async (groupId) => {
    if (typeof groupId !== "number") {
      throw new Error("groupId must be a number");
    }

    const response = await fetch(`${BASE_URL}/chat/messages/group/${groupId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
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
