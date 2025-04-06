// src/index.ts

export type RetryOptions = {
    maxAttempts?: number;
    delay?: number; // in ms
    backoff?: boolean;
    timeout?: number; // per attempt timeout (optional)
    retryOn?: (error: any) => boolean;
    onRetry?: (error: any, attempt: number) => void;
  };
  
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 0,
      backoff = false,
      timeout,
      retryOn = () => true,
      onRetry,
    } = options;
  
    let attempt = 0;
    let waitTime = delay;
  
    while (attempt < maxAttempts) {
      try {
        const result = timeout
          ? await Promise.race([
              fn(),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Retry attempt timed out')), timeout)
              ),
            ])
          : await fn();
        return result;
      } catch (err) {
        attempt++;
        if (attempt >= maxAttempts || !retryOn(err)) {
          throw err;
        }
        if (onRetry) onRetry(err, attempt);
        if (waitTime > 0) await sleep(waitTime);
        if (backoff) waitTime *= 2;
      }
    }
    throw new Error('Retry failed after maximum attempts');
  }
  