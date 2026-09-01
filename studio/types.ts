export type ScreenKey = 'desktop' | 'tablet' | 'mobile';

export interface ScreenLayer {
  /** selector -> { cssProp: value } */
  styles: Record<string, Record<string, string>>;
  /** selectors hidden on this screen only */
  hidden: string[];
}

export interface Overrides {
  /** selector -> innerHTML. גלובלי — משותף לכל שלושת המסכים. */
  text: Record<string, string>;
  /** משפחות Google Fonts שיש להזריק */
  fonts: string[];
  screens: Record<ScreenKey, ScreenLayer>;
}

export const SCREENS: { key: ScreenKey; label: string; icon: string; width: number }[] = [
  { key: 'desktop', label: 'דסקטופ', icon: '🖥', width: 0 },
  { key: 'tablet', label: 'טאבלט', icon: '📱', width: 900 },
  { key: 'mobile', label: 'מובייל', icon: '📱', width: 390 },
];

/** גבולות ה-media query לכל מסך. משמש גם בהחלה חיה וגם באפייה. */
export const MEDIA: Record<ScreenKey, string> = {
  desktop: '(min-width: 1025px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  mobile: '(max-width: 767px)',
};

export function emptyOverrides(): Overrides {
  return {
    text: {},
    fonts: [],
    screens: {
      desktop: { styles: {}, hidden: [] },
      tablet: { styles: {}, hidden: [] },
      mobile: { styles: {}, hidden: [] },
    },
  };
}
