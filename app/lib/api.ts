// app/lib/api.ts
import { API_BASE_URL, authHeaders } from '../../utils/api';

export type TileDto = {
  id: string;
  label: string;
  lang?: string;        // e.g. 'en-US' | 'hi-IN'
  core?: boolean;
  imageUri?: string;    // absolute URL: http://<PC_IP>:4000/tiles/water.png
};

export async function fetchTiles(): Promise<TileDto[]> {
  const res = await fetch(`${API_BASE_URL}/api/content/tiles`, {
    headers: await authHeaders(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Tiles HTTP ${res.status} – ${text}`);
  return JSON.parse(text);
}
