import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import chatAPI from "../services/chatAPI";
import webSocketService from "../services/websocketService";

export const useChat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const init = async () => {
      setError(null);

      // WS handlers
      const unsubConnect = webSocketService.onConnect(() => {
        setIsConnected(true);
        loadGroups().catch(console.error);
      });

      const unsubDisconnect = webSocketService.onDisconnect(() =>
        setIsConnected(false)
      );
      const unsubError = webSocketService.onError((e) => console.warn(e));

      // Message subscription (all groups)
      const unsubMessages = webSocketService.subscribe(
        "/topic/group",
        handleIncomingMessage
      );

      webSocketService.connect(user.id || user.email);

      return () => {
        unsubConnect();
        unsubDisconnect();
        unsubError();
        unsubMessages();
        webSocketService.disconnect();
      };
    };

    init();
  }, [user]);

  const createGroup = async (groupName) => {
    try {
      const response = await chatAPI.groups.createGroup(groupName, user.id);
      setGroups((prev) => [...prev, response]);
      // Automatically join the group since you created it (you're already added as ADMIN in backend)
      await loadGroupMessages(response.id);
      return response;
    } catch (err) {
      console.error("Failed to create group:", err);
      throw err;
    }
  };

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      // Use getUserGroups instead of getAllGroups to get only groups user is a member of
      const response = await chatAPI.groups.getUserGroups(user.id);
      console.log("loadGroups response:", response);
      const groupList = Array.isArray(response) ? response : [];
      setGroups(groupList);

      // Load messages for each group
      groupList.forEach((group) => loadGroupMessages(group.id));
    } catch (err) {
      console.error("Failed to load groups:", err);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupMessages = async (groupId) => {
    try {
      // Pass userId to check membership
      const response = await chatAPI.messages.getGroupMessages(
        groupId,
        user.id
      );
      const messagesArray = Array.isArray(response)
        ? response.map(normalizeMessage)
        : [];

      setMessages((prev) => ({
        ...prev,
        [groupId]: messagesArray,
      }));
    } catch (err) {
      console.error(`Failed to load messages for group ${groupId}`, err);
    }
  };

  const handleIncomingMessage = useCallback((msg) => {
    const normalized = normalizeMessage(msg);

    setMessages((prev) => ({
      ...prev,
      [normalized.groupId]: [...(prev[normalized.groupId] || []), normalized],
    }));
  }, []);

  const sendMessage = async (groupId, messageText) => {
    if (!messageText.trim()) return;

    const localMsg = {
      id: Date.now(),
      content: messageText,
      sender: { id: user.id, fullName: user.name || user.email },
      createdAt: new Date().toISOString(),
      group: { id: groupId },
    };

    const normalized = normalizeMessage(localMsg);

    setMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), normalized],
    }));

    // Send to backend
    try {
      // await chatAPI.messages.sendMessage(normalized);
      const chatMessageWS = {
        groupId,
        senderId: user.id,
        content: messageText,
      };
      console.log(
        "Payload being sent via STOMP:",
        JSON.stringify(chatMessageWS)
      );
      webSocketService.sendChatMessage(chatMessageWS);
      // webSocketService.sendChatMessage(groupId, messageText, user.id);
    } catch (err) {
      console.warn("Message not sent to backend:", err);
    }
  };

  const sendTypingIndicator = (groupId, isTyping) => {
    webSocketService.sendTypingIndicator(groupId, isTyping, user.id);
  };

  const getGroupMessages = (groupId) => messages[groupId] || [];
  const getTypingUsers = (groupId) => {
    const groupTyping = typingUsers[groupId] || {};
    return Object.entries(groupTyping)
      .filter(([userId, data]) => userId !== user.id.toString() && data)
      .map(([_, data]) => data);
  };

  const joinGroup = async (groupId) => {
    try {
      // Join via WebSocket for real-time updates
      return webSocketService.joinGroup(groupId);
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  const joinGroupAsMember = async (groupId) => {
    try {
      // Add user as member in the backend
      const response = await chatAPI.groups.joinGroup(groupId, user.id);
      // Refresh groups list to include the newly joined group
      await loadGroups();
      return response;
    } catch (err) {
      console.error("Failed to join group as member:", err);
      throw err;
    }
  };

  const refresh = async () => {
    await loadGroups();
  };

  const normalizeMessage = (msg) => {
    return {
      id: msg.id,
      message: msg.content,
      senderId: msg.sender?.id,
      senderName: msg.sender?.fullName || "Unknown User",
      timestamp: msg.createdAt,
      groupId: msg.group?.id,
    };
  };

  return {
    groups,
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    sendTypingIndicator,
    getGroupMessages,
    getTypingUsers,
    loadGroupMessages,
    joinGroup,
    joinGroupAsMember,
    createGroup,
    refresh,
  };
};

export default useChat;
