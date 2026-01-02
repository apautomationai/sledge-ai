import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return handleRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, "DELETE");
}

async function handleRequest(request: NextRequest, method: string) {
  try {
    // Get the backend API URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend API URL not configured" },
        { status: 500 }
      );
    }

    // Get cookies from the incoming request headers
    const cookieHeader = request.headers.get("cookie") || "";

    // Get query parameters from the incoming request
    const url = new URL(request.url);
    const queryString = url.search;

    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      "Content-Type": request.headers.get("content-type") || "application/json",
    };

    // Add cookie header if cookies exist
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    // Forward authorization header if it exists
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Forward the request to the backend
    // Use redirect: 'manual' to handle redirects ourselves
    const backendResponse = await fetch(
      `${backendUrl}/api/v1/auth/gmail/callback${queryString}`,
      {
        method,
        headers,
        body: method !== "GET" && method !== "DELETE" ? await request.text() : undefined,
        redirect: 'manual', // Don't follow redirects automatically
      }
    );

    // Handle redirect responses from backend
    if (backendResponse.status >= 300 && backendResponse.status < 400) {
      const location = backendResponse.headers.get('location');
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    // Handle success responses (200)
    if (backendResponse.status === 200) {
      // Always redirect to integrations page
      // The OnboardingRedirectHandler will check localStorage and redirect to dashboard if needed
      const redirectUrl = new URL("/integrations", request.url);
      redirectUrl.searchParams.set("type", "integration.gmail");
      redirectUrl.searchParams.set("message", "Gmail successfully integrated");
      return NextResponse.redirect(redirectUrl);
    }

    // Handle error responses
    const errorData = await backendResponse.json().catch(() => ({}));
    const errorMessage = errorData.message || "Failed to connect Gmail";
    const redirectUrl = new URL("/integrations", request.url);
    redirectUrl.searchParams.set("type", "error");
    redirectUrl.searchParams.set("message", encodeURIComponent(errorMessage));
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error forwarding request to backend:", error);
    return NextResponse.json(
      { error: "Failed to forward request" },
      { status: 500 }
    );
  }
}

