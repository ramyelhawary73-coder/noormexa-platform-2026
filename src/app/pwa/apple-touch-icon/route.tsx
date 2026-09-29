import { createNoormexaIconResponse } from "@/lib/noormexaIconResponse";

export function GET(request: Request) {
  return createNoormexaIconResponse(180, "apple", request.url);
}
