'use client';

import { useEffect, useState, useCallback } from 'react';

interface NotificationPermission {
  permission: 'granted' | 'denied' | 'default';
  isSubscribed: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export default function Home() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    permission: 'default',
    isSubscribed: false,
  });
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [pushSubscription, setPushSubscription] = useState<PushSubscription | null>(null);
  const [swReady, setSwReady] = useState(false);

  // Register service worker on mount (BEFORE any subscription attempt)
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
          });
          
          // Wait for service worker to be active
          if (registration.active) {
            setSwReady(true);
            console.log('Service Worker active:', registration.scope);
          } else if (registration.installing) {
            // Wait for installing worker to become active
            registration.installing.addEventListener('statechange', (event) => {
              if ((event.target as ServiceWorker).state === 'activated') {
                setSwReady(true);
                console.log('Service Worker activated:', registration.scope);
              }
            });
          } else if (registration.waiting) {
            // Worker is waiting to activate
            setSwReady(true);
            console.log('Service Worker ready (waiting):', registration.scope);
          }
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerSW();
  }, []);

  // Check installation and permission status on mount
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission({
        permission: Notification.permission as 'granted' | 'denied' | 'default',
        isSubscribed: Notification.permission === 'granted',
      });
    }

    // Check existing push subscription
    if ('serviceWorker' in navigator && 'PushManager' in window && swReady) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            setPushSubscription(subscription);
            setNotificationPermission({ permission: 'granted', isSubscribed: true });
          }
        });
      });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for install success
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setMessage({ type: 'success', text: 'PWA installed successfully!' });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [swReady]);

  // Subscribe to push notifications using Web Push API
  const handleSubscribe = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Request notification permission
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported in this browser');
      }

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        setNotificationPermission({ permission, isSubscribed: false });
        setMessage({
          type: 'error',
          text: 'Notification permission denied. Please enable notifications in your browser settings.'
        });
        setLoading(false);
        return;
      }

      // Wait for service worker to be ready
      if (!swReady) {
        throw new Error('Service Worker not ready. Please wait a moment and try again.');
      }

      // Get the registered service worker
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready:', registration.scope);

      // Unsubscribe existing subscription first (allow re-subscription)
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        console.log('Unsubscribed existing subscription');
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID Public Key not configured. Please check your .env.local file.');
      }

      // Convert VAPID key from base64 to Uint8Array
      const vapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: uint8ArrayToArrayBuffer(vapidKey),
      });

      setPushSubscription(subscription);
      setNotificationPermission({ permission: 'granted', isSubscribed: true });

      // Send subscription to server (optional - for production use)
      const subscriptionJSON = subscription.toJSON();
      console.log('Push Subscription:', subscriptionJSON);

      // Send test notification
      if (subscriptionJSON.endpoint) {
        await sendTestNotification(subscriptionJSON as PushSubscriptionData);
      }

      setMessage({ type: 'success', text: 'Successfully subscribed! Check for notification.' });
    } catch (error) {
      console.error('Subscribe error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to subscribe'
      });
    } finally {
      setLoading(false);
    }
  }, [swReady]);

  // Send test notification via API
  const sendTestNotification = async (subscription: PushSubscriptionData) => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          title: '🎉 Subscription Successful!',
          body: 'You have successfully subscribed to push notifications!',
          icon: '/icons/icon-192x192.png',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }

      console.log('Notification sent:', result);
    } catch (error) {
      console.warn('Notification send error:', error);
      // Fallback: show local notification using service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('🎉 Subscription Successful!', {
          body: 'You have successfully subscribed to push notifications!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
        });
      }
    }
  };

  // Handle PWA install
  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
        setMessage({ type: 'success', text: 'Installing PWA...' });
      } else {
        setMessage({ type: 'info', text: 'Install dismissed' });
      }
    } catch (error) {
      console.error('Install error:', error);
      setMessage({ type: 'error', text: 'Failed to install PWA' });
    }
  }, [installPrompt]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔔 PWA Push Notification
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Web Push API Testing App
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : message.type === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Subscription Status */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subscription Status
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                notificationPermission.isSubscribed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-400 text-white'
              }`}
            >
              {notificationPermission.isSubscribed ? 'Subscribed ✅' : 'Not Subscribed'}
            </span>
          </div>
        </div>

        {/* Subscribe Button - Can click multiple times */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : notificationPermission.isSubscribed
              ? 'bg-green-500 hover:bg-green-600 active:scale-95'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Subscribing...</span>
            </>
          ) : notificationPermission.isSubscribed ? (
            <>
              <span>🔁</span>
              <span>Re-subscribe</span>
            </>
          ) : (
            <>
              <span>🔔</span>
              <span>Subscribe</span>
            </>
          )}
        </button>

        {/* Install Button */}
        {!isInstalled && installPrompt && (
          <button
            onClick={handleInstall}
            className="w-full py-4 px-6 bg-purple-500 hover:bg-purple-600 active:scale-95 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>📲</span>
            <span>Install App</span>
          </button>
        )}

        {/* Installed Status */}
        {isInstalled && (
          <div className="w-full py-4 px-6 bg-green-100 dark:bg-green-900 rounded-xl font-semibold text-green-800 dark:text-green-200 flex items-center justify-center space-x-2">
            <span>✅</span>
            <span>Installed</span>
          </div>
        )}

        {/* Info Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            How to test:
          </h3>
          <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>Click Subscribe to enable push notifications</li>
            <li>Allow notification permission when prompted</li>
            <li>Receive a test notification automatically</li>
            <li>Click Install to add to home screen (mobile)</li>
            <li>Test notifications in background mode</li>
          </ol>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-400">
        <p>PWA Push Notification Tester v1.1.0</p>
        <p>Powered by Web Push API</p>
      </footer>
    </main>
  );
}

// Helper function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper to convert Uint8Array to ArrayBuffer for Push API
function uint8ArrayToArrayBuffer(uint8Array: Uint8Array): ArrayBuffer {
  return new Uint8Array(uint8Array).buffer as ArrayBuffer;
}
