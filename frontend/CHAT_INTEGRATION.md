# Chat Integration Documentation

## Overview
This implementation integrates the OpenAcademy frontend with the backend chat system, providing real-time messaging functionality for students in chat groups.

## Features Implemented

### 1. Real-time Chat Groups
- **Group-based messaging**: Students can participate in chat groups
- **Real-time updates**: Messages appear instantly via WebSocket connection
- **Group management**: Create new groups and manage existing ones

### 2. WebSocket Integration
- **Live connection**: Real-time bidirectional communication with the backend
- **Auto-reconnection**: Automatically reconnects on connection loss
- **Typing indicators**: Shows when users are typing
- **Connection status**: Visual indicators for online/offline status

### 3. User Interface
- **Modern chat interface**: Clean, responsive design with dark mode support
- **Message history**: View all previous messages in groups
- **Search functionality**: Search through chat groups
- **Message timestamps**: Clear time stamps for all messages

## Backend API Integration

### Chat Groups API Endpoints
- `GET /api/chat/groups/all-groups` - Get all available groups
- `GET /api/chat/groups/{groupId}` - Get specific group details
- `POST /api/chat/groups/create/{group-name}/{owner-id}` - Create new group
- `POST /api/chat/groups/add-member/{group-id}/{user-id}/{role}` - Add member to group
- `DELETE /api/chat/groups/remove-member/{group-id}/{user-id}/` - Remove member from group

### Chat Messages API Endpoints
- `POST /api/chat/messages/group/{groupId}` - Get all messages from a group
- `POST /api/chat/messages/send` - Send a message to a group

### WebSocket Connection
- **URL**: `ws://localhost:8080/ws`
- **Authentication**: JWT token passed as query parameter
- **Message Types**: 
  - `JOIN_GROUP` - Join a chat group
  - `LEAVE_GROUP` - Leave a chat group
  - `CHAT_MESSAGE` - Send/receive chat messages
  - `TYPING_INDICATOR` - Typing status updates

## File Structure

### New Files Added
```
frontend/src/
├── services/
│   ├── chatAPI.js              # Chat API service
│   └── websocketService.js     # WebSocket management
├── hooks/
│   └── useChat.js              # Custom React hook for chat functionality
└── pages/Messages/
    └── Messages.jsx            # Updated Messages component
```

### Key Components

#### 1. Chat API Service (`services/chatAPI.js`)
Handles all HTTP requests to the chat backend:
- Group management operations
- Message sending and retrieval
- Proper authentication with JWT tokens

#### 2. WebSocket Service (`services/websocketService.js`)
Manages real-time WebSocket connection:
- Connection establishment and management
- Message handling and event dispatching
- Auto-reconnection with exponential backoff
- Typing indicators and presence management

#### 3. Custom Hook (`hooks/useChat.js`)
Provides a clean interface for chat functionality:
- State management for groups and messages
- WebSocket event handling
- Message sending and receiving
- Error handling and loading states

#### 4. Updated Messages Component (`pages/Messages/Messages.jsx`)
Modern chat interface with:
- Group selection sidebar
- Real-time message display
- Message composition with typing indicators
- Connection status indicators
- Group creation functionality

## Usage Instructions

### For Students
1. **Access Chat**: Navigate to the Messages section in the student dashboard
2. **Join Groups**: Select an existing group or create a new one
3. **Send Messages**: Type and send messages in real-time
4. **View Status**: Monitor connection status and typing indicators

### Environment Configuration
Ensure these environment variables are set:
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## Features

### Real-time Messaging
- ✅ Send and receive messages instantly
- ✅ WebSocket connection with auto-reconnection
- ✅ Typing indicators for better UX
- ✅ Message timestamps and sender information

### Group Management
- ✅ View all available chat groups
- ✅ Create new chat groups
- ✅ Join and leave groups
- ✅ Search through groups

### User Experience
- ✅ Responsive design for all screen sizes
- ✅ Dark mode support
- ✅ Loading states and error handling
- ✅ Connection status indicators
- ✅ Auto-scroll to latest messages

### Technical Features
- ✅ JWT authentication for API calls
- ✅ WebSocket authentication
- ✅ Error boundary handling
- ✅ Memory leak prevention
- ✅ Optimistic UI updates

## Testing the Integration

### Prerequisites
1. Backend server running on `http://localhost:8080`
2. WebSocket server available at `ws://localhost:8080/ws`
3. User authenticated with valid JWT token

### Test Steps
1. **Login**: Authenticate as a student user
2. **Navigate**: Go to Messages section
3. **Create Group**: Create a test chat group
4. **Send Messages**: Send test messages
5. **Real-time**: Open multiple browser tabs to test real-time updates
6. **Connection**: Test connection resilience by temporarily disconnecting network

## Error Handling
- **Connection Errors**: Graceful handling of WebSocket disconnections
- **API Errors**: User-friendly error messages for failed API calls
- **Authentication**: Proper handling of expired tokens
- **Network Issues**: Automatic retry mechanisms for network problems

## Performance Optimizations
- **Message Pagination**: Ready for implementation when needed
- **Memory Management**: Proper cleanup of WebSocket connections
- **Efficient Re-renders**: Optimized React component updates
- **Lazy Loading**: Messages loaded on-demand

## Future Enhancements
- File sharing in chat groups
- Message reactions and replies
- User presence indicators
- Message search functionality
- Push notifications for new messages
- Message encryption for privacy

## Troubleshooting

### Common Issues
1. **WebSocket Connection Fails**: Check backend server and WebSocket endpoint
2. **Messages Not Sending**: Verify API authentication and network connectivity
3. **Groups Not Loading**: Check API endpoint availability and user permissions
4. **Typing Indicators Not Working**: Ensure WebSocket connection is established

### Debug Tools
- Browser Console: Check for JavaScript errors
- Network Tab: Monitor API calls and WebSocket frames
- Redux DevTools: Track state changes (if Redux is used)
- WebSocket debugging extensions for detailed WebSocket inspection

This implementation provides a solid foundation for real-time chat functionality that can be extended and enhanced based on specific requirements.