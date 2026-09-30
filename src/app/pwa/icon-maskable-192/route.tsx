import { createNoormexaIconResponse } from "@/lib/noormexaIconResponse";

export function GET(request: Request) {
  return createNoormexaIconResponse(192, "maskable", request.url);
}
