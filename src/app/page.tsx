"use client";

import { useState } from "react";

interface Source {
  title: string;
  link: string;
  snippet: string;
  source: string;
  date: string;
}

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

  const runResearch = async () => {
    if (!query.trim() || query.trim().length < 3) {
      setError(isAr ? "أدخل سؤال بحث واضح (3 أحرف على الأقل)" : "Enter a clear research question (min 3 chars)");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setProgress(isAr ? "جاري تخطيط البحث وتقسيم الموضوع..." : "Planning research & breaking down the topic...");

    try {
      setTimeout(() => setProgress(isAr ? "جاري البحث في مصادر متعددة..." : "Searching multiple sources..."), 1500);
      setTimeout(() => setProgress(isAr ? "جاري تحليل وتجميع النتائج..." : "Analyzing and aggregating findings..."), 4000);
      setTimeout(() => setProgress(isAr ? "جاري صياغة التقرير النهائي..." : "Synthesizing final report..."), 7000);

      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), lang }),
      });

      const data = await res.json();

      if (data.success) {
        setReport(data.report);
        setProgress("");
      } else {
        setError(data.error || (isAr ? "فشل البحث" : "Research failed"));
      }
    } catch (e: any) {
      setError(e.message || (isAr ? "خطأ في الاتصال" : "Connection error"));
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen text-slate-100" dir={isAr ? "rtl" : "ltr"}>
      <header className="border-b border-indigo-900/50 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
              DR
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text text-transparent">
                Deep Research
              </h1>
              <p className="text-xs text-slate-400">
                {isAr ? "أداة بحث عميق متعددة الخطوات · مشابهة لـ Gemini" : "Multi-step deep research · Gemini-inspired"}
              </p>
            </div>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as "ar" | "en")}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-slate-900/70 border border-indigo-900/40 rounded-2xl p-6 shadow-2xl mb-8">
          <label className="block text-sm font-medium text-indigo-300 mb-2">
            {isAr ? "موضوع البحث أو السؤال" : "Research topic or question"}
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder={
              isAr
                ? "مثال: تأثير الذكاء الاصطناعي على سوق العمل في 2026..."
                : "Example: Impact of AI on the job market in 2026..."
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            disabled={loading}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={runResearch}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loader" />
                  {isAr ? "جاري البحث العميق..." : "Deep researching..."}
                </>
              ) : (
                <>
                  <span>🔍</span>
                  {isAr ? "ابدأ البحث العميق" : "Start Deep Research"}
                </>
              )}
            </button>
            {progress && (
              <span className="text-sm text-indigo-300 animate-pulse">{progress}</span>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        {!report && !loading && (
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: "1️⃣", title: isAr ? "تخطيط" : "Plan", desc: isAr ? "تقسيم الموضوع إلى محاور" : "Break topic into angles" },
              { icon: "2️⃣", title: isAr ? "بحث" : "Search", desc: isAr ? "مصادر متعددة وموثوقة" : "Multiple trusted sources" },
              { icon: "3️⃣", title: isAr ? "تحليل" : "Analyze", desc: isAr ? "تجميع وتصفية النتائج" : "Aggregate & filter results" },
              { icon: "4️⃣", title: isAr ? "تقرير" : "Report", desc: isAr ? "صياغة منظمة مع استشهادات" : "Structured report + citations" },
            ].map((s, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-semibold text-indigo-300">{s.title}</div>
                <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        )}

        {report && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-700/50 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isAr ? "تقرير البحث العميق" : "Deep Research Report"}
                  </h2>
                  <p className="text-indigo-200 text-sm mb-3">{report.query}</p>
                  <p className="text-slate-300 leading-relaxed">{report.executiveSummary}</p>
                </div>
                <div className="text-right text-sm text-slate-400 space-y-1">
                  <div>📚 {report.totalSources} {isAr ? "مصدر" : "sources"}</div>
                  <div>🕒 {new Date(report.generatedAt).toLocaleString(isAr ? "ar" : "en")}</div>
                  <div className="text-xs text-indigo-400">{report.method}</div>
                </div>
              </div>
            </div>

            {report.steps.map((step, idx) => (
              <div
                key={idx}
                className="step-card bg-slate-900/70 border border-slate-800 rounded-2xl p-6"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-indigo-200">{step.title}</h3>
                  <span className="text-xs text-slate-500 ml-auto">
                    {step.sourcesCount} {isAr ? "مصدر" : "sources"}
                  </span>
                </div>
                <div
                  className="prose-report text-slate-300 text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: step.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
                      .replace(/\[رابط\]\((.*?)\)/g, `<a href="$1" target="_blank" rel="noopener" class="text-cyan-400 hover:underline">↗</a>`)
                      .replace(/\[([^\]]+)\]\((.*?)\)/g, `<a href="$2" target="_blank" rel="noopener" class="text-cyan-400 hover:underline">$1</a>`),
                  }}
                />
              </div>
            ))}

            <div className="text-center text-xs text-slate-500 pt-4">
              {isAr
                ? "هذه الأداة تستخدم بحثًا متعدد الخطوات من مصادر عامة (Google News + BBC + The Guardian). النتائج تعتمد على توفر المصادر."
                : "This tool uses multi-step research from public sources (Google News + BBC + The Guardian). Results depend on source availability."}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Deep Research Tool · Inspired by Gemini Deep Research · Built with Next.js
      </footer>
    </div>
  );
}
