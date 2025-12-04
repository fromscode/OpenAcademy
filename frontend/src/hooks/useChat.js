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

  console.log("useChat running, user:", user);

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

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const response = await chatAPI.groups.getAllGroups();
      const groupList = response.data || [];
      setGroups(groupList);

      // Load messages for each group
      groupList.forEach((group) => loadGroupMessages(group.id));
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupMessages = async (groupId) => {
    try {
      const response = await chatAPI.messages.getGroupMessages(groupId);
      setMessages((prev) => ({ ...prev, [groupId]: response.data || [] }));
    } catch (err) {
      console.error(`Failed to load messages for group ${groupId}`, err);
    }
  };

  const handleIncomingMessage = useCallback((msg) => {
    const { groupId, senderId, senderName, content, timestamp } = msg;
    const newMsg = {
      id: Date.now() + Math.random(),
      groupId,
      senderId,
      senderName,
      message: content,
      timestamp: timestamp || new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMsg],
    }));
  }, []);

  const sendMessage = async (groupId, messageText) => {
    if (!messageText.trim()) return;

    const messageData = {
      groupId,
      message: messageText,
      senderId: user.id,
      senderName: user.name || user.email,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), messageData],
    }));

    // Send to backend
    try {
      await chatAPI.messages.sendMessage(messageData);
      webSocketService.sendChatMessage(groupId, messageText, user.id);
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
  };
};

export default useChat;
