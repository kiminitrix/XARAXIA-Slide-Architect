
export enum LayoutType {
  TITLE = 'Title',
  AGENDA = 'Agenda',
  BODY = 'Body',
  TWO_COLUMN = 'Two-column',
  BIG_IMAGE = 'Big Image',
  COMPARISON = 'Comparison',
  CONCLUSION = 'Conclusion'
}

export enum ThemeType {
  CORPORATE = 'Corporate',
  VIBRANT = 'Vibrant',
  MINIMALIST = 'Minimalist',
  TECH = 'Tech'
}

export interface Slide {
  slide_title: string;
  slide_content: string[];
  visual_suggestion: string;
  layout_type: LayoutType;
  presenter_notes: string;
}

export interface Deck {
  title: string;
  theme: ThemeType;
  slides: Slide[];
}

export interface ProcessingStatus {
  step: string;
  loading: boolean;
  error?: string;
}
