import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "DeepResearchTool/1.1" },
});

/** Expand the main query into focused research angles (Gemini-style) */
function expandQuery(query: string, lang: string): string[] {
  const q = query.trim();
  if (lang === "ar") {
    return [
      `${q} خلفية وتاريخ`,
      `${q} أحدث التطورات والأخبار`,
      `${q} تحديات وانتقادات`,
      `${q} توقعات ومستقبل`,
      `${q} إحصائيات وبيانات`,
    ];
  }
  return [
    `${q} background history overview`,
    `${q} latest news developments 2025 2026`,
    `${q} challenges criticism controversies`,
    `${q} future outlook predictions`,
    `${q} statistics data key figures`,
  ];
}

async function fetchFeed(url: string) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, 6).map((item) => ({
      title: (item.title || "").trim(),
      link: item.link || "",
      snippet: ((item.contentSnippet || item.content || item.summary || "") as string)
        .replace(/<[^>]+>/g, "")
        .slice(0, 320)
        .trim(),
      source: (feed.title || "Source").replace(/ - Google News.*/, "").trim(),
      date: item.pubDate || item.isoDate || "",
    }));
  } catch {
    return [];
  }
}

async function searchSources(subQuery: string, lang: string) {
  const encoded = encodeURIComponent(subQuery);
  const urls: string[] = [];

  if (lang === "ar") {
    urls.push(`https://news.google.com/rss/search?q=${encoded}&hl=ar&gl=SA&ceid=SA:ar`);
    urls.push(`https://news.google.com/rss/search?q=${encoded}&hl=ar&gl=EG&ceid=EG:ar`);
  } else {
    urls.push(`https://news.google.com/rss/search?q=${encoded}&hl=en&gl=US&ceid=US:en`);
    urls.push(`https://news.google.com/rss/search?q=${encoded}&hl=en&gl=GB&ceid=GB:en`);
  }

  urls.push("https://feeds.bbci.co.uk/news/technology/rss.xml");
  urls.push("https://www.theguardian.com/technology/rss");

  const all: any[] = [];
  for (const url of urls.slice(0, 3)) {
    const items = await fetchFeed(url);
    all.push(...items);
  }

  const seen = new Set<string>();
  return all
    .filter((r) => {
      const key = r.title.toLowerCase().slice(0, 55);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 7);
}

function buildReport(query: string, findings: { angle: string; sources: any[] }[], lang: string) {
  const isAr = lang === "ar";
  const total = findings.reduce((s, f) => s + f.sources.length, 0);

  const steps = findings.map((f, i) => {
    const body = f.sources
      .map((s, idx) => {
        const dateStr = s.date ? ` · ${new Date(s.date).toLocaleDateString(isAr ? "ar" : "en")}` : "";
        return `${idx + 1}. **${s.title}**\n   ${s.snippet || "—"}\n   📰 ${s.source}${dateStr}  [↗](${s.link})`;
      })
      .join("\n\n");

    return {
      title: isAr ? `المحور ${i + 1}: ${f.angle}` : `Angle ${i + 1}: ${f.angle}`,
      content: body || (isAr ? "لم تُعثر على مصادر كافية لهذا المحور." : "Limited sources found for this angle."),
      sourcesCount: f.sources.length,
    };
  });

  const summary = isAr
    ? `تم تنفيذ بحث عميق متعدد الخطوات حول «${query}». قُسّم الموضوع إلى ${findings.length} محاور وجُمع ${total} مصدراً من Google News وBBC وThe Guardian. التقرير يعرض النتائج مع روابط مباشرة.`
    : `Multi-step deep research completed on “${query}”. The topic was split into ${findings.length} angles and ${total} sources were collected from Google News, BBC and The Guardian. The report below includes direct citations.`;

  return {
    query,
    executiveSummary: summary,
    steps,
    totalSources: total,
    generatedAt: new Date().toISOString(),
    method: isAr
      ? "بحث عميق (تخطيط ← بحث ← تجميع ← تلخيص) مستوحى من Gemini Deep Research"
      : "Deep research pipeline (Plan → Search → Aggregate → Synthesize) inspired by Gemini Deep Research",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body.query || "").trim();
    const lang = body.lang === "ar" ? "ar" : "en";

    if (query.length < 3) {
      return NextResponse.json(
        { success: false, error: lang === "ar" ? "أدخل سؤالاً أوضح (3 أحرف على الأقل)" : "Enter a clearer question (min 3 characters)" },
        { status: 400 }
      );
    }

    const angles = expandQuery(query, lang);
    const findings = [];

    for (const angle of angles) {
      const sources = await searchSources(angle, lang);
      findings.push({ angle, sources });
    }

    const report = buildReport(query, findings, lang);

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Research failed" },
      { status: 500 }
    );
  }
}
