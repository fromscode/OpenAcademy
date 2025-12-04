// WebSocket service for real-time chat functionality
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.messageHandlers = new Map();
    this.connectionHandlers = [];
    this.disconnectionHandlers = [];
    this.errorHandlers = [];
  }

  // Connect to WebSocket server
  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log("WebSocket already connected");
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";
    const token = localStorage.getItem("openacademy_token");

    try {
      // Include authentication token in connection URL
      const wsUrl = token
        ? `${WS_URL}?token=${token}&userId=${userId}`
        : `${WS_URL}?userId=${userId}`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = (event) => {
        console.log("WebSocket connected successfully");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Notify connection handlers
        this.connectionHandlers.forEach((handler) => handler(event));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        console.log("WebSocket connection closed", event.code, event.reason);
        this.isConnected = false;

        // Notify disconnection handlers
        this.disconnectionHandlers.forEach((handler) => handler(event));

        // Attempt to reconnect if not intentionally closed
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnect(userId);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.errorHandlers.forEach((handler) => handler(error));
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.errorHandlers.forEach((handler) => handler(error));
    }
  }

  // Reconnect with exponential backoff
  reconnect(userId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`
    );

    setTimeout(() => {
      this.connect(userId);
    }, this.reconnectDelay);

    // Exponential backoff with jitter
    this.reconnectDelay =
      Math.min(this.reconnectDelay * 2, 30000) + Math.random() * 1000;
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, "Manual disconnect");
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send message through WebSocket
  sendMessage(message) {
    if (this.socket && this.isConnected) {
      try {
        this.socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
        return false;
      }
    } else {
      console.warn("WebSocket not connected, cannot send message");
      return false;
    }
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;

    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in message handler for type ${type}:`, error);
        }
      });
    } else {
      console.warn(`No handler registered for message type: ${type}`);
    }
  }

  // Register message handler for specific message type
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  // Register connection event handlers
  onConnect(handler) {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  onDisconnect(handler) {
    this.disconnectionHandlers.push(handler);
    return () => {
      const index = this.disconnectionHandlers.indexOf(handler);
      if (index > -1) {
        this.disconnectionHandlers.splice(index, 1);
      }
    };
  }

  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Join a chat group (send join message)
  joinGroup(groupId) {
    return this.sendMessage({
      type: "JOIN_GROUP",
      payload: { groupId },
    });
  }

  // Leave a chat group (send leave message)
  leaveGroup(groupId) {
    return this.sendMessage({
      type: "LEAVE_GROUP",
      payload: { groupId },
    });
  }

  // Send a chat message
  sendChatMessage(groupId, message, senderId) {
    return this.sendMessage({
      type: "CHAT_MESSAGE",
      payload: {
        groupId,
        message,
        senderId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Send typing indicator
  sendTypingIndicator(groupId, isTyping, userId) {
    return this.sendMessage({
      type: "TYPING_INDICATOR",
      payload: {
        groupId,
        isTyping,
        userId,
      },
    });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
