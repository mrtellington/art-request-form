# Security Documentation

This document outlines the security measures implemented in the Art Request Form application.

## Overview

The Art Request Form follows security best practices to protect user data, prevent abuse, and ensure secure integration with external services.

## Input Validation

### Client-Side Validation
- **Zod Schemas**: All form inputs validated with Zod schemas before submission
- **Real-time Feedback**: Immediate validation feedback on form fields
- **Type Safety**: TypeScript ensures type correctness throughout the application

### Server-Side Validation
- **Double Validation**: All API endpoints re-validate with Zod schemas
- **Schema Enforcement**: `formDataSchema` validates all submission data
- **Error Details**: Detailed validation errors returned for debugging

## Rate Limiting

### Implementation
- **In-Memory Store**: Simple rate limiting for development and small deployments
- **Per-IP Tracking**: Limits based on client IP address
- **Configurable Limits**: Different limits for different endpoint types

### Current Limits
- **Submit Endpoint**: 5 requests per minute per IP
- **Validate Endpoint**: 30 requests per minute per IP
- **Read Endpoints**: 100 requests per minute per IP
- **Auth Endpoints**: 3 requests per minute per IP

### Future Enhancements
Consider upgrading to:
- Redis-backed rate limiting for distributed systems
- Upstash Rate Limit for serverless deployments
- Cloudflare Rate Limiting at the edge

## Authentication

### Firebase Auth
- **Google Sign-In**: OAuth-based authentication
- **Domain Restriction**: Limited to @whitestonebranding.com emails
- **Session Management**: Firebase handles session tokens and refresh

### API Security
- **Server-Side Only**: All API keys and secrets stored server-side
- **Environment Variables**: Sensitive data in environment variables
- **No Client Exposure**: API keys never sent to browser

## Data Protection

### Firestore Security
- **Firebase Admin SDK**: Server-side access only
- **Service Account**: Credentials stored securely
- **No Direct Access**: Clients never access Firestore directly

### File Uploads
- **Validation**: File type and size validation
- **Sanitization**: File names sanitized before storage
- **Google Drive**: Files stored in secure Google Drive folders
- **Access Control**: Folder permissions managed via service account

## API Key Management

### Storage
- **Environment Variables**: All keys in `.env.local` (gitignored)
- **Server-Side Only**: Keys never exposed to client code
- **Rotation**: Regular key rotation recommended

### External Services
- **Asana**: Personal Access Token with minimal required scopes
- **Google Drive**: Service account with limited permissions
- **CommonSKU**: API key for client validation
- **Slack**: Webhook URLs for notifications only

## XSS Prevention

### Content Sanitization
- **Rich Text Editor**: TipTap with controlled HTML output
- **Safe Rendering**: React automatically escapes content
- **Markdown Only**: User input converted to safe markdown

### CSP Headers
Future enhancement: Implement Content Security Policy headers

## CSRF Protection

### Next.js Built-in
- **Same-Origin Policy**: Enforced by default
- **API Routes**: Protected by Next.js security features

## Error Handling

### Error Boundaries
- **Global Boundary**: Catches all React errors
- **Form Boundary**: Form-specific error recovery
- **Graceful Degradation**: User-friendly error messages

### Information Disclosure
- **Production Mode**: Detailed errors hidden in production
- **Development Mode**: Full error details for debugging
- **Logging**: Errors logged server-side for monitoring

## Data Transmission

### HTTPS
- **SSL/TLS**: All production traffic over HTTPS
- **Let's Encrypt**: Free SSL certificates
- **HSTS**: HTTP Strict Transport Security recommended

### API Requests
- **Secure Connections**: All external API calls over HTTPS
- **Token Security**: Bearer tokens in Authorization headers

## Monitoring & Logging

### Error Tracking
- **Console Logging**: Development error logging
- **Future Enhancement**: Integrate Sentry or LogRocket

### Slack Notifications
- **Error Alerts**: Automatic notifications to #tech-alert
- **Context**: Error details with submission IDs
- **Admin Links**: Quick access to admin dashboard

## Security Checklist

- [x] Input validation (client + server)
- [x] Rate limiting on API routes
- [x] Authentication with domain restriction
- [x] Server-side only API keys
- [x] Error boundaries
- [x] HTTPS in production
- [x] Zod schema validation
- [x] Firebase security rules (Admin SDK)
- [x] File upload validation
- [x] XSS prevention (React + TipTap)
- [ ] Content Security Policy headers
- [ ] Regular dependency updates
- [ ] Security audit/penetration testing
- [ ] Redis-backed rate limiting (production)
- [ ] Error tracking service (Sentry)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to: tech-team@whitestonebranding.com
3. Include detailed reproduction steps
4. Allow reasonable time for patching before disclosure

## Regular Maintenance

### Weekly
- Monitor error logs and Slack notifications
- Review rate limit effectiveness

### Monthly
- Update dependencies (`npm audit`, `npm update`)
- Review and rotate API keys if needed
- Check for security advisories

### Quarterly
- Security audit of authentication flow
- Review Firebase security rules
- Penetration testing (production)
- Update this security documentation

## Compliance

### Data Handling
- **GDPR**: User data stored in Firestore (EU region if needed)
- **Data Retention**: Submissions retained indefinitely (adjust as needed)
- **Right to Delete**: Manual deletion via admin dashboard

### Access Control
- **Admin Access**: Limited to authorized personnel
- **Audit Trail**: Firestore timestamps on all documents
- **Session Management**: Firebase handles token expiration

## Security Updates

When security vulnerabilities are discovered:

1. **Assess Impact**: Determine severity and affected systems
2. **Patch Immediately**: Apply fixes to staging first
3. **Test Thoroughly**: Verify patch doesn't break functionality
4. **Deploy to Production**: Use zero-downtime deployment
5. **Notify Team**: Update security documentation
6. **Monitor**: Watch logs for any issues post-deployment

Last Updated: 2026-01-09
