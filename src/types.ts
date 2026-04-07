export interface Verse {
  text: string;
  reference: string;
}

export interface Reading {
  date: string;        // e.g. "january-1"
  period: "morning" | "evening";
  themeVerse: Verse;
  verses: Verse[];
}

export type Period = "morning" | "evening";

export interface DateQuery {
  month: number;  // 1–12
  day: number;    // 1–31
}
