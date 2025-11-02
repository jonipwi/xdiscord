<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Floating Chat Widget</title>
    <style>
        /* Host page theme support */
        :root {
            --host-bg-primary: #ffffff;
            --host-bg-secondary: #f8f9fa;
            --host-text-primary: #212529;
            --host-text-secondary: #6c757d;
            --host-accent: #5865f2;
            --host-accent-hover: #4752c4;
            --host-shadow: rgba(0, 0, 0, 0.15);
            --host-modal-overlay: rgba(0, 0, 0, 0.5);
        }

        [data-theme="dark"] {
            --host-bg-primary: #1e1f22;
            --host-bg-secondary: #2b2d31;
            --host-text-primary: #f2f3f5;
            --host-text-secondary: #b5bac1;
            --host-accent: #5865f2;
            --host-accent-hover: #4752c4;
            --host-shadow: rgba(0, 0, 0, 0.4);
            --host-modal-overlay: rgba(0, 0, 0, 0.7);
        }

        body {
            background: var(--host-bg-primary);
            color: var(--host-text-primary);
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Floating Chat Widget Styles */
        .chat-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        }

        .chat-button {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--host-accent) 0%, var(--host-accent-hover) 100%);
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 6px 20px var(--host-shadow);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }

        .chat-button::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .chat-button:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 8px 25px var(--host-shadow);
        }

        .chat-button:hover::before {
            opacity: 1;
        }

        .chat-button:active {
            transform: scale(1.05) translateY(0);
        }

        .chat-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--host-modal-overlay);
            backdrop-filter: blur(4px);
            z-index: 1001;
            display: none;
            align-items: center;
            justify-content: center;
            transition: background 0.3s ease, backdrop-filter 0.3s ease;
        }

        .chat-modal.show {
            display: flex;
            animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .modal-content {
            background: var(--host-bg-secondary);
            border-radius: 16px;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 60px var(--host-shadow);
            display: flex;
            flex-direction: column;
            min-width: 300px;
            min-height: 400px;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
            padding: 20px 24px;
            background: var(--host-bg-primary);
            border-bottom: 1px solid rgba(128, 128, 128, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--host-text-primary);
            transition: color 0.3s ease;
        }

        .modal-controls {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        /* Theme toggle button */
        .theme-toggle {
            background: none;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--host-text-secondary);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .theme-toggle::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 8px;
            background: var(--host-accent);
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .theme-toggle:hover {
            color: var(--host-accent);
            background: rgba(88, 101, 242, 0.1);
        }

        .theme-toggle:hover::before {
            opacity: 0.1;
        }

        .theme-toggle svg {
            width: 20px;
            height: 20px;
            position: relative;
            z-index: 1;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-toggle:active svg {
            transform: rotate(180deg) scale(0.9);
        }

        .modal-maximize, .modal-minimize {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: var(--host-text-secondary);
            padding: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-maximize:hover, .modal-minimize:hover {
            background: rgba(128, 128, 128, 0.1);
            color: var(--host-text-primary);
            transform: scale(1.05);
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--host-text-secondary);
            padding: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-close:hover {
            background: rgba(242, 63, 66, 0.1);
            color: #f23f42;
            transform: scale(1.05);
        }

        .modal-close:active {
            transform: scale(0.95);
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
    </style>
</head>
<body>
    <!-- Your website content goes here -->
    <div style="padding: 20px;">
        <h1>Your Website</h1>
        <p>This is your website content. The chat widget will appear in the bottom-right corner.</p>
        <p>Add your content here...</p>
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
                <h3>Chat Support</h3>
                <div class="modal-controls">
                    <button class="theme-toggle" id="hostThemeToggle" title="Toggle theme">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="m4.93 4.93 1.41 1.41"></path>
                            <path d="m17.66 17.66 1.41 1.41"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="m6.34 17.66-1.41 1.41"></path>
                            <path d="m19.07 4.93-1.41 1.41"></path>
                        </svg>
                    </button>
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
        
        // Theme toggle event listener
        const hostThemeToggle = document.getElementById('hostThemeToggle');
        if (hostThemeToggle) {
            hostThemeToggle.addEventListener('click', function() {
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyHostTheme(newTheme);
                sendThemeToIframe();
            });
        }

        // Close modal when clicking outside (but not during resize)
        chatModal.addEventListener('click', function(event) {
            if (event.target === chatModal && !isResizing) {
                toggleChatModal();
            }
        });

        // Listen for messages from the embedded chat
        window.addEventListener('message', function(event) {
            if (event.data.type === 'CLOSE_MODAL') {
                chatModal.classList.remove('show');
            }
        });

        // Forward theme between host and iframe so dark/light stays in sync.
        // Receive theme updates from iframe and persist/apply them on host.
        window.addEventListener('message', function(event) {
            try {
                const data = event.data;
                if (!data || typeof data !== 'object') return;

                if (data.type === 'THEME_CHANGED' && (data.theme === 'dark' || data.theme === 'light')) {
                    // Save host-side preference and apply theme to host page
                    applyHostTheme(data.theme);
                    console.log('Host: iframe theme changed ->', data.theme);
                }
            } catch (e) {
                // ignore
            }
        });

        // Helper to send host theme into the iframe
        function sendThemeToIframe() {
            const iframeEl = document.getElementById('embeddedChat');
            if (!iframeEl || !iframeEl.contentWindow) return;

            try {
                iframeEl.contentWindow.postMessage({ type: 'SET_THEME', theme: currentTheme }, '*');
                console.log('Host: sent SET_THEME ->', currentTheme);
            } catch (err) {
                console.warn('Host: failed to postMessage to iframe', err);
            }
        }
        
        // Theme management functions
        const THEME_KEY = 'xdiscord-theme';
        let currentTheme = localStorage.getItem(THEME_KEY) || 
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        // Apply theme to host page
        function applyHostTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(THEME_KEY, theme);
            currentTheme = theme;
            updateThemeIcon();
        }
        
        // Update theme toggle icon
        function updateThemeIcon() {
            const toggle = document.getElementById('hostThemeToggle');
            if (!toggle) return;
            
            const isDark = currentTheme === 'dark';
            toggle.innerHTML = isDark 
                ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                     <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                   </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                     <circle cx="12" cy="12" r="4"></circle>
                     <path d="M12 2v2"></path>
                     <path d="M12 20v2"></path>
                     <path d="m4.93 4.93 1.41 1.41"></path>
                     <path d="m17.66 17.66 1.41 1.41"></path>
                     <path d="M2 12h2"></path>
                     <path d="M20 12h2"></path>
                     <path d="m6.34 17.66-1.41 1.41"></path>
                     <path d="m19.07 4.93-1.41 1.41"></path>
                   </svg>`;
        }
        
        // Initialize theme on load
        applyHostTheme(currentTheme);

        // Send theme when iframe loads
        const embeddedChat = document.getElementById('embeddedChat');
        if (embeddedChat) {
            embeddedChat.addEventListener('load', () => sendThemeToIframe());
        }

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
    </script>
</body>
</html></content>
<parameter name="filePath">c:\Job\go-tools\8088-xchat\frontend\floating-widget.html