"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Submission Detail Page – Next.js (Client Component)
 * Route: /dashboard/[id]
 *
 * ✅ Uses Strapi: /api/survey-submissions/:id?populate=*
 *    Set NEXT_PUBLIC_STRAPI_URL in .env (e.g. http://localhost:1337)
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// ----------------------------- Types -----------------------------

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
  selectedItems?: Array<{ index: number | string; label: string }>;
};

type Item = {
  id: number | string;
  org: Org;
  results?: ResultItem[];
  score: Score;
  redFlags?: number | string;
  completion?: number | string;
  createdAt?: string;
  submittedAt?: string;
  timestamp?: string;
  version?: string;
};

// ----------------------------- Helpers -----------------------------
const num = (v: any) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.replace(/[^\d.\-]/g, "")) || 0;
  return 0;
};

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

function bt(org?: Org) {
  if (!org) return "—";
  return org.businessType === "Other" ? org.businessTypeOther || "Other" : org.businessType || "—";
}

function mapStrapiNode(n: any): Item {
  const a = n?.attributes || n || {};
  const org = a.org || {};
  const score = a.score || {};
  const results = a.results || [];
  return {
    id: n?.id ?? a?.id,
    org,
    results,
    score,
    redFlags: a.redFlags,
    completion: a.completion,
    createdAt: a.createdAt,
    submittedAt: a.submittedAt,
    timestamp: a.timestamp,
    version: a.version,
  } as Item;
}

async function fetchById(id: string): Promise<Item | null> {
  const url = `${STRAPI_URL}/api/survey-submissions/${id}?populate=*`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  const j = await r.json();
  if (!j?.data) return null;
  return mapStrapiNode(j.data);
}

// ----------------------------- Component -----------------------------
export default function SubmissionDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [data, setData] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const item = await fetchById(id);
        if (!item) throw new Error("Not found");
        setData(item);
      } catch (e: any) {
        setError(e?.message || "Failed to load submission");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const scorePct = useMemo(() => num(data?.score?.percentage), [data]);

  // Part → best index percent (0..4 → 0..100)
  const partRows = useMemo(() => {
    const map = new Map<string, { points: number; max: number }>();
    (data?.results || []).forEach((r) => {
      const best = (r.selectedItems || []).reduce((acc, it) => Math.max(acc, num(it.index)), 0);
      const cur = map.get(r.part || "Unknown") || { points: 0, max: 0 };
      cur.points += best; // 0..4
      cur.max += 4;
      map.set(r.part || "Unknown", cur);
    });
    const arr = Array.from(map.entries()).map(([part, agg]) => ({
      part: (part.split("–").pop() || part).trim(),
      pct: agg.max ? Math.round((agg.points / agg.max) * 100) : 0,
    }));
    return arr.sort((a, b) => a.pct - b.pct);
  }, [data]);

  // Group questions by part for the list view
  const grouped = useMemo(() => {
    const g = new Map<string, ResultItem[]>();
    (data?.results || []).forEach((r) => {
      const key = r.part || "Unknown";
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(r);
    });
    return Array.from(g.entries()).map(([part, items]) => ({ part, items }));
  }, [data]);

  return (
    <div className="wrap">
      <div className="topbar">
        <Link className="back" href="/dashboard">← Back to Dashboard</Link>
      </div>

      <header className="header">
        <div>
          <h1>{data?.org?.companyName || "Submission"}</h1>
          <p className="muted">
            Contact: {data?.org?.contactPerson || "—"} · {data?.org?.email || "—"} · {data?.org?.phone || "—"}
          </p>
          <p className="muted">Business Type: {bt(data?.org)} · Submitted: {fmtDate(data?.createdAt || data?.submittedAt || data?.timestamp)}</p>
        </div>
        <div className="badges">
          <span className="badge score">Score: {scorePct || 0}%</span>
          <span className="badge red">Red Flags: {num(data?.redFlags)}</span>
          <span className="badge comp">Completion: {num(data?.completion)}/19</span>
          <span className="badge ver">v{data?.version || "—"}</span>
        </div>
      </header>

      {/* Summary: radial score + part bars */}
      <section className="grid">
        <div className="card">
          <h3>Overall Score</h3>
          <div className="radial">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart innerRadius="55%" outerRadius="100%" data={[{ name: "Score", value: scorePct || 0 }]}> 
                <RadialBar dataKey="value" cornerRadius={8} fill="#4f46e5" />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="radial-center">{scorePct || 0}%</div>
          </div>
        </div>

        <div className="card">
          <h3>Part Breakdown</h3>
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

      {/* Questions & answers */}
      <section className="card">
        <h3>Responses</h3>
        {grouped.length === 0 && <div className="muted">No per-question data available.</div>}
        {grouped.map(({ part, items }) => (
          <div key={part} className="part">
            <div className="part-title">{(part.split("–").pop() || part).trim()}</div>
            <div className="qa-list">
              {items.map((q) => {
                const answers = (q.selectedItems || []).map((s) => s.label).filter(Boolean);
                return (
                  <div key={String(q.index)} className="qa-item">
                    <div className="q">{String(q.index || "").padStart(2, "0")}. {q.question}</div>
                    <div className="a">{answers.length ? answers.join(", ") : "—"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <style jsx>{`
        :root {
          --bg: #f7f8fc;
          --card: #ffffff;
          --border: #e6e8f0;
          --text: #0f172a;
          --muted: #64748b;
          --indigo: #4f46e5;
          --emerald: #10b981;
          --red: #ef4444;
        }
        .wrap { max-width: 1100px; margin: 0 auto; padding: 26px 22px 64px; color: var(--text); }
        .topbar { margin-bottom: 10px; }
        .back { color: var(--indigo); text-decoration: none; font-weight: 600; }
        .back:hover { text-decoration: underline; }
        .header { display: flex; align-items: start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
        h1 { margin: 0; font-size: clamp(26px, 3vw, 36px); font-weight: 800; letter-spacing: -0.02em; }
        .muted { color: var(--muted); }
        .badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .badge { background: var(--card); border: 1px solid var(--border); border-radius: 999px; padding: 8px 12px; font-weight: 700; font-size: .9rem; }
        .badge.score { color: var(--indigo); }
        .badge.red { color: var(--red); }
        .badge.comp { color: var(--emerald); }

        .grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
        @media (min-width: 980px) { .grid { grid-template-columns: 1fr 1fr; } }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; box-shadow: 0 6px 18px rgba(15,23,42,.06); }
        .card h3 { margin: 0 0 10px; font-size: 1.05rem; font-weight: 700; }

        .radial { position: relative; }
        .radial-center { position: absolute; inset: 0; display: grid; place-items: center; font-weight: 800; font-size: 28px; color: var(--indigo); }

        .part { margin: 12px 0 4px; }
        .part-title { font-weight: 800; margin-bottom: 8px; letter-spacing: -0.01em; }
        .qa-list { display: grid; grid-template-columns: 1fr; }
        .qa-item { display: grid; grid-template-columns: 1fr; gap: 6px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .qa-item .q { font-weight: 600; }
        .qa-item .a { color: var(--muted); }
      `}</style>
    </div>
  );
}