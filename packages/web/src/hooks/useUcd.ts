import { useEffect, useState } from "react";
import type { UcdJson, UcdRecord } from "@moji/shared";
import { lookupRecord, categoryLabel } from "@moji/shared";

// Module-level cache — shared across all components
let cachedData: UcdJson | null = null;
let fetchPromise: Promise<UcdJson> | null = null;

function ensureUcd(): Promise<UcdJson> {
  if (cachedData) return Promise.resolve(cachedData);
  if (!fetchPromise) {
    fetchPromise = fetch("ucd.json")
      .then((r) => r.json())
      .then((json: UcdJson) => {
        cachedData = json;
        return json;
      });
  }
  return fetchPromise;
}

export function useUcd() {
  const [data, setData] = useState<UcdJson | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) return;
    setLoading(true);
    ensureUcd()
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load UCD:", err);
        setLoading(false);
      });
  }, []);

  const lookup = (cp: number): UcdRecord | null => {
    if (!data) return null;
    return lookupRecord(data.records, cp);
  };

  const records = data?.records ?? null;

  return { data, records, loading, lookup, category: categoryLabel };
}
