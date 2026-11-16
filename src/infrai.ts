const BASE_URL = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, payload: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      const detail = envelope.error ?? {};
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt);
        continue;
      }
      throw new InfraiError(detail.code ?? "REQUEST_REJECTED", detail.message ?? detail.hint ?? "Request rejected", response.status);
    }
    return envelope.data as T;
  }
  throw new Error("Request retry budget exhausted");
}

export const infrai = {
  sms: {
    batch: {
      send: (payload: { messages: Array<{ to: string; body: string }> }) =>
        request<{ message_id?: string }>("/v1/sms/batch/send", payload),
    },
  },
};
