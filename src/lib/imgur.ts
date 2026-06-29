/**
 * Imgur adapter — anonymous image upload on the free tier.
 *
 * Uses an anonymous Client-ID (no user OAuth): ~1,250 uploads/day, 12,500
 * requests/day. Returns the hosted URL plus the `deletehash` so the caller can
 * later delete the image without an account. The Client-ID is read from
 * `VITE_IMGUR_CLIENT_ID`; uploads are refused until it is configured.
 */

const IMGUR_ENDPOINT = 'https://api.imgur.com/3/image';
const CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID;
const PLACEHOLDER = 'REPLACE_WITH_IMGUR_CLIENT_ID';

export interface ImgurUpload {
  /** Direct link to the hosted image. */
  url: string;
  /** Anonymous delete token — store this to allow later removal. */
  deletehash: string;
  /** Imgur image id. */
  id: string;
  width: number;
  height: number;
}

/** Thrown for any non-success Imgur response, including rate limits. */
export class ImgurError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly rateLimited = false,
  ) {
    super(message);
    this.name = 'ImgurError';
  }
}

/** True once a real Client-ID has been provided in the environment. */
export function imgurConfigured(): boolean {
  return Boolean(CLIENT_ID) && CLIENT_ID !== PLACEHOLDER;
}

interface ImgurApiResponse {
  success: boolean;
  status: number;
  data: {
    link?: string;
    deletehash?: string;
    id?: string;
    width?: number;
    height?: number;
    error?: string | { message?: string };
  };
}

/**
 * Upload an image file to Imgur anonymously.
 * @throws {ImgurError} when the Client-ID is missing or Imgur rejects the upload.
 */
export async function uploadImage(file: File | Blob): Promise<ImgurUpload> {
  if (!imgurConfigured()) {
    throw new ImgurError(
      'Imgur is not configured. Set VITE_IMGUR_CLIENT_ID in your .env to enable uploads.',
    );
  }

  const body = new FormData();
  body.append('image', file);

  let res: Response;
  try {
    res = await fetch(IMGUR_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Client-ID ${CLIENT_ID}` },
      body,
    });
  } catch (cause) {
    throw new ImgurError(`Network error while reaching Imgur: ${String(cause)}`);
  }

  // 429 (rate limit) and 403 (over daily quota) both signal the free-tier cap.
  if (res.status === 429 || res.status === 403) {
    throw new ImgurError(
      'Imgur upload limit reached. Try again later.',
      res.status,
      true,
    );
  }

  let payload: ImgurApiResponse;
  try {
    payload = (await res.json()) as ImgurApiResponse;
  } catch {
    throw new ImgurError(`Imgur returned an unreadable response.`, res.status);
  }

  if (!res.ok || !payload.success || !payload.data?.link) {
    const raw = payload.data?.error;
    const detail = typeof raw === 'string' ? raw : raw?.message;
    throw new ImgurError(detail ?? 'Imgur upload failed.', res.status);
  }

  const d = payload.data;
  return {
    url: d.link as string,
    deletehash: d.deletehash ?? '',
    id: d.id ?? '',
    width: d.width ?? 0,
    height: d.height ?? 0,
  };
}

/**
 * Delete a previously uploaded anonymous image by its deletehash.
 * Best-effort: returns false on any failure rather than throwing.
 */
export async function deleteImage(deletehash: string): Promise<boolean> {
  if (!imgurConfigured() || !deletehash) return false;
  try {
    const res = await fetch(`${IMGUR_ENDPOINT}/${deletehash}`, {
      method: 'DELETE',
      headers: { Authorization: `Client-ID ${CLIENT_ID}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
