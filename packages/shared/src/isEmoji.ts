export function isEmoji(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return false;
  return (
    (cp >= 0x1f300 && cp <= 0x1f5ff) || // Misc Symbols and Pictographs
    (cp >= 0x1f600 && cp <= 0x1f64f) || // Emoticons
    (cp >= 0x1f680 && cp <= 0x1f6ff) || // Transport & Map
    (cp >= 0x1f700 && cp <= 0x1f77f) || // Alchemical Symbols
    (cp >= 0x1f900 && cp <= 0x1f9ff) || // Supplemental Symbols and Pictographs
    (cp >= 0x2600 && cp <= 0x26ff) || // Misc symbols
    (cp >= 0x2700 && cp <= 0x27bf) || // Dingbats
    (cp >= 0xfe00 && cp <= 0xfe0f) || // Variation Selectors
    (cp >= 0x1fa70 && cp <= 0x1faff) || // Symbols and Pictographs Extended-A
    (cp >= 0x1f1e6 && cp <= 0x1f1ff) // Regional Indicator (flags)
  );
}
