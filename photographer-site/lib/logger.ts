import fs from "fs";
import path from "path";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
}

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ENTRIES_IN_MEMORY = 500;

// In-memory log buffer for quick access
const logBuffer: LogEntry[] = [];

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function rotateLogIfNeeded() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const stats = fs.statSync(LOG_FILE);
      if (stats.size > MAX_LOG_SIZE) {
        const rotatedFile = path.join(
          LOG_DIR,
          `app.${Date.now()}.log`
        );
        fs.renameSync(LOG_FILE, rotatedFile);
      }
    }
  } catch {
    // Ignore rotation errors
  }
}

function formatLogEntry(entry: LogEntry): string {
  const contextStr = entry.context
    ? ` | ${JSON.stringify(entry.context)}`
    : "";
  const stackStr = entry.stack ? `\n${entry.stack}` : "";
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}${stackStr}`;
}

function writeToFile(entry: LogEntry) {
  try {
    ensureLogDir();
    rotateLogIfNeeded();
    const line = formatLogEntry(entry) + "\n";
    fs.appendFileSync(LOG_FILE, line);
  } catch {
    // Silently fail file writes in case of permission issues
  }
}

function addToBuffer(entry: LogEntry) {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_ENTRIES_IN_MEMORY) {
    logBuffer.shift();
  }
}

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    stack: error?.stack,
  };

  // Console output with colors
  const colors = {
    debug: "\x1b[36m", // Cyan
    info: "\x1b[32m",  // Green
    warn: "\x1b[33m",  // Yellow
    error: "\x1b[31m", // Red
  };
  const reset = "\x1b[0m";

  console.log(
    `${colors[level]}[${level.toUpperCase()}]${reset} ${message}`,
    context ? context : ""
  );

  if (error?.stack) {
    console.log(error.stack);
  }

  // Write to file and memory buffer
  writeToFile(entry);
  addToBuffer(entry);
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    log("debug", message, context),

  info: (message: string, context?: Record<string, unknown>) =>
    log("info", message, context),

  warn: (message: string, context?: Record<string, unknown>) =>
    log("warn", message, context),

  error: (
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>
  ) => {
    const err = error instanceof Error ? error : undefined;
    const ctx = error instanceof Error ? context : (error as Record<string, unknown>);
    log("error", message, ctx, err);
  },

  // Get recent logs from memory buffer
  getRecentLogs: (
    level?: LogLevel,
    limit: number = 100
  ): LogEntry[] => {
    let logs = [...logBuffer];

    if (level) {
      const levelPriority: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
      };
      logs = logs.filter(
        (l) => levelPriority[l.level] >= levelPriority[level]
      );
    }

    return logs.slice(-limit).reverse();
  },

  // Format logs for Claude
  formatForClaude: (logs: LogEntry[]): string => {
    const header = `# Application Logs (${new Date().toISOString()})\n\n`;
    const formatted = logs
      .map((entry) => {
        let text = `## [${entry.level.toUpperCase()}] ${entry.timestamp}\n`;
        text += `**Message:** ${entry.message}\n`;
        if (entry.context) {
          text += `**Context:**\n\`\`\`json\n${JSON.stringify(entry.context, null, 2)}\n\`\`\`\n`;
        }
        if (entry.stack) {
          text += `**Stack Trace:**\n\`\`\`\n${entry.stack}\n\`\`\`\n`;
        }
        return text;
      })
      .join("\n---\n\n");

    return header + formatted;
  },

  // Clear logs
  clear: () => {
    logBuffer.length = 0;
    try {
      if (fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, "");
      }
    } catch {
      // Ignore
    }
  },
};

export default logger;
