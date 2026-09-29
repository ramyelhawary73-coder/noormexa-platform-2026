import { createNoormexaIconResponse } from "@/lib/noormexaIconResponse";

export function GET(request: Request) {
  return createNoormexaIconResponse(192, "any", request.url);
}
