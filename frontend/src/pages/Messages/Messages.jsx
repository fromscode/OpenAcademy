import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MoreVertical,
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import useChat from "../../hooks/useChat";
import chatAPI from "../../services/chatAPI";

const Messages = () => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    groups,
    isLoading: chatLoading,
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [selectedGroup]);

  // Auto-select first group if available
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
      joinGroup(groups[0].id);
    }
  }, [groups, selectedGroup, joinGroup]);

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

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;

    setLeavingGroup(true);
    try {
      await leaveGroup(selectedGroup.id);
      setShowLeaveConfirm(false);
      setSelectedGroup(null);
      // If there are other groups, select the first one
      if (groups.length > 1) {
        const remainingGroups = groups.filter((g) => g.id !== selectedGroup.id);
        if (remainingGroups.length > 0) {
          setSelectedGroup(remainingGroups[0]);
          joinGroup(remainingGroups[0].id);
        }
      }
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
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
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
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Status Banner */}
      {!isConnected && (
        <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
          <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              Running in local mode. Messages and groups are stored locally.
              Connect backend server for persistence and real-time sync.
            </span>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="flex-1 flex min-h-0">
        {/* Groups List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col min-h-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Chat Groups
              </h2>
              <div className="flex items-center space-x-2">
                {/* Connection Status */}
                <div className="flex items-center">
                  {isConnected ? (
                    <Wifi
                      className="h-4 w-4 text-green-500"
                      title="Connected"
                    />
                  ) : (
                    <WifiOff
                      className="h-4 w-4 text-red-500"
                      title="Disconnected"
                    />
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refresh}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                {/* Browse Groups Button */}
                <button
                  onClick={handleBrowseGroups}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Browse Groups"
                >
                  <UserPlus className="h-4 w-4" />
                </button>

                {/* Create Group Button */}
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Create Group"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                    Make sure the backend server is running on localhost:8080
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Create Group Form */}
          {showCreateGroup && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <form onSubmit={handleCreateGroup}>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 min-w-0 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Group name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newGroupName.trim()}
                    className="px-3 py-2 whitespace-nowrap bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateGroup(false);
                      setNewGroupName("");
                    }}
                    className="px-3 py-2 whitespace-nowrap border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Groups List */}
          <div className="flex-1 overflow-y-auto">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const groupMessages = getGroupMessages(group.id);
                const lastMessage = groupMessages[groupMessages.length - 1];

                return (
                  <div
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedGroup?.id === group.id
                        ? "bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {group.name || "Unnamed Group"}
                            </p>
                            {(group.isDemo || group.isLocal) && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded">
                                {group.isDemo ? "Demo" : "Local"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {group.memberCount || 0} members
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                            {group.description}
                          </p>
                        )}
                        {lastMessage ? (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage.senderId === user.id
                              ? "You: "
                              : `${lastMessage.senderName}: `}
                            {lastMessage.message}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                            No messages yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                {error ? (
                  <div>
                    <p className="mb-2">Unable to load groups</p>
                    <p className="text-sm text-red-500 dark:text-red-400 mb-3">
                      Backend connection required
                    </p>
                    <button
                      onClick={refresh}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">No groups found</p>
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
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
        <div className="flex-1 flex flex-col min-h-0">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedGroup.name || "Unnamed Group"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedGroup.memberCount || 0} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isConnected && (
                    <div className="flex items-center text-blue-500 text-sm">
                      <WifiOff className="h-4 w-4 mr-1" />
                      <span>Local Mode</span>
                    </div>
                  )}
                  {isConnected && (
                    <div className="flex items-center text-green-500 text-sm">
                      <Wifi className="h-4 w-4 mr-1" />
                      <span>Connected</span>
                    </div>
                  )}
                  <button
                    onClick={() => fetchGroupMembers(selectedGroup.id)}
                    className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    title="View Members"
                    disabled={loadingMembers}
                  >
                    <Users className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowLeaveConfirm(true)}
                    className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    title="Leave Group"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
                            <div className="max-w-xs lg:max-w-md">
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
                                  className={`px-4 py-2 rounded-lg ${
                                    isOwnMessage
                                      ? "bg-primary-600 text-white"
                                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                                  }`}
                                >
                                  <p className="text-sm">{message.message}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      isOwnMessage
                                        ? "text-primary-200"
                                        : "text-gray-500"
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
                                    className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 opacity-0 group-hover/message:opacity-100 transition-opacity flex-shrink-0 mt-1"
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
                          <div className="max-w-xs lg:max-w-md">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                              {typingUsers.map((u) => u.userName).join(", ")}{" "}
                              typing...
                            </p>
                            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
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
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                      <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  );
                })()}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a group
                </h3>
                <p>Choose a group from the list to start messaging</p>
                {groups.length === 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Leave Group?
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to leave{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedGroup?.name}
                </span>
                ? You will no longer receive messages from this group.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                disabled={leavingGroup}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={leavingGroup}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Browse Available Groups
              </h3>
              <button
                onClick={() => setShowBrowseGroups(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingAllGroups ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Loading groups...
                  </span>
                </div>
              ) : allGroups.length > 0 ? (
                <div className="space-y-3">
                  {allGroups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
                          className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 flex-shrink-0"
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
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No new groups available to join
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    You're already a member of all existing groups
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Group Members
                </h3>
                {selectedGroup && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({groupMembers.length}{" "}
                    {groupMembers.length === 1 ? "member" : "members"})
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Loading members...
                  </span>
                </div>
              ) : groupMembers.length > 0 ? (
                <div className="space-y-3">
                  {groupMembers.map((member, index) => (
                    <div
                      key={member.userId || index}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 dark:text-primary-300 font-semibold text-sm">
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
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.fullName || "Unknown User"}
                              </p>
                              {member.role && member.role !== "MEMBER" && (
                                <span className="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded">
                                  {member.role}
                                </span>
                              )}
                            </div>
                            {member.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {member.email}
                              </p>
                            )}
                            {member.phoneNumber && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.phoneNumber}
                              </p>
                            )}
                            {member.joinedAt && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Joined{" "}
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No members found
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Message?
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-white">
                  {messageToDelete.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(messageToDelete.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setMessageToDelete(null)}
                disabled={deletingMessageId === messageToDelete.id}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={deletingMessageId === messageToDelete.id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
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
