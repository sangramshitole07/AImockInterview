import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type ErrorBody = {
  ok: false;
  errorCode:
    | 'MISSING_GEMINI_API_KEY'
    | 'INVALID_REQUEST'
    | 'UPSTREAM_SERVICE_ERROR'
    | 'INTERNAL_SERVER_ERROR';
  message: string;
  details?: unknown;
};

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[CopilotKit] GEMINI_API_KEY is missing. Set it in your environment (.env.local)');
}

const serviceAdapter = new GoogleGenerativeAIAdapter({
  apiKey: apiKey || '',
  model: 'gemini-2.0-flash',
});

const runtime = new CopilotRuntime();

function jsonError(body: ErrorBody, status: number) {
  return NextResponse.json(body, { status });
}

export const POST = async (req: NextRequest) => {
  if (!apiKey) {
    return jsonError(
      {
        ok: false,
        errorCode: 'MISSING_GEMINI_API_KEY',
        message:
          'GEMINI_API_KEY is not set. Define GEMINI_API_KEY in .env.local to enable interviewing and chat.',
      },
      500,
    );
  }

  try {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });

    return await handleRequest(req);
  } catch (error: any) {
    // Identify common upstream errors for clearer client messaging
    const statusText = error?.statusText || error?.message || 'Unknown error';
    const isAuth = /unauthorized|forbidden|401|403|invalid api key/i.test(String(statusText));
    const errorCode: ErrorBody['errorCode'] = isAuth
      ? 'UPSTREAM_SERVICE_ERROR'
      : 'INTERNAL_SERVER_ERROR';

    return jsonError(
      {
        ok: false,
        errorCode,
        message: isAuth
          ? 'Gemini API rejected the request. Check GEMINI_API_KEY value and permissions.'
          : 'Failed to process AI request due to an unexpected error.',
        details: {
          statusText,
        },
      },
      isAuth ? 502 : 500,
    );
  }
};

export const GET = async () =>
  NextResponse.json(
    {
      ok: false,
      errorCode: 'INVALID_REQUEST',
      message: 'Use POST at /api/copilotkit for AI chat requests.',
    },
    { status: 405 },
  );
