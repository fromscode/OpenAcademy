// Test App ID (works without token) - replace with your own
const APP_ID = "aab8b8f5a8cd4469a63042fcfafe7063";

let uid = sessionStorage.getItem("uid");
if (!uid) {
  // Generate a more unique UID using timestamp + random number
  uid = String(Date.now() + Math.floor(Math.random() * 10000));
  sessionStorage.setItem("uid", uid);
}
console.log("Current user UID:", uid);

let token = null;
let client;

let rtmClient;
let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get("room");

if (!roomId) {
  roomId = "main";
}

let displayName = sessionStorage.getItem("display_name");
if (!displayName) {
  window.location = "lobby.html";
}

let localTracks = [];
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {
  try {
    console.log(
      "Initializing room with UID:",
      uid,
      "Room ID:",
      roomId,
      "Display Name:",
      displayName
    );

    // Check if Agora SDK is loaded
    if (typeof AgoraRTM === "undefined" || typeof AgoraRTC === "undefined") {
      console.error("Agora SDK not loaded properly");
      alert("Error: Agora SDK not loaded. Please refresh the page.");
      return;
    }

    rtmClient = await AgoraRTM.createInstance(APP_ID);
    await rtmClient.login({ uid, token });
    console.log("RTM login successful");

    await rtmClient.addOrUpdateLocalUserAttributes({ name: displayName });

    channel = await rtmClient.createChannel(roomId);
    await channel.join();
    console.log("RTM channel joined successfully");

    channel.on("MemberJoined", handleMemberJoined);
    channel.on("MemberLeft", handleMemberLeft);
    channel.on("ChannelMessage", handleChannelMessage);

    getMembers();
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`);

    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    await client.join(APP_ID, roomId, token, uid);
    console.log("Successfully joined RTC channel");

    client.on("user-published", handleUserPublished);
    client.on("user-left", handleUserLeft);
  } catch (error) {
    console.error("Error in joinRoomInit:", error);
    alert(
      "Failed to join room: " +
        error.message +
        ". Please check your internet connection and try again."
    );
  }
};

let joinStream = async () => {
  try {
    console.log("Joining stream with UID:", uid);

    // Check if we're properly connected first
    if (!client || !channel) {
      console.error("Client or channel not initialized");
      alert("Please refresh the page and try again");
      return;
    }

    document.getElementById("join-btn").style.display = "none";
    document.getElementsByClassName("stream__actions")[0].style.display =
      "flex";

    console.log("Requesting camera and microphone access...");
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
      {}, // Audio constraints
      {
        // Video constraints
        encoderConfig: {
          width: { min: 640, ideal: 1920, max: 1920 },
          height: { min: 480, ideal: 1080, max: 1080 },
        },
      }
    );
    console.log("Camera and microphone access granted");

    let player = `<div class="video__container" id="user-container-${uid}">
                      <div class="video-player" id="user-${uid}"></div>
                   </div>`;

    document
      .getElementById("streams__container")
      .insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    console.log("Playing local video track");
    localTracks[1].play(`user-${uid}`);

    console.log("Publishing tracks for UID:", uid);
    await client.publish([localTracks[0], localTracks[1]]);
    console.log("Successfully published audio and video tracks");
  } catch (error) {
    console.error("Error in joinStream:", error);

    // Re-show join button if there was an error
    document.getElementById("join-btn").style.display = "block";
    document.getElementsByClassName("stream__actions")[0].style.display =
      "none";

    if (error.name === "NotAllowedError") {
      alert(
        "Camera/microphone access denied. Please allow permissions and try again."
      );
    } else if (error.name === "NotFoundError") {
      alert("No camera/microphone found. Please check your devices.");
    } else {
      alert("Failed to join stream: " + error.message);
    }
  }
};

let switchToCamera = async () => {
  let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`;
  displayFrame.insertAdjacentHTML("beforeend", player);

  // Don't mute the tracks, preserve their current state
  // await localTracks[0].setMuted(true);
  // await localTracks[1].setMuted(true);

  // Update button states based on actual track mute state
  if (localTracks[0].muted) {
    document.getElementById("mic-btn").classList.remove("active");
  } else {
    document.getElementById("mic-btn").classList.add("active");
  }

  if (localTracks[1].muted) {
    document.getElementById("camera-btn").classList.remove("active");
  } else {
    document.getElementById("camera-btn").classList.add("active");
  }

  document.getElementById("screen-btn").classList.remove("active");
  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

let handleUserPublished = async (user, mediaType) => {
  try {
    console.log("User published:", user.uid, "Media type:", mediaType);
    remoteUsers[user.uid] = user;

    console.log("Subscribing to user:", user.uid, "for", mediaType);
    await client.subscribe(user, mediaType);
    console.log("Successfully subscribed to user:", user.uid);

    let player = document.getElementById(`user-container-${user.uid}`);
    if (player === null) {
      console.log("Creating new video container for user:", user.uid);
      player = `<div class="video__container" id="user-container-${user.uid}">
                  <div class="video-player" id="user-${user.uid}"></div>
              </div>`;

      document
        .getElementById("streams__container")
        .insertAdjacentHTML("beforeend", player);
      document
        .getElementById(`user-container-${user.uid}`)
        .addEventListener("click", expandVideoFrame);
    }

    if (displayFrame.style.display) {
      let videoFrame = document.getElementById(`user-container-${user.uid}`);
      videoFrame.style.height = "100px";
      videoFrame.style.width = "100px";
    }

    if (mediaType === "video") {
      console.log("Playing video track for user:", user.uid);
      if (user.videoTrack) {
        user.videoTrack.play(`user-${user.uid}`);
        console.log("Video track started playing for user:", user.uid);
      } else {
        console.error("No video track found for user:", user.uid);
      }
    }

    if (mediaType === "audio") {
      console.log("Playing audio track for user:", user.uid);
      if (user.audioTrack) {
        user.audioTrack.play();
        console.log("Audio track started playing for user:", user.uid);
      } else {
        console.error("No audio track found for user:", user.uid);
      }
    }
  } catch (error) {
    console.error("Error in handleUserPublished:", error);
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  let item = document.getElementById(`user-container-${user.uid}`);
  if (item) {
    item.remove();
  }

  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName("video__container");

    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  }
};

let toggleMic = async (e) => {
  let button = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    button.classList.add("active");
  } else {
    await localTracks[0].setMuted(true);
    button.classList.remove("active");
  }
};

let toggleCamera = async (e) => {
  let button = e.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    button.classList.add("active");
  } else {
    await localTracks[1].setMuted(true);
    button.classList.remove("active");
  }
};

let toggleScreen = async (e) => {
  let screenButton = e.currentTarget;
  let cameraButton = document.getElementById("camera-btn");

  if (!sharingScreen) {
    sharingScreen = true;

    screenButton.classList.add("active");
    cameraButton.classList.remove("active");
    cameraButton.style.display = "none";

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = "block";

    let player = `<div class="video__container" id="user-container-${uid}">
                <div class="video-player" id="user-${uid}"></div>
            </div>`;

    displayFrame.insertAdjacentHTML("beforeend", player);
    document
      .getElementById(`user-container-${uid}`)
      .addEventListener("click", expandVideoFrame);

    userIdInDisplayFrame = `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localTracks[0], localScreenTracks]);

    let videoFrames = document.getElementsByClassName("video__container");
    for (let i = 0; videoFrames.length > i; i++) {
      if (videoFrames[i].id != userIdInDisplayFrame) {
        videoFrames[i].style.height = "100px";
        videoFrames[i].style.width = "100px";
      }
    }
  } else {
    sharingScreen = false;
    cameraButton.style.display = "block";
    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish([localScreenTracks]);

    switchToCamera();
  }
};

let leaveStream = async (e) => {
  e.preventDefault();

  document.getElementById("join-btn").style.display = "block";
  document.getElementsByClassName("stream__actions")[0].style.display = "none";

  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.unpublish([localTracks[0], localTracks[1]]);

  if (localScreenTracks) {
    await client.unpublish([localScreenTracks]);
  }

  document.getElementById(`user-container-${uid}`).remove();

  if (userIdInDisplayFrame === `user-container-${uid}`) {
    displayFrame.style.display = null;

    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = "300px";
      videoFrames[i].style.width = "300px";
    }
  }

  channel.sendMessage({
    text: JSON.stringify({ type: "user_left", uid: uid }),
  });
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("screen-btn").addEventListener("click", toggleScreen);
document.getElementById("join-btn").addEventListener("click", joinStream);
document.getElementById("leave-btn").addEventListener("click", leaveStream);

joinRoomInit();
