import { getDevEmail, getDevRole, isDevBypassEnabled } from "@/lib/dev-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const devBypass = isDevBypassEnabled();

  if (devBypass && typeof window !== "undefined") {
    const email = getDevEmail();
    const role = getDevRole();
    headers["x-dev-user"] = `${email}|${role}`;
    return headers;
  }

  try {
    const tokenRes = await fetch("/api/auth/token");
    if (tokenRes.ok) {
      const json = (await tokenRes.json()) as { accessToken?: string };
      if (json.accessToken) {
        headers.Authorization = `Bearer ${json.accessToken}`;
      }
    }
  } catch {

  }

  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  const json = (await res.json()) as { data?: T };
  return (json.data ?? json) as T;
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  const json = (await res.json()) as { data?: T };
  return (json.data ?? json) as T;
}

export function formatPrice(priceCents: number, currency = "usd") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);
}
