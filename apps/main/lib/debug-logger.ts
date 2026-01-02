type LogLevel = "log" | "warn" | "error" | "info";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

interface NetworkError {
  timestamp: string;
  method: string;
  url: string;
  status: number | null;
  statusText: string;
  error: string;
}

interface BrowserContext {
  url: string;
  userAgent: string;
  platform: string;
  language: string;
  screenSize: string;
  viewportSize: string;
  timestamp: string;
}

export interface DebugInfo {
  logs: LogEntry[];
  networkErrors: NetworkError[];
  browserContext: BrowserContext;
}

const MAX_LOG_ENTRIES = 50;
const MAX_NETWORK_ERRORS = 20;

class DebugLogger {
  private logs: LogEntry[] = [];
  private networkErrors: NetworkError[] = [];
  private initialized = false;

  init() {
    if (this.initialized || typeof window === "undefined") return;

    // Store original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    // Override console methods
    console.log = (...args: unknown[]) => {
      this.addLog("log", args);
      originalLog.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      this.addLog("warn", args);
      originalWarn.apply(console, args);
    };

    console.error = (...args: unknown[]) => {
      this.addLog("error", args);
      originalError.apply(console, args);
    };

    console.info = (...args: unknown[]) => {
      this.addLog("info", args);
      originalInfo.apply(console, args);
    };

    // Capture unhandled errors
    window.addEventListener("error", (event) => {
      this.addLog("error", [`Unhandled Error: ${event.message}`, event.filename, event.lineno]);
    });

    // Capture unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.addLog("error", [`Unhandled Promise Rejection: ${event.reason}`]);
    });

    this.initialized = true;
  }

  private addLog(level: LogLevel, args: unknown[]) {
    const message = args
      .map((arg) => {
        if (typeof arg === "string") return arg;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(" ");

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: message.slice(0, 500), // Limit message length
    };

    this.logs.push(entry);

    // Keep only the last MAX_LOG_ENTRIES
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs.shift();
    }
  }

  addNetworkError(error: {
    method: string;
    url: string;
    status: number | null;
    statusText: string;
    error: string;
  }) {
    const entry: NetworkError = {
      timestamp: new Date().toISOString(),
      ...error,
    };

    this.networkErrors.push(entry);

    // Keep only the last MAX_NETWORK_ERRORS
    if (this.networkErrors.length > MAX_NETWORK_ERRORS) {
      this.networkErrors.shift();
    }
  }

  getBrowserContext(): BrowserContext {
    if (typeof window === "undefined") {
      return {
        url: "",
        userAgent: "",
        platform: "",
        language: "",
        screenSize: "",
        viewportSize: "",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timestamp: new Date().toISOString(),
    };
  }

  getDebugInfo(): DebugInfo {
    return {
      logs: [...this.logs],
      networkErrors: [...this.networkErrors],
      browserContext: this.getBrowserContext(),
    };
  }

  clear() {
    this.logs = [];
    this.networkErrors = [];
  }
}

// Singleton instance
export const debugLogger = new DebugLogger();

// Auto-initialize on import (client-side only)
if (typeof window !== "undefined") {
  debugLogger.init();
}
