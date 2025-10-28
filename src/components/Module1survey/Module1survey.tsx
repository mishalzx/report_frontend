"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Types ---------------- */
type Question = { part: string; q: string; answers: string[] };

type Org = {
  companyName: string; contactPerson: string; email: string; phone: string;
  businessType: string; businessTypeOther: string;
  surveyBy: "company" | "department"; department: string; departmentOther: string;
};

type ResultItem = {
  index: number; part: string; question: string;
  selectedIndices: number[]; selectedLabels: string[];
};

type Payload = {
  org: Org;
  results: ResultItem[];
  score: { totalPoints: number; maxPoints: number; percentage: number };
  redFlags: number;
  completion: number;
  timestamp: string;
};

/* ---------------- Questions (same as yours) ---------------- */
const QUESTIONS: Question[] = [
  { part: "Part 1 – Processes & Documentation", q: "How are your tasks and processes documented?", answers: [
    "We don’t document tasks or processes at all (Not fulfilled)",
    "Processes are only explained verbally when needed",
    "Some notes/manuals exist, but they are incomplete or outdated",
    "Standard written instructions exist for most activities",
    "All processes are fully documented, updated, and easy to access"]},
  { part: "Part 1 – Processes & Documentation", q: "Do some activities rely only on certain people to know how to do them?", answers: [
    "Yes, most processes depend on specific individuals (Not fulfilled)",
    "Knowledge is shared verbally but not written down",
    "A few processes are documented, but many still depend on individuals",
    "Most processes are documented, with only a few knowledge gaps",
    "All processes are well documented, and knowledge is widely shared"]},
  { part: "Part 1 – Processes & Documentation", q: "How do new employees usually learn their responsibilities?", answers: [
    "No structured training, they figure things out by themselves (Not fulfilled)",
    "New hires rely on shadowing others without clear materials",
    "Some training documents or guides exist, but incomplete",
    "Formal onboarding exists for most important roles",
    "Full onboarding program with documents, mentors, and training sessions"]},
  { part: "Part 2 – Roles & Responsibilities", q: "How are roles and responsibilities defined in your team?", answers: [
    "Roles are unclear or overlapping (Not fulfilled)",
    "Roles are explained verbally, without written definitions",
    "Some job descriptions exist but are outdated or inconsistent",
    "Roles are documented clearly for most employees",
    "All roles are fully defined, updated, and aligned with company goals"]},
  { part: "Part 2 – Roles & Responsibilities", q: "Do people clearly understand their duties and decision-making powers?", answers: [
    "No, responsibilities are very unclear (Not fulfilled)",
    "Some confusion exists, especially with overlapping duties",
    "Most people know their roles, but escalation paths are unclear",
    "Roles and authority are mostly clear, with minor exceptions",
    "Everyone fully understands their duties and authority limits"]},
  { part: "Part 3 – Task Management", q: "How do you keep track of assigned tasks or work items?", answers: [
    "No tracking system, depends on memory or individuals (Not fulfilled)",
    "Tasks are tracked informally using emails or chats",
    "Basic spreadsheets or notes are used to track tasks",
    "Centralized task tracker or project management tool is used",
    "Fully integrated task system with reminders and accountability"]},
  { part: "Part 3 – Task Management", q: "What is the most common reason tasks are delayed or missed?", answers: [
    "No accountability or ownership at all (Not fulfilled)",
    "Poor communication or unclear instructions",
    "Lack of deadlines or prioritization",
    "Resource constraints cause occasional delays",
    "Delays are rare, risks are proactively managed "]},
  { part: "Part 4 – Performance & Feedback", q: "How often do you hold reviews or give performance feedback?", answers: [
    "No reviews or feedback at all (Not fulfilled)",
    "Feedback is given irregularly or only in emergencies",
    "Some reviews exist, but not consistent",
    "Regular reviews, such as monthly or quarterly",
    "Continuous feedback supported by formal systems"]},
  { part: "Part 4 – Performance & Feedback", q: "What kind of feedback system do you mainly use (formal, informal, none)?", answers: [
    "No feedback culture at all (Not fulfilled)",
    "Feedback is only given when something goes wrong",
    "Feedback is mostly informal conversations",
    "Structured reviews exist with some informal input",
    "Balanced mix of formal reviews and continuous informal feedback"]},
  { part: "Part 5 – Efficiency & Improvement", q: "How do you identify slow or error-prone parts of your work?", answers: [
    "We don’t track or identify bottlenecks (Not fulfilled)",
    "Bottlenecks are noticed only through staff complaints or observations",
    "Some data is collected, but not reviewed often",
    "Known bottlenecks are addressed occasionally",
    "Continuous monitoring and improvement practices are in place"]},
  { part: "Part 5 – Efficiency & Improvement", q: "Have you considered or applied automation to reduce manual effort?", answers: [
    "We haven’t considered automation at all (Not fulfilled)",
    "Aware of automation needs, but no action taken",
    "Some tools tried, but not fully implemented",
    "Partial automation of repetitive tasks is in place",
    "High level of automation with regular reviews and improvements"]},
  { part: "Part 6 – Metrics & KPIs", q: "Which key results or performance measures (KPIs) do you track regularly?", answers: [
    "No KPIs are tracked at all (Not fulfilled)",
    "Only financial KPIs are tracked",
    "Some operational KPIs are tracked, but inconsistently",
    "Both financial and operational KPIs are tracked regularly",
    "Balanced KPIs are tracked across finance, operations, customers, and people"]},
  { part: "Part 6 – Metrics & KPIs", q: "How often are these KPIs reviewed, and in what format (reports, dashboards)?", answers: [
    "KPIs are never reviewed (Not fulfilled)",
    "Reviewed occasionally, usually in spreadsheets",
    "Monthly reviews with mostly static reports",
    "Weekly reviews using dashboards",
    "Real-time dashboards with continuous insights are used"]},
  { part: "Part 7 – Planning & Execution", q: "Who decides the steps after a new strategy or idea is approved?", answers: [
    "No structured decision-making, it happens randomly (Not fulfilled)",
    "Only top management makes the decisions",
    "Department heads decide the next steps",
    "Leadership teams decide together with cross-functional input",
    "Clear governance process with defined accountability decides next steps"]},
  { part: "Part 7 – Planning & Execution", q: "How do you ensure those steps are completed as planned?", answers: [
    "No follow-up or monitoring at all (Not fulfilled)",
    "Occasional follow-up by managers",
    "Deadlines exist, but often missed",
    "Regular check-ins and escalation if deadlines are missed",
    "Systematic monitoring with accountability for completion"]},
  { part: "Part 8 – Revenue & Cost Awareness", q: "How do you track situations where the organization loses money or misses opportunities?", answers: [
    "We don’t track revenue leaks or missed opportunities (Not fulfilled)",
    "Aware of them, but no structured tracking system",
    "Track major issues informally with notes or spreadsheets",
    "Periodic analysis of revenue losses or missed opportunities",
    "Automated systems continuously monitor and prevent revenue leaks"]},
  { part: "Part 8 – Revenue & Cost Awareness", q: "How do you review and fix such issues when they are found?", answers: [
    "We don’t address revenue losses at all (Not fulfilled)",
    "Only react when big problems occur",
    "Ad-hoc tracking and fixes using spreadsheets",
    "Dedicated teams review losses on a regular basis",
    "Automated systems detect and fix issues proactively"]},
  { part: "Part 9 – Benchmarking & Market Awareness", q: "Do you compare your performance to industry peers or standards?", answers: [
    "We never do benchmarking (Not fulfilled)",
    "Occasionally compare informally with competitors",
    "Some benchmarking studies done, but not regularly",
    "Regular benchmarking for key metrics",
    "Continuous benchmarking against industry best practices"]},
  { part: "Part 9 – Benchmarking & Market Awareness", q: "How do you identify where your organization is ahead or behind others?", answers: [
    "We don’t know our position at all (Not fulfilled)",
    "Some strengths are known, but weaknesses are unclear",
    "Broad areas of improvement are identified, but no detail",
    "Clear knowledge of main strengths and weaknesses",
    "Detailed benchmarking reports show both strengths and gaps"]},
];

/* ---------------- Utilities ---------------- */
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
function computeScore(res: ResultItem[]) {
  let total = 0;
  const max = QUESTIONS.length * 4;
  res.forEach((r) => {
    if (r.selectedIndices.includes(0)) return;
    let best = 0;
    r.selectedIndices.forEach((v) => { if (v > best) best = v; });
    total += best;
  });
  const pct = Math.round((total / max) * 100) || 0;
  return { totalPoints: total, maxPoints: max, percentage: pct };
}
function gradeFromPct(p: number) {
  if (p >= 85) return { label: "Optimized", gradient: "linear-gradient(90deg,#22c55e,#16a34a)" };
  if (p >= 70) return { label: "Strong", gradient: "linear-gradient(90deg,#8b5cf6,#6d28d9)" };
  if (p >= 50) return { label: "Developing", gradient: "linear-gradient(90deg,#f59e0b,#d97706)" };
  return { label: "Foundational", gradient: "linear-gradient(90deg,#ef4444,#b91c1c)" };
}

/* ---------------- Part subtitles (optional) ---------------- */
const PART_SUBTITLE: Record<string, string> = {
  "Processes & Documentation": "SOPs, onboarding & how work is shared.",
  "Roles & Responsibilities": "Clarity of ownership and decision rights.",
  "Task Management": "Planning, tracking and accountability.",
  "Performance & Feedback": "Cadence of reviews and feedback habits.",
  "Efficiency & Improvement": "Finding bottlenecks and fixing them.",
  "Metrics & KPIs": "Dashboards, reporting and visibility.",
  "Planning & Execution": "Governance, follow-through and delivery.",
  "Revenue & Cost Awareness": "Leak prevention and opportunities.",
  "Benchmarking & Market Awareness": "Know your strengths and gaps."
};

/* ---------------- Component (Wizard) ---------------- */
const GROUP_SIZE = 2;              // two questions per step
const HAS_DETAILS_STEP = true;     // Step 0 = Participant Details

export default function Module1Survey({ authToken }: { authToken?: string }) {
  /* ---- Auth gate ---- */
  const router = useRouter();
  const tkn = authToken ?? "";
  const isLogin = !!tkn;
  useEffect(() => { if (!isLogin) router.push("/signin"); }, [isLogin, router]);

  /* ---- Org state ---- */
  const [org, setOrg] = useState<Org>({
    companyName: "", contactPerson: "", email: "", phone: "",
    businessType: "", businessTypeOther: "",
    surveyBy: "company", department: "", departmentOther: "",
  });

  const orgValid = () => {
    if (!org.companyName) return false;
    if (!emailOk(org.email)) return false;
    if (!org.businessType) return false;
    if (org.businessType === "Other" && !org.businessTypeOther) return false;
    if (org.surveyBy === "department") {
      if (!org.department) return false;
      if (org.department === "Other" && !org.departmentOther) return false;
    }
    return true;
  };

  /* ---- Answers: radio per question ---- */
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array.from({ length: QUESTIONS.length }, () => null)
  );

  /* ---- Wizard step ---- */
  const questionSteps = Math.ceil(QUESTIONS.length / GROUP_SIZE);
  const stepsCount = HAS_DETAILS_STEP ? 1 + questionSteps : questionSteps;
  const [step, setStep] = useState(0); // 0 = details

  // progress (0..stepsCount)
  const progressPct = Math.round((step / stepsCount) * 100);

  // work out page questions if not on details step
  const qStepIndex = HAS_DETAILS_STEP ? step - 1 : step;
  const startIdx = Math.max(0, qStepIndex) * GROUP_SIZE;
  const endIdx = Math.min(startIdx + GROUP_SIZE, QUESTIONS.length);
  const pageQuestions = step === 0 ? [] : QUESTIONS.slice(startIdx, endIdx);
  const pageIndexes = Array.from({ length: Math.max(0, endIdx - startIdx) }, (_, i) => startIdx + i);

  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers]
  );

  const results: ResultItem[] = useMemo(() => {
    return QUESTIONS.map((q, qi) => {
      const sel = answers[qi];
      const arr = sel === null ? [] : [sel];
      return {
        index: qi + 1,
        part: q.part,
        question: q.q,
        selectedIndices: arr,
        selectedLabels: arr.map((i) => q.answers[i]),
      };
    });
  }, [answers]);

  const score = useMemo(() => computeScore(results), [results]);
  const g = gradeFromPct(score.percentage);

  // validation for current page
  const pageValid = step === 0 ? orgValid() : pageIndexes.every((i) => answers[i] !== null);

  // header title/subtitle
  const partNameFull = step === 0 ? "Participant Details" : (pageQuestions[0]?.part || "");
  const partName = step === 0 ? "Participant Details"
    : ((partNameFull.split("–")[1] || partNameFull).trim());
  const partSubtitle = step === 0
    ? "Your details are included in the JSON and Strapi submission."
    : (PART_SUBTITLE[partName] || "");

  /* ---- Local restore/save ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("module1WizardAnswers");
      if (raw) {
        const arr = JSON.parse(raw) as (number | null)[];
        if (Array.isArray(arr) && arr.length === QUESTIONS.length) setAnswers(arr);
      }
      const orgRaw = localStorage.getItem("module1Org");
      if (orgRaw) setOrg((prev) => ({ ...prev, ...(JSON.parse(orgRaw) as Org) }));
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("module1WizardAnswers", JSON.stringify(answers)); } catch {} }, [answers]);
  useEffect(() => { try { localStorage.setItem("module1Org", JSON.stringify(org)); } catch {} }, [org]);

  /* ---- Events ---- */
  const choose = (qIndex: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  };

  const resetAll = () => {
    setAnswers(Array.from({ length: QUESTIONS.length }, () => null));
    setOrg({
      companyName: "", contactPerson: "", email: "", phone: "",
      businessType: "", businessTypeOther: "",
      surveyBy: "company", department: "", departmentOther: "",
    });
    setStep(0);
    try {
      localStorage.removeItem("module1WizardAnswers");
      localStorage.removeItem("module1Org");
    } catch {}
  };

  /* ---- Submit to Strapi ---- */
  function buildPayload(): Payload {
    const res = QUESTIONS.map((q, qi) => {
      const sel = answers[qi];
      const arr = sel === null ? [] : [sel];
      return {
        index: qi + 1,
        part: q.part,
        question: q.q,
        selectedIndices: arr,
        selectedLabels: arr.map((i) => q.answers[i]),
      };
    });
    const sc = computeScore(res);
    const redFlags = res.filter((r) => r.selectedIndices.includes(0)).length;
    const completion = res.filter((r) => r.selectedIndices.length > 0).length;
    return { org, results: res, score: sc, redFlags, completion, timestamp: new Date().toISOString() };
  }

  function mapToStrapiData(payload: Payload) {
    // Normalize fields to match Strapi enums
    const normalizeOrg = (o: Org) => {
      let businessType: "Hospitality" | "Retail" | "Manufacturing" | "Services" | "Other";
      switch (o.businessType) {
        case "Hospitality":
          businessType = "Hospitality"; break;
        case "Retail":
        case "Retail & E-commerce":
          businessType = "Retail"; break;
        case "Manufacturing":
          businessType = "Manufacturing"; break;
        case "Other":
          businessType = "Other"; break;
        default:
          businessType = "Services"; // Map all other categories to Services
      }

      const surveyBy: "company" | "consultant" | "other" = o.surveyBy === "company" ? "company" : "other";

      return {
        ...o,
        businessType,
        surveyBy,
      };
    };

    return {
      externalId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `ext-${Date.now()}`,
      userId: "",
      org: normalizeOrg(payload.org),
      results: payload.results.map(r => ({
        index: r.index, part: r.part, question: r.question,
        selectedItems: r.selectedIndices.map((idx, i) => ({ index: idx, label: r.selectedLabels[i] })),
      })),
      score: payload.score,
      redFlags: payload.redFlags,
      completion: payload.completion,
      timestamp: payload.timestamp,
      submittedAt: new Date().toISOString(),
      version: "1.0",
    };
  }

  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async () => {
    if (answers.some((a) => a === null)) {
      alert("Please complete all questions.");
      return;
    }
    const payload = buildPayload();
    const data = mapToStrapiData(payload);
    setSubmitting(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"}/api/survey-submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
        },
        body: JSON.stringify({ data }),
      });
      const j = await r.json();
      if (!r.ok) {
        console.error(j);
        alert(j?.error?.message || "Failed to submit.");
        return;
      }
      alert(`Submitted! Status: ${g.label} • Score: ${payload.score.percentage}%`);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- UI ---- */
  return (
    <div className="shell">
      {/* Top bar */}
      <div className="topbar">
        <div className="brand">
          <div className="title">Ariflex Diagnostic App</div>
          <div className="subtitle">Solid speedometers • Anchor lenses • Adaptive questions • Client report at the end</div>
        </div>
        <button className="ghost" onClick={resetAll} title="Reset all answers">↻ Reset</button>
      </div>

      {/* Progress */}
      <div className="progress-wrap" aria-label="progress">
        <div className="progress-outer"><div className="progress-inner" style={{ width: `${progressPct}%` }} /></div>
        <div className="step-label">Step {step + 1} of {stepsCount + 1}</div>
      </div>

      {/* Section header */}
      <div className="section">
        <h2>{partName}</h2>
        {partSubtitle && <p className="muted">{partSubtitle}</p>}
      </div>

      {/* Step 0: Participant Details */}
      {step === 0 && (
        <section className="card panel">
          <div className="grid-2">
            <div className="field">
              <label>Company Name <span className="hint">(required)</span></label>
              <input value={org.companyName} onChange={e => setOrg({ ...org, companyName: e.target.value })} placeholder="e.g., Raweyah" />
            </div>
            <div className="field">
              <label>Contact Person</label>
              <input value={org.contactPerson} onChange={e => setOrg({ ...org, contactPerson: e.target.value })} placeholder="e.g., Mishal" />
            </div>
            <div className="field">
              <label>Email <span className="hint">(required)</span></label>
              <input type="email" autoComplete="email" value={org.email} onChange={e => setOrg({ ...org, email: e.target.value })} placeholder="you@company.com" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input type="tel" value={org.phone} onChange={e => setOrg({ ...org, phone: e.target.value })} placeholder="+966…" />
            </div>
            <div className="field">
              <label>Business Type <span className="hint">(required)</span></label>
              <select value={org.businessType} onChange={e => setOrg({ ...org, businessType: e.target.value })}>
                <option value="">Select…</option>
                <option>Technology</option><option>Healthcare</option><option>Finance</option>
                <option>Retail & E-commerce</option><option>Manufacturing</option><option>Education</option>
                <option>Government</option><option>Hospitality</option><option>Logistics</option>
                <option>Non-profit</option><option>Other</option>
              </select>
            </div>
            {org.businessType === "Other" && (
              <div className="field">
                <label>Other business type</label>
                <input value={org.businessTypeOther} onChange={e => setOrg({ ...org, businessTypeOther: e.target.value })} placeholder="Describe" />
              </div>
            )}
            <div className="field full">
              <label>Survey By <span className="hint">(required)</span></label>
              <div className="row">
                <label className="radio">
                  <input type="radio" checked={org.surveyBy === "company"} onChange={() => setOrg({ ...org, surveyBy: "company", department: "", departmentOther: "" })} />
                  <span>By the Company</span>
                </label>
                <label className="radio">
                  <input type="radio" checked={org.surveyBy === "department"} onChange={() => setOrg({ ...org, surveyBy: "department" })} />
                  <span>By department</span>
                </label>
              </div>
            </div>
            {org.surveyBy === "department" && (
              <div className="field full">
                <label>Department <span className="hint">(required)</span></label>
                <div className="grid-2">
                  <select value={org.department} onChange={e => setOrg({ ...org, department: e.target.value, ...(e.target.value !== "Other" ? { departmentOther: "" } : {}) })}>
                    <option value="">Select…</option>
                    <option>Sales</option><option>Marketing</option><option>Operations</option><option>HR</option>
                    <option>Finance</option><option>IT</option><option>Customer Support</option>
                    <option>R&amp;D</option><option>Procurement</option><option>Legal</option><option>Other</option>
                  </select>
                  {org.department === "Other" && (
                    <input placeholder="Other department" value={org.departmentOther} onChange={e => setOrg({ ...org, departmentOther: e.target.value })} />
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>Details are stored locally and included in the Strapi payload.</p>
        </section>
      )}

      {/* Question pages (2 per step) */}
      {step > 0 && (
        <div className="q-list">
          {pageQuestions.map((q, idx) => {
            const qi = pageIndexes[idx];
            const current = answers[qi];
            return (
              <div key={qi} className="q-card">
                <div className="q-text">{q.q}</div>
                <div className="options">
                  {q.answers.map((label, i) => (
                    <label key={i} className={`opt ${current === i ? "active" : ""}`}>
                      <input type="radio" name={`q-${qi}`} checked={current === i} onChange={() => choose(qi, i)} />
                      <span>{label.split(" (")[0]}</span>
                    </label>
                  ))}
                </div>
                <div className="meta">
                  <span className="chip">Automation</span>
                  <a className="mini" href="#" onClick={(e)=>e.preventDefault()}>1 = none → 5 = API + monitoring</a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer nav */}
      <div className="footer-nav">
        <div className="actions d-flex justify-content-between">
          <button className="nav ghost dark" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>‹ Back</button>
          {step < stepsCount ? (
            <button className=" btn" disabled={!pageValid} onClick={() => setStep((s) => Math.min(stepsCount, s + 1))}>
              Next ›
            </button>
          ) : (
            <button className="nav primary" disabled={submitting || !pageValid} onClick={onSubmit}>
              {submitting ? "Submitting…" : "Submit Module 1"}
            </button>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        :root{ --ink:#0b1220; --muted:#6b7a99; --bg:#f7f8fc; --panel:#ffffff; --border:#e6e9f2; --accent:#0b72ff; }
        *{box-sizing:border-box}
        body{background:var(--bg)}
        .shell{max-width:960px;margin:0 auto;padding:22px}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
        .title{font-weight:800}
        .subtitle{color:var(--muted);font-size:.9rem}
        .ghost{background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer}
        .ghost.dark{background:#0b1220;color:#fff;border-color:#0b1220}
        .brand .title{font-size:1.25rem}
        .progress-wrap{display:flex;align-items:center;gap:12px;margin:10px 0 18px}
        .progress-outer{flex:1;height:10px;background:#edf1f7;border-radius:999px;overflow:hidden}
        .progress-inner{height:100%;background:${g.gradient}}
        .step-label{color:var(--muted);font-size:.9rem;min-width:max-content}
        .section h2{margin:0 0 4px}
        .muted{color:var(--muted)}
        .card.panel{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px}
        .grid-2{display:grid;grid-template-columns:1fr;gap:14px}
        @media(min-width:900px){.grid-2{grid-template-columns:1fr 1fr}}
        .field{display:flex;flex-direction:column;gap:6px}
        .row{display:flex;gap:14px;flex-wrap:wrap}
        .radio{display:flex;align-items:center;gap:8px}
        .hint{font-size:.85rem;color:var(--muted)}
        .q-list{display:flex;flex-direction:column;gap:16px}
        .q-card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px}
        .q-text{font-weight:600;margin-bottom:10px}
        .options{display:flex;flex-wrap:wrap;gap:10px}
        .opt{display:flex;align-items:center;gap:8px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:#fff;cursor:pointer}
        .opt input{display:none}
        .opt.active{border-color:var(--ink);box-shadow:0 0 0 2px #0b12200f}
        .meta{display:flex;align-items:center;gap:8px;margin-top:8px}
        .chip{background:#eef4ff;color:#2846a0;border:1px solid #d7e5ff;padding:3px 8px;border-radius:999px;font-size:.8rem}
        .mini{color:#556bad;text-decoration:none;font-size:.85rem}
        .footer-nav{display:flex;justify-content:space-between;align-items:center;margin:18px 0}
        .nav{padding:12px 16px;border-radius:12px;border:1px solid var(--border);cursor:pointer}
        .nav.primary{background:var(--ink);color:#fff;border-color:var(--ink)}
        .nav:disabled{opacity:.5;cursor:not-allowed}
        input, select{background:#fff;border-radius:10px;padding:10px}
      
      `}</style>
    </div>
  );
}
