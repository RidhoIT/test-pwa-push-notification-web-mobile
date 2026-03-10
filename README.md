# PWA Push Notification Tester

A simple Progressive Web App (PWA) for testing push notifications using the **Web Push API** (no Firebase required). Built with Next.js, TypeScript, Tailwind CSS, and the standard Web Push API.

## Features

- 🔔 **Push Notification Testing** - Subscribe to push notifications using Web Push API
- 📲 **PWA Installable** - Install the app to your home screen on Android & iOS
- ✅ **Service Worker** - Handles background notifications
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔒 **HTTPS Ready** - Deploy on Vercel for automatic HTTPS
- 🚀 **No Firebase** - Uses standard Web Push API with VAPID

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- HTTPS (required for push notifications - use Vercel or ngrok for local testing)

### Installation

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate VAPID keys**
   ```bash
   node scripts/generate-vapid-keys.js
   ```
   This will generate a public/private key pair for Web Push.

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Paste the generated VAPID keys:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_generated_public_key
   VAPID_PRIVATE_KEY=your_generated_private_key
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**
   
   **Note:** For push notifications to work locally, you need HTTPS. Use [ngrok](https://ngrok.com/) or deploy to Vercel.

## Usage

### Testing Push Notifications

1. Click the **Subscribe** button
2. Allow notification permission when prompted
3. You'll automatically receive a test notification
4. Status changes to "Subscribed ✅"

### Installing PWA

1. On mobile browser (Chrome Android recommended)
2. Click the **Install App** button
3. Confirm "Add to Home Screen"
4. App installs and button shows "Installed ✅"

### Testing Background Notifications

1. Install the PWA to home screen
2. Open the installed app
3. Press home button (background the app)
4. Send a notification via the API
5. Notification appears even when app is in background

## Project Structure

```
pwa-push-notification-tester/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Service worker for push notifications
├── src/
│   └── app/
│       ├── api/
│       │   └── send-notification/
│       │       └── route.ts   # API endpoint for sending notifications
│       ├── page.tsx           # Main page with Subscribe & Install buttons
│       ├── layout.tsx         # Root layout with PWA meta tags
│       ├── vapid-keys.ts      # VAPID keys configuration
│       └── globals.css        # Global styles
├── scripts/
│   ├── generate-vapid-keys.js # Script to generate VAPID keys
│   └── generate-icons.js      # Script to generate PWA icons
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel settings:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
5. Deploy

Vercel automatically provides HTTPS which is required for PWA and push notifications.

### Local Testing with HTTPS

Use [ngrok](https://ngrok.com/) for local HTTPS testing:

```bash
# Install ngrok
npm install -g ngrok

# Run your dev server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000
```

Use the ngrok HTTPS URL to test push notifications.

## How Web Push Works

### 1. VAPID Keys
VAPID (Voluntary Application Server Identification) keys identify your application as a push sender. Generate once and reuse.

### 2. Subscription Flow
1. User clicks "Subscribe"
2. Browser requests notification permission
3. Browser creates a push subscription with the VAPID public key
4. Subscription is sent to your server
5. Server stores subscription for later use

### 3. Sending Notifications
1. Server uses the stored subscription + VAPID private key
2. Payload is encrypted and sent to the push service
3. Push service delivers to the device
4. Service Worker receives and displays notification

## Browser Compatibility

| Browser | Push Notifications | PWA Install |
|---------|-------------------|-------------|
| Chrome Android | ✅ | ✅ |
| Chrome Desktop | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Safari iOS 16.4+ | ✅ | ✅ |
| Safari Desktop | ❌ | ✅ |

**Note:** Safari has limited Web Push support. iOS 16.4+ supports push notifications for PWAs added to home screen.

## API Endpoint

### POST /api/send-notification

Send a push notification to a subscribed device.

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "title": "Test Notification",
  "body": "Hello from PWA!",
  "icon": "/icons/icon-192x192.png"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

## Troubleshooting

### Notifications not showing

- Ensure HTTPS is enabled (required for Web Push)
- Check browser notification permissions
- Verify VAPID keys are correctly configured
- Check service worker registration in DevTools
- Try Chrome on Android for best compatibility

### "Push Manager not supported"

- Make sure you're using HTTPS
- Some browsers don't support push (e.g., Safari on macOS < 16.4)
- Check if service worker is registered

### Install button not showing

- PWA install only works on mobile browsers
- Must be served over HTTPS
- Try Chrome on Android for best support
- Check `beforeinstallprompt` event in console

## Comparison: Web Push vs Firebase (FCM)

| Feature | Web Push API | Firebase FCM |
|---------|-------------|--------------|
| Setup | Simple (VAPID keys) | Requires Firebase project |
| Vendor Lock-in | None (standard API) | Google proprietary |
| Browser Support | Chrome, Firefox, Edge | Chrome, Android |
| iOS Support | iOS 16.4+ (PWA only) | iOS 10+ (requires native app) |
| Privacy | End-to-end encrypted | Google can access messages |
| Complexity | Low | Medium |

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PWA:** Web App Manifest + Service Worker
- **Push Notifications:** Web Push API (RFC 8030)
- **Deployment:** Vercel

## License

MIT

## Author

PWA Push Notification Tester v1.1.0
