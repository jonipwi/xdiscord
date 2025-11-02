<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Embedded Chat Example</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .chat-embed {
            width: 100%;
            height: 400px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
        }
        .controls {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow-x: auto;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 0 5px 5px 0;
        }
        button:hover {
            background: #0056b3;
        }
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }
        .chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #007bff;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chat-button:hover {
            background: #0056b3;
            transform: scale(1.1);
        }
        .chat-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1001;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .chat-modal.show {
            display: flex;
        }
        .modal-controls {
            display: flex;
            gap: 8px;
        }
        .modal-maximize, .modal-minimize {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #6c757d;
            padding: 4px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
        }
        .modal-maximize:hover, .modal-minimize:hover {
            background: #e9ecef;
            color: #495057;
        }
        .resize-handle {
            position: absolute;
            background: transparent;
            z-index: 10;
        }
        .resize-handle.nw {
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            cursor: nw-resize;
        }
        .resize-handle.ne {
            top: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: ne-resize;
        }
        .resize-handle.sw {
            bottom: 0;
            left: 0;
            width: 20px;
            height: 20px;
            cursor: sw-resize;
        }
        .resize-handle.se {
            bottom: 0;
            right: 0;
            width: 20px;
            height: 20px;
            cursor: se-resize;
        }
        .resize-handle.n {
            top: 0;
            left: 20px;
            right: 20px;
            height: 10px;
            cursor: n-resize;
        }
        .resize-handle.s {
            bottom: 0;
            left: 20px;
            right: 20px;
            height: 10px;
            cursor: s-resize;
        }
        .resize-handle.w {
            top: 20px;
            left: 0;
            bottom: 20px;
            width: 10px;
            cursor: w-resize;
        }
        .resize-handle.e {
            top: 20px;
            right: 0;
            bottom: 20px;
            width: 10px;
            cursor: e-resize;
        }
        .modal-header {
            padding: 16px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6c757d;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        .modal-close:hover {
            background: #e9ecef;
            color: #495057;
        }
        /* Mobile responsive styles */
        @media (max-width: 767px) {
            .resize-handle {
                display: none !important;
            }
            .modal-minimize {
                display: none;
            }
        }
        .modal-content {
            background: white;
            border-radius: 12px;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            min-width: 300px;
            min-height: 400px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Embedded Chat App Demo</h1>
        <p><strong>Quick Start:</strong> For a clean floating widget, see <a href="floating-widget.html" target="_blank">floating-widget.html</a></p>

        <div class="controls">
            <h3>Embedding Options:</h3>
            <p><strong>Floating Widget:</strong> A sticky chat button appears in the bottom-right corner that opens a modal chat when clicked.</p>
            <p><strong>Basic iframe embed:</strong> <code>&lt;iframe src="http://localhost:3000" width="800" height="400"&gt;&lt;/iframe&gt;</code></p>
            <p><strong>Modal embed:</strong> <code>&lt;iframe src="http://localhost:3000?modal=true" width="800" height="600" style="border:none;"&gt;&lt;/iframe&gt;</code></p>

            <h4>Configuration Options:</h4>
            <ul>
                <li><code>?compact=true</code> - Compact mode (hides sidebar)</li>
                <li><code>?modal=true</code> - Modal mode with maximize/minimize controls</li>
                <li><code>?maximized=true</code> - Start in maximized state (modal only)</li>
                <li><code>?hideHeader=true</code> - Hide modal header for cleaner look (modal only)</li>
                <li><code>?room=general</code> - Start in specific room</li>
                <li><code>?user=JohnDoe</code> - Set username</li>
            </ul>

            <h4>Floating Widget Features:</h4>
            <ul>
                <li>Sticky positioning in bottom-right corner</li>
                <li>Animated hover effects</li>
                <li>Modal chat interface when clicked</li>
                <li>Auto-maximized chat for better user experience</li>
                <li>Auto-fullscreen on mobile devices for optimal viewing</li>
                <li>Hidden header for cleaner, more integrated look</li>
                <li>Resizable modal with persistent size memory (desktop only)</li>
                <li>True fullscreen maximize button (covers entire screen)</li>
                <li>Click outside to close modal</li>
                <li>Close button in modal header</li>
                <li>Chat support can toggle maximize/minimize</li>
            </ul>

            <h4>Parent-Child Communication:</h4>
            <input type="text" id="messageInput" placeholder="Type a message to send to chat">
            <button onclick="sendMessage()">Send Message</button>
            <button onclick="setRoom('store')">Switch to Store Room</button>
            <button onclick="openModal()">Open Modal Chat</button>
        </div>

        <h2>Embedded Chat Examples:</h2>

        <h3>Basic Iframe Embed:</h3>
        <iframe
            id="chatFrame"
            class="chat-embed"
            src="http://localhost:3000?room=general&username=tester"
            frameborder="0">
        </iframe>

        <h3>Modal Embed:</h3>
        <iframe
            id="modalChatFrame"
            class="chat-embed"
            src="http://localhost:3000?modal=true&room=general&username=tester"
            frameborder="0">
        </iframe>

        <h2>Usage Instructions:</h2>
        <ol>
            <li><strong>Floating Widget:</strong> Look for the blue chat button (💬) in the bottom-right corner</li>
            <li>Click the floating button to open the chat modal</li>
            <li>The chat app automatically detects when it's running in an iframe</li>
            <li>In compact mode, the sidebar is hidden to save space</li>
            <li>In modal mode, the chat appears in a modal window with maximize/minimize controls</li>
            <li>You can communicate with the embedded chat using postMessage API</li>
            <li>The chat supports URL parameters for initial configuration</li>
        </ol>

    <div class="controls">
        <h3>PostMessage API:</h3>
        <pre><code>// Send a message to the chat
window.postMessage({
    type: 'SEND_MESSAGE',
    message: 'Hello from parent!'
}, '*');

// Switch rooms
window.postMessage({
    type: 'SET_ROOM',
    room: 'store'
}, '*');

// Listen for modal close event
window.addEventListener('message', function(event) {
    if (event.data.type === 'CLOSE_MODAL') {
        // Handle modal close (useful for floating widget)
        console.log('Chat modal was closed');
    }
});

// Programmatically open the floating widget modal
document.getElementById('chatToggle').click();</code></pre>
    </div>
</div>

    <!-- Floating Chat Widget -->
    <div class="chat-widget">
        <button class="chat-button" id="chatToggle" title="Open Chat">
            💬
        </button>
    </div>

    <!-- Chat Modal -->
    <div class="chat-modal" id="chatModal">
        <div class="modal-content" id="modalContent">
            <!-- Resize handles -->
            <div class="resize-handle nw"></div>
            <div class="resize-handle n"></div>
            <div class="resize-handle ne"></div>
            <div class="resize-handle w"></div>
            <div class="resize-handle e"></div>
            <div class="resize-handle sw"></div>
            <div class="resize-handle s"></div>
            <div class="resize-handle se"></div>

            <div class="modal-header">
                <h3 style="margin: 0; font-size: 18px;">Chat Support</h3>
                <div class="modal-controls">
                    <button class="modal-maximize" id="modalMaximize" title="Maximize">⛶</button>
                    <button class="modal-close" id="modalClose">&times;</button>
                </div>
            </div>
            <iframe
                id="embeddedChat"
                src="http://localhost:3000?modal=true&compact=true&maximized=true&hideHeader=true&room=general&username=tester"
                style="width: 100%; flex: 1; border: none;"
                frameborder="0">
            </iframe>
        </div>
    </div>
    <script>
        // Modal functionality
        const chatModal = document.getElementById('chatModal');
        const chatToggle = document.getElementById('chatToggle');
        const modalClose = document.getElementById('modalClose');
        const modalMaximize = document.getElementById('modalMaximize');
        const embeddedChat = document.getElementById('embeddedChat');

        // Modal state
        let isModalMaximized = false;
        let previousModalSize = null;
        let isMobile = window.innerWidth < 768;

        // Update mobile detection on resize
        window.addEventListener('resize', () => {
            isMobile = window.innerWidth < 768;
            updateMaximizeButton();
        });

        // Toggle modal
        function toggleChatModal() {
            chatModal.classList.toggle('show');
            if (chatModal.classList.contains('show')) {
                loadModalSize();
                updateMaximizeButton();
                // Auto-maximize on mobile
                if (isMobile) {
                    maximizeModal();
                }
            }
        }

        // Maximize/Restore modal
        function toggleMaximize() {
            if (isMobile) {
                maximizeModal();
                return;
            }
            if (isModalMaximized) {
                restoreModal();
            } else {
                maximizeModal();
            }
        }

        function maximizeModal() {
            // Save current size
            const rect = modalContent.getBoundingClientRect();
            previousModalSize = {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top
            };

            // Maximize to true fullscreen
            modalContent.style.width = document.documentElement.clientWidth + 'px';
            modalContent.style.height = document.documentElement.clientHeight + 'px';
            modalContent.style.left = '0px';
            modalContent.style.top = '0px';
            modalContent.style.borderRadius = '0px';
            modalContent.style.position = 'fixed'; // Break out of modal container

            // Hide the modal overlay background
            chatModal.style.background = 'transparent';

            // Hide resize handles
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'none';
            });

            isModalMaximized = true;
            updateMaximizeButton();
        }

        function restoreModal() {
            // Restore modal overlay background
            chatModal.style.background = 'rgba(0,0,0,0.5)';

            if (previousModalSize) {
                modalContent.style.width = previousModalSize.width + 'px';
                modalContent.style.height = previousModalSize.height + 'px';
                modalContent.style.left = previousModalSize.left + 'px';
                modalContent.style.top = previousModalSize.top + 'px';
                modalContent.style.borderRadius = '12px';
                modalContent.style.position = 'absolute';
            } else {
                // Fallback to default size
                modalContent.style.width = '100%';
                modalContent.style.height = '100%';
                modalContent.style.left = 'auto';
                modalContent.style.top = 'auto';
                modalContent.style.borderRadius = '12px';
                modalContent.style.position = 'relative';
            }

            // Show resize handles
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });

            isModalMaximized = false;
            updateMaximizeButton();
        }

        function updateMaximizeButton() {
            if (isMobile) {
                modalMaximize.textContent = '⛶'; // Maximize icon
                modalMaximize.title = 'Maximize';
                modalMaximize.className = 'modal-maximize';
                return;
            }
            if (isModalMaximized) {
                modalMaximize.textContent = '⛶'; // Restore icon
                modalMaximize.title = 'Restore';
                modalMaximize.className = 'modal-minimize';
            } else {
                modalMaximize.textContent = '⛶'; // Maximize icon
                modalMaximize.title = 'Maximize';
                modalMaximize.className = 'modal-maximize';
            }
        }

        // Event listeners
        chatToggle.addEventListener('click', toggleChatModal);
        modalClose.addEventListener('click', toggleChatModal);
        modalMaximize.addEventListener('click', toggleMaximize);

        // Close modal when clicking outside (but not during resize)
        chatModal.addEventListener('click', function(event) {
            if (event.target === chatModal && !isResizing) {
                toggleChatModal();
            }
        });

        // Legacy functions for backward compatibility
        function sendMessage() {
            const message = document.getElementById('messageInput');
            if (message && message.value.trim()) {
                const iframe = document.getElementById('chatFrame');
                if (iframe) {
                    iframe.contentWindow.postMessage({
                        type: 'SEND_MESSAGE',
                        message: message.value
                    }, '*');
                    message.value = '';
                }
            }
        }

        function setRoom(roomName) {
            const iframe = document.getElementById('chatFrame');
            if (iframe) {
                iframe.contentWindow.postMessage({
                    type: 'SET_ROOM',
                    room: roomName
                }, '*');
            }
        }

        function openModal() {
            toggleChatModal();
        }

        // Listen for messages from the embedded chat
        window.addEventListener('message', function(event) {
            console.log('Message from embedded chat:', event.data);
            if (event.data.type === 'CLOSE_MODAL') {
                // Handle modal close event
                chatModal.classList.remove('show');
            }
        });

        // Save and load modal size functions
        function saveModalSize() {
            // Don't save size if maximized
            if (isModalMaximized) return;

            const rect = modalContent.getBoundingClientRect();
            const modalSize = {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top
            };
            localStorage.setItem('chatModalSize', JSON.stringify(modalSize));
        }

        function loadModalSize() {
            const savedSize = localStorage.getItem('chatModalSize');
            if (savedSize) {
                try {
                    const modalSize = JSON.parse(savedSize);
                    modalContent.style.width = modalSize.width + 'px';
                    modalContent.style.height = modalSize.height + 'px';
                    modalContent.style.left = modalSize.left + 'px';
                    modalContent.style.top = modalSize.top + 'px';
                    modalContent.style.position = 'absolute';
                    modalContent.style.transform = 'none';
                } catch (e) {
                    console.warn('Failed to load saved modal size:', e);
                }
            }
        }

        // Resize functionality
        let isResizing = false;
        let currentHandle = null;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        const modalContent = document.getElementById('modalContent');
        const resizeHandles = document.querySelectorAll('.resize-handle');

        function startResize(e, handle) {
            // Prevent resize when maximized
            if (isModalMaximized) return;

            isResizing = true;
            currentHandle = handle;
            startX = e.clientX;
            startY = e.clientY;
            const rect = modalContent.getBoundingClientRect();
            startWidth = rect.width;
            startHeight = rect.height;
            startLeft = rect.left;
            startTop = rect.top;

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        }

        function resize(e) {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;

            // Handle different resize directions
            if (currentHandle.classList.contains('e') || currentHandle.classList.contains('ne') || currentHandle.classList.contains('se')) {
                newWidth = Math.max(300, startWidth + dx);
            }
            if (currentHandle.classList.contains('w') || currentHandle.classList.contains('nw') || currentHandle.classList.contains('sw')) {
                newWidth = Math.max(300, startWidth - dx);
                newLeft = startLeft + (startWidth - newWidth);
            }
            if (currentHandle.classList.contains('s') || currentHandle.classList.contains('se') || currentHandle.classList.contains('sw')) {
                newHeight = Math.max(400, startHeight + dy);
            }
            if (currentHandle.classList.contains('n') || currentHandle.classList.contains('ne') || currentHandle.classList.contains('nw')) {
                newHeight = Math.max(400, startHeight - dy);
                newTop = startTop + (startHeight - newHeight);
            }

            // Apply new dimensions
            modalContent.style.width = newWidth + 'px';
            modalContent.style.height = newHeight + 'px';
            modalContent.style.left = newLeft + 'px';
            modalContent.style.top = newTop + 'px';
            modalContent.style.position = 'absolute';
            modalContent.style.transform = 'none';
        }

        function stopResize() {
            isResizing = false;
            currentHandle = null;
            saveModalSize(); // Save the new size when resize ends
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }

        // Add event listeners to resize handles
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => startResize(e, handle));
        });

        // Prevent text selection during resize
        document.addEventListener('selectstart', (e) => {
            if (isResizing) e.preventDefault();
        });

        // Auto-hide widget after modal closes (optional)
        let hideTimeout;
        function scheduleAutoHide() {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                // Could add logic to hide the widget after inactivity
            }, 5000);
        }

        // Show widget initially
        chatToggle.style.display = 'flex';
    </script>
</body>
</html>