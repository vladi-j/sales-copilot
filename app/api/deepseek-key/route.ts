import { NextResponse, type NextRequest } from "next/server";

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    key: process.env.DEEPSEEK_API_KEY ?? "",
  });
  
  response.headers.set("Cache-Control", "no-store");
  return response;
} 