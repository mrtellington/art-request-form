# Art Request Form

Custom Next.js application to replace Cognito Forms with enhanced features and better data management.

## Overview

This application recreates the existing Cognito Forms art request form as a modern, maintainable Next.js application with:

- **Better Data Integrity**: Products stored as object arrays (not parallel arrays) preventing data misalignment
- **Rich Text Editor**: TipTap editor with bold, italic, links, and lists for multiline fields
- **Product Cloning**: Clone previous product entries or add blank ones
- **Auto-Save Drafts**: Save progress every 30 seconds with resume capability
- **Admin Dashboard**: View, edit, and retry failed submissions
- **Error Notifications**: Slack alerts for submission failures

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React Hook Form, Zod, shadcn/ui, TipTap
- **Backend**: Next.js API Routes, Firebase Firestore, Firebase Auth
- **Integrations**: Asana API, Google Drive API, CommonSKU API, Slack API
- **Deployment**: VPS with Nginx, PM2, SSL (Let's Encrypt)

## Deployment

- **Development/Testing**: https://requests.whitestonebranding.com
- **Production**: https://hub.whitestonebranding.com/artreq (after testing)

### Getting Started with Deployment

For first-time deployment, follow these guides in order:

1. **[CREDENTIALS_SETUP.md](CREDENTIALS_SETUP.md)** - Set up all API credentials (Firebase, Google Drive, Asana, etc.)
2. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with detailed procedures
4. **[MIGRATION_PLAN.md](MIGRATION_PLAN.md)** - 5-week migration strategy from Cognito Forms

### Quick Credential Validation

After setting up credentials, validate them before deployment:

```bash
# Install dependencies (if not already done)
npm install

# Validate all credentials and API connections
node -r dotenv/config scripts/validate-credentials.js dotenv_config_path=.env.production
```

This will test all Firebase, Google Drive, Asana, CommonSKU, and Slack connections.

## Features

### Core Form Features
- Multi-step form with smart conditional steps based on request type
- All 47+ fields from original Cognito form
- Real-time client validation via CommonSKU API
- Natural language date parsing ("tomorrow", "next Friday", etc.)
- File upload with drag-and-drop support
- Google Sign-In with @whitestonebranding.com domain restriction

### Enhanced Features
- **Repeatable Sections**: Products and website links with add/clone/remove
- **Rich Text Editing**: Format pertinent information with toolbar
- **Draft Management**: Auto-save every 30 seconds, resume anytime
- **Admin Panel**: Search, filter, edit, and retry submissions
- **Error Recovery**: Slack notifications + Firestore logging + retry mechanism

### Integrations
- **CommonSKU**: Client validation and lookup
- **Google Drive**: Auto-create folders (A-L/M-Z structure), upload attachments
- **Asana**: Create tasks with all custom fields on Art Request board
- **Slack**: Error notifications to tech-alert channel

## Development Setup

### Prerequisites
- Node.js 18+
- Firebase project (Firestore + Auth)
- Google Drive API service account
- Asana API access token
- CommonSKU API key
- Slack webhook URL

### Installation

```bash
# Clone repository
git clone https://github.com/mrtellington/art-request-form.git
cd art-request-form

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure environment variables in .env.local

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for required environment variables including:
- Firebase configuration (public + admin)
- Google Drive API credentials
- Asana API token + project ID
- CommonSKU API key
- Slack webhook URL

## Project Structure

```
art-request-form/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (submit, validate, upload, drafts)
│   ├── admin/             # Admin dashboard
│   ├── request/           # Main form page
│   └── success/           # Post-submission page
├── components/
│   ├── form/              # Form components (steps, fields, navigation)
│   ├── admin/             # Admin components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── firebase/          # Firebase config and helpers
│   ├── integrations/      # API clients (Asana, Drive, CommonSKU, Slack)
│   ├── schemas/           # Zod validation schemas
│   └── utils/             # Utilities (formatters, date parser, etc.)
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript type definitions
```

## Implementation Progress

See [Implementation Plan](/Users/todellington/.claude/plans/virtual-percolating-cherny.md) for detailed roadmap.

### Phases
- [x] Phase 0: Repository Setup
- [x] Phase 1: Foundation & Setup
- [x] Phase 2: Form Structure & Basic Steps
- [x] Phase 3: Advanced Features
- [x] Phase 4: Backend Integrations
- [x] Phase 5: Admin Dashboard
- [x] Phase 6: Testing & Polish
- [x] Phase 7: Deployment & Migration (Documentation & Configuration Complete)

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## Deployment

### Quick Deploy to Production

```bash
# Automated deployment (from local machine)
./scripts/deploy.sh production
```

The deployment script handles:
- Git verification and push
- SSH to server
- Pull latest code
- Install dependencies
- Build application
- Zero-downtime PM2 reload
- Health check verification

### First-Time Setup

For initial server setup, see **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete guide including:
- VPS server setup
- Node.js, PM2, and Nginx installation
- SSL certificate configuration (Let's Encrypt)
- Environment variable setup
- Initial deployment

### Migration from Cognito Forms

See **[MIGRATION_PLAN.md](MIGRATION_PLAN.md)** for complete migration strategy including:
- 5-week migration timeline
- Testing procedures
- Parallel running phase
- Communication plan
- Rollback procedures
- Success metrics

## Key Improvements Over Cognito Forms

| Feature | Cognito Forms | Custom Form |
|---------|--------------|-------------|
| Data Structure | Parallel arrays (fragile) | Object arrays (robust) |
| Product Cloning | ❌ Not available | ✅ Clone previous or add blank |
| Rich Text | ❌ Plain text only | ✅ Bold, italic, links, lists |
| Draft Save | ❌ None | ✅ Auto-save every 30s |
| Admin Panel | ❌ View-only in Cognito | ✅ Full edit/retry capabilities |
| Error Recovery | ❌ Manual intervention | ✅ Slack alerts + auto-retry |
| Extensibility | ❌ Platform limited | ✅ Full control over features |

## Contributing

1. Create a feature branch from `development`
2. Make your changes
3. Test thoroughly (unit + E2E)
4. Submit a pull request to `development`

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Deployment Quick Reference

### Common Commands

```bash
# Deploy to production
./scripts/deploy.sh production

# SSH to server
ssh deploy@requests.whitestonebranding.com

# Check application status
ssh deploy@requests.whitestonebranding.com 'pm2 status'

# View logs
ssh deploy@requests.whitestonebranding.com 'pm2 logs art-request-form'

# Restart application
ssh deploy@requests.whitestonebranding.com 'pm2 restart art-request-form'

# Health check
curl https://requests.whitestonebranding.com/api/health
```

### Monitoring

- **Health Check**: https://requests.whitestonebranding.com/api/health
- **PM2 Status**: `pm2 status`
- **Application Logs**: `pm2 logs art-request-form`
- **Nginx Logs**: `/var/log/nginx/art-request-form-*.log`
- **Slack Alerts**: #tech-alert channel

## Support

For issues or questions:
- GitHub Issues: https://github.com/mrtellington/art-request-form/issues
- Slack: #tech-alert channel
- Deployment Guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Security: [SECURITY.md](SECURITY.md)

## Acknowledgments

Built to replace Cognito Forms + Zapier workflow while preserving all existing integrations with Asana, Google Drive, and CommonSKU.
