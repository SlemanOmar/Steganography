# Veil — encrypted image steganography

A browser-only app that encrypts text with AES-256-GCM and hides it in an image's RGB least significant bits. Files, messages, and passwords stay on the device; no backend or external requests are needed.

## Start on Windows

Install Node.js LTS from https://nodejs.org/, then double-click `start.bat` in the project folder. It installs dependencies on first launch and opens the app in your browser. Keep the terminal window open while using the app; press Ctrl+C to stop it.

## Develop

Requires Node.js 20.19+ or 22.12+ (tested with Node 24).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

Open the development server in your browser. Web Crypto requires HTTPS or localhost.

```sh
npm test
npm run build
```

Deploy `dist/` to any HTTPS static host.

## Languages

Choose English or **کوردی — بادینی** (Badini Kurdish, Arabic script) from the header. Kurdish uses a right-to-left layout; the language choice is remembered locally. Switching languages preserves current uploads, messages, passwords, and results. Translations are maintained in `src/i18n.js`.

## Use

Choose **Hide a message**, upload PNG/JPEG/WebP, enter text and a password, and download the resulting PNG. The app verifies the actual exported PNG can be decrypted before offering the download. Choose **Reveal a message**, upload the original output PNG, and enter its password to recover the text.

Only images are supported in this version. Images are limited to 20 MB and 16 million pixels. Transparency is flattened onto white before embedding. Preserve the output PNG: resizing, lossy compression, image editing, or social-media processing can erase the payload. Encryption does not make the presence of hidden data undetectable.

## Encryption format

Uses native Web Crypto AES-256-GCM with a fresh 16-byte salt, 12-byte nonce, and 128-bit authentication tag per message. Password keys use PBKDF2-HMAC-SHA-256 with 600,000 iterations. Choose a strong password and share it separately; forgotten passwords cannot be recovered.

Version 1 payload: `VEIL` + version byte, four-byte big-endian ciphertext length, salt, nonce, and ciphertext including authentication tag. The signature/version is authenticated as additional data. Payload bits occupy RGB channels in order, most significant bit first, without modifying alpha. Capacity is `floor(width * height * 3 / 8) - 53` UTF-8 bytes.

## Validation

`npm test` covers Unicode round trips, alpha preservation, wrong passwords, tampering, invalid headers, oversized payloads, and fresh salts/nonces. Browser smoke validation also exercised PNG encoding/download/re-upload, decryption, wrong-password errors, and mobile overflow checks.
