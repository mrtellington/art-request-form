# Migration Plan: Cognito Forms → Custom Art Request Form

## Overview

This document outlines the complete migration strategy from the existing Cognito Forms setup to the new custom Art Request Form application.

---

## Current State

### Existing Workflow
1. User fills out Cognito form at `hub.whitestonebranding.com/artreq`
2. Cognito triggers Zapier webhooks
3. Zapier runs transformations (zapier-transformations.js logic)
4. Zapier creates:
   - Google Drive folder (A-L or M-Z routing)
   - Uploads attachments
   - Creates Asana task with custom fields
   - Sends notifications

### Pain Points
- **Parallel Arrays**: Product data stored as fragile parallel arrays
- **No Cloning**: Cannot duplicate previous product entries
- **Plain Text**: No rich text formatting for multiline fields
- **No Drafts**: Cannot save progress and resume later
- **Limited Admin**: View-only access to submissions
- **Manual Recovery**: Failed integrations require manual intervention

---

## Migration Timeline

### Week 1-2: Development & Testing (Complete ✅)
- [x] Build custom Next.js application
- [x] Implement all 47+ form fields
- [x] Create Google Drive integration
- [x] Create Asana integration
- [x] Build admin dashboard
- [x] Add error recovery features

### Week 3: Deployment & Internal Testing

#### Day 1-2: VPS Setup
- [ ] Provision VPS server
- [ ] Configure Node.js, PM2, Nginx
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Test server accessibility

#### Day 3-4: Application Deployment
- [ ] Deploy application to server
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Run health checks
- [ ] Verify all integrations

#### Day 5-7: Internal Testing
- [ ] Create test Asana board
- [ ] Team testing with test board
- [ ] Submit test requests for each type
- [ ] Verify all integrations work
- [ ] Test error scenarios
- [ ] Validate admin dashboard

### Week 4: Parallel Running

#### Day 1: Production Switch
- [ ] Switch to production Asana board (1211223909834951)
- [ ] Monitor first production submissions
- [ ] Verify Slack notifications
- [ ] Check Google Drive folders

#### Day 2-7: Dual Operation
- [ ] Keep Cognito form active
- [ ] Add banner to Cognito form:
  ```
  ⚠️ New Art Request Form Available!
  Please use the new form at: https://requests.whitestonebranding.com
  This form will be deprecated on [DATE]
  ```
- [ ] Monitor both systems
- [ ] Track usage metrics
- [ ] Address any issues

### Week 5: Migration Completion

#### Day 1-3: Final Validation
- [ ] Verify all features working
- [ ] Confirm no errors in past week
- [ ] Review admin dashboard data
- [ ] Check integration success rates

#### Day 4-5: Redirect Setup
- [ ] Add Nginx redirect: `/artreq` → `https://requests.whitestonebranding.com`
- [ ] Test redirect works correctly
- [ ] Update internal documentation

#### Day 6-7: Cognito Deprecation
- [ ] Disable Cognito form submissions
- [ ] Archive Cognito form
- [ ] Export historical Cognito data (if needed)
- [ ] Announce completion to team

---

## Data Migration

### Historical Submissions

**Decision**: Do NOT migrate historical Cognito submissions to new system

**Rationale**:
- Historical data remains accessible in Cognito
- Existing Asana tasks unchanged
- Google Drive folders remain intact
- Migration risk outweighs benefit

**Access to Historical Data**:
- Cognito form data: Keep Cognito account read-only
- Asana tasks: All remain in production board
- Google Drive: All folders remain accessible

### Future Submissions

All new submissions after cutover will:
- Be stored in Firebase Firestore
- Create tasks in production Asana board
- Create folders in same Google Drive structure
- Appear in custom admin dashboard

---

## Rollback Strategy

### Scenario 1: Critical Bug Found (Week 3-4)

**Trigger**: Application-breaking bug, data loss, or security issue

**Action**:
1. Immediately disable new form
2. Re-enable Cognito form
3. Notify team via Slack
4. Fix bug in development
5. Re-test thoroughly
6. Re-deploy when fixed

**Rollback Commands**:
```bash
# Stop application
ssh deploy@requests.whitestonebranding.com 'pm2 stop art-request-form'

# Restore Cognito form
# Remove deprecation banner
# Notify team
```

### Scenario 2: Integration Failure (Week 4-5)

**Trigger**: Asana or Google Drive integration failing consistently

**Action**:
1. Keep application running for new submissions
2. Use admin dashboard retry feature
3. Monitor Slack notifications
4. Fix integration issue
5. Retry failed submissions

**No full rollback needed** - retry mechanism handles this

### Scenario 3: User Confusion (Week 4-5)

**Trigger**: Users reporting difficulty using new form

**Action**:
1. Gather specific feedback
2. Keep both forms running longer
3. Provide training/documentation
4. Make UX improvements
5. Extend parallel running period

---

## Communication Plan

### Week 3: Soft Launch Announcement

**To**: Art team, frequent requestors
**Channel**: Slack #art-requests
**Message**:
```
🎨 New Art Request Form Coming Soon!

We're launching an improved art request form with:
✨ Better product entry (clone previous entries)
✨ Rich text formatting
✨ Auto-save drafts
✨ Improved error handling

Testing starts next week. Stay tuned!
```

### Week 4: Parallel Running Announcement

**To**: All team
**Channel**: Slack #general, Email
**Message**:
```
📢 New Art Request Form Now Available!

We've launched a new and improved art request form:
🔗 https://requests.whitestonebranding.com

New Features:
✅ Clone previous product entries
✅ Rich text editing
✅ Auto-save drafts every 30 seconds
✅ Better admin dashboard

The old form (hub.whitestonebranding.com/artreq) will remain active
until [DATE], but please start using the new form.

Questions? Ask in #tech-alert
```

### Week 5: Final Cutover Announcement

**To**: All team
**Channel**: Slack #general, Email
**Message**:
```
✅ Art Request Form Migration Complete!

The new art request form is now the official way to submit requests:
🔗 https://requests.whitestonebranding.com

The old Cognito form has been retired.

If you've bookmarked hub.whitestonebranding.com/artreq, it will
automatically redirect to the new form.

Thank you for your patience during the transition!
```

---

## Training Materials

### Quick Start Guide

Create a 1-page PDF or Slack post with screenshots:

1. **Access the Form**
   - Go to https://requests.whitestonebranding.com
   - Sign in with your @whitestonebranding.com Google account

2. **Fill Out the Form**
   - Step through each section
   - Use "Clone Product" to duplicate previous entries
   - Use formatting toolbar for pertinent information
   - Form auto-saves every 30 seconds

3. **Submit**
   - Review summary page
   - Click "Submit Request"
   - You'll receive a confirmation with links to Asana and Drive

### Video Walkthrough (Optional)

Record a 3-5 minute Loom video demonstrating:
- Signing in
- Completing a sample request
- Using clone product feature
- Finding request in Asana

---

## Success Metrics

### Week 4-5 Tracking

Monitor and report:

| Metric | Target | Actual |
|--------|--------|--------|
| Successful submissions | >95% | ___ |
| Asana tasks created | 100% | ___ |
| Drive folders created | 100% | ___ |
| Error rate | <5% | ___ |
| User adoption | >80% using new form | ___ |
| Support requests | <5 issues/week | ___ |

### Post-Migration (Month 1)

Track:
- [ ] Total submissions via new form
- [ ] Average completion time
- [ ] Error notifications received
- [ ] Admin dashboard usage
- [ ] User feedback/satisfaction

---

## Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss | Critical | Firestore backups, error recovery, retry mechanism |
| Integration failure | High | Comprehensive testing, Slack alerts, admin retry |
| Server downtime | High | PM2 auto-restart, health monitoring, rollback plan |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| User confusion | Medium | Clear communication, training, parallel running |
| Performance issues | Medium | Load testing, PM2 clustering, monitoring |
| SSL certificate expiry | Medium | Auto-renewal, monitoring |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Browser compatibility | Low | Modern Next.js handles this, test major browsers |
| Rate limiting too strict | Low | Configurable limits, monitoring |

---

## Validation Checklist

Before full cutover, verify:

### Technical Validation
- [ ] All form fields working correctly
- [ ] All request types tested
- [ ] Google Drive integration 100% success
- [ ] Asana integration 100% success
- [ ] Slack notifications working
- [ ] Admin dashboard functional
- [ ] Error recovery tested
- [ ] Rate limiting working
- [ ] SSL certificates valid
- [ ] Health check endpoint responding
- [ ] PM2 auto-restart working
- [ ] Nginx configuration correct

### Business Validation
- [ ] At least 20 test submissions successful
- [ ] No critical bugs in past week
- [ ] Team feedback incorporated
- [ ] Training materials created
- [ ] Communication plan executed
- [ ] Rollback procedure tested
- [ ] Support team briefed

### Data Validation
- [ ] Firebase Firestore saving submissions
- [ ] Admin dashboard showing all submissions
- [ ] Asana custom fields mapping correctly
- [ ] Google Drive folder naming correct
- [ ] File uploads working
- [ ] Search and filter in admin working

---

## Post-Migration Tasks

### Week 6-8: Stabilization

- [ ] Monitor error rates daily
- [ ] Review Slack notifications
- [ ] Check admin dashboard regularly
- [ ] Gather user feedback
- [ ] Make minor improvements
- [ ] Update documentation

### Month 2: Optimization

- [ ] Analyze usage patterns
- [ ] Optimize performance if needed
- [ ] Add features based on feedback
- [ ] Review security
- [ ] Update dependencies

### Month 3: Review

- [ ] Conduct retrospective
- [ ] Document lessons learned
- [ ] Plan future enhancements
- [ ] Celebrate success! 🎉

---

## Cognito Form Deprecation

### Archive Process

1. **Download Historical Data**
   ```
   Cognito Forms → Entries → Export to CSV
   Save to: Google Drive/Archive/cognito-art-requests-backup.csv
   ```

2. **Update Form Status**
   - Mark form as "Archived"
   - Add final redirect message
   - Keep read-only access

3. **Preserve Integrations**
   - Keep Zapier zaps archived (don't delete)
   - Document Zapier transformation logic
   - Save for reference

4. **Update Documentation**
   - Remove Cognito form references
   - Update wiki/handbook
   - Update onboarding materials

---

## Support Plan

### Week 4-8: Enhanced Support

**Coverage**: Monitor #tech-alert channel actively

**Response Times**:
- Critical issues (form down): <15 minutes
- High priority (integration failure): <1 hour
- Medium priority (UX issues): <4 hours
- Low priority (enhancement requests): <24 hours

**On-Call Rotation**:
- Assign team members to monitor
- Ensure someone available during business hours
- Have escalation path

---

## Appendix

### Asana Board IDs

- **Test Board**: [Create new board, add ID here]
- **Production Board**: 1211223909834951

### Google Drive Folder IDs

- **A-L Folder**: [Add folder ID]
- **M-Z Folder**: [Add folder ID]
- **Not Listed Folder**: [Add folder ID]

### Key Contacts

- **Technical Lead**: [Name, Email]
- **Product Owner**: [Name, Email]
- **Server Admin**: [Name, Email]
- **Asana Admin**: [Name, Email]

---

**Migration Plan Version**: 1.0
**Last Updated**: 2026-01-09
**Next Review**: Week 3 (Before Deployment)
