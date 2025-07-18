package com.whatsapppush;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CallNotificationModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "call_channel";
    private final ReactApplicationContext reactContext;

    public CallNotificationModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        createNotificationChannel();
    }

    @Override
    public String getName() {
        return "CallNotification";
    }

    @ReactMethod
    public void showCallNotification(String title, String body) {
        Intent intent = new Intent(reactContext, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        intent.putExtra("notification_data", "call_screen"); // For deep linking
        
        PendingIntent pendingIntent = PendingIntent.getActivity(reactContext, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setFullScreenIntent(pendingIntent, true)
                .setAutoCancel(true)
                .setOngoing(true)
                .setTimeoutAfter(30000); // Auto dismiss after 30 seconds

        NotificationManager manager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.notify(1, builder.build());
        }
    }

    @ReactMethod
    public void dismissCallNotification() {
        NotificationManager manager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.cancel(1);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Call Notifications",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Incoming call notifications");
            channel.setShowBadge(true);
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            
            NotificationManager manager = reactContext.getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
}
