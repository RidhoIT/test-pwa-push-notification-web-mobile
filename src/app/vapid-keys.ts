// VAPID Keys for Web Push
// These keys identify your application as a push sender
// Generate once and store securely (e.g., in environment variables)

export const VAPID_KEYS = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

// Subject for VAPID (must be a mailto URL or your website URL)
export const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:your-email@example.com';
