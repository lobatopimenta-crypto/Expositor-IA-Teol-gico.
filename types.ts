export type Translation = 'NVI' | 'ARC' | 'ACF' | 'KJA' | 'NVT' | 'KJV' | 'NIV' | 'ESV';
export type Depth = 'rapido' | 'detalhado' | 'academico' | 'sermao';

export interface StudyRequest {
  passage: string;
  translation: Translation;
  depth: Depth;
}

export interface HistoryItem extends StudyRequest {
  timestamp: number;
}

export interface LexicalEntry {
  word: string;
  lemma: string;
  transliteration: string;
  morphology: string;
  meaning: string;
}

export interface TheologicalPosition {
  tradition: string; // e.g., "Reformada", "Patrística"
  summary: string;
}

export interface Theologian {
  name: string;
  era: string; // e.g. "Século IV", "Reforma Protestante"
  view: string; // Summary of their view
}

export interface BibliographicEntry {
  author: string;
  title: string;
  publisher?: string;
  year?: string;
  annotation: string; // Brief comment on relevance
}

export interface ParallelPassage {
  reference: string; // e.g., "Lucas 3:16"
  text: string;      // The text or summary
  correlation: string; // How it relates (e.g., "Sinótico", "Citação do AT")
}

export interface SlideContent {
  title: string;
  bullets: string[];
  image_hint: string;
}

export interface SermonPoint {
  title: string;
  explanation: string;
  illustration: string;
  application: string;
}

export interface SermonContent {
  title: string;
  text_focus: string; // The specific verses focused on
  introduction: string;
  points: SermonPoint[];
  conclusion: string;
}

export interface StudyData {
  meta: {
    reference: string;
    translation: Translation;
    generated_at: string;
  };
  summary: {
    executive: string;
    preaching_points: string[];
  };
  content: {
    text_base: string;
    intro_definition: string;
    context_literary: string;
    context_historical: string;
    parallels: ParallelPassage[];
    lexical_analysis: LexicalEntry[];
    intertextuality: string;
    interpretations: TheologicalPosition[];
    theologians: Theologian[];
    implications: string;
    study_questions: string[];
    bibliography: BibliographicEntry[];
  };
  sermon?: SermonContent; // Optional, populated fully when depth is 'sermao'
  slides: SlideContent[];
}