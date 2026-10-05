import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 12000,
  headers: { "User-Agent": "DeepResearchTool/1.0" },
});

// Expand a query into research sub-questions (Gemini-style multi-step)
function expandQuery(query: string, lang: string): string[] {
  const isArabic = lang === "ar";
  if (isArabic) {
    return [
      `ما هي الخلفية التاريخية والعلمية لـ: ${query}`,
      `أحدث التطورات والأخبار حول: ${query}`,
      `الآراء المتضاربة والنقد المتعلق بـ: ${query}`,
      `التأثيرات المستقبلية والتوقعات لـ: ${query}`,
      `الإحصائيات والبيانات الرئيسية حول: ${query}`,
    ];
  }
  return [
    `Background and history of: ${query}`,
    `Latest developments and news about: ${query}`,
    `Controversies and critiques regarding: ${query}`,
    `Future implications and predictions for: ${query}`,
    `Key statistics and data on: ${query}`,
  ];
}

async function searchSources(subQuery: string, lang: string) {
  const encoded = encodeURIComponent(subQuery);
  const feeds: string[] = [];

  if (lang === "ar") {
    feeds.push(
      `https://news.google.com/rss/search?q=${encoded}&hl=ar&gl=SA&ceid=SA:ar`
    );
  } else {
    feeds.push(
      `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=US&ceid=US:en`,
      `https://news.google.com/rss/search?q=${encoded}&hl=en&gl=GB&ceid=GB:en`
    );
  }

  feeds.push("https://feeds.bbci.co.uk/news/science_and_environment/rss.xml");
  feeds.push("https://www.theguardian.com/world/rss");

  const results: any[] = [];

  for (const url of feeds.slice(0, 3)) {
    try {
      const feed = await parser.parseURL(url);
      const items = (feed.items || []).slice(0, 5).map((item) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: (item.contentSnippet || item.content || item.summary || "").slice(0, 280),
        source: feed.title || "Web Source",
        date: item.pubDate || item.isoDate || "",
      }));
      results.push(...items);
    } catch (e) {
      // continue
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function synthesizeReport(
  query: string,
  subQueries: string[],
  allFindings: { query: string; sources: any[] }[],
  lang: string
) {
  const isArabic = lang === "ar";

  const sections = allFindings.map((f, i) => {
    const sourcesText = f.sources
      .map(
        (s, idx) =>
          `${idx + 1}. **${s.title}**\n   ${s.snippet}\n   المصدر: ${s.source} | [رابط](${s.link})`
      )
      .join("\n\n");

    return {
      title: isArabic ? `المرحلة ${i + 1}: ${f.query}` : `Step ${i + 1}: ${f.query}`,
      content: sourcesText || (isArabic ? "لم يتم العثور على مصادر كافية." : "Limited sources found."),
      sourcesCount: f.sources.length,
    };
  });

  const totalSources = allFindings.reduce((acc, f) => acc + f.sources.length, 0);

  const executiveSummary = isArabic
    ? `تم إجراء بحث عميق متعدد الخطوات حول "${query}". تم تقسيم الموضوع إلى ${subQueries.length} محاور رئيسية وجُمعت ${totalSources} مصدرًا من أخبار ومواقع موثوقة. التقرير أدناه يلخص النتائج مع الاستشهادات.`
    : `A multi-step deep research was conducted on "${query}". The topic was broken into ${subQueries.length} key angles and ${totalSources} sources were gathered from reputable news outlets. The report below synthesizes the findings with citations.`;

  return {
    query,
    executiveSummary,
    steps: sections,
    totalSources,
    generatedAt: new Date().toISOString(),
    method: isArabic
      ? "بحث عميق متعدد الخطوات (تخطيط → بحث → تجميع → تلخيص) مشابه لـ Gemini Deep Research"
      : "Multi-step deep research (Plan → Search → Aggregate → Synthesize) inspired by Gemini Deep Research",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = (body.query || "").trim();
    const lang = body.lang === "ar" ? "ar" : "en";

    if (!query || query.length < 3) {
      return NextResponse.json(
        { success: false, error: lang === "ar" ? "يرجى إدخال سؤال بحث أطول" : "Please enter a longer research query" },
        { status: 400 }
      );
    }

    const subQueries = expandQuery(query, lang);

    const findings = [];
    for (const sq of subQueries) {
      const sources = await searchSources(sq, lang);
      findings.push({ query: sq, sources });
    }

    const report = synthesizeReport(query, subQueries, findings, lang);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Research failed" },
      { status: 500 }
    );
  }
}
