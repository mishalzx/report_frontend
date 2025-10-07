"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area, AreaChart, BarChart, Bar,
} from "recharts";

type Org = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  businessTypeOther: string;
  surveyBy: "company" | "department";
  department: string;
  departmentOther: string;
};

type ResultRow = {
  index: number;
  part: string;
  question: string;
  selectedItems: Array<{ index: number; label: string }>;
};

type Item = {
  id: number | string;
  externalId: string;
  userId: string;
  org: Org;
  results: ResultRow[];
  score: { totalPoints: number; maxPoints: number; percentage: number };
  redFlags: number;
  completion: number;
  timestamp: string;
  submittedAt: string;
  version: string;
  createdAt: string;
};

function pct(n: number) {
  return `${Math.round(n)}%`;
}

function fmtDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(+dt)) return d;
  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [bizFilter, setBizFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/surveys/list", { cache: "no-store" });
        const j = await r.json();
        setRaw(j?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Distinct business types from data
  const businessTypes = useMemo(() => {
    const s = new Set<string>();
    raw.forEach((x) => {
      const bt =
        x.org?.businessType === "Other"
          ? (x.org?.businessTypeOther || "Other")
          : (x.org?.businessType || "—");
      if (bt) s.add(bt);
    });
    return ["All", ...Array.from(s.values()).sort()];
  }, [raw]);

  // Filtered rows
  const rows = useMemo(() => {
    let list = raw.slice();

    if (bizFilter !== "All") {
      list = list.filter((x) => {
        const bt =
          x.org.businessType === "Other"
            ? (x.org.businessTypeOther || "Other")
            : (x.org.businessType || "—");
        return bt === bizFilter;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((x) => {
        const hay = [
          x.org.companyName,
          x.org.contactPerson,
          x.org.email,
          x.org.phone,
          x.org.businessType,
          x.org.businessTypeOther,
          x.org.department,
          x.org.departmentOther,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [raw, bizFilter, search]);

  // KPIs
  const kpis = useMemo(() => {
    if (!rows.length) {
      return {
        count: 0,
        avgScore: 0,
        avgRed: 0,
        avgCompletion: 0,
      };
    }
    const count = rows.length;
    const avgScore = rows.reduce((a, b) => a + (b.score?.percentage || 0), 0) / count;
    const avgRed = rows.reduce((a, b) => a + (b.redFlags || 0), 0) / count;
    const avgCompletion = rows.reduce((a, b) => a + (b.completion || 0), 0) / count;

    return {
      count,
      avgScore,
      avgRed,
      avgCompletion,
    };
  }, [rows]);

  // Score trend (over time)
  const trend = useMemo(() => {
    const list = rows
      .slice()
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
      .map((r) => ({
        date: fmtDate(r.createdAt),
        score: r.score?.percentage || 0,
      }));
    return list;
  }, [rows]);

  // Per-part averages (heat/Bar chart)
  const partAverages = useMemo(() => {
    const map = new Map<string, { points: number; max: number }>();
    rows.forEach((item) => {
      (item.results || []).forEach((res) => {
        // compute best score for that question (selectedItems indexes 0..4)
        const best =
          (res.selectedItems || []).reduce((acc, it) => Math.max(acc, it.index), 0) || 0;
        const cur = map.get(res.part) || { points: 0, max: 0 };
        // index 0 = Not fulfilled -> 0 points; otherwise add index
        cur.points += best;
        cur.max += 4; // each question has max 4 points
        map.set(res.part, cur);
      });
    });

    const arr = Array.from(map.entries()).map(([part, agg]) => ({
      part: part.split("–").pop()?.trim() || part,
      pct: agg.max ? Math.round((agg.points / agg.max) * 100) : 0,
    }));

    // Sort by weakest → strongest
    arr.sort((a, b) => a.pct - b.pct);
    return arr;
  }, [rows]);

  return (
    <div className="wrap">
      <header className="dash-header">
        <h1>Operational Maturity Dashboard</h1>
        <p className="muted">
          Live analytics from survey submissions stored in Strapi.
        </p>
      </header>

      <section className="controls">
        <div className="filters">
          <div className="field">
            <label>Business Type</label>
            <select value={bizFilter} onChange={(e) => setBizFilter(e.target.value)}>
              {businessTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
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
        </div>
      </section>

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
          <div className="kpi-label">Avg Red Flags</div>
          <div className="kpi-value">{loading ? "…" : kpis.avgRed.toFixed(1)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg Completion</div>
          <div className="kpi-value">
            {loading ? "…" : `${Math.round(kpis.avgCompletion)}/${19}`}
          </div>
        </div>
      </section>

      <section className="grid-2">
        {/* Score trend */}
        <div className="card">
          <h3>Score Trend</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5aa9ff" stopOpacity={0.5}/>
                    <stop offset="100%" stopColor="#5aa9ff" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} tickFormatter={(v:any) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                <Area type="monotone" dataKey="score" stroke="#5aa9ff" fill="url(#g)" />
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
                <YAxis domain={[0, 100]} tickFormatter={(v:any) => `${v}%`} />
                <Tooltip formatter={(v: any) => [`${v}%`, "Avg"]} />
                <Bar dataKey="pct" fill="#69db7c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="card">
        <h3>Submissions</h3>
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
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="muted">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={6} className="muted">No data</td></tr>
              )}
              {!loading && rows.map((r) => {
                const bt =
                  r.org.businessType === "Other"
                    ? (r.org.businessTypeOther || "Other")
                    : (r.org.businessType || "—");
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="company">{r.org.companyName || "—"}</div>
                      <div className="sub muted">{r.org.contactPerson || r.org.email || "—"}</div>
                    </td>
                    <td>{bt}</td>
                    <td>{pct(r.score?.percentage || 0)}</td>
                    <td>{r.redFlags ?? 0}</td>
                    <td>{r.completion ?? 0}/19</td>
                    <td>{fmtDate(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .wrap{max-width:1100px;margin:0 auto;padding:22px}
        .muted{color:#8ca0c6}
        .kpis{
        color:white;
        }
        .dash-header h1{margin:0 0 4px}
        .controls{margin:14px 0 12px}
        .filters{display:flex;gap:12px;flex-wrap:wrap}
        .field{display:flex;flex-direction:column;gap:6px;min-width:220px}
        select,input{background:#0f1733;border:1px solid #1d274a;color:#e9eefb;padding:10px;border-radius:10px}
        .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:14px 0 8px}
        .kpi{background:#121a33;border:1px solid #ffffffff;border-radius:14px;padding:14px}
        .kpi-label{font-size:.9rem;color:#8ca0c6}
        .kpi-value{font-size:1.6rem;font-weight:700}
        .grid-2{display:grid;grid-template-columns:1fr;gap:12px}
        @media(min-width:920px){.grid-2{grid-template-columns:1fr 1fr}}
        .card{background:#121a33;border:1px solid #1d274a;border-radius:14px;padding:14px;margin:12px 0}
        .table-wrap{overflow:auto}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border-bottom:1px solid #1d274a;padding:10px;text-align:left}
        th{color:#8ca0c6;font-weight:600}
        .company{font-weight:600}
        .sub{font-size:.85rem}
      `}</style>
    </div>
  );
}
