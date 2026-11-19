/**
 * Utility for robust API requests that safely parses JSON, retries transient
 * network connection drops ("Failed to fetch") or 502/503/504 proxy warm-ups,
 * and handles HTML error pages without throwing raw JSON syntax errors.
 */
export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
  maxNetworkRetries = 2
): Promise<T> {
  let response: Response | null = null;
  let rawBody = '';
  let contentType = '';
  let isHtml = false;
  let lastNetworkError: any = null;

  for (let attempt = 0; attempt <= maxNetworkRetries; attempt++) {
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        },
      });

      contentType = response.headers.get('content-type') || '';
      rawBody = await response.text();
      const trimmed = rawBody.trim().toLowerCase();

      isHtml =
        contentType.includes('text/html') ||
        trimmed.startsWith('<!doctype') ||
        trimmed.startsWith('<html') ||
        trimmed.startsWith('<');

      // Retry transient 502/503/504 gateway responses or proxy warmup HTML pages (which nginx serves as HTTP 200)
      const isTransientProxyResponse =
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504 ||
        (isHtml && response.status !== 404 && response.status !== 429);

      if (isTransientProxyResponse && attempt < maxNetworkRetries) {
        await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
        continue;
      }

      break;
    } catch (networkErr: any) {
      lastNetworkError = networkErr;
      if (attempt < maxNetworkRetries) {
        await new Promise((resolve) => setTimeout(resolve, 900 * (attempt + 1)));
        continue;
      }
    }
  }

  if (!response) {
    throw new Error(
      `Unable to reach the server (${lastNetworkError?.message || 'connection interrupted'}). Please try again.`
    );
  }

  if (isHtml) {
    if (
      response.status === 429 ||
      rawBody.includes('429') ||
      rawBody.toLowerCase().includes('quota') ||
      rawBody.toLowerCase().includes('resource_exhausted')
    ) {
      throw new Error('Daily limit reached, try again tomorrow');
    }
    if (response.status === 404) {
      throw new Error(
        `The API service is currently starting up or the route was not found (HTTP 404). Please try again in a few seconds.`
      );
    }
    throw new Error(
      `The AI service is temporarily warming up or busy. Please try again in a few seconds.`
    );
  }

  // Parse JSON safely
  let data: any;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new Error(
      `Invalid server response format. Please retry your request.`
    );
  }

  if (!response.ok) {
    const errorStr = String(data?.error || '');
    if (
      response.status === 429 ||
      errorStr.includes('Daily limit') ||
      errorStr.includes('429') ||
      errorStr.toLowerCase().includes('quota') ||
      errorStr.toLowerCase().includes('resource_exhausted') ||
      errorStr.toLowerCase().includes('resource has been exhausted')
    ) {
      throw new Error('Daily limit reached, try again tomorrow');
    }
    throw new Error(data?.error || `Server request failed with status ${response.status}.`);
  }

  return data as T;
}
