import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabaseAdmin";

type ServerAuthResult =
  | { user: User; error: null }
  | { user: null; error: "server_not_configured" | "missing_token" | "invalid_token" };

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  const token = authorization.slice(7).trim();
  return token.length > 0 ? token : null;
}

export async function requireAuthenticatedUser(
  request: NextRequest
): Promise<ServerAuthResult> {
  if (!isSupabaseAdminConfigured) {
    return { user: null, error: "server_not_configured" };
  }

  const token = getBearerToken(request);
  if (!token) {
    return { user: null, error: "missing_token" };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "invalid_token" };
  }

  return { user, error: null };
}
