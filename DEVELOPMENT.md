# Development Workflow

This document outlines the development and deployment workflow for the Art Request Form application.

## Project Overview

- **Production URL**: https://request.whitestonebranding.com/art
- **Deployment**: Vercel (auto-deploys from `main` branch)
- **Framework**: Next.js with subdirectory deployment (`/art` basePath)

## Development Workflow

### 1. Local Development

Run the development server locally:

```bash
npm run dev
```

The app will be available at `http://localhost:3000` (no `/art` prefix in development).

### 2. Making Changes

1. Make your code changes locally
2. Test thoroughly at `localhost:3000`
3. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

### 3. Deploying to Production

Simply push to the `main` branch:

```bash
git push origin main
```

**Vercel will automatically:**

- Detect the push to `main`
- Build the application
- Deploy to production at https://request.whitestonebranding.com/art
- Takes approximately 1-2 minutes

### 4. Verifying Deployment

1. Wait for Vercel deployment to complete (check Vercel dashboard or GitHub commit status)
2. Visit https://request.whitestonebranding.com/art
3. Test your changes in production

## Environment Configuration

### Subdirectory Deployment

The app is deployed to `/art` subdirectory in production. This is handled automatically:

- **Development**: No basePath (runs at `/`)
- **Production**: Uses `/art` basePath

Configuration in `next.config.ts`:

```typescript
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/art' : '';
```

### API Routes

All API routes automatically use the correct path for both environments via the `getApiPath()` helper:

```typescript
import { getApiPath } from '@/lib/api-base-path';

// Automatically handles /art prefix in production
const response = await fetch(getApiPath('/api/submit'));
```

**Never hardcode API paths** - always use `getApiPath()` to ensure compatibility with both development and production.

## Environment Variables

### Local Development (.env.local)

All environment variables are stored in `.env.local` (not committed to git).

### Production (Vercel)

Environment variables are configured in Vercel dashboard:

- Go to Project Settings → Environment Variables
- Add/update variables
- Redeploy for changes to take effect

### Important Variables

- `ASANA_PROJECT_ID=1211223909834951` - Production Asana project
- `ASANA_WORKSPACE_ID=1201405786124364` - Production workspace
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=requests-9d412.firebaseapp.com` - Must use Firebase domain for OAuth

## Firebase Authentication

### OAuth Domain Configuration

**IMPORTANT**: The Firebase Auth domain must remain as the Firebase-controlled domain:

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=requests-9d412.firebaseapp.com
```

Do NOT use the custom domain (`request.whitestonebranding.com`) as the auth domain, as OAuth callback handlers only exist on Firebase-controlled domains.

### Authorized Domains

Ensure both domains are authorized in Firebase Console:

- `requests-9d412.firebaseapp.com`
- `request.whitestonebranding.com`

## Asana Integration

### Custom Field IDs

Custom field IDs in `lib/utils/formatters.ts` are specific to the production Asana project.

**Production Project**: https://app.asana.com/0/1211223909834951

If custom field IDs need to be updated:

1. Retrieve current fields from Asana API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://app.asana.com/api/1.0/projects/1211223909834951/custom_field_settings"
   ```
2. Update `ASANA_CUSTOM_FIELDS` in `lib/utils/formatters.ts`
3. Commit and deploy changes

## CommonSKU Integration

The app caches CommonSKU clients in Firestore for faster autocomplete.

### Syncing Clients

To refresh the client cache:

1. Visit: https://request.whitestonebranding.com/art/api/sync-clients
2. Clients are synced from CommonSKU API to Firestore
3. Cache is used by the client name autocomplete

## Troubleshooting

### Issue: API calls returning 404 or HTML instead of JSON

**Cause**: API paths not using `getApiPath()` helper

**Solution**: Ensure all fetch calls use:

```typescript
fetch(getApiPath('/api/your-endpoint'));
```

### Issue: OAuth popup shows 404

**Cause**: Using custom domain as Firebase auth domain

**Solution**: Set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` to Firebase domain:

```
requests-9d412.firebaseapp.com
```

### Issue: "Custom field not on given object" error

**Cause**: Asana custom field IDs don't match production project

**Solution**: Verify and update field IDs in `lib/utils/formatters.ts` using Asana API

### Issue: Changes not appearing in production

**Possible causes:**

1. Deployment still in progress (wait 1-2 minutes)
2. Browser cache (hard refresh with Cmd+Shift+R)
3. Build failed (check Vercel deployment logs)

## Best Practices

1. **Always test locally first** before pushing to production
2. **Use `getApiPath()` for all API calls** to ensure environment compatibility
3. **Never commit `.env.local`** - sensitive credentials must stay local
4. **Write descriptive commit messages** - helps track changes in deployment history
5. **Check Vercel deployment status** before testing production changes
6. **Keep custom field IDs in sync** with production Asana project

## Quick Reference

| Environment | URL                                        | BasePath |
| ----------- | ------------------------------------------ | -------- |
| Development | http://localhost:3000                      | None     |
| Production  | https://request.whitestonebranding.com/art | /art     |

| Service      | Purpose                                   |
| ------------ | ----------------------------------------- |
| Vercel       | Hosting and deployment                    |
| Firebase     | Authentication (Google OAuth)             |
| Firestore    | Database (form submissions, client cache) |
| Asana        | Task creation and project management      |
| Google Drive | File storage (uploaded files)             |
| CommonSKU    | Client data source                        |

## Support

For issues or questions:

- Check Vercel deployment logs
- Review Firebase Console for auth issues
- Check Asana API documentation for custom field changes
- Review this document for common troubleshooting steps
