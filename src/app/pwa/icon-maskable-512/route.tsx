import { createNoormexaIconResponse } from "@/lib/noormexaIconResponse";

export function GET(request: Request) {
  return createNoormexaIconResponse(512, "maskable", request.url);
}
