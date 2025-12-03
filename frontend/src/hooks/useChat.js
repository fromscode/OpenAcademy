import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import chatAPI from "../services/chatAPI";
import webSocketService from "../services/websocketService";

export const useChat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([
    {
      id: "demo-1",
      name: "General Chat",
      description: "General discussion",
      memberCount: 1,
      isDemo: true,
    },
    {
      id: "demo-2",
      name: "Study Group",
      description: "Study together",
      memberCount: 1,
      isDemo: true,
    },
  ]);
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Start with false
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  // Initialize WebSocket connection and load groups
  useEffect(() => {
    // Always initialize, regardless of user state
    initializeChat();
    return () => {
      webSocketService.disconnect();
    };
  }, [user]);

  // Initialize chat system
  const initializeChat = async () => {
    console.log("Initializing chat system...");

    // Stop loading immediately and let user use the interface
    setIsLoading(false);
    setError(null);

    // Set up WebSocket event handlers
    const unsubscribeConnect = webSocketService.onConnect(() => {
      setIsConnected(true);
      console.log("Chat connected");
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      setIsConnected(false);
      console.log("Chat disconnected");
    });

    const unsubscribeError = webSocketService.onError((error) => {
      console.warn("WebSocket error (non-blocking):", error.message);
      setIsConnected(false);
    });

    // Set up message handlers
    const unsubscribeMessage = webSocketService.onMessage(
      "CHAT_MESSAGE",
      (payload) => {
        handleIncomingMessage(payload);
      }
    );

    const unsubscribeTyping = webSocketService.onMessage(
      "TYPING_INDICATOR",
      (payload) => {
        handleTypingIndicator(payload);
      }
    );

    // Try to load groups in background (non-blocking)
    loadGroups().catch((error) => {
      console.warn("Could not load groups from backend:", error.message);
      // Set some default demo groups for testing
      setGroups([
        {
          id: "demo-1",
          name: "General Chat",
          description: "General discussion",
          memberCount: 0,
          isDemo: true,
        },
        {
          id: "demo-2",
          name: "Study Group",
          description: "Study together",
          memberCount: 0,
          isDemo: true,
        },
      ]);
    });

    // Try WebSocket connection in background (non-blocking)
    setTimeout(() => {
      try {
        webSocketService.connect(user.id);
      } catch (error) {
        console.warn("WebSocket connection failed:", error);
      }
    }, 100);

    // Cleanup function
    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
      unsubscribeMessage();
      unsubscribeTyping();
    };
  };

  // Load all groups
  const loadGroups = async () => {
    try {
      const response = await chatAPI.groups.getAllGroups();
      setGroups(response.data || []);

      // Load messages for each group (but don't block on failures)
      if (response.data && response.data.length > 0) {
        // Load messages in parallel, but don't wait for all to complete
        const messagePromises = response.data.map((group) =>
          loadGroupMessages(group.id).catch((err) =>
            console.warn(`Failed to load messages for group ${group.id}:`, err)
          )
        );

        // Don't await all - let them load in background
        Promise.allSettled(messagePromises);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
      // Don't throw - allow the UI to show empty state
      setGroups([]);
      throw error; // Re-throw for the caller to handle
    }
  };

  // Load messages for a specific group
  const loadGroupMessages = async (groupId) => {
    try {
      const response = await chatAPI.messages.getGroupMessages(groupId);
      setMessages((prev) => ({
        ...prev,
        [groupId]: response.data || [],
      }));
    } catch (error) {
      console.error(`Failed to load messages for group ${groupId}:`, error);
    }
  };

  // Handle incoming message from WebSocket
  const handleIncomingMessage = useCallback((payload) => {
    const { groupId, message, senderId, senderName, timestamp } = payload;

    const newMessage = {
      id: Date.now() + Math.random(), // Temporary ID
      groupId,
      senderId,
      senderName,
      message,
      timestamp: timestamp || new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMessage],
    }));
  }, []);

  // Handle typing indicators
  const handleTypingIndicator = useCallback((payload) => {
    const { groupId, userId, isTyping, userName } = payload;

    setTypingUsers((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [userId]: isTyping ? { userName, timestamp: Date.now() } : undefined,
      },
    }));

    // Clear typing indicator after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers((prev) => ({
          ...prev,
          [groupId]: {
            ...prev[groupId],
            [userId]: undefined,
          },
        }));
      }, 3000);
    }
  }, []);

  // Send a message
  const sendMessage = async (groupId, messageText) => {
    try {
      if (!messageText.trim()) return false;

      const messageData = {
        id: Date.now() + Math.random(),
        groupId,
        message: messageText,
        senderId: user?.id || "demo-user",
        senderName: user?.name || user?.email || "Demo User",
        timestamp: new Date().toISOString(),
      };

      // Add message locally first for immediate feedback
      setMessages((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), messageData],
      }));

      // Try to send via API and WebSocket if available (non-blocking)
      try {
        await chatAPI.messages.sendMessage(messageData);
        webSocketService.sendChatMessage(groupId, messageText, user.id);
      } catch (error) {
        console.warn("Could not send to backend:", error.message);
        // Message is already added locally, so it still works
      }

      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  };

  // Create a new group
  const createGroup = async (groupName) => {
    try {
      const newGroup = {
        id: `local-${Date.now()}`,
        name: groupName,
        description: "Local chat group",
        memberCount: 1,
        ownerId: user?.id || "demo-user",
        isLocal: true,
      };

      // Add group locally first
      setGroups((prev) => [...prev, newGroup]);

      // Try to create on backend (non-blocking)
      try {
        const response = await chatAPI.groups.createGroup(groupName, user.id);
        if (response.success) {
          // Replace local group with backend group
          setGroups((prev) =>
            prev.map((group) =>
              group.id === newGroup.id
                ? { ...response.data, isLocal: false }
                : group
            )
          );
          return response.data;
        }
      } catch (error) {
        console.warn("Could not create group on backend:", error.message);
        // Keep the local group
      }

      return newGroup;
    } catch (error) {
      console.error("Failed to create group:", error);
      throw error;
    }
  };

  // Join a group
  const joinGroup = async (groupId) => {
    try {
      webSocketService.joinGroup(groupId);
      await loadGroupMessages(groupId);
    } catch (error) {
      console.error("Failed to join group:", error);
      setError("Failed to join group");
    }
  };

  // Leave a group
  const leaveGroup = (groupId) => {
    try {
      webSocketService.leaveGroup(groupId);
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (groupId, isTyping) => {
    webSocketService.sendTypingIndicator(groupId, isTyping, user.id);
  };

  // Get messages for a specific group
  const getGroupMessages = (groupId) => {
    return messages[groupId] || [];
  };

  // Get typing users for a group (excluding current user)
  const getTypingUsers = (groupId) => {
    const groupTyping = typingUsers[groupId] || {};
    return Object.entries(groupTyping)
      .filter(([userId, data]) => userId !== user.id.toString() && data)
      .map(([userId, data]) => data);
  };

  // Refresh groups and messages
  const refresh = async () => {
    setIsLoading(true);
    try {
      await loadGroups();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    groups,
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    createGroup,
    joinGroup,
    leaveGroup,
    sendTypingIndicator,
    getGroupMessages,
    getTypingUsers,
    refresh,
    loadGroupMessages,
  };
};

export default useChat;
