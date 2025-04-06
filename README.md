# 🔁 retryx

A tiny, flexible, Promise-based retry utility with support for delays, exponential backoff, per-attempt timeouts, and custom retry conditions.

## 🚀 Features

- Retry any async function
- Delay and exponential backoff
- Timeout per attempt
- Custom retry filters
- onRetry logging hook
- Zero dependencies, TypeScript-ready

## 📦 Installation

```bash
npm install retryx
# or
yarn add retryx
```

## 💡 Usage

```ts
import { retry } from 'retryx'

const result = await retry(() => fetch('https://api.example.com'), {
  maxAttempts: 3,
  delay: 500,
  backoff: true,
  onRetry: (err, attempt) =>
    console.log(`Attempt ${attempt} failed: ${err.message}`),
})
```

## 🔧 Options

| Option       | Type                          | Default     | Description                               |
|--------------|-------------------------------|-------------|-------------------------------------------|
| `maxAttempts`| `number`                      | `3`         | Max number of attempts (including the first) |
| `delay`      | `number`                      | `0`         | Delay in ms between attempts              |
| `backoff`    | `boolean`                     | `false`     | Exponential backoff (delay × 2ⁿ)          |
| `timeout`    | `number`                      | `undefined` | Timeout per attempt in ms                 |
| `onRetry`    | `(error, attempt) => void`    | `undefined` | Callback after each failed attempt        |
| `retryOn`    | `(error) => boolean`          | Always      | Custom error filter to allow/disallow retries |

## ❌ Example: Reject after timeout

```ts
await retry(
  () => new Promise((res) => setTimeout(() => res('done'), 300)),
  { timeout: 100 }
)
// ➡️ throws: Retry attempt timed out
```

## ✅ TypeScript Support

Built in — no extra types needed.

---

## 🛡️ License

MIT — build cool things with it!

[![npm version](https://badge.fury.io/js/retryx.svg)](https://www.npmjs.com/package/@harisk/retryx)
