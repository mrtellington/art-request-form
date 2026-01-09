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
- [x] Phase 0: Repository Setup (Day 1)
- [ ] Phase 1: Foundation & Setup (Week 1-2)
- [ ] Phase 2: Form Structure & Basic Steps (Week 3-4)
- [ ] Phase 3: Advanced Features (Week 5-6)
- [ ] Phase 4: Backend Integrations (Week 7-8)
- [ ] Phase 5: Admin Dashboard (Week 9-10)
- [ ] Phase 6: Testing & Polish (Week 11-12)
- [ ] Phase 7: Deployment & Migration (Week 13-14)

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

### Development (requests.whitestonebranding.com)
```bash
npm run build
pm2 start ecosystem.config.js
```

### Production (hub.whitestonebranding.com/artreq)
After successful testing on requests subdomain, production cutover involves:
1. Updating ASANA_PROJECT_ID to production board
2. Adding Nginx redirect from /artreq to requests.whitestonebranding.com

See [Migration Plan](/Users/todellington/.claude/plans/virtual-percolating-cherny.md#migration-plan) for details.

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

## Support

For issues or questions:
- GitHub Issues: https://github.com/mrtellington/art-request-form/issues
- Slack: #tech-alert channel

## Acknowledgments

Built to replace Cognito Forms + Zapier workflow while preserving all existing integrations with Asana, Google Drive, and CommonSKU.
