# Credentials Setup Guide

Complete guide for obtaining and configuring all credentials needed to deploy the Art Request Form.

## Table of Contents

1. [Firebase Credentials](#firebase-credentials)
2. [Google Drive API Credentials](#google-drive-api-credentials)
3. [Asana API Credentials](#asana-api-credentials)
4. [CommonSKU API Credentials](#commonsku-api-credentials)
5. [Slack Webhook URLs](#slack-webhook-urls)
6. [Environment Configuration](#environment-configuration)
7. [Testing Credentials](#testing-credentials)

---

## Firebase Credentials

### Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Click the gear icon → **Project settings**

### Step 2: Get Public Firebase Config (Client-Side)

1. In Project settings, scroll to **Your apps**
2. Click the web icon (`</>`) or select your existing web app
3. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

These values go in your `.env.production` as:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

### Step 3: Get Firebase Admin SDK Credentials (Server-Side)

1. In Project settings, click **Service accounts** tab
2. Click **Generate new private key**
3. Download the JSON file (keep this secure!)
4. Open the JSON file, you'll see:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

Extract these values for `.env.production`:
```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important**: The private key must include the `\n` newline characters and be wrapped in quotes.

### Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Google** provider
5. Add authorized domain: `requests.whitestonebranding.com`
6. Save

### Step 5: Set Up Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select region closest to your server
5. Create these collections:
   - `submissions`
   - `drafts`

---

## Google Drive API Credentials

### Step 1: Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project (or create new project)
3. Go to **APIs & Services** → **Library**
4. Search for "Google Drive API"
5. Click **Enable**

### Step 2: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details:
   - **Service account name**: `art-request-drive-access`
   - **Service account ID**: (auto-generated)
   - **Description**: "Art Request Form - Google Drive Integration"
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**)
6. Click **Done**

### Step 3: Generate Service Account Key

1. In **Service Accounts** list, click the account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create** (downloads JSON file)

The downloaded JSON looks like:
```json
{
  "type": "service_account",
  "project_id": "your-project-123",
  "private_key_id": "abc...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "art-request-drive-access@your-project.iam.gserviceaccount.com",
  "client_id": "123...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

For `.env.production`, you need the **entire JSON as a single-line string**:
```bash
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account","project_id":"your-project-123","private_key_id":"abc...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"art-request-drive-access@your-project.iam.gserviceaccount.com",...}
```

**Tip**: Use this command to create a single-line JSON:
```bash
cat service-account-key.json | jq -c . > credentials-oneline.txt
```

### Step 4: Set Up Google Drive Folders

1. Open Google Drive
2. Create folder structure:
   ```
   Art Requests/
   ├── A-L/
   ├── M-Z/
   └── Not Listed/
   ```

3. For each folder, get the folder ID:
   - Open the folder in Google Drive
   - Look at URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the folder ID

4. Share each folder with the service account email:
   - Right-click folder → **Share**
   - Add email: `art-request-drive-access@your-project.iam.gserviceaccount.com`
   - Give **Editor** permission
   - Click **Send**

5. Add folder IDs to `.env.production`:
```bash
GOOGLE_DRIVE_AL_FOLDER_ID=1abc123...
GOOGLE_DRIVE_MZ_FOLDER_ID=1def456...
GOOGLE_DRIVE_NOT_LISTED_FOLDER_ID=1ghi789...
```

---

## Asana API Credentials

### Step 1: Generate Personal Access Token

1. Go to [Asana](https://app.asana.com)
2. Click your profile photo → **My Settings**
3. Go to **Apps** tab
4. Scroll to **Personal Access Tokens**
5. Click **+ New access token**
6. Name: `Art Request Form Integration`
7. Click **Create token**
8. **Copy the token immediately** (you won't see it again!)

Add to `.env.production`:
```bash
ASANA_ACCESS_TOKEN=1/1234567890abcdef:1234567890abcdef1234567890abcdef
```

### Step 2: Get Project ID

#### Option A: From URL
1. Open your "Art Request" board in Asana
2. Look at URL: `https://app.asana.com/0/PROJECT_ID/...`
3. Copy the project ID (long number)

#### Option B: From API
```bash
# List all projects
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://app.asana.com/api/1.0/projects

# Find the project ID in the response
```

Add to `.env.production`:
```bash
ASANA_PROJECT_ID=1211223909834951  # Your production board ID
```

### Step 3: Verify Custom Fields (Optional)

The custom field GIDs are hardcoded in `lib/integrations/asana.ts`. If your Asana board uses different custom fields:

1. Get custom field list:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://app.asana.com/api/1.0/projects/YOUR_PROJECT_ID"
```

2. Update the mapping in `lib/integrations/asana.ts` if needed.

---

## CommonSKU API Credentials

### Step 1: Get API Key

1. Log in to [CommonSKU](https://app.commonsku.com)
2. Go to **Settings** → **API Access**
3. Copy your API key

If you don't see API Access:
- Contact CommonSKU support to enable API access for your account
- Email: support@commonsku.com

Add to `.env.production`:
```bash
COMMONSKU_API_KEY=your_commonsku_api_key_here
```

### Step 2: Test API Access (Optional)

```bash
curl -X POST https://api.commonsku.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"query":"query { viewer { email } }"}'
```

Should return your CommonSKU account email.

---

## Slack Webhook URLs

### Step 1: Create Slack App (If Needed)

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App name: `Art Request Form Notifications`
4. Choose your workspace
5. Click **Create App**

### Step 2: Enable Incoming Webhooks

1. In your app settings, go to **Incoming Webhooks**
2. Toggle **Activate Incoming Webhooks** to **On**
3. Scroll down, click **Add New Webhook to Workspace**

### Step 3: Create Webhooks for Each Channel

#### Tech Alert Webhook (Required)
1. Click **Add New Webhook to Workspace**
2. Select channel: **#tech-alert** (or create it)
3. Click **Allow**
4. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

Add to `.env.production`:
```bash
SLACK_TECH_ALERT_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

#### Success Webhook (Optional)
1. Repeat process for success notifications
2. Select channel: **#art-requests** (or preferred channel)
3. Copy webhook URL

Add to `.env.production` (optional):
```bash
SLACK_SUCCESS_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/YYYYYYYYYYYYYYYYYYYY
```

### Step 4: Test Webhooks

```bash
# Test tech-alert webhook
curl -X POST YOUR_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message from Art Request Form setup"}'

# Check Slack channel for message
```

---

## Environment Configuration

### Step 1: Create `.env.production` File

SSH to your server:
```bash
ssh deploy@requests.whitestonebranding.com
cd /var/www/art-request-form
nano .env.production
```

### Step 2: Complete Template

```bash
# ========================================
# Node Environment
# ========================================
NODE_ENV=production
PORT=3000

# ========================================
# Firebase (Public - Client Side)
# ========================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# ========================================
# Firebase Admin (Private - Server Side)
# ========================================
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"

# ========================================
# Google Drive API
# ========================================
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account","project_id":"your-project-123",...}
GOOGLE_DRIVE_AL_FOLDER_ID=1abc123...
GOOGLE_DRIVE_MZ_FOLDER_ID=1def456...
GOOGLE_DRIVE_NOT_LISTED_FOLDER_ID=1ghi789...

# ========================================
# Asana API
# ========================================
ASANA_ACCESS_TOKEN=1/1234567890abcdef:1234567890abcdef1234567890abcdef
ASANA_PROJECT_ID=1211223909834951

# ========================================
# CommonSKU API
# ========================================
COMMONSKU_API_KEY=your_commonsku_api_key_here

# ========================================
# Slack Webhooks
# ========================================
SLACK_TECH_ALERT_WEBHOOK=https://hooks.slack.com/services/T00/B00/XXX
SLACK_SUCCESS_WEBHOOK=https://hooks.slack.com/services/T00/B00/YYY
```

### Step 3: Secure the File

```bash
# Set proper permissions (only owner can read)
chmod 600 .env.production

# Verify permissions
ls -la .env.production
# Should show: -rw------- 1 deploy deploy
```

### Step 4: Verify No Secrets in Git

```bash
# Make sure .env.production is in .gitignore
cat .gitignore | grep .env.production

# If not listed, add it:
echo ".env.production" >> .gitignore
```

---

## Testing Credentials

### Test 1: Firebase Connection

Create a test script:
```bash
cd /var/www/art-request-form
nano test-firebase.js
```

```javascript
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function testFirestore() {
  try {
    const testDoc = await db.collection('submissions').limit(1).get();
    console.log('✅ Firestore connection successful!');
    console.log(`Found ${testDoc.size} documents`);
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
  }
}

testFirestore();
```

Run test:
```bash
node -r dotenv/config test-firebase.js dotenv_config_path=.env.production
```

### Test 2: Google Drive API

```bash
nano test-drive.js
```

```javascript
const { google } = require('googleapis');

const credentials = JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

async function testDrive() {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const folderId = process.env.GOOGLE_DRIVE_AL_FOLDER_ID;

    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, permissions',
    });

    console.log('✅ Google Drive connection successful!');
    console.log(`Folder name: ${response.data.name}`);
  } catch (error) {
    console.error('❌ Google Drive connection failed:', error.message);
  }
}

testDrive();
```

Run test:
```bash
node -r dotenv/config test-drive.js dotenv_config_path=.env.production
```

### Test 3: Asana API

```bash
curl -H "Authorization: Bearer $ASANA_ACCESS_TOKEN" \
  "https://app.asana.com/api/1.0/projects/$ASANA_PROJECT_ID"
```

Should return project details.

### Test 4: CommonSKU API

```bash
curl -X POST https://api.commonsku.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $COMMONSKU_API_KEY" \
  -d '{"query":"query { viewer { email } }"}'
```

Should return your CommonSKU email.

### Test 5: Slack Webhooks

```bash
curl -X POST $SLACK_TECH_ALERT_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "✅ *Credentials Test*\nAll Slack webhooks configured correctly!"
        }
      }
    ]
  }'
```

Check #tech-alert channel for message.

### Test 6: Full Application Health Check

After building and starting the application:

```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Test health endpoint
curl https://requests.whitestonebranding.com/api/health?checkDb=true
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-09T...",
  "checks": {
    "app": { "status": "healthy" },
    "firestore": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

---

## Troubleshooting

### Firebase "Invalid API Key" Error
- Check that API key doesn't have extra spaces
- Verify Firebase project is enabled
- Ensure authentication is enabled in Firebase Console

### Google Drive "Insufficient Permission" Error
- Verify service account email has Editor access to folders
- Check folder IDs are correct
- Ensure Google Drive API is enabled in Cloud Console

### Asana "Invalid Token" Error
- Regenerate Personal Access Token
- Check token doesn't have extra spaces or newlines
- Verify token has access to the project

### CommonSKU API Errors
- Contact CommonSKU support if API access not available
- Verify API key is valid and active

### Slack Webhook "Invalid Webhook URL" Error
- Check webhook URL is complete (starts with `https://hooks.slack.com/services/`)
- Verify webhook hasn't been revoked in Slack app settings
- Test webhook with simple curl command first

---

## Security Best Practices

1. **Never commit credentials to Git**
   - Always use `.env.production` (in .gitignore)
   - Never include credentials in code

2. **Use service accounts for server-side APIs**
   - Don't use personal Google accounts
   - Use dedicated service accounts with minimal permissions

3. **Rotate credentials regularly**
   - Update API keys every 90 days
   - Revoke old tokens when creating new ones

4. **Restrict access**
   - Firebase: Only allow @whitestonebranding.com domain
   - Google Drive: Share only specific folders, not entire drive
   - Asana: Use project-specific tokens if available

5. **Monitor usage**
   - Check Slack #tech-alert for error notifications
   - Review API usage in Google Cloud Console
   - Monitor Asana API rate limits

---

## Quick Reference

### Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] Firebase public config (6 variables starting with `NEXT_PUBLIC_`)
- [ ] Firebase Admin SDK (3 variables: project ID, client email, private key)
- [ ] Google Drive credentials (JSON string)
- [ ] Google Drive folder IDs (3 folders: A-L, M-Z, Not Listed)
- [ ] Asana access token
- [ ] Asana project ID
- [ ] CommonSKU API key
- [ ] Slack tech-alert webhook
- [ ] Slack success webhook (optional)

### Total: 19 required environment variables

---

**Last Updated**: 2026-01-09
**Version**: 1.0
