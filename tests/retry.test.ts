import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { retry } from "../src/utils/retry.js";

describe("retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the operation result on the first attempt", async () => {
    const operation = vi.fn().mockResolvedValue("success");

    const result = await retry(operation);

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should retry when a retryable error occurs", async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValue("success");

    const result = await retry(operation, {
      initialDelay: 1,
    });

    expect(result).toBe("success");
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("should not retry for non-retryable errors", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue({ status: 401 });

    await expect(retry(operation)).rejects.toEqual({
      status: 401,
    });

    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("should throw after exceeding the maximum retries", async () => {
    const operation = vi
      .fn()
      .mockRejectedValue({ status: 503 });

    await expect(
      retry(operation, {
        maxRetries: 2,
        initialDelay: 1,
      })
    ).rejects.toEqual({
      status: 503,
    });

    expect(operation).toHaveBeenCalledTimes(3);
  });
});