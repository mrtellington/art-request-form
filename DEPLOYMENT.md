# Deployment Guide

Complete guide for deploying the Art Request Form to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Setup](#vps-setup)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [Application Deployment](#application-deployment)
5. [Environment Variables](#environment-variables)
6. [Testing Procedure](#testing-procedure)
7. [Production Cutover](#production-cutover)
8. [Monitoring](#monitoring)
9. [Rollback Procedure](#rollback-procedure)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Machine
- Git repository access
- SSH key configured for server access
- Node.js 18+ installed

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Minimum 2GB RAM, 2 CPU cores
- 20GB storage
- Root or sudo access

### Domain Setup
- DNS A record: `requests.whitestonebranding.com` → Server IP
- DNS configuration propagated (check with `dig requests.whitestonebranding.com`)

---

## VPS Setup

### 1. Initial Server Setup

```bash
# SSH into server
ssh root@<server-ip>

# Update system packages
apt update && apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install Git
apt install -y git
```

### 2. Create Deployment User

```bash
# Create deploy user
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy

# Generate SSH key for GitHub access (if needed)
ssh-keygen -t ed25519 -C "deploy@whitestonebranding.com"
cat ~/.ssh/id_ed25519.pub  # Add to GitHub deploy keys
```

### 3. Clone Repository

```bash
# Create web directory
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www

# Clone repository
cd /var/www
git clone https://github.com/mrtellington/art-request-form.git
cd art-request-form

# Install dependencies
npm ci --production
```

### 4. Configure PM2

```bash
# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown deploy:deploy /var/log/pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup systemd -u deploy --hp /home/deploy
# Run the command that PM2 outputs (with sudo)
```

---

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d requests.whitestonebranding.com

# Follow prompts and provide email address
# Certificates will be stored in /etc/letsencrypt/live/requests.whitestonebranding.com/
```

### Option 2: Existing Certificate

If you have an existing SSL certificate:

```bash
# Copy certificate files to server
sudo mkdir -p /etc/nginx/ssl
sudo cp fullchain.pem /etc/nginx/ssl/requests.whitestonebranding.com.crt
sudo cp privkey.pem /etc/nginx/ssl/requests.whitestonebranding.com.key
sudo chmod 600 /etc/nginx/ssl/*
```

### Auto-Renewal Setup (Let's Encrypt)

```bash
# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is configured by default via systemd timer
sudo systemctl status certbot.timer
```

---

## Application Deployment

### 1. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp /var/www/art-request-form/nginx.conf /etc/nginx/sites-available/art-request-form

# Create symlink
sudo ln -s /etc/nginx/sites-available/art-request-form /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Build Application

```bash
cd /var/www/art-request-form

# Install dependencies (if not already done)
npm ci --production

# Build Next.js application
npm run build
```

### 3. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs art-request-form
```

---

## Environment Variables

### 1. Create `.env.production` File

```bash
cd /var/www/art-request-form

# Create environment file
nano .env.production
```

### 2. Add Required Variables

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Firebase (Public - Client Side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Private - Server Side)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PROJECT_ID=your_project_id

# Google Drive API
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account","project_id":"..."}
GOOGLE_DRIVE_AL_FOLDER_ID=your_folder_id_for_a_to_l
GOOGLE_DRIVE_MZ_FOLDER_ID=your_folder_id_for_m_to_z
GOOGLE_DRIVE_NOT_LISTED_FOLDER_ID=your_folder_id_for_not_listed

# Asana API
ASANA_ACCESS_TOKEN=your_asana_token
ASANA_PROJECT_ID=1211223909834951  # Use test board ID initially

# CommonSKU API
COMMONSKU_API_KEY=your_commonsku_api_key

# Slack Webhooks
SLACK_TECH_ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_SUCCESS_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL  # Optional
```

### 3. Secure Environment File

```bash
# Set proper permissions
chmod 600 .env.production
chown deploy:deploy .env.production
```

---

## Testing Procedure

### Phase 1: Smoke Tests (Day 1)

#### 1. Health Check
```bash
curl https://requests.whitestonebranding.com/api/health
# Should return {"status":"healthy"}
```

#### 2. Form Access
- Navigate to https://requests.whitestonebranding.com
- Verify landing page loads
- Click "Get Started" → Should redirect to /request

#### 3. Authentication
- Test Google Sign-In
- Verify @whitestonebranding.com domain restriction
- Confirm successful login

#### 4. Form Steps
- Complete each step of the form
- Verify step navigation works
- Test form validation
- Check conditional logic (mockup type, etc.)

### Phase 2: Integration Tests (Day 2-3)

#### 1. Create Test Asana Board
```
Asana → Create new board: "Art Request Form - Test"
Copy board ID for testing
```

#### 2. Update Environment Variables
```bash
# Temporarily use test board
ASANA_PROJECT_ID=<test_board_id>  # Not production board yet!
```

#### 3. Submit Test Requests
Test each request type:
- [ ] Mockup request
- [ ] PPTX request
- [ ] Rise & Shine request
- [ ] Proof request
- [ ] Sneak Peek request
- [ ] Other request

For each submission, verify:
- [ ] Google Drive folder created (A-L or M-Z)
- [ ] Files uploaded to Drive
- [ ] Asana task created with correct fields
- [ ] Slack notification received (if configured)
- [ ] Admin dashboard shows submission

#### 4. Test Error Recovery
- [ ] Simulate Drive failure (wrong credentials)
- [ ] Verify Slack error notification
- [ ] Test retry functionality in admin dashboard
- [ ] Confirm error state tracking

#### 5. Admin Dashboard Tests
- [ ] View all submissions
- [ ] Filter by status
- [ ] Search submissions
- [ ] View submission details
- [ ] Retry failed submission
- [ ] Verify data accuracy

### Phase 3: Load Tests (Day 4)

#### 1. Rate Limiting
```bash
# Test submit endpoint rate limit (5 req/min)
for i in {1..10}; do
  curl -X POST https://requests.whitestonebranding.com/api/submit \
    -H "Content-Type: application/json" \
    -d '{"test":true}'
  echo "Request $i"
done

# Should see 429 errors after 5 requests
```

#### 2. Concurrent Users
- Have 3-5 team members submit simultaneously
- Monitor server resources (CPU, memory)
- Check logs for errors

### Phase 4: Browser Compatibility (Day 5)

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Production Cutover

### Timeline

**Week 1: Testing Phase**
- Deploy to `requests.whitestonebranding.com`
- Use test Asana board
- Internal team testing
- Fix any bugs discovered

**Week 2: Production Switch**
- Switch to production Asana board ID
- Update Cognito form with deprecation notice
- Monitor submissions

**Week 3: Full Cutover**
- Add /artreq redirect from hub.whitestonebranding.com
- Remove Cognito form
- Announce to team

### Step-by-Step Cutover

#### 1. Switch to Production Asana Board

```bash
# SSH to server
ssh deploy@requests.whitestonebranding.com

# Update environment variable
cd /var/www/art-request-form
nano .env.production

# Change:
ASANA_PROJECT_ID=1211223909834951  # Production Art Request board

# Restart application
pm2 reload art-request-form
```

#### 2. Update Cognito Form

Add banner to existing Cognito form:
```
⚠️ This form is being deprecated. Please use the new Art Request Form at:
https://requests.whitestonebranding.com

The Cognito form will be disabled on [DATE].
```

#### 3. Monitor for 1 Week

Check daily:
- [ ] New submissions going to correct board
- [ ] No error notifications
- [ ] Google Drive folders created correctly
- [ ] Admin dashboard working

#### 4. Add Hub Redirect (Week 3)

```bash
# Uncomment redirect in nginx.conf
sudo nano /etc/nginx/sites-available/art-request-form

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

#### 5. Disable Cognito Form

- Mark Cognito form as archived
- Update any internal documentation
- Announce completion to team

---

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Status
pm2 status

# Logs
pm2 logs art-request-form

# Specific log file
pm2 logs art-request-form --lines 100 --err
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/art-request-form-access.log

# Error logs
sudo tail -f /var/log/nginx/art-request-form-error.log
```

### Health Check Endpoint

```bash
# Basic health
curl https://requests.whitestonebranding.com/api/health

# With database check
curl https://requests.whitestonebranding.com/api/health?checkDb=true
```

### Uptime Monitoring (External)

Consider setting up:
- UptimeRobot (free tier: https://uptimerobot.com)
- Better Uptime (https://betteruptime.com)
- Pingdom (https://www.pingdom.com)

Monitor:
- URL: https://requests.whitestonebranding.com/api/health
- Interval: 5 minutes
- Alert: Email + Slack

---

## Rollback Procedure

### Quick Rollback (Keep Current Code)

```bash
# SSH to server
ssh deploy@requests.whitestonebranding.com

# Restart application
cd /var/www/art-request-form
pm2 restart art-request-form
```

### Rollback to Previous Commit

```bash
# SSH to server
ssh deploy@requests.whitestonebranding.com
cd /var/www/art-request-form

# Find commit to rollback to
git log --oneline -10

# Rollback
git reset --hard <commit-hash>

# Reinstall dependencies
npm ci --production

# Rebuild
npm run build

# Reload PM2
pm2 reload art-request-form

# Verify
curl https://requests.whitestonebranding.com/api/health
```

### Emergency Shutdown

```bash
# Stop application
pm2 stop art-request-form

# Or stop and remove from PM2
pm2 delete art-request-form

# Re-enable Cognito form immediately
```

---

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs art-request-form --lines 50

# Common issues:
# 1. Port 3000 already in use
sudo lsof -i :3000
# Kill process: sudo kill -9 <PID>

# 2. Missing environment variables
pm2 env art-request-form

# 3. Build errors
cd /var/www/art-request-form
npm run build
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

### Database Connection Errors

```bash
# Verify Firebase credentials
cd /var/www/art-request-form
node -e "console.log(require('./.env.production').FIREBASE_ADMIN_PROJECT_ID)"

# Test Firestore access
curl "https://requests.whitestonebranding.com/api/health?checkDb=true"
```

### High Memory Usage

```bash
# Check memory
free -h

# PM2 memory usage
pm2 monit

# Restart if needed
pm2 reload art-request-form
```

### Rate Limiting Too Aggressive

If legitimate users are being rate-limited:

```typescript
// Edit lib/middleware/rate-limit.ts
export const RateLimits = {
  submit: { max: 10, windowMs: 60000 },  // Increase from 5 to 10
  // ...
};
```

Then rebuild and reload.

---

## Maintenance Tasks

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor Slack notifications

### Weekly
- [ ] Review access logs for unusual patterns
- [ ] Check disk space: `df -h`
- [ ] Update server packages: `sudo apt update && sudo apt upgrade`

### Monthly
- [ ] Update npm dependencies: `npm audit fix`
- [ ] Review and rotate API keys if needed
- [ ] Test backup/restore procedures
- [ ] Review SSL certificate expiration

---

## Support Contacts

- **Technical Issues**: tech-team@whitestonebranding.com
- **Slack Channel**: #tech-alert
- **GitHub Issues**: https://github.com/mrtellington/art-request-form/issues

---

Last Updated: 2026-01-09
