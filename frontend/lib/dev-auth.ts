export type DevRole = "BUYER" | "SELLER" | "ADMIN";

const ROLE_KEY = "dev_role";
const EMAIL_KEY = "dev_email";
const EVENT_NAME = "prosets-dev-auth-changed";

export function isDevBypassEnabled() {
  return process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
}

export function getDevRole(): DevRole {
  if (typeof window === "undefined") return "BUYER";
  const value = (localStorage.getItem(ROLE_KEY) ?? "BUYER").toUpperCase();
  if (value === "SELLER" || value === "ADMIN") return value;
  return "BUYER";
}

export function getDevEmail() {
  if (typeof window === "undefined") return "buyer@prosets.dev";
  return localStorage.getItem(EMAIL_KEY) ?? "buyer@prosets.dev";
}

export function setDevAuth(role: DevRole, email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function clearDevAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeDevAuth(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}
