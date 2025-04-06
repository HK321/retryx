import { describe, it, expect, vi } from 'vitest'
import { retry } from '../src/index'

describe('retry', () => {
  it('resolves successfully on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await retry(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on rejection and eventually resolves', async () => {
    const fn = vi.fn()
    fn.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce('success')

    const result = await retry(fn, { maxAttempts: 3 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('fails after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    await expect(() =>
      retry(fn, { maxAttempts: 2 })
    ).rejects.toThrow('fail')

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('uses delay between retries', async () => {
    const fn = vi.fn()
    fn.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce('ok')

    const delay = 200
    const start = Date.now()

    await retry(fn, { delay, maxAttempts: 2 })

    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(delay)
  })

  it('applies exponential backoff', async () => {
    const fn = vi.fn()
    fn.mockRejectedValueOnce(new Error('fail')).mockRejectedValueOnce(new Error('fail')).mockResolvedValue('ok')

    const delay = 100
    const start = Date.now()

    await retry(fn, { delay, backoff: true, maxAttempts: 3 })

    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(100 + 200)
  })

  it('calls onRetry callback with error and attempt number', async () => {
    const fn = vi.fn()
    fn.mockRejectedValueOnce(new Error('fail')).mockResolvedValue('ok')

    const spy = vi.fn()
    await retry(fn, {
      onRetry: spy,
      maxAttempts: 2,
    })

    expect(spy).toHaveBeenCalledWith(expect.any(Error), 1)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('respects timeout per attempt', async () => {
    const fn = () =>
      new Promise((resolve) => setTimeout(() => resolve('late'), 200))

    await expect(() =>
      retry(fn, { timeout: 100, maxAttempts: 1 })
    ).rejects.toThrow('Retry attempt timed out')

    // Will timeout, not resolve
  })

  it('uses custom retryOn function', async () => {
    const fn = vi.fn()
    fn
      .mockRejectedValueOnce(new Error('temporary'))
      .mockRejectedValueOnce(new Error('fatal'))

    const retryOn = (err: Error) => err.message === 'temporary'

    await expect(() =>
      retry(fn, { retryOn, maxAttempts: 3 })
    ).rejects.toThrow('fatal')

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
