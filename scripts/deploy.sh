#!/bin/bash

##############################################################################
# Deployment Script for Art Request Form
#
# This script deploys the application to the production server.
# Run from your local machine, not on the server.
#
# Usage:
#   ./scripts/deploy.sh [production|staging]
#
# Prerequisites:
#   - SSH access to server configured
#   - Server setup completed (see DEPLOYMENT.md)
#   - Environment variables configured on server
##############################################################################

set -e  # Exit on error

# Configuration
ENVIRONMENT="${1:-production}"
SERVER_USER="deploy"
SERVER_HOST="requests.whitestonebranding.com"
DEPLOY_PATH="/var/www/art-request-form"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Art Request Form Deployment${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. Verify branch and clean working directory
echo -e "\n${YELLOW}[1/8] Checking Git status...${NC}"
if [[ $(git status --porcelain) ]]; then
  echo -e "${RED}Error: Working directory is not clean. Commit or stash changes.${NC}"
  exit 1
fi

# 2. Run tests (if available)
echo -e "\n${YELLOW}[2/8] Running tests...${NC}"
npm run build || {
  echo -e "${RED}Build failed. Aborting deployment.${NC}"
  exit 1
}

# 3. Push to repository
echo -e "\n${YELLOW}[3/8] Pushing to repository...${NC}"
git push origin $BRANCH

# 4. SSH to server and pull changes
echo -e "\n${YELLOW}[4/8] Connecting to server and pulling changes...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /var/www/art-request-form

# Pull latest code
echo "Pulling latest code from main branch..."
git fetch origin
git reset --hard origin/main

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Build application
echo "Building application..."
npm run build

ENDSSH

# 5. Restart PM2
echo -e "\n${YELLOW}[5/8] Restarting application with PM2...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /var/www/art-request-form

# Reload PM2 with zero downtime
pm2 reload ecosystem.config.js --env production

# Save PM2 process list
pm2 save

ENDSSH

# 6. Health check
echo -e "\n${YELLOW}[6/8] Running health check...${NC}"
sleep 5  # Give the app time to start

HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://${SERVER_HOST}/api/health)

if [ "$HEALTH_RESPONSE" = "200" ]; then
  echo -e "${GREEN}✓ Health check passed (HTTP $HEALTH_RESPONSE)${NC}"
else
  echo -e "${RED}✗ Health check failed (HTTP $HEALTH_RESPONSE)${NC}"
  echo -e "${RED}Deployment may have issues. Check logs with: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs'${NC}"
  exit 1
fi

# 7. Verify deployment
echo -e "\n${YELLOW}[7/8] Verifying deployment...${NC}"
DEPLOYMENT_INFO=$(ssh ${SERVER_USER}@${SERVER_HOST} "cd ${DEPLOY_PATH} && git log -1 --pretty=format:'%h - %s (%ar)' && echo '' && pm2 info art-request-form | grep 'status' | head -1")

echo -e "${GREEN}Latest commit: $DEPLOYMENT_INFO${NC}"

# 8. Done
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nApplication URL: https://${SERVER_HOST}"
echo -e "Health Check: https://${SERVER_HOST}/api/health"
echo -e "\nMonitoring commands:"
echo -e "  SSH: ssh ${SERVER_USER}@${SERVER_HOST}"
echo -e "  Logs: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs art-request-form'"
echo -e "  Status: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 status'"
echo -e "\nRollback command:"
echo -e "  ssh ${SERVER_USER}@${SERVER_HOST} 'cd ${DEPLOY_PATH} && git reset --hard <commit-hash> && npm ci && npm run build && pm2 reload ecosystem.config.js'"
