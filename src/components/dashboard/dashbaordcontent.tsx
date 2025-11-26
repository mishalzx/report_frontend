"use client";

export const KPIS_COLORS = [
  "#06D6A0",
  "#ffb300",
  "#e53935",
  "#38bdf8",
  "#7f56b3",
  "#EF476F",
  "#fca5a5",
];

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Dashboard.css";
import { IoEyeOutline } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";

// ------------- Config -------------
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const PAGE_SIZE = 100;

// ------------- Types -------------
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
  documentId: string;
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
    // build export data
    const jsonData = {
      submissionId: item.documentId,
      metadata: {
        submittedAt: item.createdAt || item.publishedAt || item.timestamp,
        version: item.version || "1.0",
        externalId: item.externalId,
        userId: item.userId,
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
        departmentOther: item.org?.departmentOther || "",
      },
      questionnaireResponses: {
        totalQuestions: item.results?.length || 0,
        completedQuestions: num(item.completion),
        questions: (item.results || []).map((result) => ({
          questionNumber: result.index,
          part: result.part,
          question: result.question,
          selectedAnswers: (result.selectedItems || []).map((selected) => ({
            index: selected.index,
            label: selected.label,
          })),
          hasAnswer: (result.selectedItems || []).length > 0,
        })),
      },
      scoring: {
        totalPoints: num(item.score?.totalPoints),
        maxPoints: num(item.score?.maxPoints),
        percentage: num(item.score?.percentage),
        redFlags: num(item.redFlags),
        completionRate: item.results?.length
          ? Math.round((num(item.completion) / item.results.length) * 100)
          : 0,
      },
      summary: {
        overallScore: `${num(item.score?.percentage)}%`,
        redFlagsCount: num(item.redFlags),
        completionStatus: `${num(item.completion)}/${
          item.results?.length || 19
        } questions completed`,
        businessType: businessTypeOf(item.org),
        submissionDate: fmtDate(
          item.createdAt || item.publishedAt || item.timestamp
        ),
      },
    };

    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `questionnaire-submission-${item.documentId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error in downloadJSON:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
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
    const selectedItems =
      resultData.selectedItems || result?.selectedItems || [];

    const mappedSelectedItems = selectedItems.map((si: any) => {
      const siData = si?.attributes || si || {};
      return {
        index: siData.index ?? si?.index,
        label: siData.label ?? si?.label,
      };
    });

    return {
      index: resultData.index ?? result?.index,
      part: resultData.part ?? result?.part,
      question: resultData.question ?? result?.question,
      selectedItems: mappedSelectedItems,
    };
  });

  return {
    // 🔁 IMPORTANT: We now treat documentId as the canonical ID
    documentId:
      n?.documentId ??
      a?.documentId ??
      // fallback if Strapi didn't include documentId for some item
      n?.id ??
      a?.id ??
      crypto.randomUUID?.() ??
      Math.random().toString(36).slice(2),

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

    for (const node of data) items.push(mapStrapiNode(node));

    const pageCount = j?.meta?.pagination?.pageCount ?? 1;
    if (page >= pageCount) break;
    page += 1;
  }
  return items;
}

export default function DashboardPage({
  initialData,
}: {
  initialData?: Item[];
}) {
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

    if (bizFilter !== "All")
      list = list.filter((x) => businessTypeOf(x.org) === bizFilter);

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
      list = list.filter(
        (x) =>
          new Date(
            x.createdAt || x.publishedAt || x.timestamp || 0
          ).getTime() >= from
      );
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime();
      list = list.filter(
        (x) =>
          new Date(
            x.createdAt || x.publishedAt || x.timestamp || 0
          ).getTime() <= to
      );
    }

    return list;
  }, [raw, bizFilter, search, dateFrom, dateTo]);

  // KPIs
  const kpis = useMemo(() => {
    if (!rows.length)
      return {
        count: 0,
        avgScore: 0,
        avgRed: 0,
        avgCompletion: 0,
        best: 0,
        worst: 0,
      };

    const count = rows.length;
    const scores = rows.map((r) => num(r.score?.percentage));
    const avgScore = scores.reduce((a, b) => a + b, 0) / count;
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const avgRed = rows.reduce((a, b) => a + num(b.redFlags), 0) / count;
    const avgCompletion =
      rows.reduce((a, b) => a + num(b.completion), 0) / count;

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

  // Part averages (weak → strong)
  const partAverages = useMemo(() => {
    const map = new Map<string, { points: number; max: number }>();
    rows.forEach((item) => {
      (item.results || []).forEach((res) => {
        const best = (res?.selectedItems || []).reduce(
          (acc, it) => Math.max(acc, num(it.index)),
          0
        );
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

    if (!arr.length && rows.length) {
      return [
        {
          part: "Overall",
          pct: Math.round(
            rows.reduce((a, b) => a + num(b.score?.percentage), 0) / rows.length
          ),
        },
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
    return Array.from(buckets.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [rows]);

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // === Use donut chart colors for KPIs background ===
  const kpiBgColors = KPIS_COLORS;

  return (
    <div className="wrap">
      <header className="dash-header">
        <div>
          <h3 className=" fw-semibold letter-spacing">
            Operational Maturity Dashboard
          </h3>
          <p className="muted ">
            Live analytics from Strapi survey submissions.
          </p>
        </div>
      </header>

      {/* Controls */}
      <section className="controls">
        <div className="filters">
          <div className="field">
            <label className="form-label text-dark">Business Type</label>
            <select
              value={bizFilter}
              onChange={(e) => setBizFilter(e.target.value)}
            >
              {businessTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="form-label text-dark">Search</label>
            <input
              type="text"
              placeholder="Company, contact, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="form-label text-dark">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="form-label text-dark">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpis">
        {[
          {
            label: "Submissions",
            value: loading ? "…" : kpis.count,
          },
          {
            label: "Avg Score",
            value: loading ? "…" : pct(kpis.avgScore),
          },
          {
            label: "Best / Worst",
            value: loading ? "…" : `${pct(kpis.best)} / ${pct(kpis.worst)}`,
          },
          {
            label: "Avg Red Flags",
            value: loading ? "…" : kpis.avgRed.toFixed(1),
          },
          {
            label: "Avg Completion",
            value: loading ? "…" : `${Math.round(kpis.avgCompletion)}/19`,
          },
        ].map((kpi, i) => (
          <div
            className="kpi"
            key={kpi.label}
            style={{
              background: kpiBgColors[i % kpiBgColors.length],
              color:
                i === 1 || i === 3 || i === 4 // for yellow, pink, light blue backgrounds, use dark font
                  ? "#222"
                  : "#fff",
              borderRadius: 3,
              boxShadow: "0 1px 6px #0001",
              transition: "background .2s",
            }}
          >
            <div className="kpi-label text-white fs-20">{kpi.label}</div>
            <div className="kpi-value text-white fs-24">{kpi.value}</div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="grid-3 mb-3">
        {/* Score trend */}
        <div className="card ">
          <h3 className=" fw-semibold letter-spacing">Score Trend</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5aa9ff" stopOpacity={0.5} />
                    <stop
                      offset="100%"
                      stopColor="#5aa9ff"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} tickFormatter={(v: any) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="url(#g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Part averages */}
        <div className="card">
          <h3 className=" fw-semibold letter-spacing">
            Part Averages (weak → strong)
          </h3>
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
          <h3 className=" fw-semibold letter-spacing">
            Red Flags Distribution
          </h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={redDist}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  label
                >
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
      <section>
        <h3>Submissions</h3>
        {error && <div className="error">{error}</div>}
        <div className="pt-4 table-responsive">
          <Table responsive="sm table_class">
            <thead>
              <tr className="table_white_head">
                <th>Company</th>
                <th>Business Type</th>
                <th>Score</th>
                <th>Red Flags</th>
                <th>Completed</th>
                <th>Submitted</th>
                <th>JSON</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody className="table_white">
              {loading && (
                <tr>
                  <td colSpan={8} className="muted">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    No data
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => {
                  const bt = businessTypeOf(r.org);
                  return (
                    <tr key={String(r.documentId)}>
                      <td>
                        <div className="company">
                          {r.org.companyName || "—"}
                        </div>
                        <div className="sub muted">
                          {r.org.contactPerson || r.org.email || "—"}
                        </div>
                      </td>
                      <td>{bt}</td>
                      <td>{pct(num(r.score?.percentage) || 0)}</td>
                      <td>{num(r.redFlags)}</td>
                      <td>{num(r.completion)}/19</td>
                      <td>
                        {fmtDate(r.createdAt || r.publishedAt || r.timestamp)}
                      </td>
                      <td>
                        <button
                          onClick={() => downloadJSON(r)}
                          className="primary-text bg-transparent border-0"
                          title="Download JSON"
                        >
                          <MdOutlineFileDownload size={30} />
                        </button>
                      </td>
                      <td>
                        <Link
                          href={`/submissionDetailPage/${r.documentId}`}
                          className=" text-decoration-none primary-text"
                        >
                          <IoEyeOutline size={30} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </section>
    </div>
  );
}
