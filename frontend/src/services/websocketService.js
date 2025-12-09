// websocketService.js
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map(); // destination -> Set of callbacks
    this.connectHandlers = new Set();
    this.disconnectHandlers = new Set();
    this.errorHandlers = new Set();
    this._userId = null;

    this.reconnectDelay = 5000;
    this.debug = true;
  }

  _getWsEndpoint() {
    return "http://localhost:8080/ws";
  }

  connect(userId) {
    if (!userId) return;

    this._userId = userId;
    const token = localStorage.getItem("openacademy_token");
    const endpoint = this._getWsEndpoint();

    this.client = new Client({
      webSocketFactory: () => new SockJS(endpoint),
      reconnectDelay: this.reconnectDelay,
      debug: (msg) => this.debug && console.log("STOMP:", msg),
      onConnect: (frame) => {
        this.connected = true;
        console.log("WebSocket connected");
        this.connectHandlers.forEach((h) => h(frame));

        // re-subscribe
        this.subscriptions.forEach((callbacks, destination) => {
          if (!callbacks.stompSub) {
            callbacks.stompSub = this.client.subscribe(destination, (msg) =>
              this._handleMessage(destination, msg)
            );
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        this.errorHandlers.forEach((h) => h(frame));
      },
      onWebSocketClose: (evt) => {
        this.connected = false;
        this.disconnectHandlers.forEach((h) => h(evt));
        console.log("WebSocket disconnected");
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
    this.client = null;
    this.connected = false;
    this.subscriptions.clear();
  }

  subscribe(destination, callback) {
    if (!this.subscriptions.has(destination)) {
      this.subscriptions.set(destination, {
        callbacks: new Set(),
        stompSub: null,
      });
    }
    const meta = this.subscriptions.get(destination);
    meta.callbacks.add(callback);

    if (this.connected && !meta.stompSub) {
      meta.stompSub = this.client.subscribe(destination, (msg) =>
        this._handleMessage(destination, msg)
      );
    }

    return () => {
      meta.callbacks.delete(callback);
      if (meta.callbacks.size === 0 && meta.stompSub) {
        meta.stompSub.unsubscribe();
        this.subscriptions.delete(destination);
      }
    };
  }

  _handleMessage(destination, msg) {
    let payload;
    try {
      payload = JSON.parse(msg.body);
    } catch (e) {
      payload = msg.body;
    }

    const meta = this.subscriptions.get(destination);
    if (meta) {
      meta.callbacks.forEach((cb) => cb(payload));
    }
  }

  publish(destination, payload) {
    if (!this.connected) return false;
    try {
      this.client.publish({ destination, body: JSON.stringify(payload) });
      return true;
    } catch (e) {
      console.error("Failed to publish", e);
      return false;
    }
  }

  sendChatMessage({ groupId, senderId, content }) {
    this.client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({
        // MUST be string
        groupId: Number(groupId), // make sure primitive
        senderId: Number(senderId),
        content: String(content),
      }),
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
}

export default new WebSocketService();
