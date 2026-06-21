let chatSocket = null;
let chatReady = false;

function initChat() {
  const room = sessionStorage.getItem("room");
  const name = sessionStorage.getItem("display_name");
  if (!room || !name) return;

  const wsUrl = `ws://${window.location.host}`;
  chatSocket = new WebSocket(wsUrl);

  chatSocket.onopen = () => {
    const uid = sessionStorage.getItem("uid") || null;
    chatSocket.send(JSON.stringify({ type: "join", room, name, uid }));
    chatReady = true;
    console.log("✅ Chat connected");
  };

  chatSocket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "chat") {
      addMessage(msg.from, msg.text, false);
    } else if (msg.type === "members") {
      // Update participant list UI
      updateMemberList(msg.members || []);
    }
  };

  chatSocket.onclose = () => {
    chatReady = false;
    setTimeout(initChat, 3000);
  };
}

function sendChatMessage(text) {
  if (!chatReady || !chatSocket) return;
  chatSocket.send(JSON.stringify({ type: "chat", text }));
}

function addMessage(user, text, isSelf) {
  const box = document.getElementById("messages");

  // Ensure flex layout every time (in case CSS overrides it)
  box.style.display = "flex";
  box.style.flexDirection = "column";

  const wrapper = document.createElement("div");
  wrapper.style.cssText = [
    "width: 100%",
    "display: flex",
    "flex-direction: column",
    "align-items: " + (isSelf ? "flex-end" : "flex-start"),
    "margin: 5px 0",
    "padding: 0 12px",
    "box-sizing: border-box",
  ].join(";");

  const nameEl = document.createElement("div");
  nameEl.style.cssText = [
    "font-size: 11px",
    "font-weight: 600",
    "margin-bottom: 3px",
    "color: " + (isSelf ? "#c89ef2" : "#999999"),
  ].join(";");
  nameEl.textContent = isSelf ? "You" : user;

  const bubble = document.createElement("div");
  bubble.style.cssText = [
    "display: inline-block",
    "background: " + (isSelf ? "#6e3fa3" : "#2a2a3d"),
    "color: #ffffff",
    "padding: 9px 14px",
    "border-radius: " + (isSelf ? "18px 18px 4px 18px" : "18px 18px 18px 4px"),
    "max-width: 75%",
    "word-break: break-word",
    "font-size: 14px",
    "line-height: 1.5",
  ].join(";");
  bubble.textContent = text;

  wrapper.appendChild(nameEl);
  wrapper.appendChild(bubble);
  box.appendChild(wrapper);
  box.scrollTop = box.scrollHeight;
}

function updateMemberList(members) {
  const listEl = document.getElementById("member__list");
  const countEl = document.getElementById("members__count");
  if (!listEl) return;

  // Clear existing list
  listEl.innerHTML = "";

  const myName = sessionStorage.getItem("display_name");

  members.forEach((m) => {
    const item = document.createElement("div");
    item.className = "member__item";
    item.style.cssText =
      "display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.02);";

    const dot = document.createElement("span");
    dot.style.cssText =
      "width:10px;height:10px;border-radius:50%;background:#4ee44e;margin-right:12px;display:inline-block;";

    const name = document.createElement("div");
    name.style.fontSize = "14px";
    name.style.color = "#fff";
    name.textContent = m.name + (m.name === myName ? " (You)" : "");

    item.appendChild(dot);
    item.appendChild(name);

    listEl.appendChild(item);
  });

  if (countEl) countEl.innerText = members.length;
}

// Single form listener — only in room_chat.js
document.getElementById("message__form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.target.message;
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  addMessage(null, text, true); // show MY message on right
  sendChatMessage(text); // send to others
});

window.onload = () => {
  initChat();
};
