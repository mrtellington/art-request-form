# Cognito Form Field Mapping

## Overview

This document maps all fields from the original Cognito Art Request form to ensure our Next.js implementation matches exactly.

**Source:** https://www.cognitoforms.com/WhitestoneBranding/ArtRequest

## Request Types in Cognito (5 types)

1. Creative Design Services
2. Mockup
3. PPTX
4. Proofs
5. Sneak Peek

**Note:** Our app has 6 types - **Rise & Shine is NEW** and does NOT exist in Cognito.

---

## Common Fields (All Request Types)

| Field Name                      | Type               | Required | Notes                                                                            |
| ------------------------------- | ------------------ | -------- | -------------------------------------------------------------------------------- |
| Requestor Name                  | Text (First, Last) | Yes      | Two text inputs                                                                  |
| Requestor Email                 | Text               | Yes      | Email format                                                                     |
| Request                         | Dropdown           | Yes      | 5 options (see above)                                                            |
| Region                          | Dropdown           | No       | Default: "US"                                                                    |
| Request Title                   | Text               | Yes      |                                                                                  |
| Client                          | Dropdown           | Yes      | commonsku clients, "Select 'Not Listed' if client is not in dropdown"            |
| Due Date                        | Date Picker        | Yes      |                                                                                  |
| Due Time                        | Time Picker        | No       | Default: 6:00 PM, "Enter as Eastern Standard Time"                               |
| Add Collaborators?              | Radio              | No       | Yes/No, Default: No, "Included collaborators will be added to the Asana request" |
| Client Type                     | Dropdown           | Yes      |                                                                                  |
| Labels                          | Checkboxes         | No       | Call Needed, Rush, Needs Creative                                                |
| Websites, Social, & Inspiration | Repeating          | No       | Table with Type (dropdown) and Website (text), "+ Add Links"                     |
| Pertinent Information           | Textarea           | No       |                                                                                  |
| Attachments or Logos            | File Upload        | No       |                                                                                  |

---

## Type-Specific Fields Matrix

| Field                  | Creative Design | Mockup        | PPTX        | Proofs       | Sneak Peek           | Rise & Shine |
| ---------------------- | --------------- | ------------- | ----------- | ------------ | -------------------- | ------------ |
| Type-Specific Dropdown | -               | Mockup Type\* | PPTX Type\* | Proof Type\* | Sneak Peek Options\* | R&S Level\*  |
| Number of Slides       | ✗               | ✗             | ✓           | ✗            | ✗                    | ✓            |
| Project#               | ✓               | ✓             | ✓           | ✓            | ✗                    | ✓            |
| Billable               | ✓               | ✓             | ✗           | ✗            | ✗                    | ✗            |
| Project Value          | ✗               | ✓             | ✓           | ✗            | ✗                    | ✓            |
| Products Section       | ✗               | ✓             | ✗           | ✓            | ✗                    | ✗            |

\*Required field

---

## Type-Specific Field Details

### Creative Design Services

- **No type-specific dropdown** (unlike other types)
- Has: Project#, Billable
- Missing: Project Value, Products

### Mockup

- **Mockup Type** (required, dropdown)
- Has: Project#, Billable, Project Value, Products
- Most complete set of fields

### PPTX

- **PPTX Type** (required, dropdown)
- Has: Project#, Project Value
- Missing: Billable, Products

### Proofs

- **Proof Type** (required, dropdown)
- Has: Project#, Products
- Missing: Billable, Project Value

### Sneak Peek

- **Sneak Peek Options** (required, dropdown)
- Missing: Project#, Billable, Project Value, Products
- Simplest form configuration

---

## Products Section Fields (Mockup & Proofs only)

| Field Name           | Type | Required |
| -------------------- | ---- | -------- |
| Product Name         | Text | Yes      |
| Product Link         | Text | No       |
| Product Color        | Text | No       |
| Imprint Method       | Text | No       |
| Imprint Color        | Text | No       |
| Decoration Locations | Text | No       |
| Decoration Size      | Text | No       |
| Other Info           | Text | No       |

"+ Add Products" button allows multiple products.

---

## Key Differences from Current Implementation

### 1. Rise & Shine - KEEPING (New Feature)

- Does NOT exist in Cognito - this is a NEW feature in our app
- Similar to PPTX (presentation-based)
- Fields:
  - **Rise & Shine Level** (required, dropdown): Bronze, Silver, Gold
  - **Number of Slides** (required, number) - shared with PPTX
- Should have: Project#, Project Value (like PPTX)
- Should NOT have: Billable, Products

### 2. Step Structure

- Cognito is a **single-page form** (no wizard steps)
- Our app has multi-step wizard
- Need to consolidate fields appropriately

### 3. Field Placement

- All type-specific fields should be in Project Details step
- Remove separate "Request Details" step
- Products step only for Mockup & Proofs

---

## Dropdown Options (To Be Verified)

Need to document dropdown values for:

- [ ] Region
- [ ] Client (commonsku integration)
- [ ] Mockup Type
- [ ] PPTX Type
- [ ] Proof Type
- [ ] Sneak Peek Options
- [ ] Billable
- [ ] Project Value
- [ ] Client Type
- [ ] Websites Type (in Links section)

---

## Implementation Checklist

- [ ] Remove "Request Details" step from all request types
- [ ] Move type-specific fields to Project Details step
- [ ] Conditionally show/hide fields based on request type:
  - [ ] Project# (all except Sneak Peek)
  - [ ] Billable (Creative Design, Mockup only)
  - [ ] Project Value (Mockup, PPTX only)
- [ ] Products step only for Mockup & Proofs
- [ ] Decide on Rise & Shine fate
- [ ] Verify all dropdown options match Cognito
