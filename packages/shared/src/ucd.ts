export interface UcdRecord {
  n: string; // name
  c: string; // category
  b: string; // block
}

export interface UcdJson {
  version: string;
  records: Record<string, UcdRecord>;
  blocks: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  Lu: "Uppercase Letter",
  Ll: "Lowercase Letter",
  Lt: "Titlecase Letter",
  Lm: "Modifier Letter",
  Lo: "Other Letter",
  Mn: "Nonspacing Mark",
  Mc: "Spacing Mark",
  Me: "Enclosing Mark",
  Nd: "Decimal Number",
  Nl: "Letter Number",
  No: "Other Number",
  Pc: "Connector Punctuation",
  Pd: "Dash Punctuation",
  Ps: "Open Punctuation",
  Pe: "Close Punctuation",
  Pi: "Initial Punctuation",
  Pf: "Final Punctuation",
  Po: "Other Punctuation",
  Sm: "Math Symbol",
  Sc: "Currency Symbol",
  Sk: "Modifier Symbol",
  So: "Other Symbol",
  Zs: "Space Separator",
  Zl: "Line Separator",
  Zp: "Paragraph Separator",
  Cc: "Control",
  Cf: "Format",
  Cs: "Surrogate",
  Co: "Private Use",
  Cn: "Unassigned",
};

export function categoryLabel(code: string): string {
  return CATEGORY_LABELS[code] ?? code;
}

export function lookupRecord(
  records: Record<string, UcdRecord> | null,
  cp: number,
): UcdRecord | null {
  if (!records) return null;
  const hex = cp.toString(16).toUpperCase().padStart(4, "0");
  const keys = [hex, hex.padStart(5, "0"), hex.padStart(6, "0")];
  for (const k of keys) {
    if (records[k]) return records[k];
  }
  return null;
}
