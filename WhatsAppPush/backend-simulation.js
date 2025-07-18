/**
 * Simple Backend Simulation for Firebase Cloud Messaging
 * This script simulates sending push notifications to test the app
 */

const https = require('https');

// Configuration - Replace with your actual values
const CONFIG = {
  SERVER_KEY: 'YOUR_FIREBASE_SERVER_KEY_HERE', // Replace with your Firebase Server Key
  FCM_TOKEN: 'YOUR_DEVICE_FCM_TOKEN_HERE', // Replace with device FCM token from the app
};

// Function to send FCM notification
function sendNotification(title, body, data = {}) {
  const payload = {
    to: CONFIG.FCM_TOKEN,
    notification: {
      title: title,
      body: body,
    },
    data: {
      screen: 'call',
      type: 'incoming_call',
      ...data,
    },
    priority: 'high',
    android: {
      priority: 'high',
      notification: {
        channel_id: 'call_channel',
        priority: 'high',
        default_sound: true,
        default_vibrate_timings: true,
      },
    },
  };

  const postData = JSON.stringify(payload);

  const options = {
    hostname: 'fcm.googleapis.com',
    port: 443,
    path: '/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${CONFIG.SERVER_KEY}`,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

// Test scenarios
function runTests() {
  console.log('🚀 Starting Firebase Cloud Messaging Tests...\n');

  // Test 1: Basic incoming call notification
  setTimeout(() => {
    console.log('📞 Test 1: Sending incoming call notification...');
    sendNotification('Incoming Call', 'John Doe is calling...', {
      caller_name: 'John Doe',
      call_type: 'voice',
    });
  }, 1000);

  // Test 2: Video call notification
  setTimeout(() => {
    console.log('📹 Test 2: Sending video call notification...');
    sendNotification('Video Call', 'Sarah is calling via video...', {
      caller_name: 'Sarah',
      call_type: 'video',
    });
  }, 5000);

  // Test 3: Group call notification
  setTimeout(() => {
    console.log('👥 Test 3: Sending group call notification...');
    sendNotification('Group Call', 'Family Group is calling...', {
      caller_name: 'Family Group',
      call_type: 'group',
    });
  }, 10000);

  // Test 4: Message notification (different style)
  setTimeout(() => {
    console.log('💬 Test 4: Sending message notification...');
    sendNotification('New Message', 'You have a new message from Alex', {
      sender_name: 'Alex',
      message_type: 'text',
    });
  }, 15000);
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📱 WhatsApp Push Notification Backend Simulation\n');
    console.log('Usage:');
    console.log('  node backend-simulation.js test                    - Run all test scenarios');
    console.log('  node backend-simulation.js send "Title" "Body"     - Send custom notification');
    console.log('  node backend-simulation.js call "Caller Name"      - Send call notification');
    console.log('\nBefore running, make sure to:');
    console.log('1. Replace SERVER_KEY with your Firebase Server Key');
    console.log('2. Replace FCM_TOKEN with the device token from your app\n');
    return;
  }

  const command = args[0];

  switch (command) {
    case 'test':
      if (!CONFIG.SERVER_KEY.includes('YOUR_') && !CONFIG.FCM_TOKEN.includes('YOUR_')) {
        runTests();
      } else {
        console.error('❌ Please configure SERVER_KEY and FCM_TOKEN in the script first!');
      }
      break;

    case 'send':
      if (args.length < 3) {
        console.error('❌ Usage: node backend-simulation.js send "Title" "Body"');
        return;
      }
      const title = args[1];
      const body = args[2];
      console.log(`📤 Sending custom notification: ${title}`);
      sendNotification(title, body);
      break;

    case 'call':
      if (args.length < 2) {
        console.error('❌ Usage: node backend-simulation.js call "Caller Name"');
        return;
      }
      const callerName = args[1];
      console.log(`📞 Sending call notification from: ${callerName}`);
      sendNotification('Incoming Call', `${callerName} is calling...`, {
        caller_name: callerName,
        call_type: 'voice',
      });
      break;

    default:
      console.error('❌ Unknown command. Use "test", "send", or "call"');
  }
}

module.exports = { sendNotification };
