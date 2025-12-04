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
      const response = await chatAPI.groups.createGroup(groupName, user.id); // assuming API needs owner id
      setGroups((prev) => [...prev, response]); // add newly created group to local state
      return response;
    } catch (err) {
      console.error("Failed to create group:", err);
      throw err;
    }
  };

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const response = await chatAPI.groups.getAllGroups();
      console.log("loadGroups response:", response); // debug
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
      const response = await chatAPI.messages.getGroupMessages(groupId);
      console.log(`Messages for group ${groupId}:`, response); // debug
      const messagesArray = Array.isArray(response) ? response : [];
      setMessages((prev) => ({ ...prev, [groupId]: messagesArray }));
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
      return webSocketService.joinGroup(groupId);
    } catch (err) {
      console.error("Failed to join group:", err);
    }
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
    createGroup,
  };
};

export default useChat;
