#!/usr/bin/env node

/**
 * Credential Validation Script
 *
 * Tests all environment variables and API connections to ensure
 * the application is properly configured for deployment.
 *
 * Usage:
 *   node scripts/validate-credentials.js
 *
 * Or with specific env file:
 *   node -r dotenv/config scripts/validate-credentials.js dotenv_config_path=.env.production
 */

const https = require('https');
const { google } = require('googleapis');
const admin = require('firebase-admin');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function checkEnvVariable(name, required = true) {
  const value = process.env[name];
  const exists = !!value;

  if (required && !exists) {
    log(`❌ ${name}: MISSING (required)`, 'red');
    return false;
  } else if (!exists) {
    log(`⚠️  ${name}: Not set (optional)`, 'yellow');
    return true;
  } else {
    const preview = value.length > 50 ? value.substring(0, 47) + '...' : value;
    log(`✅ ${name}: ${preview}`, 'green');
    return true;
  }
}

async function testFirebase() {
  section('Testing Firebase Connection');

  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const db = admin.firestore();

    // Try to access Firestore
    const testRef = db.collection('_test_connection');
    await testRef.limit(1).get();

    log('✅ Firebase Admin SDK initialized successfully', 'green');
    log('✅ Firestore connection working', 'green');
    return true;
  } catch (error) {
    log(`❌ Firebase connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function testGoogleDrive() {
  section('Testing Google Drive API');

  try {
    const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Test each folder
    const folders = {
      'A-L': process.env.GOOGLE_DRIVE_AL_FOLDER_ID,
      'M-Z': process.env.GOOGLE_DRIVE_MZ_FOLDER_ID,
      'Not Listed': process.env.GOOGLE_DRIVE_NOT_LISTED_FOLDER_ID,
    };

    let allSuccess = true;

    for (const [name, folderId] of Object.entries(folders)) {
      try {
        const response = await drive.files.get({
          fileId: folderId,
          fields: 'id, name, permissions',
        });

        log(`✅ ${name} folder accessible: "${response.data.name}"`, 'green');
      } catch (error) {
        log(`❌ ${name} folder (${folderId}): ${error.message}`, 'red');
        allSuccess = false;
      }
    }

    return allSuccess;
  } catch (error) {
    log(`❌ Google Drive API failed: ${error.message}`, 'red');
    return false;
  }
}

async function testAsana() {
  section('Testing Asana API');

  return new Promise((resolve) => {
    const token = process.env.ASANA_ACCESS_TOKEN;
    const projectId = process.env.ASANA_PROJECT_ID;

    const options = {
      hostname: 'app.asana.com',
      path: `/api/1.0/projects/${projectId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          if (res.statusCode === 200) {
            log(`✅ Asana API connected successfully`, 'green');
            log(`✅ Project found: "${parsed.data.name}"`, 'green');
            resolve(true);
          } else {
            log(`❌ Asana API error (${res.statusCode}): ${parsed.errors?.[0]?.message || 'Unknown error'}`, 'red');
            resolve(false);
          }
        } catch (error) {
          log(`❌ Asana API response parse error: ${error.message}`, 'red');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ Asana API request failed: ${error.message}`, 'red');
      resolve(false);
    });

    req.end();
  });
}

async function testCommonSKU() {
  section('Testing CommonSKU API');

  return new Promise((resolve) => {
    const apiKey = process.env.COMMONSKU_API_KEY;

    const postData = JSON.stringify({
      query: 'query { viewer { email } }',
    });

    const options = {
      hostname: 'api.commonsku.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          if (parsed.data?.viewer?.email) {
            log(`✅ CommonSKU API connected successfully`, 'green');
            log(`✅ Authenticated as: ${parsed.data.viewer.email}`, 'green');
            resolve(true);
          } else if (parsed.errors) {
            log(`❌ CommonSKU API error: ${parsed.errors[0]?.message || 'Unknown error'}`, 'red');
            resolve(false);
          } else {
            log(`❌ CommonSKU API unexpected response`, 'red');
            resolve(false);
          }
        } catch (error) {
          log(`❌ CommonSKU API response parse error: ${error.message}`, 'red');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ CommonSKU API request failed: ${error.message}`, 'red');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function testSlackWebhook(webhookUrl, name) {
  return new Promise((resolve) => {
    const url = new URL(webhookUrl);
    const postData = JSON.stringify({
      text: `✅ Credential validation test from Art Request Form - ${name}`,
    });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          log(`✅ ${name} webhook working (check Slack for test message)`, 'green');
          resolve(true);
        } else {
          log(`❌ ${name} webhook failed (${res.statusCode}): ${data}`, 'red');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      log(`❌ ${name} webhook request failed: ${error.message}`, 'red');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function testSlack() {
  section('Testing Slack Webhooks');

  const techAlertWebhook = process.env.SLACK_TECH_ALERT_WEBHOOK;
  const successWebhook = process.env.SLACK_SUCCESS_WEBHOOK;

  let allSuccess = true;

  if (techAlertWebhook) {
    const result = await testSlackWebhook(techAlertWebhook, 'Tech Alert');
    allSuccess = allSuccess && result;
  } else {
    log('❌ SLACK_TECH_ALERT_WEBHOOK not set (required)', 'red');
    allSuccess = false;
  }

  if (successWebhook) {
    const result = await testSlackWebhook(successWebhook, 'Success Notifications');
    allSuccess = allSuccess && result;
  } else {
    log('⚠️  SLACK_SUCCESS_WEBHOOK not set (optional)', 'yellow');
  }

  return allSuccess;
}

async function main() {
  log('\n🔍 Art Request Form - Credential Validation\n', 'blue');

  // Check environment variables
  section('Checking Environment Variables');

  const envChecks = [
    // Node
    await checkEnvVariable('NODE_ENV'),
    await checkEnvVariable('PORT'),

    // Firebase Public
    await checkEnvVariable('NEXT_PUBLIC_FIREBASE_API_KEY'),
    await checkEnvVariable('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    await checkEnvVariable('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    await checkEnvVariable('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    await checkEnvVariable('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    await checkEnvVariable('NEXT_PUBLIC_FIREBASE_APP_ID'),

    // Firebase Admin
    await checkEnvVariable('FIREBASE_ADMIN_PROJECT_ID'),
    await checkEnvVariable('FIREBASE_ADMIN_CLIENT_EMAIL'),
    await checkEnvVariable('FIREBASE_ADMIN_PRIVATE_KEY'),

    // Google Drive
    await checkEnvVariable('GOOGLE_DRIVE_CREDENTIALS'),
    await checkEnvVariable('GOOGLE_DRIVE_AL_FOLDER_ID'),
    await checkEnvVariable('GOOGLE_DRIVE_MZ_FOLDER_ID'),
    await checkEnvVariable('GOOGLE_DRIVE_NOT_LISTED_FOLDER_ID'),

    // Asana
    await checkEnvVariable('ASANA_ACCESS_TOKEN'),
    await checkEnvVariable('ASANA_PROJECT_ID'),

    // CommonSKU
    await checkEnvVariable('COMMONSKU_API_KEY'),

    // Slack
    await checkEnvVariable('SLACK_TECH_ALERT_WEBHOOK'),
    await checkEnvVariable('SLACK_SUCCESS_WEBHOOK', false), // Optional
  ];

  const envSuccess = envChecks.every((check) => check);

  if (!envSuccess) {
    log('\n❌ Some required environment variables are missing. Cannot proceed with API tests.', 'red');
    log('Please check CREDENTIALS_SETUP.md for setup instructions.\n', 'yellow');
    process.exit(1);
  }

  // Test API connections
  const results = {
    firebase: await testFirebase(),
    googleDrive: await testGoogleDrive(),
    asana: await testAsana(),
    commonsku: await testCommonSKU(),
    slack: await testSlack(),
  };

  // Summary
  section('Validation Summary');

  const allPassed = Object.values(results).every((result) => result);

  if (allPassed) {
    log('\n🎉 All credentials validated successfully!', 'green');
    log('✅ Your application is ready for deployment.\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some credential tests failed:', 'red');
    Object.entries(results).forEach(([name, passed]) => {
      const status = passed ? '✅' : '❌';
      const color = passed ? 'green' : 'red';
      log(`${status} ${name}`, color);
    });
    log('\nPlease check the errors above and update your credentials.\n', 'yellow');
    log('See CREDENTIALS_SETUP.md for detailed setup instructions.\n', 'yellow');
    process.exit(1);
  }
}

// Run validation
main().catch((error) => {
  log(`\n❌ Validation script error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
