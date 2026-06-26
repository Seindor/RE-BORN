export const Clans = ["Yoshimura", "Kamishiro", "Kirishima"] as const;

export type Clan = (typeof Clans)[number];
