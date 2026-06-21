import { NextResponse } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req: Request) {
  try {
    // Check if API key is configured
    const apiKey = process.env.NV_API_KEY;
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error("ai-proxy: NV_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "API key not configured", details: "NV_API_KEY env var is missing" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const res = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    // If OK, return the NVIDIA response as-is
    if (res.ok) {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse error body for diagnostics
    let parsedBody: any = text;
    try {
      parsedBody = JSON.parse(text);
    } catch (e) {
      parsedBody = text;
    }

    // Log and forward the error from NVIDIA
    // eslint-disable-next-line no-console
    console.error("ai-proxy: NVIDIA returned error", { status: res.status, body: parsedBody });

    return NextResponse.json(
      { error: true, status: res.status, body: parsedBody },
      { status: res.status }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("ai-proxy error:", err);
    return NextResponse.json(
      { error: "Proxy error", details: String(err) },
      { status: 500 }
    );
  }
}