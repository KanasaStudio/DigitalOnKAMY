export const RANGES = ["7", "30", "90"] as const;
export type Range = (typeof RANGES)[number];
