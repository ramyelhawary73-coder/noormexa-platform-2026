import { createNoormexaIconResponse } from "@/lib/noormexaIconResponse";

export const dynamic = "force-static";

export function GET() {
  return createNoormexaIconResponse(512, "any");
}
