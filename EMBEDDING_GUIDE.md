# Chat App Embedding Guide

This chat application supports multiple embedding options for integration into websites.

## 🚀 Quick Start Options

### 1. Floating Widget (Recommended)

A sticky chat button in the bottom-right corner that opens a modal chat.

**File:** `floating-widget.html`

- Clean, minimal implementation
- Perfect for websites
- Mobile-friendly

### 2. Full Demo

Complete demonstration of all embedding options.

**File:** `embed-example.html`

- All embedding methods
- API examples
- Testing interface

## 📋 Embedding Methods

### Method 1: Floating Chat Widget

```html
<!-- Add this to your website -->
<div class="chat-widget">
    <button class="chat-button" id="chatToggle">💬</button>
</div>

<div class="chat-modal" id="chatModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Chat Support</h3>
            <button class="modal-close" id="modalClose">&times;</button>
        </div>
        <iframe src="http://your-domain.com?modal=true&compact=true&maximized=true&hideHeader=true" frameborder="0"></iframe>
    </div>
</div>
```

### Method 2: Direct Modal Embed

```html
<iframe src="http://your-domain.com?modal=true" width="800" height="600" style="border:none;"></iframe>
```

### Method 3: Inline Embed

```html
<iframe src="http://your-domain.com?compact=true" width="100%" height="400"></iframe>
```

## ⚙️ URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `modal=true` | Enable modal mode | `?modal=true` |
| `compact=true` | Hide sidebar | `?compact=true` |
| `maximized=true` | Start maximized (modal only) | `?maximized=true` |
| `hideHeader=true` | Hide modal header (modal only) | `?hideHeader=true` |
| `room=name` | Start in specific room | `?room=general` |
| `user=name` | Set username | `?user=JohnDoe` |

## 🔧 Features

### Resizable Modal

The floating widget modal supports resizing by dragging the edges and corners:

- **Resize Handles:** 8 resize handles (4 corners + 4 edges)
- **Minimum Size:** 300px width, 400px height
- **Persistent Size:** Modal size is saved to localStorage and restored on next open
- **No Auto-Close:** Modal won't close during resize operations

**Resize Directions:**
- Corners: `nw-resize`, `ne-resize`, `sw-resize`, `se-resize`
- Edges: `n-resize`, `s-resize`, `w-resize`, `e-resize`

### Fullscreen Maximize

The modal includes a maximize button for fullscreen mode:

- **Maximize Button:** Click ⛶ to toggle between normal and fullscreen
- **True Fullscreen:** Uses `document.documentElement.clientWidth` × `document.documentElement.clientHeight` (viewport size)
- **Position Fixed:** Breaks out of modal container for true fullscreen coverage
- **Resize Disabled:** Resize handles are hidden in fullscreen mode
- **Restore Previous Size:** Returns to previous dimensions when restored
- **Visual Feedback:** Button changes to indicate current state

### Mobile Behavior

On mobile devices (screens < 768px width):

- **Resize Handles:** Hidden to prevent accidental interactions
- **Minimize Button:** Hidden; maximize only maximizes to fullscreen
- **Available Controls:** Only maximize (fullscreen) and close buttons are shown
- **Auto-Fullscreen:** Modal automatically opens in fullscreen mode when the floating widget button is clicked
- **Maximize Behavior:** Clicking maximize goes to fullscreen; no restore option on mobile
- **Responsive:** Modal adapts to mobile viewport for optimal chat experience

## 🔧 PostMessage API

### Send Messages to Chat

```javascript
window.postMessage({
    type: 'SEND_MESSAGE',
    message: 'Hello from parent!'
}, '*');
```

### Switch Rooms

```javascript
window.postMessage({
    type: 'SET_ROOM',
    room: 'store'
}, '*');
```

### Listen for Events

```javascript
window.addEventListener('message', function(event) {
    if (event.data.type === 'CLOSE_MODAL') {
        // Handle modal close
    }
});
```

## 🎨 Customization

### Styling the Widget

```css
.chat-button {
    background: #your-color;
    /* Add your custom styles */
}
```

### Positioning

```css
.chat-widget {
    bottom: 20px;
    right: 20px;
    /* Adjust position */
}
```

## 📱 Mobile Considerations

- Widget automatically adapts to mobile screens
- Modal is responsive and touch-friendly
- Consider hiding widget on very small screens if needed

## 🔒 Security Notes

- Use `postMessage` with specific origins in production
- Validate all incoming messages
- Consider implementing authentication for user-specific chats
