// Debug logging utility for frontend
type LogData = Record<string, unknown>;

class DebugLogger {
  private static instance: DebugLogger;
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'debug';
  private isEnabled: boolean = true;

  private constructor() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Server-side rendering - disable logging
      this.isEnabled = false;
      return;
    }

    // Check if debug logging is enabled via URL parameter or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug');
    const storedDebug = localStorage.getItem('debug_logging');

    if (debugParam === 'false' || storedDebug === 'false') {
      this.isEnabled = false;
    }

    if (debugParam === 'true' || storedDebug === 'true') {
      this.isEnabled = true;
    }

    // Set log level
    const levelParam = urlParams.get('log_level') || localStorage.getItem('log_level') || 'debug';
    if (['debug', 'info', 'warn', 'error'].includes(levelParam)) {
      this.logLevel = levelParam as 'debug' | 'info' | 'warn' | 'error';
    }
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private shouldLog(level: string): boolean {
    if (!this.isEnabled) return false;

    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(component: string, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${component.toUpperCase()}] ${message}${dataStr}`;
  }

  debug(component: string, message: string, data?: LogData) {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage(component, message, data);
      console.debug(formattedMessage);

      // Send to backend debug endpoint if available
      this.sendToBackend('debug', component, message, data);
    }
  }

  info(component: string, message: string, data?: LogData) {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage(component, message, data);
      console.info(formattedMessage);

      // Send to backend debug endpoint if available
      this.sendToBackend('info', component, message, data);
    }
  }

  warn(component: string, message: string, data?: LogData) {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage(component, message, data);
      console.warn(formattedMessage);

      // Send to backend debug endpoint if available
      this.sendToBackend('warn', component, message, data);
    }
  }

  error(component: string, message: string, error?: Error, data?: LogData) {
    if (this.shouldLog('error')) {
      const errorStr = error ? ` | Error: ${error.message}` : '';
      const formattedMessage = this.formatMessage(component, message + errorStr, data);
      console.error(formattedMessage);

      // Send to backend debug endpoint if available
      this.sendToBackend('error', component, message, { ...data, error: error?.message, stack: error?.stack });
    }
  }

  private async sendToBackend(level: string, component: string, message: string, data?: LogData) {
    try {
      // Check if debug logging is disabled via environment variable
      if (process.env.DEBUG_ENABLED === 'false') {
        return;
      }

      // Only send if we're in development or explicitly enabled
      if (process.env.NODE_ENV !== 'development' && !localStorage.getItem('send_logs_to_backend')) {
        return;
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        component,
        message,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.getSessionId(),
      };

      // Send to backend debug endpoint (you would need to implement this endpoint)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8088';
      await fetch(`${backendUrl}/api/debug/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      }).catch(() => {
        // Silently fail if backend logging fails
        console.debug('Failed to send log to backend');
      });
    } catch {
      // Silently fail
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('debug_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('debug_session_id', sessionId);
    }
    return sessionId;
  }

  // Performance timing
  startTimer(component: string, operation: string): () => void {
    const startTime = performance.now();
    this.debug(component, `Starting operation: ${operation}`);

    return () => {
      const duration = performance.now() - startTime;
      this.debug(component, `Completed operation: ${operation}`, {
        duration_ms: Math.round(duration * 100) / 100,
      });
    };
  }

  // API call logging
  logApiCall(component: string, method: string, url: string, data?: LogData) {
    this.debug(component, `API Call: ${method} ${url}`, {
      method,
      url,
      data_size: data ? JSON.stringify(data).length : 0,
    });
  }

  logApiResponse(component: string, method: string, url: string, status: number, duration: number, responseSize?: number) {
    const level = status >= 400 ? 'warn' : 'debug';
    this[level](component, `API Response: ${method} ${url} -> ${status}`, {
      method,
      url,
      status,
      duration_ms: Math.round(duration),
      response_size: responseSize,
    });
  }

  // WebSocket logging
  logWebSocketEvent(component: string, event: string, data?: LogData) {
    this.debug(component, `WebSocket ${event}`, {
      event,
      data_size: data ? JSON.stringify(data).length : 0,
      data_type: data ? typeof data : 'none',
    });
  }

  // Component lifecycle logging
  logComponentMount(component: string, props?: LogData) {
    this.debug(component, 'Component mounted', {
      props_count: props ? Object.keys(props).length : 0,
    });
  }

  logComponentUnmount(component: string) {
    this.debug(component, 'Component unmounted');
  }

  logComponentUpdate(component: string, prevProps?: LogData, nextProps?: LogData) {
    this.debug(component, 'Component updating', {
      props_changed: prevProps && nextProps ? !this.shallowEqual(prevProps, nextProps) : false,
    });
  }

  private shallowEqual(obj1: LogData, obj2: LogData): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }
}

// Export singleton instance
export const debugLogger = DebugLogger.getInstance();

// Convenience functions
export const debugLog = {
  debug: (component: string, message: string, data?: LogData) => debugLogger.debug(component, message, data),
  info: (component: string, message: string, data?: LogData) => debugLogger.info(component, message, data),
  warn: (component: string, message: string, data?: LogData) => debugLogger.warn(component, message, data),
  error: (component: string, message: string, error?: Error, data?: LogData) => debugLogger.error(component, message, error, data),
  startTimer: (component: string, operation: string) => debugLogger.startTimer(component, operation),
  logApiCall: (component: string, method: string, url: string, data?: LogData) => debugLogger.logApiCall(component, method, url, data),
  logApiResponse: (component: string, method: string, url: string, status: number, duration: number, responseSize?: number) =>
    debugLogger.logApiResponse(component, method, url, status, duration, responseSize),
  logWebSocketEvent: (component: string, event: string, data?: LogData) => debugLogger.logWebSocketEvent(component, event, data),
  logComponentMount: (component: string, props?: LogData) => debugLogger.logComponentMount(component, props),
  logComponentUpdate: (component: string, prevProps?: LogData, nextProps?: LogData) => debugLogger.logComponentUpdate(component, prevProps, nextProps),
  logComponentUnmount: (component: string) => debugLogger.logComponentUnmount(component),
};