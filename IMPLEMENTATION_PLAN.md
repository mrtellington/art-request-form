# Implementation Plan: Brand Updates + Form Consistency

## Phase A: Whitestone Branding Updates (FIRST)

### Overview

Apply Whitestone brand identity to the art request form application before implementing form consistency changes.

### Brand Assets Collected

From https://www.whitestonebranding.com/brand:

**Colors:**

- Midnight: #0e1237 (primary dark)
- Hudson: #2F6E87 (primary blue)
- Verdigris: #51b3bd (primary teal)
- Sea Salt: #f7f7f7 (light background)
- Tart: #DF636E (accent red)

**Typography:**

- Figtree (variable sans serif from Google Fonts)
- Weights: SemiBold, Regular, ExtraBold

**Logo:**

- Stone mark with wordmark
- Multiple colorways available

### Implementation Steps

#### Step A1: Create Brand Documentation File

**File to create**: `/Users/todellington/art-request-form/WHITESTONE_BRAND.md`

Document all brand specifications for future reference across projects:

- Color palette with hex codes and usage guidelines
- Typography specifications
- Logo asset locations and usage rules
- Component styling patterns
- This file becomes the source of truth for all Whitestone projects

#### Step A2: Download and Add Logo Assets

**Files to create**:

- `/Users/todellington/art-request-form/public/logo.svg` (or .png)
- `/Users/todellington/art-request-form/public/favicon.ico`
- `/Users/todellington/art-request-form/public/favicon.svg` (optional)

Download from Whitestone brand page and add to public directory.

#### Step A3: Update Fonts to Figtree

**Files to modify**:

- `/Users/todellington/art-request-form/app/layout.tsx` (or pages/\_app.tsx for Pages Router)

Changes:

1. Import Figtree from `next/font/google`
2. Configure with weights: 400 (Regular), 600 (SemiBold), 800 (ExtraBold)
3. Apply to document body
4. Remove any existing font imports (if different)

**Example**:

```typescript
import { Figtree } from 'next/font/google';

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-figtree',
});
```

#### Step A4: Update Tailwind Config with Brand Colors

**File to modify**: `/Users/todellington/art-request-form/tailwind.config.ts`

Replace default blue colors with Whitestone palette:

```typescript
theme: {
  extend: {
    colors: {
      // Whitestone Brand Colors
      midnight: '#0e1237',
      hudson: '#2F6E87',
      verdigris: '#51b3bd',
      'sea-salt': '#f7f7f7',
      tart: '#DF636E',

      // Map to Tailwind semantic names for easy replacement
      primary: {
        DEFAULT: '#2F6E87', // Hudson
        dark: '#0e1237',    // Midnight
        light: '#51b3bd',   // Verdigris
      },
      accent: '#DF636E',      // Tart
      background: '#f7f7f7',  // Sea Salt
    },
    fontFamily: {
      sans: ['var(--font-figtree)', 'system-ui', 'sans-serif'],
    },
  },
}
```

#### Step A5: Update Global Styles and Component Colors

**Files to check and update**:

- `/Users/todellington/art-request-form/app/globals.css`
- Component files using `bg-blue-*`, `text-blue-*`, `border-blue-*`, etc.

Changes:

1. Replace CSS custom properties with Whitestone colors
2. Find and replace blue color classes:
   - `bg-blue-600` → `bg-hudson` or `bg-primary`
   - `text-blue-600` → `text-hudson` or `text-primary`
   - `hover:bg-blue-700` → `hover:bg-midnight` or `hover:bg-primary-dark`
3. Update focus rings, borders, highlights
4. Update button primary styles

**Search strategy**:

```bash
grep -r "blue-" components/ app/ --include="*.tsx" --include="*.ts"
```

#### Step A6: Update Favicon and Logo in Layout

**Files to modify**:

- `/Users/todellington/art-request-form/app/layout.tsx` (metadata)
- Navigation components that show logo

Add favicon to metadata:

```typescript
export const metadata: Metadata = {
  title: 'Art Request Form',
  description: 'Whitestone Branding Art Request System',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
};
```

Add logo to navigation/header if not present.

#### Step A7: Testing and Verification

- [ ] Fonts load correctly (check Network tab)
- [ ] Figtree is applied throughout application
- [ ] All blue highlights replaced with Whitestone colors
- [ ] Logo displays in header/navigation
- [ ] Favicon shows in browser tab
- [ ] Color contrast meets WCAG standards (especially text on backgrounds)
- [ ] Buttons, links, form inputs use brand colors
- [ ] Focus states are visible and use brand colors

### Brand Update Success Criteria

✅ Figtree font loaded and applied throughout
✅ All brand colors from WHITESTONE_BRAND.md are used consistently
✅ No default blue colors remain (replaced with Hudson/Verdigris)
✅ Logo visible in application header
✅ Favicon displays in browser tab
✅ WHITESTONE_BRAND.md created as reference for future projects

---

## Phase B: Form Consistency Updates (SECOND - After Branding)

### Overview

After branding is complete, standardize all request types to follow the Proofs pattern and ensure consistency with the Cognito form.

**Goal**: Apply Proofs pattern to all request types:

- Request Type → Project Details → Product Details (if applicable) → Additional Information → Review & Submit

**Current Issues**:

1. 5 request types have an extra "Request Details" step that Proofs doesn't have
2. Type-specific fields are scattered across different steps
3. Field types may not match Cognito (text vs dropdown)
4. Rise & Shine is NEW (not in original Cognito form)

### Solution Approach

**Eliminate the "Request Details" step** and consolidate all type-specific fields into the Project Details step.

### Critical Files

1. **`hooks/useStepNavigation.ts`** - Remove Request Details step conditional logic
2. **`components/form/steps/ProjectDetailsStep.tsx`** - Add type-specific fields conditionally
3. **`components/form/steps/AdditionalInfoStep.tsx`** - Remove proofType field
4. **`components/form/steps/RequestDetailsStep.tsx`** - DELETE this file
5. **`lib/schemas/form-schema.ts`** - Update validation
6. **`lib/integrations/asana.ts`** - Verify custom field mapping
7. **`lib/utils/formatters.ts`** - Verify task description formatting

### Implementation Phases

#### Phase B1: Cognito Form Field Verification ⚠️ CRITICAL FIRST STEP

Access https://www.cognitoforms.com/WhitestoneBranding/ArtRequest and document for EACH request type:

- All field names and labels
- Field types (text input, dropdown, textarea, number)
- Required vs optional
- Dropdown option values
- Field order

**Deliverable**: `COGNITO_FIELD_MAPPING.md` or spreadsheet

#### Phase B2: Update Step Navigation Logic

**File**: `hooks/useStepNavigation.ts`

Remove conditional "Request Details" step, simplify to:

```typescript
const steps: FormStep[] = [
  { id: 'requestType', label: 'Request Type', ... },
  { id: 'projectDetails', label: 'Project Details', ... },
];

if (requestType === 'Mockup' || requestType === 'Proofs') {
  steps.push({ id: 'products', label: 'Product Details', ... });
}

steps.push(
  { id: 'additionalInfo', label: 'Additional Information', ... },
  { id: 'review', label: 'Review & Submit', ... }
);
```

#### Phase B3: Consolidate Project Details Step

**File**: `components/form/steps/ProjectDetailsStep.tsx`

Add type-specific fields conditionally after Request Title and before due date.

#### Phase B4: Update Additional Information Step

**File**: `components/form/steps/AdditionalInfoStep.tsx`

Remove proofType field (moves to Project Details), keep all metadata fields.

#### Phase B5: Delete Request Details Step

**DELETE**: `components/form/steps/RequestDetailsStep.tsx`
**Update**: Remove imports and rendering references

#### Phase B6: Update Validation Schemas

**File**: `lib/schemas/form-schema.ts`

Update to match new step structure, verify required/optional status.

#### Phase B7: Update Type Definitions

**File**: `types/form.ts`

Verify all conditional field types, add missing fields from Cognito.

#### Phase B8: Verify Asana Integration

**Files**: `lib/integrations/asana.ts`, `lib/utils/formatters.ts`

Verify custom field GIDs, task description formatting, collaborators, due date/time handling.

#### Phase B9: Handle Rise & Shine Decision

Determine if it exists in Cognito, decide whether to remove or keep.

#### Phase B10: End-to-End Testing

Test all 6 request types thoroughly:

- Navigation flow
- Field validation
- Products step (Mockup & Proofs only)
- Draft auto-save
- Form submission
- Asana task creation
- Google Drive folder creation
- Slack notifications

### Form Update Success Criteria

✅ All request types follow identical step flow (except Products for Mockup/Proofs)
✅ All fields match Cognito form in type, validation, and options
✅ No "Request Details" step
✅ All 6 request types create correct Asana tasks
✅ Custom fields populate correctly in Asana
✅ Collaborators added to tasks when selected
✅ Due date/time displays correctly with Eastern timezone
✅ Google Drive folders created in correct A-L or M-Z folder
✅ Slack notifications sent for all submissions

---

## Timeline

**Phase A (Branding)**: 3-4 hours
**Phase B (Form Consistency)**: 16-23 hours

**Total**: 19-27 hours
