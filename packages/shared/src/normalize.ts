export interface NormalizationForms {
  nfc: string;
  nfd: string;
  nfkc: string;
  nfkd: string;
}

export function normalizeAll(input: string): NormalizationForms {
  return {
    nfc: input.normalize("NFC"),
    nfd: input.normalize("NFD"),
    nfkc: input.normalize("NFKC"),
    nfkd: input.normalize("NFKD"),
  };
}

export function normalizationDiff(input: string): Array<{
  form: string;
  text: string;
  codepoints: string[];
  changed: boolean;
}> {
  const base = input.normalize("NFC");
  const forms = normalizeAll(input);

  return [
    { form: "NFC", text: forms.nfc, codepoints: codepoints(forms.nfc), changed: forms.nfc !== base },
    { form: "NFD", text: forms.nfd, codepoints: codepoints(forms.nfd), changed: forms.nfd !== base },
    { form: "NFKC", text: forms.nfkc, codepoints: codepoints(forms.nfkc), changed: forms.nfkc !== base },
    { form: "NFKD", text: forms.nfkd, codepoints: codepoints(forms.nfkd), changed: forms.nfkd !== base },
  ];
}

function codepoints(s: string): string[] {
  return Array.from(s).map(
    (ch) => `U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`,
  );
}
