export interface EmojiComponent {
  codepoint: number;
  hex: string;
  char: string;
  role: "emoji" | "zwj" | "skin_tone" | "variation_selector" | "keycap" | "regional_indicator" | "tag" | "other";
  label: string;
}

export interface EmojiCluster {
  input: string;
  components: EmojiComponent[];
}

const FITZPATRICK = [0x1f3fb, 0x1f3fc, 0x1f3fd, 0x1f3fe, 0x1f3ff];
const REGIONAL_INDICATOR = { start: 0x1f1e6, end: 0x1f1ff };
const TAG_CHARS = { start: 0xe0020, end: 0xe007e };
const TAG_TERM = 0xe007f;

function componentRole(cp: number): EmojiComponent["role"] {
  if (cp === 0x200d) return "zwj";
  if (cp === 0xfe0f || cp === 0xfe0e) return "variation_selector";
  if (FITZPATRICK.includes(cp)) return "skin_tone";
  if (cp === 0x20e3) return "keycap";
  if (cp >= REGIONAL_INDICATOR.start && cp <= REGIONAL_INDICATOR.end) return "regional_indicator";
  if ((cp >= TAG_CHARS.start && cp <= TAG_CHARS.end) || cp === TAG_TERM) return "tag";
  // Check if it's in a known emoji range
  if (isInEmojiRange(cp)) return "emoji";
  return "other";
}

function componentLabel(cp: number, role: EmojiComponent["role"]): string {
  switch (role) {
    case "zwj":
      return "Zero Width Joiner (ZWJ)";
    case "variation_selector":
      return cp === 0xfe0f ? "Variation Selector-16 (emoji style)" : "Variation Selector-15 (text style)";
    case "skin_tone": {
      const tones = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"];
      return `Fitzpatrick Modifier: ${tones[cp - 0x1f3fb] ?? ""}`;
    }
    case "keycap":
      return "Combining Enclosing Keycap";
    case "regional_indicator": {
      const letter = String.fromCodePoint(cp - REGIONAL_INDICATOR.start + 0x41);
      return `Regional Indicator Symbol Letter ${letter}`;
    }
    case "tag":
      return cp === TAG_TERM ? "Tag Terminator (U+E007F)" : `Tag Character U+${cp.toString(16).toUpperCase().padStart(5, "0")}`;
    default:
      return "";
  }
}

function isInEmojiRange(cp: number): boolean {
  return (
    (cp >= 0x1f300 && cp <= 0x1f5ff) ||
    (cp >= 0x1f600 && cp <= 0x1f64f) ||
    (cp >= 0x1f680 && cp <= 0x1f6ff) ||
    (cp >= 0x1f700 && cp <= 0x1f77f) ||
    (cp >= 0x1f900 && cp <= 0x1f9ff) ||
    (cp >= 0x2600 && cp <= 0x26ff) ||
    (cp >= 0x2700 && cp <= 0x27bf) ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0x1fa70 && cp <= 0x1faff) ||
    (cp >= 0x1f1e6 && cp <= 0x1f1ff)
  );
}

export function analyzeEmoji(input: string): EmojiCluster[] {
  // Split into grapheme clusters
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const segments = Array.from(segmenter.segment(input));

  return segments.map((seg) => {
    const chars = Array.from(seg.segment);
    const components: EmojiComponent[] = chars.map((ch) => {
      const cp = ch.codePointAt(0)!;
      const role = componentRole(cp);
      return {
        codepoint: cp,
        hex: cp.toString(16).toUpperCase().padStart(4, "0"),
        char: ch,
        role,
        label: componentLabel(cp, role),
      };
    });
    return { input: seg.segment, components };
  });
}
