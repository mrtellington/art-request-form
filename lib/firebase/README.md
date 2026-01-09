# Firebase Configuration

This directory contains Firebase configuration and helper functions for both client-side and server-side usage.

## Files

- **config.ts** - Client-side Firebase initialization (browser)
- **auth.ts** - Authentication helpers with Google Sign-In
- **firestore.ts** - Firestore database helpers
- **admin.ts** - Server-side Firebase Admin SDK
- **AuthContext.tsx** - React context for authentication state
- **index.ts** - Centralized exports

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `art-request-form` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your location (us-central1 recommended)
5. Click "Enable"

### 3. Set Firestore Security Rules

Go to "Firestore Database" → "Rules" and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if email is from allowed domain
    function isAllowedDomain() {
      return isAuthenticated() &&
             request.auth.token.email.matches('.*@whitestonebranding.com$');
    }

    // Submissions collection
    match /submissions/{submissionId} {
      // Users can read their own submissions and drafts
      allow read: if isAllowedDomain() &&
                     resource.data.submittedBy.uid == request.auth.uid;

      // Users can create submissions
      allow create: if isAllowedDomain() &&
                       request.resource.data.submittedBy.uid == request.auth.uid;

      // Users can update their own drafts and submissions
      allow update: if isAllowedDomain() &&
                       resource.data.submittedBy.uid == request.auth.uid;

      // Users can delete their own drafts
      allow delete: if isAllowedDomain() &&
                       resource.data.submittedBy.uid == request.auth.uid &&
                       resource.data.status == 'draft';
    }
  }
}
```

### 4. Enable Authentication

1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Select "Google" sign-in provider
4. Enable Google sign-in
5. Enter project support email
6. Add authorized domain: `requests.whitestonebranding.com`
7. Click "Save"

### 5. Create Web App

1. In Project Overview, click "Add app" → Web
2. Enter app nickname: `Art Request Form`
3. **Do not** check "Firebase Hosting"
4. Click "Register app"
5. Copy the configuration object

### 6. Create Service Account (for Admin SDK)

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Keep this file secure - never commit to git!

### 7. Configure Environment Variables

Create `.env.local` in the project root (copy from `.env.example`):

```bash
# From Firebase Web App Config (Step 5)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# From Service Account JSON (Step 6)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PROJECT_ID=your-project-id
```

**Important:** For the `FIREBASE_ADMIN_PRIVATE_KEY`, make sure to:
- Keep the quotes around the entire key
- Keep the `\n` newline characters (they'll be processed correctly)

### 8. Test Firebase Connection

Run the development server and check the console:

```bash
npm run dev
```

The Firebase app should initialize without errors.

## Usage Examples

### Client-Side Authentication

```typescript
import { signInWithGoogle, signOut, useAuth } from '@/lib/firebase';

function LoginButton() {
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <button onClick={signOut}>Sign Out</button>;

  return <button onClick={handleSignIn}>Sign In with Google</button>;
}
```

### Server-Side Token Verification (API Routes)

```typescript
import { verifyIdToken, getAuthTokenFromHeaders } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = getAuthTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);

    // User is authenticated and from allowed domain
    return NextResponse.json({ uid: decodedToken.uid });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### Saving to Firestore

```typescript
import { saveUserDraft, getUserDraft } from '@/lib/firebase';

// Save draft
await saveUserDraft(userId, formData, userEmail, displayName);

// Load draft
const draft = await getUserDraft(userId);
```

## Security Notes

- ✅ Domain restriction: Only @whitestonebranding.com emails can sign in
- ✅ Server-side token verification: All API routes verify authentication
- ✅ Firestore rules: Users can only access their own submissions
- ⚠️ Never commit `.env.local` or service account JSON to git
- ⚠️ Keep Firebase Admin private key secure

## Troubleshooting

**"Firebase not configured"**
- Check that all environment variables are set in `.env.local`
- Restart the development server after adding env variables

**"Unauthorized: Invalid email domain"**
- Only @whitestonebranding.com emails are allowed
- Check the domain restriction in auth.ts

**"Token verification failed"**
- Ensure Firebase Admin credentials are correct
- Check that private key has proper newline formatting

**Firestore permission denied**
- Verify Firestore security rules are published
- Check that user is authenticated
- Ensure user's email ends with @whitestonebranding.com
