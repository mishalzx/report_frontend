"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./SubmissionDetailPage.css";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { MdOutlineFileDownload } from "react-icons/md";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// ------------- Types -------------
type Org = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  businessTypeOther?: string;
  surveyBy?: string;
  department?: string;
  departmentOther?: string;
};

type Score = {
  totalPoints?: number | string;
  maxPoints?: number | string;
  percentage?: number | string;
};

type ResultItem = {
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
  results?: ResultItem[];
  score: Score;
  redFlags?: number | string;
  completion?: number | string;
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

// ----------------------------- Shared JSON builder -----------------------------
function buildSubmissionJson(item: Item) {
  return {
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
}

// ----------------------------- downloadJSON -----------------------------
function downloadJSON(item: Item) {
  try {
    const jsonData = buildSubmissionJson(item);

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

// ----------------------------- Strapi mapping + fetch -----------------------------
function mapStrapiNode(n: any): Item {
  const a = n || {};
  const org = a.org || {};
  const score = a.score || {};
  const rawResults = a.results || [];

  const results = rawResults.map((result: any) => {
    const resultData = result || {};
    const selectedItems = resultData.selectedItems || [];
    return {
      index: resultData.index,
      part: resultData.part,
      question: resultData.question,
      selectedItems: selectedItems.map((si: any) => ({
        index: si.index,
        label: si.label,
      })),
    };
  });

  return {
    documentId:
      a.documentId ??
      a.id ??
      crypto.randomUUID?.() ??
      Math.random().toString(36).slice(2),
    externalId: a.externalId,
    userId: a.userId,
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
    redFlags: a.redFlags,
    completion: a.completion,
    timestamp: a.timestamp,
    submittedAt: a.submittedAt,
    version: a.version,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    publishedAt: a.publishedAt,
  };
}

async function fetchByDocumentId(documentId: string): Promise<Item | null> {
  const url = `${STRAPI_URL}/api/survey-submissions/${encodeURIComponent(
    documentId
  )}?populate[results][populate][selectedItems]=true&populate[org]=true&populate[score]=true`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    console.error("fetch error", r.status, r.statusText);
    return null;
  }

  const j = await r.json();
  if (!j?.data) return null;

  return mapStrapiNode(j.data);
}

// ----------------------------- Component -----------------------------
export default function SubmissionDetailPage() {
  const params = useParams();
  const documentId = String(params?.id || "");

  const [data, setData] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      setError("No documentId in route");
      return;
    }

    (async () => {
      setLoading(true);
      const item = await fetchByDocumentId(documentId);
      if (!item) {
        setError("Not found");
        setData(null);
      } else {
        setError(null);
        setData(item);
      }
      setLoading(false);
    })();
  }, [documentId]);

  const scorePct = useMemo(() => num(data?.score?.percentage), [data]);

  const partRows = useMemo(() => {
    const map = new Map<string, { points: number; max: number }>();

    (data?.results || []).forEach((r) => {
      const best = (r.selectedItems || []).reduce(
        (acc, it) => Math.max(acc, num(it.index)),
        0
      );
      const key = r.part || "Unknown";
      const cur = map.get(key) || { points: 0, max: 0 };
      cur.points += best;
      cur.max += 4;
      map.set(key, cur);
    });

    const arr = Array.from(map.entries()).map(([part, agg]) => ({
      part: (part.split("–").pop() || part).trim(),
      pct: agg.max ? Math.round((agg.points / agg.max) * 100) : 0,
    }));

    return arr.sort((a, b) => a.pct - b.pct);
  }, [data]);

  const grouped = useMemo(() => {
    const buckets = new Map<string, ResultItem[]>();
    (data?.results || []).forEach((r) => {
      const key = r.part || "Unknown";
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(r);
    });
    return Array.from(buckets.entries()).map(([part, items]) => ({
      part,
      items,
    }));
  }, [data]);

  // -------------- Connect with AI handler --------------
  async function handleConnectWithAI(item: Item) {
    try {
      setAiLoading(true);
      setAiError(null);
      setAiReport(null);

      const submissionJson = buildSubmissionJson(item);

      const res = await fetch("/api/analyze-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission: submissionJson }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed with ${res.status}`);
      }

      const data = await res.json();
      setAiReport(data.report || "");
    } catch (err) {
      console.error("AI connect error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setAiError(`Error connecting to AI: ${msg}`);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="wrap">
        <div className="topbar">
          <Link
            className=" text-decoration-none text-dark d-flex align-items-center gap-2 fw-medium"
            href="/dashboard"
          >
            <span>
              <HiArrowNarrowLeft size={24} />
            </span>
            Back to Dashboard
          </Link>
        </div>
        <div className="card">Loading…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="wrap">
        <div className="topbar">
          <Link
            className=" text-decoration-none text-dark d-flex align-items-center gap-2 fw-medium"
            href="/dashboard"
          >
            <span>
              <HiArrowNarrowLeft size={24} />
            </span>
            Back to Dashboard
          </Link>
        </div>
        <div className="card">
          <h3>Error</h3>
          <div className="muted">{error || "Unknown error"}</div>
          <div className="muted">documentId: {documentId}</div>
        </div>
      </div>
    );
  }

  // Main page
  return (
    <div className="wrap">
      <div className="topbar">
        <Link
          className=" text-decoration-none text-dark d-flex align-items-center gap-2 fw-medium"
          href="/dashboard"
        >
          <span>
            <HiArrowNarrowLeft size={24} />
          </span>
          Back to Dashboard
        </Link>
      </div>

      <div className=" d-flex align-items-center flex-wrap justify-content-between my-4">
        <h3 className=" fw-semibold letter-spacing mb-0">
          {data.org.companyName || "Submission"}
        </h3>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button
            className="json-btn d-flex align-items-center gap-2"
            onClick={() => downloadJSON(data)}
          >
            <span>
              <MdOutlineFileDownload size={30} />
            </span>
            Download JSON
          </button>

          <button
            className="ai-btn"
            onClick={() => handleConnectWithAI(data)}
            disabled={aiLoading}
          >
            <span className="fs-20">🤖</span>{" "}
            {aiLoading ? "Connecting…" : " Connect with our AI"}
          </button>
        </div>
      </div>

      <header className=" d-flex align-items-center flex-wrap justify-content-between mb-4">
        <div>
          <p className="muted mb-0">
            <span className=" fw-semibold letter-spacing text-dark pe-2">
              Contact:
            </span>
            {data.org.contactPerson || "—"} · {data.org.email || "—"} ·{" "}
            {data.org.phone || "—"}
          </p>
          <p className="muted mb-0">
            <span className=" fw-semibold letter-spacing text-dark pe-2">
              Business Type:
            </span>
            {businessTypeOf(data.org)} · Submitted:{" "}
            {fmtDate(data.createdAt || data.submittedAt || data.timestamp)}
          </p>
        </div>

        <div>
          <div className="badges">
            <span className="badge score">Score: {pct(scorePct || 0)}</span>
            <span className="badge red">Red Flags: {num(data.redFlags)}</span>
            <span className="badge comp">
              Completion: {num(data.completion)}/19
            </span>
            <span className="badge ver">v{data.version || "—"}</span>
          </div>
        </div>
      </header>

      {/* Score summary */}
      <section className="grid gap-4 py-4">
        <div className="card">
          <h3 className=" fw-semibold letter-spacing mb-3">Overall Score</h3>
          <div className="radial">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart
                innerRadius="55%"
                outerRadius="100%"
                data={[{ name: "Score", value: scorePct || 0 }]}
              >
                <RadialBar dataKey="value" cornerRadius={8} fill="#4f46e5" />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="radial-center">{scorePct || 0}%</div>
          </div>
        </div>

        <div className="card">
          <h3 className=" fw-semibold letter-spacing mb-3">Part Breakdown</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partRows}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="part" />
                <YAxis domain={[0, 100]} tickFormatter={(v: any) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Avg"]} />
                <Bar dataKey="pct" radius={[8, 8, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Answers */}

      <h3 className=" fw-semibold letter-spacing mb-4">Responses</h3>
      <section>
        {grouped.length === 0 && (
          <div className="muted">No per-question data available.</div>
        )}
        {grouped.map(({ part, items }) => (
          <div key={part} className="part card mb-4">
            <h3 className="part-title fw-semibold letter-spacing">
              {(part.split("–").pop() || part).trim()}
            </h3>
            <div className="qa-list">
              {items.map((q) => {
                const answers = (q.selectedItems || [])
                  .map((s) => s.label)
                  .filter(Boolean);

                return (
                  <div key={String(q.index)} className="qa-item">
                    <div className="q">
                      {String(q.index || "").padStart(2, "0")}. {q.question}
                    </div>
                    <div className="a">
                      {answers.length ? answers.join(", ") : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* AI output / errors */}
      {aiError && (
        <section className="card">
          <h3 className=" fw-semibold letter-spacing mb-4">
            AI Analysis Error
          </h3>
          <div className="muted">{aiError}</div>
        </section>
      )}

      {aiReport && (
        <section className="card">
          <h3 className=" fw-semibold letter-spacing mb-4">
            AI Diagnostic Summary
          </h3>
          <pre className="ai-output">{aiReport}</pre>
        </section>
      )}
    </div>
  );
}
