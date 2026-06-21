// Agora App ID
const APP_ID = "b9b575649b48443596bba578b214b3ae";

let uid = sessionStorage.getItem("uid");
if (!uid) {
    uid = String(Date.now() + Math.floor(Math.random() * 10000));
    sessionStorage.setItem("uid", uid);
}
console.log("Current user UID:", uid);

let token = null;
let client;
let hasJoinedChannel = false; // Guard flag to prevent publish before join

// Fetch a fresh token from our local server
let fetchToken = async (channelName) => {
    try {
        const response = await fetch(`/get-token?channel=${channelName}&uid=${uid}`);
        if (!response.ok) throw new Error("Token server returned error: " + response.status);
        const data = await response.json();
        console.log("Token fetched successfully");
        return data.token;
    } catch (err) {
        console.error("Failed to fetch token:", err);
        alert("Could not get access token from server. Make sure server.js is running.");
        return null;
    }
};



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

// Camera switching variables for mobile
let currentCameraId = null;
let availableCameras = [];
let currentCameraIndex = 0;

let joinRoomInit = async () => {
    try {
        console.log(
            "Initializing room with UID:",
            uid,
            "Room ID:",
            roomId,
            "Display Name:",
            displayName,
        );

        // Check if Agora SDK is loaded
       if(typeof AgoraRTC === "undefined") {
            console.error("Agora SDK not loaded properly");
            alert("Error: Agora SDK not loaded. Please refresh the page.");
            return;
        }

        // rtmClient = await AgoraRTM.createInstance(APP_ID);
        // await rtmClient.login({ uid, token });
        // console.log("RTM login successful");

        // await rtmClient.addOrUpdateLocalUserAttributes({ name: displayName });

        // channel = await rtmClient.createChannel(roomId);
        // await channel.join();
        // console.log("RTM channel joined successfully");

        // channel.on("MemberJoined", handleMemberJoined);
        // channel.on("MemberLeft", handleMemberLeft);
        // channel.on("ChannelMessage", handleChannelMessage);

        // getMembers();
        // addBotMessageToDom(`Welcome to the room ${displayName}! 👋`);
        console.log("Joining RTC room only");

        if(typeof addBotMessageToDom === "function"){
            addBotMessageToDom(`Welcome to the room ${displayName}! 👋`);
        }

        // Fetch a fresh token for this channel
        token = await fetchToken(roomId);
        if (!token) return;

        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.join(APP_ID, roomId, token, uid);
        hasJoinedChannel = true; // ✅ Mark as joined
        updateMemberCount();
        console.log("Successfully joined RTC channel");
        client.on("user-published", handleUserPublished);
        client.on("user-left", handleUserLeft);

        // Initialize camera switching for mobile devices
        if (isMobileDevice()) {
            await getAvailableCameras();
            console.log(
                `Mobile device detected. Found ${availableCameras.length} cameras.`,
            );
        }
    } catch (error) {
        console.error("Error in joinRoomInit:", error);
        alert(
            "Failed to join room: " +
                error.message +
                ". Please check your internet connection and try again.",
        );
    }
};

let joinStream = async () => {
    try {
        console.log("Joining stream with UID:", uid);

        // Check if we're properly connected first
        if (!client || !hasJoinedChannel) {
            console.error("Client not ready yet");
            alert("Still connecting to room, please wait a moment and try again.");
            return;
        }

        document.getElementById("join-btn").style.display = "none";
        document.getElementsByClassName("stream__actions")[0].style.display =
            "flex"; // Check screen sharing support and update UI
        updateScreenShareButton();

        // Get available cameras for mobile switching
        await getAvailableCameras();
        updateCameraSwitchButton();

        console.log("Requesting camera and microphone access...");

        // Create video track with specific camera if selected
        let videoConstraints = {
            encoderConfig: {
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 480, ideal: 1080, max: 1080 },
            },
        };

        if (currentCameraId) {
            videoConstraints.cameraId = currentCameraId;
        }

        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
            {}, // Audio constraints
            videoConstraints,
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
                "Camera/microphone access denied. Please allow permissions and try again.",
            );
        } else if (error.name === "NotFoundError") {
            alert("No camera/microphone found. Please check your devices.");
        } else {
            alert("Failed to join stream: " + error.message);
        }
    }
};

// Function to update screen share button based on device capabilities
let updateScreenShareButton = () => {
    const screenBtn = document.getElementById("screen-btn");

    if (!isScreenSharingSupported() || isMobileDevice()) {
        // Disable screen sharing on mobile or unsupported browsers
        screenBtn.style.opacity = "0.5";
        screenBtn.style.cursor = "not-allowed";
        screenBtn.title = isMobileDevice()
            ? "Screen sharing is not available on mobile devices"
            : "Screen sharing is not supported in this browser";

        // Add a visual indicator
        screenBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z" opacity="0.5"/>
        <path d="M2 2L22 22" stroke="currentColor" stroke-width="2"/>
      </svg>
    `;
    } else {
        // Enable screen sharing for supported devices
        screenBtn.style.opacity = "1";
        screenBtn.style.cursor = "pointer";
        screenBtn.title = "Share your screen";
        screenBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z"/>
      </svg>
    `;
    }
};

// Utility function to sync button states with track states
let syncButtonStates = () => {
    const micBtn = document.getElementById("mic-btn");
    const cameraBtn = document.getElementById("camera-btn");

    if (localTracks[0]) {
        if (localTracks[0].muted) {
            micBtn.classList.remove("active");
            micBtn.style.backgroundColor = "#262625";
        } else {
            micBtn.classList.add("active");
            micBtn.style.backgroundColor = "#845695";
        }
        // Remove inline styles after a brief delay
        setTimeout(() => {
            micBtn.style.backgroundColor = "";
        }, 100);
    }

    if (localTracks[1]) {
        if (localTracks[1].muted) {
            cameraBtn.classList.remove("active");
            cameraBtn.style.backgroundColor = "#262625";
        } else {
            cameraBtn.classList.add("active");
            cameraBtn.style.backgroundColor = "#845695";
        }
        // Remove inline styles after a brief delay
        setTimeout(() => {
            cameraBtn.style.backgroundColor = "";
        }, 100);
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

    // Sync button states with track states
    syncButtonStates();

    document.getElementById("screen-btn").classList.remove("active");
    localTracks[1].play(`user-${uid}`);
    await client.publish([localTracks[0], localTracks[1]]);
};

// Update participant count display
let updateMemberCount = () => {
    const count = Object.keys(remoteUsers).length + 1; // +1 for self
    const countEl = document.getElementById("members__count");
    if (countEl) countEl.innerText = count;
};

let handleUserPublished = async (user, mediaType) => {
    try {
        console.log("User published:", user.uid, "Media type:", mediaType);
        remoteUsers[user.uid] = user;
        updateMemberCount();

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
            let videoFrame = document.getElementById(
                `user-container-${user.uid}`,
            );
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
    updateMemberCount();
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
    if (!localTracks[0]) return; // Not streaming yet

    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false);
    } else {
        await localTracks[0].setMuted(true);
    }

    // Use the utility function to sync states
    syncButtonStates();
};

let toggleCamera = async (e) => {
    let button = e.currentTarget;
    if (!localTracks[1]) return; // Not streaming yet

    if (localTracks[1].muted) {
        await localTracks[1].setMuted(false);
    } else {
        await localTracks[1].setMuted(true);
    }

    // Use the utility function to sync states
    syncButtonStates();
};

// Function to detect if user is on mobile device
let isMobileDevice = () => {
    return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
        ) ||
        window.innerWidth <= 768 ||
        "ontouchstart" in window
    );
};

// Function to enumerate available cameras
let getAvailableCameras = async () => {
    try {
        // Request permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        availableCameras = devices.filter(
            (device) => device.kind === "videoinput",
        );

        // Try to identify front and back cameras based on labels
        availableCameras.forEach((camera, index) => {
            const label = camera.label.toLowerCase();
            if (label.includes("front") || label.includes("user")) {
                camera.facingMode = "user";
            } else if (
                label.includes("back") ||
                label.includes("rear") ||
                label.includes("environment")
            ) {
                camera.facingMode = "environment";
            } else {
                // Default to alternating for unlabeled cameras
                camera.facingMode = index % 2 === 0 ? "user" : "environment";
            }
        });

        console.log(
            "Available cameras:",
            availableCameras.map((c) => ({
                label: c.label || "Unknown Camera",
                facingMode: c.facingMode,
                deviceId: c.deviceId.substring(0, 8) + "...",
            })),
        );

        return availableCameras;
    } catch (error) {
        console.error("Error enumerating cameras:", error);
        return [];
    }
};

// Function to update camera switch button visibility
let updateCameraSwitchButton = () => {
    const cameraSwitchBtn = document.getElementById("camera-switch-btn");

    if (isMobileDevice() && availableCameras.length > 1) {
        cameraSwitchBtn.style.display = "block";
        cameraSwitchBtn.style.opacity = "1";
        cameraSwitchBtn.style.cursor = "pointer";
        cameraSwitchBtn.title = `Switch camera (${availableCameras.length} available)`;
        cameraSwitchBtn.classList.add("show");

        console.log(
            `Camera switching enabled: ${availableCameras.length} cameras found`,
        );
    } else {
        cameraSwitchBtn.style.display = "none";
        console.log(
            "Camera switching not available:",
            !isMobileDevice()
                ? "Not mobile device"
                : "Only one camera available",
        );
    }
};

// Function to switch camera on mobile devices
let switchCamera = async () => {
    if (!isMobileDevice() || availableCameras.length <= 1) {
        console.log("Camera switching not available");
        showNotification("Camera switching not available", "warning");
        return;
    }

    const cameraSwitchBtn = document.getElementById("camera-switch-btn");

    try {
        // Add loading state
        cameraSwitchBtn.disabled = true;
        cameraSwitchBtn.style.opacity = "0.6";
        // Stop current video track
        if (localTracks[1]) {
            localTracks[1].stop();
            localTracks[1].close();
            await client.unpublish([localTracks[1]]);
        }

        // Switch to next camera
        currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
        currentCameraId = availableCameras[currentCameraIndex].deviceId;

        console.log(
            "Switching to camera:",
            availableCameras[currentCameraIndex].label ||
                `Camera ${currentCameraIndex + 1}`,
        );

        // Create new video track with selected camera
        const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
            cameraId: currentCameraId,
            encoderConfig: {
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 480, ideal: 1080, max: 1080 },
            },
        });

        // Update local tracks array
        localTracks[1] = newVideoTrack;

        // Play the new video track
        newVideoTrack.play(`user-${uid}`);

        // Publish the new video track
        await client.publish([newVideoTrack]);

        // Show notification
        const cameraName =
            availableCameras[currentCameraIndex].label ||
            (availableCameras[currentCameraIndex].facingMode === "user"
                ? "Front Camera"
                : availableCameras[currentCameraIndex].facingMode ===
                    "environment"
                  ? "Back Camera"
                  : `Camera ${currentCameraIndex + 1}`);
        showNotification(`📷 Switched to ${cameraName}`, "info");

        // Reset button state
        cameraSwitchBtn.disabled = false;
        cameraSwitchBtn.style.opacity = "1";
    } catch (error) {
        console.error("Error switching camera:", error);

        // Reset button state
        cameraSwitchBtn.disabled = false;
        cameraSwitchBtn.style.opacity = "1";

        showNotification("Failed to switch camera", "error");

        // Try to restore previous camera
        try {
            const fallbackTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: {
                    width: { min: 640, ideal: 1920, max: 1920 },
                    height: { min: 480, ideal: 1080, max: 1080 },
                },
            });
            localTracks[1] = fallbackTrack;
            fallbackTrack.play(`user-${uid}`);
            await client.publish([fallbackTrack]);
        } catch (fallbackError) {
            console.error("Failed to restore camera:", fallbackError);
        }
    }
};

// Function to check if screen sharing is supported
let isScreenSharingSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
};

let toggleScreen = async (e) => {
    let screenButton = e.currentTarget;
    let cameraButton = document.getElementById("camera-btn");

    // Check if screen sharing is supported
    if (!isScreenSharingSupported()) {
        showScreenShareNotSupported();
        return;
    }

    // Check if user is on mobile device
    if (isMobileDevice()) {
        showMobileScreenShareWarning();
        return;
    }

    if (!sharingScreen) {
        try {
            sharingScreen = true;

            screenButton.classList.add("active");
            cameraButton.classList.remove("active");
            cameraButton.style.display = "none";

            // Show loading state
            screenButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" opacity="0.3"/><path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2v2c4.411 0 8 3.589 8 8s-3.589 8-8 8v2z" fill="currentColor"><animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>';

            localScreenTracks = await AgoraRTC.createScreenVideoTrack();

            // Restore original icon
            screenButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z"/></svg>';

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

            let videoFrames =
                document.getElementsByClassName("video__container");
            for (let i = 0; videoFrames.length > i; i++) {
                if (videoFrames[i].id != userIdInDisplayFrame) {
                    videoFrames[i].style.height = "100px";
                    videoFrames[i].style.width = "100px";
                }
            }

            // Add screen share end detection
            localScreenTracks.on("track-ended", () => {
                console.log("Screen sharing ended by user");
                stopScreenSharing();
            });
        } catch (error) {
            console.error("Screen sharing failed:", error);

            // Reset button state
            sharingScreen = false;
            screenButton.classList.remove("active");
            cameraButton.style.display = "block";
            screenButton.innerHTML =
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z"/></svg>';

            if (error.name === "NotAllowedError") {
                showScreenSharePermissionDenied();
            } else if (error.name === "NotSupportedError") {
                showScreenShareNotSupported();
            } else {
                showScreenShareGenericError(error.message);
            }
        }
    } else {
        stopScreenSharing();
    }
};

// Helper function to stop screen sharing
let stopScreenSharing = async () => {
    sharingScreen = false;
    let screenButton = document.getElementById("screen-btn");
    let cameraButton = document.getElementById("camera-btn");

    screenButton.classList.remove("active");
    cameraButton.style.display = "block";

    if (localScreenTracks) {
        localScreenTracks.stop();
        localScreenTracks.close();
    }

    document.getElementById(`user-container-${uid}`).remove();
    await client.unpublish([localScreenTracks]);

    switchToCamera();
};

// Error handling functions
let showMobileScreenShareWarning = () => {
    addBotMessageToDom(
        "📱 Screen sharing is not available on mobile devices. You can share your camera instead!",
    );

    // Show temporary notification
    showNotification(
        "Screen sharing is not supported on mobile devices",
        "warning",
    );
};

let showScreenShareNotSupported = () => {
    addBotMessageToDom(
        "❌ Screen sharing is not supported in this browser. Please use Chrome, Firefox, or Edge.",
    );
    showNotification("Screen sharing not supported in this browser", "error");
};

let showScreenSharePermissionDenied = () => {
    addBotMessageToDom(
        "🚫 Screen sharing permission was denied. Please allow screen sharing and try again.",
    );
    showNotification("Screen sharing permission denied", "warning");
};

let showScreenShareGenericError = (message) => {
    addBotMessageToDom(`❌ Screen sharing failed: ${message}`);
    showNotification("Screen sharing failed", "error");
};

// Simple notification system
let showNotification = (message, type = "info") => {
    // Remove existing notifications
    const existingNotification = document.querySelector(
        ".screen-share-notification",
    );
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = `screen-share-notification ${type}`;
    notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    ${type === "error" ? "background-color: #ff4757;" : ""}
    ${type === "warning" ? "background-color: #ffa502;" : ""}
    ${type === "info" ? "background-color: #5352ed;" : ""}
  `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Slide in animation
    setTimeout(() => {
        notification.style.transform = "translateX(0)";
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
};

let leaveStream = async (e) => {
    e.preventDefault();

    document.getElementById("join-btn").style.display = "block";
    document.getElementsByClassName("stream__actions")[0].style.display =
        "none";

    for (let i = 0; localTracks.length > i; i++) {
        localTracks[i].stop();
        localTracks[i].close();
    }

    if (localTracks.length > 0) {
        await client.unpublish([localTracks[0], localTracks[1]]);
    }

    if (localScreenTracks) {
        await client.unpublish([localScreenTracks]);
    }

    const userContainer = document.getElementById(`user-container-${uid}`);
    if (userContainer) userContainer.remove();

    if (userIdInDisplayFrame === `user-container-${uid}`) {
        displayFrame.style.display = null;

        for (let i = 0; videoFrames.length > i; i++) {
            videoFrames[i].style.height = "300px";
            videoFrames[i].style.width = "300px";
        }
    }

    // Reset camera switching state
    currentCameraId = null;
    currentCameraIndex = 0;
    availableCameras = [];

  
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("screen-btn").addEventListener("click", toggleScreen);
document.getElementById("join-btn").addEventListener("click", joinStream);
document.getElementById("leave-btn").addEventListener("click", leaveStream);

// Add camera switch button event listener if it exists
const cameraSwitchBtn = document.getElementById("camera-switch-btn");
if (cameraSwitchBtn) {
    cameraSwitchBtn.addEventListener("click", switchCamera);
}

joinRoomInit();
