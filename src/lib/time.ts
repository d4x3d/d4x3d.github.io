const tzMap: Record<string, string> = {
  Nigeria: 'Africa/Lagos',
  Lagos: 'Africa/Lagos',
  'United States': 'America/New_York',
  London: 'Europe/London',
};

export function guessTimeZoneFromLocation(location?: string | null): string | undefined {
  if (!location) return undefined;
  const key = location.trim();
  for (const k of Object.keys(tzMap)) if (key.toLowerCase().includes(k.toLowerCase())) return tzMap[k];
  return undefined;
}

export function formatLocalTime(location?: string | null) {
  const tz = guessTimeZoneFromLocation(location);
  try {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }
}
