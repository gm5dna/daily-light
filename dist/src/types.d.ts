export interface Verse {
    text: string;
    reference: string;
}
export interface Reading {
    date: string;
    period: "morning" | "evening";
    themeVerse: Verse;
    verses: Verse[];
}
export type Period = "morning" | "evening";
export interface DateQuery {
    month: number;
    day: number;
}
