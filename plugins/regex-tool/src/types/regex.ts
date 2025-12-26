export interface RegexMatch {
  index: number;
  match: string;
  groups: string[];
  namedGroups?: Record<string, string>;
  start: number;
  end: number;
}

export interface CaptureGroup {
  index: number;
  name?: string;
  content: string;
  start: number;
  end: number;
}

export interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

export interface ProcessingResult {
  matches: RegexMatch[];
  replacedText?: string;
  isValid: boolean;
  error?: string;
}
