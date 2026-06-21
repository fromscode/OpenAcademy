const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ✅ Your Agora credentials
const APP_ID = "b9b575649b48443596bba578b214b3ae";
const APP_CERTIFICATE = "d5ce94da0b0a4475953eea7efb5e0f06";

// RTC Token (for video calling)
app.get("/get-token", (req, res) => {
  const channelName = req.query.channel;
  const uid = parseInt(req.query.uid) || 0;
  if (!channelName)
    return res.status(400).json({ error: "Channel name is required" });

  const role = RtcRole.PUBLISHER;
  const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  console.log(`✅ RTC Token generated for channel: ${channelName}`);
  res.json({ token });
});

// ─── WebSocket Chat Server ───────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store clients per room: { roomName: Map(ws -> name) }
const rooms = {};

wss.on("connection", (ws) => {
  let userRoom = null;
  let userName = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      // User joins a room
      if (msg.type === "join") {
        userRoom = msg.room;
        // Use provided name, fallback to a generated one
        userName =
          msg.name || `User ${msg.uid || Math.floor(Math.random() * 1000000)}`;
        if (!rooms[userRoom]) rooms[userRoom] = new Map();
        rooms[userRoom].set(ws, userName);
        console.log(`✅ ${userName} joined room: ${userRoom}`);

        // Broadcast updated members list to everyone in the room
        const memberList = Array.from(rooms[userRoom].values()).map((name) => ({
          name,
        }));
        const membersPayload = JSON.stringify({
          type: "members",
          members: memberList,
        });
        rooms[userRoom].forEach((_, clientWs) => {
          if (clientWs.readyState === 1) clientWs.send(membersPayload);
        });
      }

      // User sends a chat message
      if (msg.type === "chat" && userRoom && rooms[userRoom]) {
        const payload = JSON.stringify({
          type: "chat",
          from: userName,
          text: msg.text,
        });
        // Broadcast to everyone else in the same room
        rooms[userRoom].forEach((clientName, client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(payload);
          }
        });
      }
    } catch (err) {
      console.error("WS message error:", err);
    }
  });

  ws.on("close", () => {
    if (userRoom && rooms[userRoom]) {
      rooms[userRoom].delete(ws);
      console.log(`❌ ${userName} left room: ${userRoom}`);

      // Broadcast updated members list
      if (rooms[userRoom].size > 0) {
        const memberList = Array.from(rooms[userRoom].values()).map((name) => ({
          name,
        }));
        const membersPayload = JSON.stringify({
          type: "members",
          members: memberList,
        });
        rooms[userRoom].forEach((_, clientWs) => {
          if (clientWs.readyState === 1) clientWs.send(membersPayload);
        });
      } else {
        // No clients left, clean up room
        delete rooms[userRoom];
      }
    }
  });
});

const PORT = 5502;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://127.0.0.1:${PORT}`);
  console.log(`✅ Open http://127.0.0.1:${PORT}/lobby.html to start`);
});
