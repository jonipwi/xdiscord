# xChat Lite - WhatsApp Style UI

## 📱 Overview
A simplified 2-page chat interface designed for elderly users with large buttons, simple navigation, and familiar WhatsApp-style layout.

## 🎯 Pages

### 1. Chat List (`/lite`)
- **Large search bar** with prominent search icon
- **Groups and friends list** with:
  - Big avatars (64px) with gradient backgrounds
  - Online/offline status indicators
  - Last message preview
  - Timestamp display
  - Unread message badges
  - Large touch-friendly buttons (96px height)

### 2. Chat Room (`/lite/chat`)
- **Full-screen chat interface** with:
  - Back button to return to chat list
  - WhatsApp-style message bubbles
  - Sent messages: Green gradient, right-aligned
  - Received messages: White, left-aligned
  - Large input field with emoji & image shortcuts
  - Voice recording button (switches to send when typing)
  - Auto-scroll to latest message

## 🚀 Usage

### Start the Application
```bash
# Start backend (in backend folder)
go run main.go

# Start frontend (in frontend folder)
npm run dev
```

### Access Lite UI
```
http://localhost:3000/lite?username=YourName
```

### URL Parameters
- `username` - Your display name (required)
- Example: `http://localhost:3000/lite?username=Alice`

## 🎨 Design Features

### Elderly-Friendly Design
- **Large fonts**: 2xl-3xl (24-36px)
- **Big buttons**: h-16 to h-20 (64-80px height)
- **High contrast**: Clear color differentiation
- **Simple navigation**: Only 2 pages, no complex menus
- **WhatsApp-familiar**: Uses familiar chat patterns

### Visual Indicators
- 🟢 Green dot = User online
- ⚫ Gray dot = User offline
- 🔵 Blue badge = Unread messages
- 🏠 Green gradient = Group rooms
- 👤 Blue gradient = Individual users

## 📊 Standard Groups (From Full Version)
The lite version displays all **7 standard groups** in order:
1. **General** - Main community chat
2. **Store** - Shopping and products discussion
3. **Orders** - Order tracking and management
4. **Payment** - Payment and transaction support
5. **Friends** - Personal connections
6. **Church** - Faith community
7. **Family** - Family group chat

These groups are fetched directly from the backend API and match the full version exactly.

## 📊 Data Sources
The chat list displays:
- **All 7 standard groups** from backend `/api/rooms`
- **Users from General room** (to avoid duplicates across rooms)
- Falls back to empty state if backend is unavailable

Groups are displayed in the standard order:
1. General
2. Store  
3. Orders
4. Payment
5. Friends
6. Church
7. Family

Then followed by individual users with online/offline status.

## 🔌 Backend Integration
- Connects to existing xChat API:
  - `/api/rooms` - Fetch chat rooms
  - `/api/rooms/{id}/users` - Fetch room members
  - `/api/messages` - Fetch message history
  - `/ws` - WebSocket for real-time messaging

- Falls back to mock data if backend unavailable

## 📁 File Structure
```
frontend/src/app/lite/
├── layout.tsx          # Lite shell with header
├── page.tsx            # Chat list page
└── chat/
    └── page.tsx        # Chat room page
```

## 🎯 User Flow
1. Visit `/lite?username=YourName`
2. See list of groups and friends
3. Click any chat to open
4. Send messages, voice notes, images
5. Click back arrow to return to list

## ✨ Features

### ✅ Complete Feature Set (Matching Full Version)
- **Real-time messaging** via WebSocket
- **Text messages** with large, readable fonts
- **Voice recording** - Hold mic button to record, release to send
- **Image uploads** - Tap image icon to select and send photos
- **File attachments** - Send any file type via paperclip icon
- **Emoticons** - Tap smile icon for emoji/emoticon picker
- **Voting polls** - Create polls with multiple options, real-time vote counting
- **Graphs/Charts** - Upload CSV/Excel data to create visual charts
- **GIF emoticons** - Animated emoticons support
- **Online/offline status** - See who's available in real-time
- **Unread message badges** - Never miss a message
- **Auto-scroll** - Automatically scroll to latest messages
- **Loading states** - Clear feedback during data fetching
- **Error handling** - Graceful fallbacks when offline

## 🔧 Customization
Edit these files to customize:
- **Colors**: Change green/teal gradients in page components
- **Mock data**: Edit `mockChatList` in `/lite/page.tsx`
- **Layout**: Modify header in `/lite/layout.tsx`
- **Font sizes**: Adjust text-xl, text-2xl classes
