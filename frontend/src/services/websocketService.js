// websocketService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

/**
 * Singleton WebSocket/STOMP service
 *
 * Usage:
 *  import webSocketService from "../services/websocketService";
 *  webSocketService.connect(userId);
 *  const unsub = webSocketService.subscribe(`/topic/group/${groupId}`, handler);
 *  webSocketService.publish("/app/chat.sendMessage", payload);
 */

class WebSocketService {
  constructor() {
    this.client = null; // @stomp/stompjs Client
    this.connected = false;
    this.subscriptions = new Map(); // destination -> {count, subscribers: Set}
    this.connectHandlers = new Set();
    this.disconnectHandlers = new Set();
    this.errorHandlers = new Set();
    this.messageHandlers = new Map(); // optional named handlers for types
    this._userId = null;

    // settings
    this.reconnectDelay = 5000;
    this.debug = false;
  }

  _getWsEndpoint(userId) {
    const base = import.meta.env.VITE_WS_URL || "http://localhost:8080/ws";
    const token = localStorage.getItem("openacademy_token");
    // SockJS uses HTTP endpoint; tokens can be passed as query params if your backend reads them
    const params = new URLSearchParams();
    if (token) params.append("token", token);
    if (userId) params.append("userId", userId);
    const url = `${base}?${params.toString()}`;
    return url;
  }

  connect(userId) {
    if (this.client && this.connected) {
      if (this.debug) console.log("STOMP: already connected");
      return;
    }
    this._userId = userId;
    const endpoint = this._getWsEndpoint(userId);

    // Create STOMP client with SockJS factory
    this.client = new Client({
      // We'll use webSocketFactory to create SockJS so we keep SockJS fallback behavior
      webSocketFactory: () => new SockJS(endpoint),
      connectHeaders: {},
      debug: (str) => {
        if (this.debug) console.log("STOMP DEBUG:", str);
      },
      reconnectDelay: this.reconnectDelay,
      onConnect: (frame) => {
        this.connected = true;
        if (this.debug) console.log("STOMP connected:", frame);
        // re-subscribe existing destinations
        [...this.subscriptions.keys()].forEach((destination) => {
          // re-subscribe all subscribers
          const meta = this.subscriptions.get(destination);
          if (meta && !meta.stompSub) {
            meta.stompSub = this.client.subscribe(destination, (msg) => {
              this._handleIncomingMessage(msg);
            });
          }
        });
        this.connectHandlers.forEach((h) => {
          try {
            h(frame);
          } catch (e) {
            console.error(e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP Error: ", frame);
        this.errorHandlers.forEach((h) => h(frame));
      },
      onWebSocketClose: (evt) => {
        this.connected = false;
        this.disconnectHandlers.forEach((h) => h(evt));
        if (this.debug) console.log("STOMP websocket closed", evt);
      },
      onWebSocketError: (evt) => {
        this.errorHandlers.forEach((h) => h(evt));
        if (this.debug) console.error("STOMP websocket error", evt);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.warn("Error while deactivating STOMP client", e);
      }
    }
    this.client = null;
    this.connected = false;
    // clear subscriptions
    this.subscriptions.forEach((meta, dest) => {
      if (meta.stompSub) {
        try {
          meta.stompSub.unsubscribe();
        } catch (e) {}
      }
    });
    this.subscriptions.clear();
  }

  // Subscribe to a STOMP destination. Returns unsubscribe function.
  subscribe(destination, callback) {
    if (!destination || typeof callback !== "function") {
      throw new Error("destination and callback required");
    }

    // ensure meta
    if (!this.subscriptions.has(destination)) {
      this.subscriptions.set(destination, {
        count: 0,
        subscribers: new Set(),
        stompSub: null,
      });
    }
    const meta = this.subscriptions.get(destination);
    meta.subscribers.add(callback);
    meta.count++;

    // If connected and not yet subscribed at stomp level, do it now
    if (this.client && this.connected && !meta.stompSub) {
      meta.stompSub = this.client.subscribe(destination, (msg) => {
        this._handleIncomingMessage(msg);
      });
    }

    // Unsubscribe function
    return () => {
      const m = this.subscriptions.get(destination);
      if (!m) return;
      m.subscribers.delete(callback);
      m.count = Math.max(0, m.count - 1);
      if (m.count === 0) {
        // remove stomp subscription
        try {
          if (m.stompSub) m.stompSub.unsubscribe();
        } catch (e) {}
        this.subscriptions.delete(destination);
      }
    };
  }

  // Internal: handle raw STOMP message (msg.body)
  _handleIncomingMessage(msg) {
    let body = msg.body;
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (e) {
      // if not JSON, forward raw
      payload = body;
    }

    const destination =
      msg.headers && (msg.headers.destination || msg.headers["destination"]);
    const meta = this.subscriptions.get(destination);
    if (meta) {
      meta.subscribers.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error("handler error", e);
        }
      });
    } else {
      // if no subscription meta, try messageHandlers (by type)
      if (payload && payload.type && this.messageHandlers.has(payload.type)) {
        this.messageHandlers.get(payload.type).forEach((h) => {
          try {
            h(payload.payload);
          } catch (e) {}
        });
      } else {
        // Optional: log orphan messages
        if (this.debug) console.log("Unrouted message", destination, payload);
      }
    }
  }

  // Publish / send to a destination
  publish(destination, payload = {}) {
    if (!this.client || !this.connected) {
      if (this.debug)
        console.warn("STOMP not connected; cannot publish", destination);
      return false;
    }
    try {
      const body =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      this.client.publish({ destination, body });
      return true;
    } catch (e) {
      console.error("Failed to publish STOMP message", e);
      return false;
    }
  }

  // convenience wrappers
  sendChatMessage(groupId, message, senderId) {
    return this.publish("/app/chat.sendMessage", {
      groupId,
      senderId,
      content: message,
    });
  }

  sendTypingIndicator(groupId, isTyping, userId) {
    return this.publish("/app/chat.typing", { groupId, userId, isTyping });
  }

  joinGroup(groupId) {
    return this.publish("/app/chat.join", { groupId });
  }

  leaveGroup(groupId) {
    return this.publish("/app/chat.leave", { groupId });
  }

  // connection event register/unregister
  onConnect(fn) {
    this.connectHandlers.add(fn);
    return () => this.connectHandlers.delete(fn);
  }
  onDisconnect(fn) {
    this.disconnectHandlers.add(fn);
    return () => this.disconnectHandlers.delete(fn);
  }
  onError(fn) {
    this.errorHandlers.add(fn);
    return () => this.errorHandlers.delete(fn);
  }

  // messageHandlers by custom type (optional)
  onMessageType(type, handler) {
    if (!this.messageHandlers.has(type))
      this.messageHandlers.set(type, new Set());
    this.messageHandlers.get(type).add(handler);
    return () => this.messageHandlers.get(type).delete(handler);
  }
}

export default new WebSocketService();
