import { auth0 } from "@/lib/auth0";

export async function GET() {
  if (!auth0) {
    return Response.json({ accessToken: null });
  }
  try {
    const token = await auth0.getAccessToken();
    return Response.json({ accessToken: token.token ?? null });
  } catch {
    return Response.json({ accessToken: null });
  }
}
