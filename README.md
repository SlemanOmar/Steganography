# Wéne Cipher — encrypted image steganography

Wéne Cipher is a browser-based web application that combines AES-256-GCM encryption with Least Significant Bit (LSB) steganography to hide and recover text inside images. All processing happens locally: images, messages, and passwords stay on the user's device.

- Password-based key derivation with PBKDF2-HMAC-SHA-256 and a fresh salt and nonce for each message.
- PNG export with automatic extraction and decryption verification before download.
- Responsive navy blue and cream interface with English and Badini Kurdish support, including right-to-left layouts.

**Technologies:** JavaScript, HTML, CSS, Web Crypto API, Canvas API, Vite, Git.

**Designed and developed by Mr. Suleman Omar.**

## Get the project

Install [Node.js 24 LTS](https://nodejs.org/) and [Git](https://git-scm.com/downloads), then run:

```sh
git clone https://github.com/SlemanOmar/WeneCipher.git
cd WeneCipher
```

Alternatively, select **Code → Download ZIP** on GitHub and extract the archive. Git updates require a cloned checkout.

## Start on Windows

Double-click `start.bat` inside the downloaded or cloned project folder. It installs dependencies on first launch and opens the app in your browser. Keep the terminal window open while using the app; press Ctrl+C to stop it.

## Develop

Requires Node.js 20.19 or later in the 20.x series, 22.12 or later in the 22.x series, or 24+. Node.js 24 LTS is recommended and was used for validation. Run these commands from the project folder:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite (usually `http://localhost:5173`). Web Crypto requires HTTPS or localhost; an HTTP LAN address will not support encryption. The Windows launcher binds to localhost, while `npm run dev` listens on all network interfaces.

```sh
npm test
npm run build
```

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` tests, builds, and deploys the site on pushes to `main`.

In the repository's **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. Then open **Actions → Deploy Wéne Cipher to GitHub Pages → Run workflow** if a deployment has not already started.

After the deployment succeeds, the site will be available at https://slemanomar.github.io/WeneCipher/. The workflow sets the asset base path to `/WeneCipher/`, including bundled Kurdish fonts. No backend or secrets are required.

For another HTTPS static host, run `npm run build` and publish `dist/`. Set `VITE_BASE_PATH` when hosting under a subdirectory.

## Update your local copy

Stop the app with Ctrl+C. In a Git-cloned project folder, run:

```sh
git pull --ff-only
npm ci
```

Then double-click `start.bat` on Windows or run `npm run dev` again. A ZIP download cannot be updated with `git pull`.

## Languages

Choose English or **کوردی — بادینی** (Badini Kurdish, Arabic script) from the header. Kurdish uses a right-to-left layout; the language choice is remembered locally. Switching languages preserves current uploads, messages, passwords, and results. The Kurdish interface uses the locally bundled Shahid Foundation font. Translations are maintained in `src/i18n.js`.

## Use

Choose **Hide a message**, upload PNG/JPEG/WebP, enter text and a strong password, and download the resulting PNG. The app verifies the actual exported PNG can be decrypted before offering the download. Choose **Reveal a message**, upload the original output PNG, and enter its password to recover the text.

Hide and Reveal keep separate image and password selections. Selections, passwords, and messages are held in memory and cleared when the page is reloaded; only the language preference is remembered.

Only images are supported in this version; video is not supported. Uploaded files are limited to 64 MiB (67,108,864 bytes) and images to 16 million pixels. Transparency is flattened onto white before embedding. Preserve the output PNG: resizing, lossy compression, image editing, or social-media processing can erase the payload. Share the PNG as an original file and share its password separately. Encryption protects the message contents; LSB embedding does not make hidden data undetectable.

## Encryption format

Uses native Web Crypto AES-256-GCM with a fresh 16-byte salt, 12-byte nonce, and 128-bit authentication tag per message. Password keys use PBKDF2-HMAC-SHA-256 with 600,000 iterations. Choose a strong password and share it separately; forgotten passwords cannot be recovered.

Version 1 payload: the four-byte `VEIL` signature (retained from the original app name for compatibility) + version byte, four-byte big-endian ciphertext length, salt, nonce, and ciphertext including authentication tag. The signature/version is authenticated as additional data. Payload bits occupy RGB channels in order, most significant bit first, without modifying alpha. Available text capacity is `max(0, floor(width * height * 3 / 8) - 53)` UTF-8 bytes. This is a byte limit, not a character limit; Kurdish characters and emoji can take multiple bytes.

## Validation

`npm test` covers Unicode round trips, alpha preservation, wrong passwords, tampering, invalid headers, truncated or appended packets, exact capacity boundaries, oversized payloads, and fresh salts/nonces. Separate browser smoke checks performed during development also exercised PNG encoding/download/re-upload, decryption, wrong-password errors, and mobile overflow checks.
