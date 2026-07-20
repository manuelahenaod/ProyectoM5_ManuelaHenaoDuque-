import { logger } from "./logging.js";

type RetryOptions = {
  maxRetries?: number;
  initialDelay?: number;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error: any): boolean {
  const retryableStatus = [429, 500, 502, 503, 504];

  return retryableStatus.includes(error?.status);
}

export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 500,
  } = options;

  let attempt = 0;
  let delayMs = initialDelay;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (!shouldRetry(error) || attempt >= maxRetries) {
        throw error;
      }

      attempt++;

      logger.warn(
        `Retry attempt ${attempt}/${maxRetries} after ${delayMs}ms.`
      );

      await delay(delayMs);

      delayMs *= 2;
    }
  }
}