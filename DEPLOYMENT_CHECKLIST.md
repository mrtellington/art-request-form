# Deployment Checklist

Quick reference checklist for deploying the Art Request Form to production.

## Phase 1: Credentials Setup (Local)

Follow **CREDENTIALS_SETUP.md** to obtain all credentials.

### Firebase
- [ ] Created Firebase project or using existing
- [ ] Copied public Firebase config (6 variables)
- [ ] Downloaded Firebase Admin SDK JSON key
- [ ] Enabled Google Authentication
- [ ] Added authorized domain: `requests.whitestonebranding.com`
- [ ] Created Firestore database with `submissions` and `drafts` collections

### Google Drive
- [ ] Enabled Google Drive API in Cloud Console
- [ ] Created service account: `art-request-drive-access`
- [ ] Downloaded service account JSON key
- [ ] Created folder structure: Art Requests → A-L, M-Z, Not Listed
- [ ] Shared all 3 folders with service account email (Editor permission)
- [ ] Copied all 3 folder IDs

### Asana
- [ ] Generated Personal Access Token
- [ ] Copied production board ID: `1211223909834951`
- [ ] (Optional) Created test board for Week 3 testing

### CommonSKU
- [ ] Obtained API key from CommonSKU settings
- [ ] Tested API access

### Slack
- [ ] Created or have access to Slack app
- [ ] Created webhook for #tech-alert channel
- [ ] (Optional) Created webhook for success notifications
- [ ] Tested webhooks with curl

---

## Phase 2: Server Provisioning

### VPS Setup
- [ ] Provisioned Ubuntu 20.04+ server (2GB RAM, 2 CPU)
- [ ] Noted server IP address: `___________________`
- [ ] Configured DNS A record: `requests.whitestonebranding.com → SERVER_IP`
- [ ] Verified DNS propagation: `dig requests.whitestonebranding.com`

### SSH Access
- [ ] Can SSH to server: `ssh root@SERVER_IP`
- [ ] Created deploy user with sudo access
- [ ] Configured SSH key for deploy user
- [ ] Can SSH as deploy: `ssh deploy@requests.whitestonebranding.com`

---

## Phase 3: Server Software Installation

SSH to server and run:

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```
- [ ] System updated

### Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
node --version  # Should be v20.x
```
- [ ] Node.js 20.x installed

### Install PM2
```bash
sudo npm install -g pm2
pm2 --version
```
- [ ] PM2 installed globally

### Install Nginx
```bash
sudo apt install -y nginx
nginx -v
```
- [ ] Nginx installed

### Install Certbot (SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
certbot --version
```
- [ ] Certbot installed

### Install Git
```bash
sudo apt install -y git
git --version
```
- [ ] Git installed

### Configure Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```
- [ ] Firewall configured

---

## Phase 4: SSL Certificate

### Option A: Let's Encrypt (Recommended)

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d requests.whitestonebranding.com

# Provide email when prompted
# Agree to terms
```
- [ ] SSL certificate obtained
- [ ] Certificates stored in `/etc/letsencrypt/live/requests.whitestonebranding.com/`

### Test Auto-Renewal
```bash
sudo certbot renew --dry-run
```
- [ ] Auto-renewal working

### Option B: Existing Certificate

If you have an existing certificate:
```bash
sudo mkdir -p /etc/nginx/ssl
sudo cp fullchain.pem /etc/nginx/ssl/requests.whitestonebranding.com.crt
sudo cp privkey.pem /etc/nginx/ssl/requests.whitestonebranding.com.key
sudo chmod 600 /etc/nginx/ssl/*
```
- [ ] Existing certificate installed

---

## Phase 5: Application Deployment

### Clone Repository
```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone https://github.com/mrtellington/art-request-form.git
cd art-request-form
```
- [ ] Repository cloned to `/var/www/art-request-form`

### Create Environment File
```bash
cd /var/www/art-request-form
nano .env.production
```

Paste all credentials from Phase 1. See **CREDENTIALS_SETUP.md** for complete template.

- [ ] `.env.production` created with all 19 variables

### Secure Environment File
```bash
chmod 600 .env.production
ls -la .env.production  # Should show -rw-------
```
- [ ] Environment file permissions set to 600

### Install Dependencies
```bash
npm ci --production
```
- [ ] Dependencies installed

### Build Application
```bash
npm run build
```
- [ ] Build completed successfully
- [ ] No TypeScript errors
- [ ] No build warnings

---

## Phase 6: Validate Credentials

### Run Validation Script
```bash
cd /var/www/art-request-form
node -r dotenv/config scripts/validate-credentials.js dotenv_config_path=.env.production
```

Expected output:
```
✅ All environment variables set
✅ Firebase connection working
✅ Google Drive API connected (all 3 folders accessible)
✅ Asana API connected
✅ CommonSKU API connected
✅ Slack webhooks working
```

- [ ] All credential tests passed

If any tests fail, revisit **CREDENTIALS_SETUP.md** to fix the issues.

---

## Phase 7: Nginx Configuration

### Copy Nginx Config
```bash
sudo cp /var/www/art-request-form/nginx.conf /etc/nginx/sites-available/art-request-form
```
- [ ] Nginx config copied

### Create Symlink
```bash
sudo ln -s /etc/nginx/sites-available/art-request-form /etc/nginx/sites-enabled/
```
- [ ] Symlink created

### Test Nginx Config
```bash
sudo nginx -t
```
- [ ] Nginx configuration valid (no errors)

### Start Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```
- [ ] Nginx running and enabled

---

## Phase 8: Start Application with PM2

### Start Application
```bash
cd /var/www/art-request-form
pm2 start ecosystem.config.js --env production
```
- [ ] Application started with PM2

### Check Status
```bash
pm2 status
pm2 logs art-request-form --lines 20
```
- [ ] Application status: `online`
- [ ] No errors in logs

### Save PM2 Process List
```bash
pm2 save
```
- [ ] PM2 process list saved

### Configure PM2 Startup
```bash
pm2 startup systemd -u deploy --hp /home/deploy
# Run the command that PM2 outputs (with sudo)
```
- [ ] PM2 configured to start on boot
- [ ] Ran the sudo command output by PM2

---

## Phase 9: Testing (Week 3)

### Health Check
```bash
curl https://requests.whitestonebranding.com/api/health
```
Expected: `{"status":"healthy",...}`

- [ ] Health check endpoint working

### Health Check with Database
```bash
curl https://requests.whitestonebranding.com/api/health?checkDb=true
```
- [ ] Health check with database working

### Form Access
- [ ] Visit `https://requests.whitestonebranding.com`
- [ ] Landing page loads correctly
- [ ] Click "Get Started" → redirects to `/request`
- [ ] Form loads without errors

### Authentication
- [ ] Click "Sign in with Google"
- [ ] Sign in with @whitestonebranding.com account
- [ ] Successfully authenticated
- [ ] Redirected to form

### Test Submissions (Use Test Asana Board)

**Important**: For Week 3 testing, use a test Asana board:
1. Create new board: "Art Request Form - Test"
2. Update `.env.production`: `ASANA_PROJECT_ID=<test_board_id>`
3. Restart: `pm2 reload art-request-form`

Test each request type:
- [ ] Mockup request → Check Drive folder + Asana task created
- [ ] PPTX request → Check Drive folder + Asana task created
- [ ] Rise & Shine request → Check Drive folder + Asana task created
- [ ] Proof request → Check Drive folder + Asana task created
- [ ] Sneak Peek request → Check Drive folder + Asana task created
- [ ] Other request → Check Drive folder + Asana task created

For each submission:
- [ ] Google Drive folder created in correct location (A-L/M-Z/Not Listed)
- [ ] Files uploaded to Drive successfully
- [ ] Asana task created with all custom fields
- [ ] Slack notification received (if enabled)
- [ ] Submission appears in admin dashboard
- [ ] All submission details accurate

### Test Error Recovery
- [ ] Temporarily break Google Drive connection (wrong folder ID)
- [ ] Submit request → should fail at drive_folder step
- [ ] Check Slack error notification received
- [ ] Check admin dashboard shows error status
- [ ] Fix Drive connection
- [ ] Click "Retry" in admin dashboard
- [ ] Verify submission completes successfully

### Admin Dashboard
- [ ] Visit `https://requests.whitestonebranding.com/admin`
- [ ] See all test submissions
- [ ] Filter by status (completed, error, processing, draft)
- [ ] Search by client name
- [ ] View submission details
- [ ] Retry failed submission works

### Browser Compatibility
Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Phase 10: Production Cutover (Week 4)

### Switch to Production Asana Board

```bash
ssh deploy@requests.whitestonebranding.com
cd /var/www/art-request-form
nano .env.production
```

Change:
```bash
ASANA_PROJECT_ID=1211223909834951  # Production board
```

Reload:
```bash
pm2 reload art-request-form
```

- [ ] Updated to production Asana board ID
- [ ] Application reloaded
- [ ] Verified first production submission works

### Update Cognito Form

Add deprecation banner to existing Cognito form:
```
⚠️ This form is being deprecated. Please use the new Art Request Form at:
https://requests.whitestonebranding.com

The Cognito form will be disabled on [DATE].
```

- [ ] Deprecation notice added to Cognito form

### Team Announcement (Week 4)

Send announcement to team (see MIGRATION_PLAN.md for template):
- [ ] Slack announcement sent to #general
- [ ] Email announcement sent
- [ ] Team members aware of new form

### Monitor Closely

For the next 7 days:
- [ ] Check PM2 logs daily: `pm2 logs art-request-form`
- [ ] Monitor #tech-alert for errors
- [ ] Review submissions in admin dashboard
- [ ] Track user adoption (% using new vs old form)
- [ ] Respond to any issues quickly

---

## Phase 11: Final Cutover (Week 5)

### Validation Before Cutover

- [ ] No critical errors in past 7 days
- [ ] User adoption >80%
- [ ] All integrations working reliably
- [ ] Team feedback positive
- [ ] At least 20 successful submissions

### Enable /artreq Redirect

If you want `hub.whitestonebranding.com/artreq` to redirect to new form:

1. Edit Nginx config for hub.whitestonebranding.com
2. Add redirect:
```nginx
location /artreq {
    return 301 https://requests.whitestonebranding.com$request_uri;
}
```
3. Reload Nginx: `sudo systemctl reload nginx`

- [ ] /artreq redirect configured (if applicable)
- [ ] Tested redirect works

### Disable Cognito Form

- [ ] Mark Cognito form as archived
- [ ] Export historical Cognito data to CSV (backup)
- [ ] Save CSV to Google Drive/Archive folder
- [ ] Update internal documentation (wiki, handbook)

### Final Announcement

Send completion announcement (see MIGRATION_PLAN.md for template):
- [ ] Announced migration complete
- [ ] Team knows Cognito form is retired
- [ ] Support plan communicated

---

## Phase 12: Post-Deployment Monitoring

### Daily (Week 6-8)
- [ ] Check PM2 status: `pm2 status`
- [ ] Review error logs: `pm2 logs art-request-form --err --lines 50`
- [ ] Monitor #tech-alert channel
- [ ] Check health endpoint: `curl https://requests.whitestonebranding.com/api/health`

### Weekly
- [ ] Review access logs: `sudo tail -f /var/log/nginx/art-request-form-access.log`
- [ ] Check disk space: `df -h`
- [ ] Update server packages: `sudo apt update && sudo apt upgrade`
- [ ] Verify SSL certificate not expiring soon: `sudo certbot certificates`

### Monthly
- [ ] Update npm dependencies: `npm audit fix`
- [ ] Review and rotate API keys if needed
- [ ] Test rollback procedures
- [ ] Review security

---

## External Monitoring Setup (Optional but Recommended)

### UptimeRobot or Better Uptime

1. Sign up for free account
2. Add monitor:
   - **URL**: `https://requests.whitestonebranding.com/api/health`
   - **Interval**: 5 minutes
   - **Alert contacts**: Email + Slack
3. Configure Slack alerts

- [ ] External monitoring configured
- [ ] Alerts working (send test)

---

## Rollback Procedures

Keep these commands handy in case of emergency:

### Quick Restart
```bash
ssh deploy@requests.whitestonebranding.com
pm2 restart art-request-form
```

### Rollback to Previous Version
```bash
ssh deploy@requests.whitestonebranding.com
cd /var/www/art-request-form
git log --oneline -10  # Find commit hash
git reset --hard <commit-hash>
npm ci --production
npm run build
pm2 reload art-request-form
```

### Emergency Shutdown
```bash
pm2 stop art-request-form
# Re-enable Cognito form immediately
```

- [ ] Rollback procedures documented and accessible
- [ ] Team knows who to contact for emergencies

---

## Success Criteria

Before marking deployment as successful:

### Technical
- [ ] Health check returning 200 OK
- [ ] SSL certificate valid and auto-renewing
- [ ] PM2 running in cluster mode
- [ ] Nginx proxy working correctly
- [ ] All environment variables configured
- [ ] Build succeeds without errors
- [ ] No errors in PM2 logs

### Integration
- [ ] Google Drive folders created correctly (100% success)
- [ ] Files uploaded successfully (100% success)
- [ ] Asana tasks created with all fields (100% success)
- [ ] Slack notifications received
- [ ] Admin dashboard shows all submissions
- [ ] Retry mechanism works for failures

### Business
- [ ] At least 20 successful submissions
- [ ] All 6 request types tested
- [ ] Team feedback incorporated
- [ ] No critical bugs in 1 week
- [ ] User adoption >80%
- [ ] Support requests <5/week

---

## Troubleshooting Quick Reference

### Application won't start
```bash
pm2 logs art-request-form --lines 50
# Check for missing env variables or port conflicts
```

### Nginx errors
```bash
sudo nginx -t  # Test config
sudo tail -f /var/log/nginx/error.log
```

### SSL issues
```bash
sudo certbot certificates  # Check expiration
sudo certbot renew  # Manual renewal
```

### High memory usage
```bash
free -h
pm2 monit
pm2 reload art-request-form  # If needed
```

See **DEPLOYMENT.md** for comprehensive troubleshooting guide.

---

## Next Steps After Successful Deployment

### Week 6-8: Stabilization
- Monitor daily
- Quick bug fixes
- User support
- Performance tuning

### Month 2: Optimization
- Analyze usage patterns
- Performance improvements
- Feature enhancements based on feedback

### Month 3: Review
- Team retrospective
- Document lessons learned
- Plan future features
- Celebrate success! 🎉

---

## Support Contacts

- **Technical Issues**: tech-team@whitestonebranding.com
- **Slack Channel**: #tech-alert
- **GitHub Issues**: https://github.com/mrtellington/art-request-form/issues

---

## Documentation Reference

- **CREDENTIALS_SETUP.md** - Complete credential setup guide
- **DEPLOYMENT.md** - Detailed deployment guide (350+ lines)
- **MIGRATION_PLAN.md** - 5-week migration strategy
- **SECURITY.md** - Security best practices
- **README.md** - Project overview and quick start

---

**Last Updated**: 2026-01-09
**Version**: 1.0

---

## Quick Command Reference

```bash
# SSH to server
ssh deploy@requests.whitestonebranding.com

# Check application status
pm2 status

# View logs
pm2 logs art-request-form

# Restart application
pm2 reload art-request-form

# Health check
curl https://requests.whitestonebranding.com/api/health

# Deploy updates (from local machine)
./scripts/deploy.sh production

# Validate credentials
node -r dotenv/config scripts/validate-credentials.js dotenv_config_path=.env.production
```

---

🎉 **You're ready to deploy!** Follow this checklist step-by-step for a successful deployment.
