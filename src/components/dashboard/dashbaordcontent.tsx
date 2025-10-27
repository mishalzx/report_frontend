"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/**
 * Operational Maturity Dashboard – Next.js (Client Component)
 *
 * ✅ Works with Strapi at: /api/survey-submissions?populate=*
 *    Set NEXT_PUBLIC_STRAPI_URL in your .env (e.g. http://localhost:1337)
 *    This component will auto-paginate through Strapi pages.
 *
 * Optionally, you can pass `initialData` as a prop to render without fetching.
 */

// ------------- Config -------------
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const PAGE_SIZE = 100; // adjust if you expect large datasets

// ------------- Types (loose to tolerate string/number fields) -------------

type Org = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  businessTypeOther?: string;
  surveyBy?: "company" | "department" | string;
  department?: string;
  departmentOther?: string;
};

type Score = {
  totalPoints?: number | string;
  maxPoints?: number | string;
  percentage?: number | string;
};

type ResultRow = {
  index?: number | string;
  part?: string;
  question?: string;
  selectedItems?: Array<{ index: number; label: string }>;
};

type Item = {
  id: number | string;
  externalId?: string;
  userId?: string;
  org: Org;
  results?: ResultRow[];
  score: Score;
  redFlags?: number | string;
  completion?: number | string; // count of answered questions
  timestamp?: string;
  submittedAt?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

// ----------------------------- Helpers -----------------------------
const num = (v: any) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.replace(/[^\d.\-]/g, "")) || 0;
  return 0;
};

const pct = (n: number) => `${Math.round(n)}%`;

function fmtDate(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return d || "—";
  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function businessTypeOf(org?: Org) {
  if (!org) return "—";
  if (org.businessType === "Other") return org.businessTypeOther || "Other";
  return org.businessType || "—";
}

function downloadJSON(item: Item) {
  try {
    // Debug: Log the raw item data to understand structure
    console.log('=== JSON DOWNLOAD DEBUG ===');
    console.log('Function called with item:', item);
    
    // Function is working - removed alert
    console.log('Item ID:', item.id);
    console.log('Item results:', item.results);
    console.log('Results length:', item.results?.length);
    
    if (item.results && item.results.length > 0) {
      console.log('First result:', item.results[0]);
      console.log('First result selectedItems:', item.results[0]?.selectedItems);
      console.log('First result selectedItems length:', item.results[0]?.selectedItems?.length);
    } else {
      console.log('No results found or results array is empty');
    }
    
    // Also log the raw data structure
    console.log('Raw item structure:', JSON.stringify(item, null, 2));
  
  // Create a comprehensive JSON structure with all questionnaire data
  const jsonData = {
    submissionId: item.id,
    metadata: {
      submittedAt: item.createdAt || item.publishedAt || item.timestamp,
      version: item.version || "1.0",
      externalId: item.externalId,
      userId: item.userId
    },
    organization: {
      companyName: item.org?.companyName || "",
      contactPerson: item.org?.contactPerson || "",
      email: item.org?.email || "",
      phone: item.org?.phone || "",
      businessType: item.org?.businessType || "",
      businessTypeOther: item.org?.businessTypeOther || "",
      surveyBy: item.org?.surveyBy || "",
      department: item.org?.department || "",
      departmentOther: item.org?.departmentOther || ""
    },
    questionnaireResponses: {
      totalQuestions: item.results?.length || 0,
      completedQuestions: num(item.completion),
      questions: (item.results || []).map(result => ({
        questionNumber: result.index,
        part: result.part,
        question: result.question,
        selectedAnswers: (result.selectedItems || []).map(selected => ({
          index: selected.index,
          label: selected.label
        })),
        hasAnswer: (result.selectedItems || []).length > 0
      }))
    },
    scoring: {
      totalPoints: num(item.score?.totalPoints),
      maxPoints: num(item.score?.maxPoints),
      percentage: num(item.score?.percentage),
      redFlags: num(item.redFlags),
      completionRate: item.results?.length ? Math.round((num(item.completion) / item.results.length) * 100) : 0
    },
    summary: {
      overallScore: `${num(item.score?.percentage)}%`,
      redFlagsCount: num(item.redFlags),
      completionStatus: `${num(item.completion)}/${item.results?.length || 19} questions completed`,
      businessType: businessTypeOf(item.org),
      submissionDate: fmtDate(item.createdAt || item.publishedAt || item.timestamp)
    }
  };

    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questionnaire-submission-${item.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error in downloadJSON:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    alert(`Error downloading JSON: ${errorMessage}`);
  }
}

// map a Strapi item (which may nest under attributes) to flat Item
function mapStrapiNode(n: any): Item {
  const a = n?.attributes || n || {};
  const org = a.org || n?.org || {};
  const score = a.score || n?.score || {};
  const rawResults = a.results || n?.results || [];
  
  // Properly map results with nested selectedItems
  const results = rawResults.map((result: any) => {
    const resultData = result?.attributes || result || {};
    const selectedItems = resultData.selectedItems || result?.selectedItems || [];
    
    // Map selectedItems properly
    const mappedSelectedItems = selectedItems.map((item: any) => {
      const itemData = item?.attributes || item || {};
      return {
        index: itemData.index ?? item?.index,
        label: itemData.label ?? item?.label
      };
    });
    
    return {
      index: resultData.index ?? result?.index,
      part: resultData.part ?? result?.part,
      question: resultData.question ?? result?.question,
      selectedItems: mappedSelectedItems
    };
  });
  
  return {
    id: n?.id ?? a?.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    externalId: a.externalId || n.externalId,
    userId: a.userId || n.userId,
    org: {
      companyName: org.companyName,
      contactPerson: org.contactPerson,
      email: org.email,
      phone: org.phone,
      businessType: org.businessType,
      businessTypeOther: org.businessTypeOther,
      surveyBy: org.surveyBy,
      department: org.department,
      departmentOther: org.departmentOther,
    },
    results,
    score,
    redFlags: a.redFlags ?? n.redFlags,
    completion: a.completion ?? n.completion,
    timestamp: a.timestamp ?? n.timestamp,
    submittedAt: a.submittedAt ?? n.submittedAt,
    version: a.version ?? n.version,
    createdAt: a.createdAt ?? n.createdAt,
    updatedAt: a.updatedAt ?? n.updatedAt,
    publishedAt: a.publishedAt ?? n.publishedAt,
  } as Item;
}

async function fetchAllSubmissions(): Promise<Item[]> {
  const items: Item[] = [];
  let page = 1;
  // Use populate=* to get nested org/score/results
  while (true) {
    const url = `${STRAPI_URL}/api/survey-submissions?populate[results][populate][selectedItems]=true&populate[org]=true&populate[score]=true&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`Strapi fetch failed (${r.status})`);
    const j = await r.json();
    const data = Array.isArray(j?.data) ? j.data : [];
    
    // Debug: Log raw Strapi response for first item
    if (page === 1 && data.length > 0) {
      console.log('=== RAW STRAPI RESPONSE DEBUG ===');
      console.log('Raw Strapi data for first item:', data[0]);
      console.log('Raw results:', data[0]?.attributes?.results);
      if (data[0]?.attributes?.results?.[0]) {
        console.log('First raw result:', data[0].attributes.results[0]);
        console.log('First raw result selectedItems:', data[0].attributes.results[0].selectedItems);
      }
    }
    
    for (const node of data) items.push(mapStrapiNode(node));
    const pageCount = j?.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page += 1;
  }
  return items;
}

export default function DashboardPage({ initialData }: { initialData?: Item[] }) {
  const [raw, setRaw] = useState<Item[]>(initialData || []);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [bizFilter, setBizFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    if (initialData) return; // already have data
    (async () => {
      try {
        setLoading(true);
        const list = await fetchAllSubmissions();
        setRaw(list);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [initialData]);

  // Distinct business types
  const businessTypes = useMemo(() => {
    const s = new Set<string>();
    raw.forEach((x) => s.add(businessTypeOf(x.org)));
    return ["All", ...Array.from(s.values()).sort()];
  }, [raw]);

  // Filtered rows
  const rows = useMemo(() => {
    let list = raw.slice();

    if (bizFilter !== "All") list = list.filter((x) => businessTypeOf(x.org) === bizFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((x) => {
        const hay = [
          x.org?.companyName,
          x.org?.contactPerson,
          x.org?.email,
          x.org?.phone,
          x.org?.businessType,
          x.org?.businessTypeOther,
          x.org?.department,
          x.org?.departmentOther,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // Date filter (createdAt)
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((x) => new Date(x.createdAt || x.publishedAt || x.timestamp || 0).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      list = list.filter((x) => new Date(x.createdAt || x.publishedAt || x.timestamp || 0).getTime() <= to);
    }

    return list;
  }, [raw, bizFilter, search, dateFrom, dateTo]);

  // KPIs
  const kpis = useMemo(() => {
    if (!rows.length)
      return { count: 0, avgScore: 0, avgRed: 0, avgCompletion: 0, best: 0, worst: 0 };

    const count = rows.length;
    const scores = rows.map((r) => num(r.score?.percentage));
    const avgScore = scores.reduce((a, b) => a + b, 0) / count;
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const avgRed = rows.reduce((a, b) => a + num(b.redFlags), 0) / count;
    const avgCompletion = rows.reduce((a, b) => a + num(b.completion), 0) / count;

    return { count, avgScore, avgRed, avgCompletion, best, worst };
  }, [rows]);

  // Score trend (over time)
  const trend = useMemo(() => {
    return rows
      .slice()
      .sort((a, b) => +new Date(a.createdAt || 0) - +new Date(b.createdAt || 0))
      .map((r) => ({
        date: fmtDate(r.createdAt || r.publishedAt || r.timestamp),
        score: num(r.score?.percentage),
      }));
  }, [rows]);

  // Part averages (weak → strong). If no selectedItems, fallback to score distribution by part count.
  const partAverages = useMemo(() => {
    const map = new Map<string, { points: number; max: number }>();
    rows.forEach((item) => {
      (item.results || []).forEach((res) => {
        // try to compute best index from selectedItems; index ranges 0..4 typically
        const best = (res?.selectedItems || []).reduce((acc, it) => Math.max(acc, num(it.index)), 0);
        const cur = map.get(res.part || "Unknown") || { points: 0, max: 0 };
        cur.points += best; // 0..4
        cur.max += 4;
        map.set(res.part || "Unknown", cur);
      });
    });

    const arr = Array.from(map.entries()).map(([part, agg]) => ({
      part: (part.split("–").pop() || part).trim(),
      pct: agg.max ? Math.round((agg.points / agg.max) * 100) : 0,
    }));

    // If no per-part data, derive a single bar from overall score average
    if (!arr.length && rows.length) {
      return [
        { part: "Overall", pct: Math.round(rows.reduce((a, b) => a + num(b.score?.percentage), 0) / rows.length) },
      ];
    }

    arr.sort((a, b) => a.pct - b.pct);
    return arr;
  }, [rows]);

  // Red flags distribution for Pie
  const redDist = useMemo(() => {
    const buckets = new Map<string, number>();
    const bin = (v: number) => {
      if (v === 0) return "0";
      if (v <= 2) return "1–2";
      if (v <= 5) return "3–5";
      return "6+";
    };
    rows.forEach((r) => {
      const key = bin(num(r.redFlags));
      buckets.set(key, (buckets.get(key) || 0) + 1);
    });
    return Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]; // Pie colors (indigo, emerald, amber, red, violet)

  return (
    <div className="wrap">
      <header className="dash-header">
        <div>
          <h1>Operational Maturity Dashboard</h1>
          <p className="muted">Live analytics from Strapi survey submissions.</p>
        </div>
      </header>

      {/* Controls */}
      <section className="controls">
        <div className="filters">
          <div className="field">
            <label>Business Type</label>
            <select value={bizFilter} onChange={(e) => setBizFilter(e.target.value)}>
              {businessTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Search</label>
            <input
              type="text"
              placeholder="Company, contact, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpis">
        <div className="kpi">
          <div className="kpi-label">Submissions</div>
          <div className="kpi-value">{loading ? "…" : kpis.count}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Score</div>
          <div className="kpi-value">{loading ? "…" : pct(kpis.avgScore)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Best / Worst</div>
          <div className="kpi-value">{loading ? "…" : `${pct(kpis.best)} / ${pct(kpis.worst)}`}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Red Flags</div>
          <div className="kpi-value">{loading ? "…" : kpis.avgRed.toFixed(1)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Completion</div>
          <div className="kpi-value">{loading ? "…" : `${Math.round(kpis.avgCompletion)}/19`}</div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid-3">
        {/* Score trend */}
        <div className="card">
          <h3>Score Trend</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5aa9ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#5aa9ff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} tickFormatter={(v: any) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Part averages */}
        <div className="card">
          <h3>Part Averages (weak → strong)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partAverages}>
                <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                <XAxis dataKey="part" />
                <YAxis domain={[0, 100]} tickFormatter={(v: any) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Avg"]} />
                <Bar dataKey="pct" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Red flags distribution */}
        <div className="card">
          <h3>Red Flags Distribution</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={redDist} dataKey="value" nameKey="name" outerRadius={95} label>
                  {redDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="card">
        <h3>Submissions</h3>
        {error && <div className="error">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Business Type</th>
                <th>Score</th>
                <th>Red Flags</th>
                <th>Completed</th>
                <th>Submitted</th>
                <th>JSON</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="muted">Loading…</td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">No data</td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => {
                  const bt = businessTypeOf(r.org);
                  return (
                    <tr key={String(r.id)}>
                      <td>
                        <div className="company">{r.org.companyName || "—"}</div>
                        <div className="sub muted">{r.org.contactPerson || r.org.email || "—"}</div>
                      </td>
                      <td>{bt}</td>
                      <td>{pct(num(r.score?.percentage) || 0)}</td>
                      <td>{num(r.redFlags)}</td>
                      <td>{num(r.completion)}/19</td>
                      <td>{fmtDate(r.createdAt || r.publishedAt || r.timestamp)}</td>
                      <td>
                        <button 
                          onClick={() => downloadJSON(r)} 
                          className="json-btn"
                          title="Download JSON"
                        >
                          📄
                        </button>
                      </td>
                      <td>
                        <Link href={`/submissionDetailPage/${r.id}`} className="view-btn">View</Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        :root {
          --bg: #f7f8fc;
          --card: #ffffff;
          --border: #e6e8f0;
          --text: #0f172a;
          --muted: #64748b;
          --accent: #4f46e5; /* indigo */
          --accent-2: #10b981; /* emerald */
        }
        
        /* Ensure the entire component has proper background */
        :global(body) {
          background-color: var(--bg) !important;
        }
        
        :global(html) {
          background-color: var(--bg) !important;
        }
        
        /* Override any dark theme styles */
        * {
          background-color: transparent;
        }
        
        .wrap { 
          max-width: 1240px; 
          margin: 0 auto; 
          padding: 28px 24px 64px; 
          color: var(--text);
          background-color: var(--bg);
          min-height: 100vh;
        }
        .dash-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 18px; }
        .dash-header h1 { margin: 0; font-weight: 800; letter-spacing: -0.02em; font-size: clamp(28px, 3vw, 40px); }
        .muted { color: var(--muted); }

        .view-btn {
background: var(--accent);
color: white;
padding: 6px 10px;
border-radius: 8px;
text-decoration: none;
font-weight: 600;
transition: background .2s;
}
.view-btn:hover { background: var(--accent-2); }

.json-btn {
background: var(--accent-2);
color: white;
border: none;
padding: 6px 10px;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: background .2s;
font-size: 14px;
}
.json-btn:hover { background: var(--accent); }

        /* Controls */
        .controls { margin: 10px 0 18px; }
        .filters { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; }
        .field { grid-column: span 12; display: flex; flex-direction: column; gap: 8px; }
        @media (min-width: 900px) {
          .field { grid-column: span 3; }
        }
        label { font-size: .85rem; color: var(--muted); }
        select, input[type="text"], input[type="date"] {
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 12px 14px;
          border-radius: 12px;
          outline: none;
          transition: box-shadow .2s ease, border-color .2s ease;
        }
        select:focus, input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(79,70,229,.12); }

        /* KPI cards */
        .kpis { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; margin: 12px 0 16px; }
        .kpi { grid-column: span 12; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px 18px; box-shadow: 0 6px 18px rgba(15,23,42,.06); }
        @media (min-width: 900px) { .kpi { grid-column: span 3; } }
        .kpi-label { font-size: .9rem; color: var(--muted); margin-bottom: 2px; }
        .kpi-value { font-size: clamp(20px, 3vw, 28px); font-weight: 800; letter-spacing: -0.01em; }

        /* Chart grid */
        .grid-3 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 1100px) { .grid-3 { grid-template-columns: 1fr 1fr 1fr; } }

        /* Card */
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; box-shadow: 0 6px 18px rgba(15,23,42,.06); }
        .card h3 { margin: 2px 0 10px; font-size: 1.05rem; font-weight: 700; color: var(--text); }

        /* Table */
        .table-wrap { overflow: auto; border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border-bottom: 1px solid var(--border); padding: 12px 12px; text-align: left; }
        th { color: var(--muted); font-weight: 600; font-size: .9rem; }
        tr:hover td { background: #fafbfe; }
        .company { font-weight: 700; }
        .sub { font-size: .85rem; color: var(--muted); }
        
        /* Error styling */
        .error {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #fecaca;
          margin-bottom: 16px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
