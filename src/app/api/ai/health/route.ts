import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();

  try {
    if (provider === 'openai') {
      const key = process.env.OPENAI_API_KEY;
      if (!key) {
        return NextResponse.json({ ok: false, provider, error: 'OPENAI_API_KEY not configured' }, { status: 500 });
      }

      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) {
        let body: any;
        try { body = await res.json(); } catch { body = await res.text(); }
        return NextResponse.json({ ok: false, provider, status: res.status, body }, { status: 500 });
      }

      const data: any = await res.json();
      const models = Array.isArray(data?.data) ? data.data : [];
      const sample = models.slice(0, 5).map((m: any) => m.id);
      return NextResponse.json({ ok: true, provider, check: 'models', count: models.length, sample });
    }

    // Default: gemini
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json({ ok: false, provider: 'gemini', error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
    if (!res.ok) {
      let body: any;
      try { body = await res.json(); } catch { body = await res.text(); }
      return NextResponse.json({ ok: false, provider: 'gemini', status: res.status, body }, { status: 500 });
    }

    const data: any = await res.json();
    const models = Array.isArray(data?.models) ? data.models : [];
    const sample = models.slice(0, 5).map((m: any) => (m?.name || '').replace(/^models\//, ''));
    return NextResponse.json({ ok: true, provider: 'gemini', check: 'models', count: models.length, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, provider, error: e?.message || String(e) }, { status: 500 });
  }
}

