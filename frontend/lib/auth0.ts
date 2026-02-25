import { Auth0Client } from "@auth0/nextjs-auth0/server";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

const devBypassEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

export const auth0Enabled =
  !devBypassEnabled &&
  hasValue(process.env.AUTH0_DOMAIN) &&
  hasValue(process.env.AUTH0_CLIENT_ID) &&
  hasValue(process.env.AUTH0_ISSUER_BASE_URL) &&
  (hasValue(process.env.AUTH0_CLIENT_SECRET) ||
    hasValue(process.env.AUTH0_CLIENT_ASSERTION_SIGNING_KEY)) &&
  hasValue(process.env.AUTH0_SECRET);

export const auth0 = auth0Enabled
  ? new Auth0Client({
      authorizationParameters: {
        audience: process.env.AUTH0_AUDIENCE,
      },
    })
  : null;
