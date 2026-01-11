# Art Request Form - Project Scratchpad

## Last Updated: January 11, 2026

---

## Recent Session Summary

### What We Fixed

1. **Client Search Issue** - Fixed client name lookup not working when switching between request types. Added initialization logic in `ProjectDetailsStep.tsx` to re-validate clients when the component remounts.

2. **Step Indicator Line** - Fixed the connecting line between steps in `StepIndicator.tsx` using absolute positioning with `top-4 left-1/2 w-full`.

3. **Label Style Consistency** - Removed `text-base font-semibold` overrides from labels across all steps. Labels now use default `text-sm font-medium` from the Label component.

4. **Product Fields Tab Order** - Added `baseTabIndex` prop to `ProductInput.tsx` and set `tabIndex={-1}` on action buttons (Remove, Add, Clone) in `RepeatableSection.tsx`.

5. **Validation Rules** - Added missing Zod schema validations in `form-schema.ts`:
   - Proofs requires products + proofType
   - Mockup requires mockupType
   - PPTX requires pptxType
   - Sneak Peek requires sneakPeekOptions

6. **Cleanup** - Removed unused `ClientStep.tsx` file.

---

## Request Types & Their Configuration

| Request Type             | Unique Fields                                   | Products Step | Request Details Step     |
| ------------------------ | ----------------------------------------------- | ------------- | ------------------------ |
| Creative Design Services | None                                            | No            | Yes (shows info message) |
| Mockup                   | mockupType                                      | Yes           | Yes                      |
| PPTX                     | pptxType, numberOfSlides, presentationStructure | No            | Yes                      |
| Proofs                   | proofType                                       | Yes           | No (skipped)             |
| Sneak Peek               | sneakPeekOptions                                | No            | Yes                      |
| Rise & Shine             | riseAndShineLevel, numberOfSlides               | No            | Yes                      |

---

## Form Step Flow

```
All Types:
1. Request Type Selection
2. Project Details (client, requestor, region, title, project#, due date)
3. Request Details (conditional - skipped for Proofs)
4. Product Details (only for Mockup & Proofs)
5. Additional Information (project value, billable, client type, labels, collaborators, pertinent info, websites, attachments)
6. Review & Submit
```

---

## Key Files

### Form Components

- `components/form/FormContainer.tsx` - Main form orchestrator, step validation
- `components/form/StepIndicator.tsx` - Visual step progress indicator
- `components/form/FormNavigation.tsx` - Previous/Next buttons

### Step Components

- `components/form/steps/RequestTypeStep.tsx` - Request type selection
- `components/form/steps/ProjectDetailsStep.tsx` - Client info, requestor, dates (includes client search)
- `components/form/steps/RequestDetailsStep.tsx` - Type-specific fields (mockupType, pptxType, etc.)
- `components/form/steps/ProductsStep.tsx` - Product list for Mockup/Proofs
- `components/form/steps/AdditionalInfoStep.tsx` - Project metadata, websites, attachments
- `components/form/steps/ReviewStep.tsx` - Final review before submission

### Field Components

- `components/form/fields/ProductInput.tsx` - Individual product form fields
- `components/form/fields/RepeatableSection.tsx` - Generic repeatable section wrapper
- `components/form/fields/WebsiteLinkInput.tsx` - Website/social link input
- `components/form/fields/FileUpload.tsx` - File attachment upload
- `components/form/fields/RichTextEditor.tsx` - TipTap rich text editor
- `components/form/fields/UserAutocomplete.tsx` - Collaborator search/autocomplete

### Schemas & Types

- `lib/schemas/form-schema.ts` - Zod validation schemas
- `types/form.ts` - TypeScript type definitions

### Hooks

- `hooks/useStepNavigation.ts` - Step navigation logic (conditional steps based on requestType)
- `hooks/useFormPersistence.ts` - Auto-save drafts to Firebase

### API Routes

- `app/api/search-clients/route.ts` - Client search (Firebase cached)
- `app/api/search-users/route.ts` - User/collaborator search (Asana)
- `app/api/sync-clients/route.ts` - Sync clients from CommonSKU to Firebase
- `app/api/submit/route.ts` - Form submission (creates Asana task, Google Drive folder)

---

## Things to Test

1. **Client Search** - Test in a fresh incognito window:
   - Select Mockup, go to Project Details, type a client name
   - Verify search results appear and green checkmark shows for valid clients
   - Switch to different request type, verify client search still works

2. **All Request Types** - Go through each request type end-to-end:
   - Creative Design Services
   - Mockup (requires mockupType + products)
   - PPTX (requires pptxType + numberOfSlides)
   - Proofs (requires proofType + products)
   - Sneak Peek (requires sneakPeekOptions)
   - Rise & Shine (requires riseAndShineLevel + numberOfSlides)

3. **Tab Order** - Tab through product fields, should flow sequentially

4. **Step Indicator** - Verify lines connect properly between step circles

---

## Known Issues / Potential Improvements

- [ ] If client search still doesn't work for some request types, check browser console for errors
- [ ] May need to sync clients from CommonSKU if Firebase cache is stale (`POST /api/sync-clients`)
- [ ] Consider adding loading states for form submission
- [ ] Rich text editor loads dynamically to avoid SSR issues

---

## Git Info

- **Branch**: `development`
- **Last Commit**: `0e75ce1` - "Fix client search, add validation rules, and improve form consistency"
- **Remote**: `https://github.com/mrtellington/art-request-form.git`

---

## Environment

- Next.js 16.1.1 (Turbopack)
- React Hook Form with Zod validation
- Firebase (Firestore for drafts, client cache)
- Asana API (task creation, user search)
- Google Drive API (folder creation, file uploads)
- CommonSKU API (client data source)
