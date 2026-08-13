/** Admin allowlist — Settings admin card (RB-007). */
export const ADMIN_EMAILS = ["jeremyrschrader@gmail.com"] as const;

export type GenderOption = "woman" | "man" | "non_binary" | "prefer_not";

export const GENDER_OPTIONS: { value: GenderOption; label: string }[] = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not", label: "Prefer not to say" },
];

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

/** Canned support chips for trail onboarding (inspiration + defaults). */
export const SUPPORT_INSPIRATION: {
  type: string;
  label: string;
  weeklyTarget: number;
}[] = [
  { type: "walk", label: "Walk", weeklyTarget: 4 },
  { type: "gym", label: "Gym", weeklyTarget: 4 },
  { type: "meditation", label: "Meditate", weeklyTarget: 5 },
  {
    type: "recovery_content",
    label: "Recovery content",
    weeklyTarget: 2,
  },
  { type: "meetings", label: "Meetings", weeklyTarget: 3 },
  { type: "medication", label: "Medication", weeklyTarget: 7 },
];

export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((e) => e === normalized);
}

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Max length for support labels so Today’s Rebuild fits on mobile. */
export const SUPPORT_LABEL_MAX = 16;

export function truncateSupportLabel(label: string, max = SUPPORT_LABEL_MAX) {
  const t = label.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}
