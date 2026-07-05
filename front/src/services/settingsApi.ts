import { api as http } from './httpClient';

const BASE = '/api/settings';

export async function fetchSettings(): Promise<Record<string, string>> {
  const data = await http<{ settings: Record<string, string> }>(BASE, '');
  return data.settings ?? {};
}

export async function saveSettings(settings: Record<string, string>): Promise<void> {
  await http(BASE, '', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}
