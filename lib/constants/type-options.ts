/**
 * Type-Specific Field Options
 *
 * Dropdown options for type-specific fields matching Cognito form.
 */

export const MOCKUP_TYPE_OPTIONS = [
  { value: 'Whitestone Template', label: 'Whitestone Template' },
  {
    value: 'Individual Mockups (No Template)',
    label: 'Individual Mockups (No Template)',
  },
] as const;

export const PPTX_TYPE_OPTIONS = [
  { value: 'Biz Dev', label: 'Biz Dev' },
  { value: 'Pitch Deck', label: 'Pitch Deck' },
  { value: 'Rise & Shine', label: 'Rise & Shine' },
] as const;

export const PROOF_TYPE_OPTIONS = [
  { value: 'Digital Proof', label: 'Digital Proof' },
  { value: 'Print Proof', label: 'Print Proof' },
  { value: 'Virtual Sample', label: 'Virtual Sample' },
] as const;

// Sneak Peek uses a textarea, not dropdown options
