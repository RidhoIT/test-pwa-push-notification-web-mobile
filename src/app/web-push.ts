// Web Push configuration utilities
import { VAPID_KEYS } from './vapid-keys';

export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Generate VAPID keys (run this once and save the keys)
export function generateVAPIDKeys() {
  // In production, use web-push library to generate keys
  // const webPush = require('web-push');
  // const vapidKeys = webPush.generateVAPIDKeys();
  return {
    publicKey: VAPID_KEYS.publicKey,
    privateKey: VAPID_KEYS.privateKey,
  };
}

// Get VAPID public key for client subscription
export function getVAPIDPublicKey(): string {
  return VAPID_KEYS.publicKey;
}

// Convert subscription to JSON for storage
export function subscriptionToJSON(subscription: PushSubscription): PushSubscriptionJSON {
  return subscription.toJSON() as PushSubscriptionJSON;
}
