type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private formatMessage(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();

    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string) {
    console.debug(this.formatMessage("debug", message));
  }

  info(message: string) {
    console.info(this.formatMessage("info", message));
  }

  warn(message: string) {
    console.warn(this.formatMessage("warn", message));
  }

  error(message: string, error?: unknown) {
    console.error(this.formatMessage("error", message));

    if (error) {
      console.error(error);
    }
  }
}

export const logger = new Logger();