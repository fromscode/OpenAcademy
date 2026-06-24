import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  Plus,
  Users,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw,
  UserPlus,
  X,
  LogOut,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useChat from "../../hooks/useChat";
import chatAPI from "../../services/chatAPI";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "../../utils/date";

const Messages = () => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    groups,
    isConnected,
    error,
    sendMessage,
    createGroup,
    joinGroup,
    joinGroupAsMember,
    leaveGroup,
    getGroupMessages,
    getTypingUsers,
    sendTypingIndicator,
    deleteMessage,
    refresh,
  } = useChat();

  const isLoading = authLoading; // Only wait for auth, not chat

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showBrowseGroups, setShowBrowseGroups] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [allGroups, setAllGroups] = useState([]);
  const [loadingAllGroups, setLoadingAllGroups] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // No auto-selection: user controls which group to view

  const selectedMessageCount = selectedGroup
    ? getGroupMessages(selectedGroup.id).length
    : 0;

  // Keep the newest message in view when opening a chat or receiving a message.
  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollToBottom());
    return () => cancelAnimationFrame(frame);
  }, [selectedGroup?.id, selectedMessageCount]);

  // Removed auto-select logic to prevent automatic group selection

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch group members
  const fetchGroupMembers = async (groupId) => {
    if (!groupId) return;

    setLoadingMembers(true);
    try {
      const members = await chatAPI.groups.getGroupMembers(groupId);
      setGroupMembers(members);
      setShowMembersModal(true);
    } catch (error) {
      console.error("Failed to fetch group members:", error);
      setGroupMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || isSending) return;

    setIsSending(true);
    const messageText = newMessage;

    // Stop typing indicator
    if (isTyping) {
      sendTypingIndicator(selectedGroup.id, false);
      setIsTyping(false);
    }

    try {
      await sendMessage(selectedGroup.id, messageText);
      // Clear input only after successful send
      setNewMessage("");
      // Scroll to bottom to show new message
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Keep message in input if failed
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await createGroup(newGroupName.trim());
      setNewGroupName("");
      setShowCreateGroup(false);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleBrowseGroups = async () => {
    setShowBrowseGroups(true);
    setLoadingAllGroups(true);
    try {
      const response = await chatAPI.groups.getAllGroups();
      // Filter out groups user is already a member of
      const availableGroups = response.filter(
        (group) => !groups.some((g) => g.id === group.id)
      );

      // Load member count for each available group
      const groupsWithCount = await Promise.all(
        availableGroups.map(async (group) => {
          try {
            const memberCount = await chatAPI.groups.getGroupMemberCount(
              group.id
            );
            return { ...group, memberCount };
          } catch (err) {
            console.error(
              `Failed to load member count for group ${group.id}:`,
              err
            );
            return { ...group, memberCount: 0 };
          }
        })
      );

      setAllGroups(groupsWithCount);
    } catch (error) {
      console.error("Failed to load all groups:", error);
    } finally {
      setLoadingAllGroups(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setJoiningGroupId(groupId);
    try {
      await joinGroupAsMember(groupId);
      // Remove from available groups
      setAllGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch (error) {
      console.error("Failed to join group:", error);
      alert(error.message || "Failed to join group");
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleGroupSelect = (group) => {
    if (selectedGroup?.id !== group.id) {
      setSelectedGroup(group);

      if (!group.isDemo) {
        joinGroup(group.id).catch((error) => {
          console.error("Failed to join group:", error);
        });
      }
    }
  };

  const handleBackToGroups = () => {
    if (selectedGroup && isTyping) {
      sendTypingIndicator(selectedGroup.id, false);
    }
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    setNewMessage("");
    setSelectedGroup(null);
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;

    setLeavingGroup(true);
    try {
      await leaveGroup(selectedGroup.id);
      setShowLeaveConfirm(false);
      setSelectedGroup(null);
      // Do not auto-select another group after leaving
    } catch (error) {
      console.error("Failed to leave group:", error);
      alert(error.message || "Failed to leave group");
    } finally {
      setLeavingGroup(false);
    }
  };

  const handleDeleteMessage = async () => {
    console.log("handleDeleteMessage called", {
      messageToDelete,
      userId: user?.id,
      selectedGroup,
    });

    if (!messageToDelete || !user?.id) {
      console.error("Missing required data:", {
        messageToDelete,
        userId: user?.id,
      });
      return;
    }

    // Check if this is a temporary local message (very large ID from Date.now())
    // Backend IDs are typically smaller sequential numbers
    if (messageToDelete.id > 1000000000000) {
      alert(
        "This message is still being sent. Please wait a moment and try again."
      );
      setMessageToDelete(null);
      return;
    }

    setDeletingMessageId(messageToDelete.id);
    try {
      console.log("Calling deleteMessage with:", {
        groupId: selectedGroup.id,
        messageId: messageToDelete.id,
        userId: user.id,
      });
      await deleteMessage(selectedGroup.id, messageToDelete.id, user.id);
      console.log("Delete successful, closing modal");
      setMessageToDelete(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert(error.message || "Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleTyping = (value) => {
    setNewMessage(value);

    if (selectedGroup && value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingIndicator(selectedGroup.id, true);
      }

      // Reset typing timeout
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(selectedGroup.id, false);
      }, 2000);
    } else if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(selectedGroup.id, false);
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100dvh-5rem)] sm:h-[calc(100vh-7rem)] flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Connecting to chat server...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-5rem)] sm:h-[calc(100vh-7rem)] flex flex-col overflow-hidden bg-white dark:bg-gray-800 sm:rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10">
      {/* Status Banner */}
      {!isConnected && (
        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-3 sm:px-4 py-2">
          <div className="flex items-center text-xs sm:text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              Running in local mode. Messages and groups are stored locally.
              <span className="hidden sm:inline">
                {" "}
                Connect backend server for persistence and real-time sync.
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="flex-1 flex min-h-0">
        {/* Groups List - Hidden on mobile when chat is selected */}
        <div
          className={`${
            selectedGroup ? "hidden lg:flex" : "flex"
          } lg:w-[22rem] xl:w-[24rem] lg:flex-none w-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-col min-h-0`}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Chat Groups</span>
                <span className="sm:hidden">Groups</span>
              </h2>
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Connection Status */}
                <div className="flex items-center">
                  {isConnected ? (
                    <Wifi
                      className="h-3 w-3 sm:h-4 sm:w-4 text-green-500"
                      title="Connected"
                    />
                  ) : (
                    <WifiOff
                      className="h-3 w-3 sm:h-4 sm:w-4 text-red-500"
                      title="Disconnected"
                    />
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refresh}
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 min-h-[40px] min-w-[40px] touch-manipulation"
                  title="Refresh"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Browse Groups Button */}
                <button
                  onClick={handleBrowseGroups}
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 min-h-[40px] min-w-[40px] touch-manipulation"
                  title="Browse Groups"
                >
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>

                {/* Create Group Button */}
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:text-gray-200 dark:hover:bg-gray-700 min-h-[40px] min-w-[40px] touch-manipulation"
                  title="Create Group"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full min-h-[42px] pl-9 sm:pl-10 pr-4 py-2 text-sm border-0 rounded-full leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
                {error.includes("backend") && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Make sure the backend server is running and accessible
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Create Group Form */}
          {showCreateGroup && (
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <form onSubmit={handleCreateGroup}>
                <div className="flex flex-col sm:flex-row sm:flex-nowrap items-stretch sm:items-center gap-2 sm:min-w-0">
                  <input
                    type="text"
                    className="flex-1 min-w-0 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Group name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="submit"
                      disabled={!newGroupName.trim()}
                      className="px-4 py-2 text-xs sm:text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 min-h-[36px] touch-manipulation"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateGroup(false);
                        setNewGroupName("");
                      }}
                      className="min-h-[44px] sm:min-h-[36px] px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const groupMessages = getGroupMessages(group.id);
                const lastMessage = groupMessages[groupMessages.length - 1];

                return (
                  <div
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className={`min-h-[72px] p-3 sm:px-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedGroup?.id === group.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-sm">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center min-w-0 flex-1 pr-2">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {group.name || "Unnamed Group"}
                            </p>
                            {(group.isDemo || group.isLocal) && (
                              <span className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded flex-shrink-0">
                                {group.isDemo ? "Demo" : "Local"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {group.memberCount || 0}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                            {group.description}
                          </p>
                        )}
                        {lastMessage ? (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage.senderId === user.id
                              ? "You: "
                              : `${lastMessage.senderName}: `}
                            {lastMessage.message}
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-300 dark:text-gray-600" />
                {error ? (
                  <div>
                    <p className="mb-2 text-xs sm:text-sm">
                      Unable to load groups
                    </p>
                    <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 mb-3">
                      Backend connection required
                    </p>
                    <button
                      onClick={refresh}
                      className="min-h-[44px] text-xs sm:text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 px-2 py-2 rounded"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 text-xs sm:text-sm">No groups found</p>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="min-h-[44px] text-xs sm:text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 px-2 py-2 rounded"
                    >
                      Create your first group
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`${
            selectedGroup ? "flex" : "hidden"
          } lg:flex flex-1 flex-col min-w-0 min-h-0 bg-[#efeae2] dark:bg-gray-950`}
        >
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 pr-2">
                    {/* Back Button */}
                    <button
                      onClick={handleBackToGroups}
                      className="min-h-[44px] min-w-[44px] px-2 inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                      title="Back to Groups"
                      aria-label="Back to groups"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span className="text-sm font-semibold">Groups</span>
                    </button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                        {selectedGroup.name || "Unnamed Group"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {selectedGroup.memberCount || 0} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    {!isConnected && (
                      <div className="hidden sm:flex items-center text-blue-500 text-xs sm:text-sm mr-2">
                        <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Local</span>
                      </div>
                    )}
                    {isConnected && (
                      <div className="hidden sm:flex items-center text-green-500 text-xs sm:text-sm mr-2">
                        <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Connected</span>
                      </div>
                    )}
                    <button
                      onClick={() => fetchGroupMembers(selectedGroup.id)}
                      className="min-h-[44px] min-w-[44px] p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      title="View Members"
                      disabled={loadingMembers}
                    >
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => setShowLeaveConfirm(true)}
                      className="min-h-[44px] min-w-[44px] p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Leave Group"
                    >
                      <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-2 sm:px-5 py-4 space-y-2 min-h-0 bg-[radial-gradient(circle_at_center,_rgba(120,113,108,0.08)_1px,_transparent_1px)] bg-[length:18px_18px]">
                {(() => {
                  const messages = getGroupMessages(selectedGroup.id);
                  const typingUsers = getTypingUsers(selectedGroup.id);

                  return messages.length > 0 || typingUsers.length > 0 ? (
                    <>
                      {messages.map((message) => {
                        const isOwnMessage = message.senderId === user.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex group/message ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-[88%] sm:max-w-[75%] lg:max-w-[65%]">
                              {!isOwnMessage && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                                  {message.senderName || "Unknown User"}
                                </p>
                              )}
                              <div
                                className={`flex items-start gap-2 ${
                                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                <div
                                  className={`relative px-3 py-2 rounded-xl break-words shadow-sm ${
                                    isOwnMessage
                                      ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-tr-sm"
                                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">
                                    {message.message}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isOwnMessage
                                        ? "text-emerald-700 dark:text-emerald-200 text-right"
                                        : "text-gray-500 dark:text-gray-400 text-right"
                                    }`}
                                  >
                                    {new Date(
                                      message.timestamp
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                {/* Show delete button for your own messages (all roles) */}
                                {isOwnMessage && (
                                  <button
                                    onClick={() => setMessageToDelete(message)}
                                    className="min-h-[40px] min-w-[40px] p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-300 opacity-80 sm:opacity-0 sm:group-hover/message:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0 rounded-full hover:bg-white/70 dark:hover:bg-gray-800"
                                    title="Delete message"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                              {typingUsers.map((u) => u.userName).join(", ")}{" "}
                              typing...
                            </p>
                            <div className="bg-gray-200 dark:bg-gray-700 px-3 sm:px-4 py-2 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                <div
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"
                                  style={{ animationDelay: "0.4s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-4 sm:mt-8 px-4">
                      <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm sm:text-base">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 px-2 sm:px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      className="block w-full min-h-[46px] border-0 rounded-full px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      placeholder={
                        isConnected ? "Type a message..." : "Connecting..."
                      }
                      value={newMessage}
                      onChange={(e) => handleTyping(e.target.value)}
                      disabled={!isConnected || isSending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected || isSending}
                    className="h-[46px] w-[46px] flex-shrink-0 inline-flex items-center justify-center border-0 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {isSending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a group
                </h3>
                <p className="text-sm sm:text-base mb-4">
                  Choose a group from the list to start messaging
                </p>
                {groups.length === 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="min-h-[44px] inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm sm:text-base rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Leave Group?
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Are you sure you want to leave{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedGroup?.name}
                </span>
                ? You will no longer receive messages from this group.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                disabled={leavingGroup}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={leavingGroup}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
              >
                {leavingGroup ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Leaving...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Leave Group</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Groups Modal */}
      {showBrowseGroups && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden mx-4">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Browse Available Groups
              </h3>
              <button
                onClick={() => setShowBrowseGroups(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh]">
              {loadingAllGroups ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Loading groups...
                  </span>
                </div>
              ) : allGroups.length > 0 ? (
                <div className="space-y-3">
                  {allGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                              {group.name || "Unnamed Group"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {group.memberCount || 0} members
                            </p>
                            {group.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={joiningGroupId === group.id}
                          className="min-h-[44px] w-full sm:w-auto sm:ml-4 px-4 py-2 bg-primary-600 text-white text-sm sm:text-base rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 flex-shrink-0 transition-colors"
                        >
                          {joiningGroupId === group.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Joining...</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              <span>Join</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    No new groups available to join
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
                    You&apos;re already a member of all existing groups
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden mx-4">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1 pr-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Group Members
                </h3>
                {selectedGroup && (
                  <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    ({groupMembers.length}{" "}
                    {groupMembers.length === 1 ? "member" : "members"})
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[60vh]">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Loading members...
                  </span>
                </div>
              ) : groupMembers.length > 0 ? (
                <div className="space-y-3">
                  {groupMembers.map((member, index) => (
                    <div
                      key={member.userId || index}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 dark:text-primary-300 font-semibold text-xs sm:text-sm">
                              {member.fullName
                                ? member.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)
                                : "U"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                {member.fullName || "Unknown User"}
                              </p>
                              {member.role && member.role !== "MEMBER" && (
                                <span className="mt-1 sm:mt-0 inline-block px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded flex-shrink-0">
                                  {member.role}
                                </span>
                              )}
                            </div>
                            {member.joinedAt && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Joined {formatDateDDMMYYYY(member.joinedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    No members found
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="min-h-[44px] px-4 py-2 bg-primary-600 text-white text-sm sm:text-base rounded-md hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Delete Message?
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-white break-words">
                  {messageToDelete.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDateTimeDDMMYYYY(messageToDelete.timestamp)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setMessageToDelete(null)}
                disabled={deletingMessageId === messageToDelete.id}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={deletingMessageId === messageToDelete.id}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-colors"
              >
                {deletingMessageId === messageToDelete.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
