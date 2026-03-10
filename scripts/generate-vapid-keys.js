// Script to generate VAPID keys for Web Push
const webPush = require('web-push');

// Generate VAPID keys
const vapidKeys = webPush.generateVAPIDKeys();

console.log('===========================================');
console.log('VAPID Keys Generated Successfully!');
console.log('===========================================');
console.log('');
console.log('Add these to your .env.local file:');
console.log('');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log('');
console.log('===========================================');
console.log('IMPORTANT: Keep your PRIVATE KEY secret!');
console.log('Never commit it to version control.');
console.log('===========================================');
