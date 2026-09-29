import { createNoormexaIconResponse } from "@/lib/noormexaIconResponse";

export const dynamic = "force-static";

export function GET() {
  return createNoormexaIconResponse(192, "maskable");
}
