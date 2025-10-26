import fs from "node:fs/promises";
import path from "node:path";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

export enum LogCategory {
  // Session lifecycle
  SESSION_START = "session_start",
  SESSION_RESUME = "session_resume",
  SESSION_END = "session_end",

  // User interactions
  USER_INPUT = "user_input",
  USER_COMMAND = "user_command",

  // Agent operations
  AGENT_CALL = "agent_call",
  AGENT_RESPONSE = "agent_response",
  AGENT_ERROR = "agent_error",

  // Data operations
  DATA_LOAD = "data_load",
  DATA_SAVE = "data_save",
  CSV_READ = "csv_read",
  PROFILE_UPDATE = "profile_update",

  // Order flow
  ORDER_INTENT_DETECTED = "order_intent_detected",
  ORDER_DRAFT_CREATED = "order_draft_created",
  ORDER_CONFIRMED = "order_confirmed",
  ORDER_CANCELLED = "order_cancelled",

  // Payment
  CHECKOUT_INITIATED = "checkout_initiated",
  CHECKOUT_COMPLETED = "checkout_completed",
  CHECKOUT_FAILED = "checkout_failed",

  // State transitions
  STATE_CHANGE = "state_change",

  // System
  SYSTEM_INFO = "system_info",
  PERFORMANCE = "performance",
}

export interface LogEntry {
  timestamp: string;
  sessionId: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, any>;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  white: "\x1b[97m",
};

export class SystemLogger {
  private sessionId: string;
  private logBuffer: LogEntry[] = [];
  private sessionLogPath: string;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.sessionLogPath = path.resolve(
      __dirname,
      "../../sessions",
      sessionId,
      "logs.jsonl"
    );

    // Auto-flush every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flush().catch((error) => {
        console.error("Failed to flush logs:", error);
      });
    }, 5000);
  }

  log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: Record<string, any>,
    duration?: number
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      level,
      category,
      message,
      ...(data && { data }),
      ...(duration && { duration }),
    };

    this.logBuffer.push(entry);
    this.printToConsole(entry);

    // Flush immediately for errors
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      this.flush().catch(console.error);
    }
  }

  private printToConsole(entry: LogEntry): void {
    const emoji = this.getEmoji(entry.category);
    const color = this.getColor(entry.level);

    let output = `${emoji} [${entry.category}] ${entry.message}`;
    if (entry.duration) {
      output += ` ${COLORS.gray}(${entry.duration}ms)${COLORS.reset}`;
    }

    console.log(this.colorize(output, color));

    if (entry.data && Object.keys(entry.data).length > 0) {
      const dataStr = JSON.stringify(entry.data, null, 2)
        .split("\n")
        .map((line) => `   ${line}`)
        .join("\n");
      console.log(COLORS.gray + dataStr + COLORS.reset);
    }

    if (entry.error) {
      console.log(
        COLORS.red +
          `   Error: ${entry.error.message}` +
          COLORS.reset
      );
    }
  }

  private getEmoji(category: LogCategory): string {
    const emojiMap: Record<LogCategory, string> = {
      [LogCategory.SESSION_START]: "🚀",
      [LogCategory.SESSION_RESUME]: "🔄",
      [LogCategory.SESSION_END]: "✅",
      [LogCategory.USER_INPUT]: "💬",
      [LogCategory.USER_COMMAND]: "⌨️",
      [LogCategory.AGENT_CALL]: "🤖",
      [LogCategory.AGENT_RESPONSE]: "💡",
      [LogCategory.AGENT_ERROR]: "❌",
      [LogCategory.DATA_LOAD]: "📂",
      [LogCategory.DATA_SAVE]: "💾",
      [LogCategory.CSV_READ]: "📊",
      [LogCategory.PROFILE_UPDATE]: "📝",
      [LogCategory.ORDER_INTENT_DETECTED]: "🎯",
      [LogCategory.ORDER_DRAFT_CREATED]: "📋",
      [LogCategory.ORDER_CONFIRMED]: "✔️",
      [LogCategory.ORDER_CANCELLED]: "❌",
      [LogCategory.CHECKOUT_INITIATED]: "💳",
      [LogCategory.CHECKOUT_COMPLETED]: "✅",
      [LogCategory.CHECKOUT_FAILED]: "❌",
      [LogCategory.STATE_CHANGE]: "🔀",
      [LogCategory.SYSTEM_INFO]: "ℹ️",
      [LogCategory.PERFORMANCE]: "⚡",
    };
    return emojiMap[category] || "•";
  }

  private getColor(level: LogLevel): keyof typeof COLORS {
    const colorMap: Record<LogLevel, keyof typeof COLORS> = {
      [LogLevel.DEBUG]: "gray",
      [LogLevel.INFO]: "cyan",
      [LogLevel.WARN]: "yellow",
      [LogLevel.ERROR]: "red",
      [LogLevel.CRITICAL]: "magenta",
    };
    return colorMap[level];
  }

  private colorize(text: string, color: keyof typeof COLORS): string {
    return `${COLORS[color]}${text}${COLORS.reset}`;
  }

  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      await fs.mkdir(path.dirname(this.sessionLogPath), { recursive: true });

      const lines =
        this.logBuffer.map((entry) => JSON.stringify(entry)).join("\n") + "\n";
      await fs.appendFile(this.sessionLogPath, lines, "utf8");

      this.logBuffer = [];
    } catch (error) {
      console.error("Failed to flush logs to file:", error);
    }
  }

  // Convenience methods
  info(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  debug(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  warn(
    category: LogCategory,
    message: string,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(
    category: LogCategory,
    message: string,
    error?: Error,
    data?: Record<string, any>
  ): void {
    this.log(LogLevel.ERROR, category, message, {
      ...data,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }

  // Performance tracking
  async trackOperation<T>(
    category: LogCategory,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    this.debug(category, `Starting: ${operation}`);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.log(LogLevel.INFO, category, `Completed: ${operation}`, undefined, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(category, `Failed: ${operation}`, error as Error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flush();
  }
}
