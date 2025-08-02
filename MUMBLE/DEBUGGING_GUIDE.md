# Video Calling App Debugging Guide

## The Issue
When two users join the same room ID (5502), only one user's video is showing instead of both.

## What I've Fixed
1. **Improved UID Generation**: Changed from random 4-digit numbers to timestamp + random number to prevent UID conflicts
2. **Added Debug Logging**: Added console logs to track user actions and debugging

## Steps to Debug and Test

### Step 1: Clear Browser Data (Important!)
Before testing, both users should:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear all Session Storage and Local Storage
4. Refresh the page

### Step 2: Test Process
1. **First User**: 
   - Open `lobby.html`
   - Enter name (e.g., "User1") 
   - Enter room name: "5502"
   - Click "Go to Room"
   - **IMPORTANT**: Click "Join Stream" button in the room

2. **Second User** (different browser/incognito):
   - Open `lobby.html`
   - Enter name (e.g., "User2")
   - Enter room name: "5502" 
   - Click "Go to Room"
   - **IMPORTANT**: Click "Join Stream" button in the room

### Step 3: Check Console Logs
Open Developer Tools (F12) and check the Console tab for these messages:
- "Current user UID: [number]" - Should be different for each user
- "Initializing room with UID: [number] Room ID: 5502"
- "A new member has joined the room: [UID]"
- "Total members in room: 2" (when second user joins)
- "Joining stream with UID: [number]" (when clicking Join Stream)
- "User published: [UID] Media type: video/audio"
- "Creating new video container for user: [UID]"

### Common Issues and Solutions

#### Issue 1: Same UID for both users
**Symptoms**: Console shows same UID for both users
**Solution**: Clear browser storage completely and try again

#### Issue 2: Users not in same room
**Symptoms**: Member count stays at 1, no "new member joined" message
**Solution**: Ensure both users enter exactly the same room name "5502"

#### Issue 3: User not clicking "Join Stream"
**Symptoms**: Member shows in participant list but no video appears
**Solution**: Both users MUST click the "Join Stream" button to start video

#### Issue 4: Permission Issues
**Symptoms**: Browser doesn't ask for camera/microphone permissions
**Solution**: 
- Use `https://` URL or `localhost`
- Grant camera/microphone permissions when prompted
- Check browser settings if permissions were previously denied

### Expected Behavior
When working correctly, you should see:
1. Both users in the "Participants" panel (count shows 2)
2. Both users' video streams in the video area
3. Console logs showing both users publishing video/audio tracks

### Network Requirements
- Both users need stable internet connection
- The Agora SDK requires internet access to their servers
- Firewall/antivirus might block WebRTC - try disabling temporarily for testing

## If Still Not Working
1. Check if Agora APP_ID is valid and active
2. Try using different browsers (Chrome, Firefox, Edge)
3. Test on different networks
4. Check browser compatibility with WebRTC
