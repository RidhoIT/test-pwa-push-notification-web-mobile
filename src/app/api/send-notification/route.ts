import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

// Configure VAPID keys
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscription {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

interface RequestBody {
  subscription: PushSubscription;
  title?: string;
  body?: string;
  icon?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { subscription, title, body: messageBody, icon } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Valid push subscription is required' },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title: title || 'New Notification',
      body: messageBody || 'You have a new message',
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' }
      ],
    });

    // Send push notification
    await webPush.sendNotification(subscription, payload);

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Send notification error:', error);
    
    // Handle subscription errors (e.g., expired subscription)
    if (error instanceof webPush.WebPushError) {
      if (error.statusCode === 410) {
        return NextResponse.json(
          { error: 'Subscription has expired or been revoked' },
          { status: 410 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send notification', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
