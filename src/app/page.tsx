"use client";

import { useState } from "react";

interface Step {
  title: string;
  content: string;
  sourcesCount: number;
}

interface Report {
  query: string;
  executiveSummary: string;
  steps: Step[];
  totalSources: number;
  generatedAt: string;
  method: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const isAr = lang === "ar";

  const run = async () => {
    if (query.trim().length < 3) {
      setError(isAr ? "أدخل سؤالاً واضحاً (3 أحرف على الأقل)" : "Enter a clear question (min 3 characters)");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setProgress(isAr ? "① تخطيط وتقسيم الموضوع..." : "① Planning & expanding query...");

    const timers = [
      setTimeout(() => setProgress(isAr ? "② البحث في مصادر متعددة..." : "② Searching multiple sources..."), 1800),
      setTimeout(() => setProgress(isAr ? "③ تحليل وتجميع النتائج..." : "③ Analyzing & aggregating..."), 4500),
      setTimeout(() => setProgress(isAr ? "④ صياغة التقرير النهائي..." : "④ Synthesizing final report..."), 7500),
    ];

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), lang }),
      });
      const data = await res.json();

      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || (isAr ? "فشل البحث" : "Research failed"));
      }
    } catch (e: any) {
      setError(e.message || (isAr ? "خطأ في الاتصال" : "Network error"));
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen text-slate-100" dir={isAr ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-30 border-b border-indigo-900/40 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm">
              DR
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
                Deep Research
              </h1>
              <p className="text-[11px] text-slate-400">
                {isAr ? "بحث عميق متعدد الخطوات · مشابه لـ Gemini" : "Multi-step deep research · Gemini-inspired"}
              </p>
            </div>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "ar" | "en")}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-slate-900/70 border border-indigo-900/30 rounded-2xl p-5 shadow-xl mb-8">
          <label className="block text-sm font-medium text-indigo-300 mb-2">
            {isAr ? "موضوع البحث أو السؤال" : "Research topic or question"}
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder={isAr ? "مثال: تأثير الذكاء الاصطناعي على سوق العمل 2026..." : "Example: Impact of AI on the job market in 2026..."}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={run}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loader" />
                  {isAr ? "جاري البحث العميق..." : "Deep researching..."}
                </>
              ) : (
                <>🔍 {isAr ? "ابدأ البحث العميق" : "Start Deep Research"}</>
              )}
            </button>
            {progress && <span className="text-sm text-indigo-300 animate-pulse">{progress}</span>}
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        {!report && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { n: "1", t: isAr ? "تخطيط" : "Plan", d: isAr ? "تقسيم إلى محاور" : "Expand into angles" },
              { n: "2", t: isAr ? "بحث" : "Search", d: isAr ? "مصادر متعددة" : "Multiple sources" },
              { n: "3", t: isAr ? "تحليل" : "Analyze", d: isAr ? "تجميع وتصفية" : "Aggregate & filter" },
              { n: "4", t: isAr ? "تقرير" : "Report", d: isAr ? "مع استشهادات" : "With citations" },
            ].map((s) => (
              <div key={s.n} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                <div className="w-7 h-7 mx-auto mb-2 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">{s.n}</div>
                <div className="font-semibold text-indigo-300 text-sm">{s.t}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.d}</div>
              </div>
            ))}
          </div>
        )}

        {report && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-indigo-950/90 to-violet-950/80 border border-indigo-700/40 rounded-2xl p-5">
              <h2 className="text-xl font-bold text-white mb-1">
                {isAr ? "تقرير البحث العميق" : "Deep Research Report"}
              </h2>
              <p className="text-indigo-200 text-sm mb-3">{report.query}</p>
              <p className="text-slate-300 text-sm leading-relaxed">{report.executiveSummary}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>📚 {report.totalSources} {isAr ? "مصدر" : "sources"}</span>
                <span>🕒 {new Date(report.generatedAt).toLocaleString(isAr ? "ar" : "en")}</span>
                <span className="text-indigo-400">{report.method}</span>
              </div>
            </div>

            {report.steps.map((step, i) => (
              <div
                key={i}
                className="step-card bg-slate-900/70 border border-slate-800 rounded-2xl p-5"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-indigo-200">{step.title}</h3>
                  <span className="text-[11px] text-slate-500 ms-auto shrink-0">
                    {step.sourcesCount} {isAr ? "مصدر" : "src"}
                  </span>
                </div>
                <div
                  className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: step.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
                      .replace(/\[↗\]\((.*?)\)/g, `<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">↗</a>`),
                  }}
                />
              </div>
            ))}

            <p className="text-center text-[11px] text-slate-500 pt-2">
              {isAr
                ? "مصادر: Google News · BBC · The Guardian · النتائج تعتمد على توفر المصادر العامة"
                : "Sources: Google News · BBC · The Guardian · Results depend on public feed availability"}
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-5 text-center text-[11px] text-slate-500">
        Deep Research Tool · Inspired by Gemini Deep Research · Next.js + real RSS sources
      </footer>
    </div>
  );
}
