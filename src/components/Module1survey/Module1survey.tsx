"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Types ---------------- */
type Question = { part: string; q: string; answers: string[] };

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

type ResultItem = {
  index: number;
  part: string;
  question: string;
  selectedIndices: number[];
  selectedLabels: string[];
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
  // 1️⃣ Organizational Foundation & Structure
  {
    part: "Part 1 – Organizational Foundation & Structure",
    q: "How clearly are your workflows, roles, and responsibilities defined and documented for employees to follow?",
    answers: [
      "Not defined or documented at all (Not fulfilled)",
      "Some roles or workflows exist but mostly informal",
      "Documented for key areas, but inconsistent or outdated",
      "Clearly documented and accessible for most teams",
      "Fully standardized, documented, and regularly updated across all departments",
    ],
  },
  {
    part: "Part 1 – Organizational Foundation & Structure",
    q: "How well do employees understand and follow the documented processes in their daily work?",
    answers: [
      "No awareness or use of any process documentation (Not fulfilled)",
      "Only some employees follow written procedures",
      "Documentation exists, but not consistently followed",
      "Most teams refer to and comply with documented workflows",
      "All staff fully trained and adhere to structured operational processes",
    ],
  },

  // 2️⃣ Operational Planning & Execution
  {
    part: "Part 2 – Operational Planning & Execution",
    q: "When new goals or strategies are approved, how consistently are they converted into actionable plans?",
    answers: [
      "No structured process for turning ideas into plans (Not fulfilled)",
      "Plans created occasionally without ownership",
      "Some projects tracked manually, others not",
      "Clear planning with measurable steps and owners",
      "Standardized execution model used company-wide for every initiative",
    ],
  },
  {
    part: "Part 2 – Operational Planning & Execution",
    q: "How do you monitor progress and ensure tasks are completed as planned?",
    answers: [
      "No tracking; progress known only when deadlines missed (Not fulfilled)",
      "Informal updates shared occasionally",
      "Managers track some activities but lack visibility",
      "Regular progress tracking with defined responsibilities",
      "Continuous monitoring with escalation and automated reminders",
    ],
  },

  // 3️⃣ Workflow Efficiency & Systems
  {
    part: "Part 3 – Workflow Efficiency & Systems",
    q: "How do teams manage and track their daily tasks and projects?",
    answers: [
      "No formal system; relies on memory or chat apps (Not fulfilled)",
      "Simple lists or spreadsheets used manually",
      "A few tools used inconsistently across teams",
      "Centralized task tracker used regularly",
      "Fully integrated digital system with dashboards and accountability",
    ],
  },
  {
    part: "Part 3 – Workflow Efficiency & Systems",
    q: "How often are inefficiencies (e.g., delays, rework, miscommunication) identified and resolved?",
    answers: [
      "Rarely identified or documented (Not fulfilled)",
      "Identified occasionally, but no formal resolution",
      "Discussed periodically, with limited follow-up",
      "Reviewed through meetings and improvement logs",
      "Continuously monitored and improved using data-driven insights",
    ],
  },

  // 4️⃣ Performance Measurement & Accountability
  {
    part: "Part 4 – Performance Measurement & Accountability",
    q: "How regularly are employee or team performance results reviewed and discussed?",
    answers: [
      "No review or feedback system exists (Not fulfilled)",
      "Feedback given only when problems arise",
      "Some reviews occur, but not systematically",
      "Regular reviews (monthly or quarterly) across teams",
      "Continuous performance tracking integrated into operations",
    ],
  },
  {
    part: "Part 4 – Performance Measurement & Accountability",
    q: "How clearly are responsibilities and accountability defined for achieving key performance goals (KPIs)?",
    answers: [
      "No defined accountability structure (Not fulfilled)",
      "Roles unclear; goals often missed",
      "Some KPIs assigned, but ownership unclear",
      "Clear accountability for most goals and metrics",
      "All KPIs linked to specific owners and reviewed frequently",
    ],
  },

  // 5️⃣ Communication, Collaboration & Culture
  {
    part: "Part 5 – Communication, Collaboration & Culture",
    q: "How open and effective is communication across departments and levels of management?",
    answers: [
      "Very poor; frequent silos and misunderstandings (Not fulfilled)",
      "Basic communication exists but unstructured",
      "Regular updates but often unclear or delayed",
      "Effective cross-functional collaboration and updates",
      "Transparent communication culture supported by leadership",
    ],
  },
  {
    part: "Part 5 – Communication, Collaboration & Culture",
    q: "How easily can employees provide feedback or raise issues to management?",
    answers: [
      "No channel for feedback (Not fulfilled)",
      "Employees hesitate or fear to raise issues",
      "Occasional feedback, not always acted upon",
      "Clear and open feedback process exists",
      "Encouraged culture of open communication and action on feedback",
    ],
  },

  // 6️⃣ Risk, Problem-Solving & Adaptability
  {
    part: "Part 6 – Risk, Problem-Solving & Adaptability",
    q: "How effectively does the company identify and analyze recurring problems or risks?",
    answers: [
      "No structured problem-tracking system (Not fulfilled)",
      "Issues identified only during crises",
      "Some analysis done informally",
      "Regular reviews with basic documentation",
      "Proactive risk identification with root-cause analysis and prevention",
    ],
  },
  {
    part: "Part 6 – Risk, Problem-Solving & Adaptability",
    q: "How well does your organization adapt to new systems, technologies, or market changes?",
    answers: [
      "Strong resistance to change (Not fulfilled)",
      "Adopts changes only under pressure",
      "Some openness but inconsistent adoption",
      "Generally adaptable and responsive",
      "Highly agile; adapts quickly through continuous learning",
    ],
  },

  // 7️⃣ Financial Health & Resource Utilization
  {
    part: "Part 7 – Financial Health & Resource Utilization",
    q: "How regularly are costs, budgets, and resource usage reviewed for efficiency?",
    answers: [
      "Rarely or never reviewed (Not fulfilled)",
      "Reviewed only when overspending occurs",
      "Occasional cost reviews at department level",
      "Regular cost analysis linked to KPIs",
      "Ongoing financial efficiency tracking with proactive actions",
    ],
  },
  {
    part: "Part 7 – Financial Health & Resource Utilization",
    q: "How quickly are financial inefficiencies (losses, revenue leaks) detected and corrected?",
    answers: [
      "Not detected until it causes major loss (Not fulfilled)",
      "Detected late, with no follow-up",
      "Occasionally detected and corrected",
      "Regularly monitored through finance reviews",
      "Automatically tracked through data analytics and immediate corrective action",
    ],
  },

  // 8️⃣ Market Awareness & Benchmarking
  {
    part: "Part 8 – Market Awareness & Benchmarking",
    q: "How often does the company compare its performance with competitors or industry benchmarks?",
    answers: [
      "Never benchmarked (Not fulfilled)",
      "Discussed informally but not documented",
      "Benchmarking done occasionally for specific areas",
      "Regular comparisons against key industry standards",
      "Continuous benchmarking with integration of external best practices",
    ],
  },
  {
    part: "Part 8 – Market Awareness & Benchmarking",
    q: "How aware is leadership of changing market trends and competitor strategies?",
    answers: [
      "No awareness or tracking (Not fulfilled)",
      "Awareness exists but rarely analyzed",
      "Market data reviewed occasionally",
      "Regular market analysis done and shared",
      "Market intelligence integrated into strategic planning",
    ],
  },

  // 9️⃣ Continuous Improvement & Innovation
  {
    part: "Part 9 – Continuous Improvement & Innovation",
    q: "How often does your organization review and improve its processes, systems, or tools?",
    answers: [
      "No improvement reviews conducted (Not fulfilled)",
      "Only after major issues occur",
      "Occasionally reviewed without formal process",
      "Regular internal reviews for efficiency",
      "Continuous improvement embedded in company operations",
    ],
  },
  {
    part: "Part 9 – Continuous Improvement & Innovation",
    q: "How actively does leadership encourage new ideas or innovation from employees?",
    answers: [
      "No encouragement for innovation (Not fulfilled)",
      "Occasionally accepts ideas but rarely implements",
      "Some initiatives taken but limited recognition",
      "Regular idea-sharing and pilot programs encouraged",
      "Strong innovation culture with recognition and measurable impact",
    ],
  },
];


/* ---------------- Utilities ---------------- */
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
function computeScore(res: ResultItem[]) {
  let total = 0;
  const max = QUESTIONS.length * 4;
  res.forEach((r) => {
    if (r.selectedIndices.includes(0)) return;
    let best = 0;
    r.selectedIndices.forEach((v) => {
      if (v > best) best = v;
    });
    total += best;
  });
  const pct = Math.round((total / max) * 100) || 0;
  return { totalPoints: total, maxPoints: max, percentage: pct };
}
function gradeFromPct(p: number) {
  if (p >= 85)
    return {
      label: "Optimized",
      gradient: "linear-gradient(90deg,#22c55e,#16a34a)",
    };
  if (p >= 70)
    return {
      label: "Strong",
      gradient: "linear-gradient(90deg,#8b5cf6,#6d28d9)",
    };
  if (p >= 50)
    return {
      label: "Developing",
      gradient: "linear-gradient(90deg,#f59e0b,#d97706)",
    };
  return {
    label: "Foundational",
    gradient: "linear-gradient(90deg,#ef4444,#b91c1c)",
  };
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
  "Benchmarking & Market Awareness": "Know your strengths and gaps.",
};

/* ---------------- Component (Wizard) ---------------- */
const GROUP_SIZE = 2; // two questions per step
const HAS_DETAILS_STEP = true; // Step 0 = Participant Details

export default function Module1Survey({ authToken }: { authToken?: string }) {
  /* ---- Auth gate ---- */
  const router = useRouter();
  const tkn = authToken ?? "";
  const isLogin = !!tkn;
  useEffect(() => {
    if (!isLogin) router.push("/signin");
  }, [isLogin, router]);

  /* ---- Org state ---- */
  const [org, setOrg] = useState<Org>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    businessType: "",
    businessTypeOther: "",
    surveyBy: "company",
    department: "",
    departmentOther: "",
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
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array.from({ length: QUESTIONS.length }, () => null)
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
  const pageIndexes = Array.from(
    { length: Math.max(0, endIdx - startIdx) },
    (_, i) => startIdx + i
  );

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
  const pageValid =
    step === 0 ? orgValid() : pageIndexes.every((i) => answers[i] !== null);

  // header title/subtitle
  const partNameFull =
    step === 0 ? "Participant Details" : pageQuestions[0]?.part || "";
  const partName =
    step === 0
      ? "Participant Details"
      : (partNameFull.split("–")[1] || partNameFull).trim();
  const partSubtitle =
    step === 0
      ? "Your details are included in the JSON and Strapi submission."
      : PART_SUBTITLE[partName] || "";

  /* ---- Local restore/save ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("module1WizardAnswers");
      if (raw) {
        const arr = JSON.parse(raw) as (number | null)[];
        if (Array.isArray(arr) && arr.length === QUESTIONS.length)
          setAnswers(arr);
      }
      const orgRaw = localStorage.getItem("module1Org");
      if (orgRaw)
        setOrg((prev) => ({ ...prev, ...(JSON.parse(orgRaw) as Org) }));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("module1WizardAnswers", JSON.stringify(answers));
    } catch {}
  }, [answers]);
  useEffect(() => {
    try {
      localStorage.setItem("module1Org", JSON.stringify(org));
    } catch {}
  }, [org]);

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
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      businessType: "",
      businessTypeOther: "",
      surveyBy: "company",
      department: "",
      departmentOther: "",
    });
    setStep(0);
    try {
      localStorage.removeItem("module1WizardAnswers");
      localStorage.removeItem("module1Org");
    } catch {}
  };

  const clearFormData = () => {
    setAnswers(Array.from({ length: QUESTIONS.length }, () => null));
    setOrg({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      businessType: "",
      businessTypeOther: "",
      surveyBy: "company",
      department: "",
      departmentOther: "",
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
    return {
      org,
      results: res,
      score: sc,
      redFlags,
      completion,
      timestamp: new Date().toISOString(),
    };
  }

  function mapToStrapiData(payload: Payload) {
    // Normalize fields to match Strapi enums
    const normalizeOrg = (o: Org) => {
      let businessType:
        | "Agriculture, Forestry and Fishing"
        | "Mining and Quarrying"
        | "Manufacturing"
        | "Electricity, Gas, Steam and Air Conditioning Supply"
        | "Water Supply, Sewerage and Waste Management"
        | "Construction"
        | "Wholesale and Retail Trade"
        | "Transportation and Storage"
        | "Accommodation and Food Service Activities"
        | "Information and Communication"
        | "Financial and Insurance Activities"
        | "Real Estate Activities"
        | "Professional, Scientific and Technical Activities"
        | "Administrative and Support Service Activities"
        | "Public Administration and Defense"
        | "Education"
        | "Human Health and Social Work Activities"
        | "Arts, Entertainment and Recreation"
        | "Other Service Activities"
        | "Other";
      switch (o.businessType) {
        case "Agriculture, Forestry and Fishing":
          businessType = "Agriculture, Forestry and Fishing";
          break;
        case "Mining and Quarrying":
          businessType = "Mining and Quarrying";
          break;
        case "Manufacturing":
          businessType = "Manufacturing";
          break;
        case "Electricity, Gas, Steam and Air Conditioning Supply":
          businessType = "Electricity, Gas, Steam and Air Conditioning Supply";
          break;
        case "Water Supply, Sewerage and Waste Management":
          businessType = "Water Supply, Sewerage and Waste Management";
          break;
        case "Construction":
          businessType = "Construction";
          break;
        case "Wholesale and Retail Trade":
          businessType = "Wholesale and Retail Trade";
          break;
        case "Transportation and Storage":
          businessType = "Transportation and Storage";
          break;
        case "Accommodation and Food Service Activities":
          businessType = "Accommodation and Food Service Activities";
          break;
        case "Information and Communication":
          businessType = "Information and Communication";
          break;
        case "Financial and Insurance Activities":
          businessType = "Financial and Insurance Activities";
          break;
        case "Real Estate Activities":
          businessType = "Real Estate Activities";
          break;
        case "Professional, Scientific and Technical Activities":
          businessType = "Professional, Scientific and Technical Activities";
          break;
        case "Administrative and Support Service Activities":
          businessType = "Administrative and Support Service Activities";
          break;
        case "Public Administration and Defense":
          businessType = "Public Administration and Defense";
          break;
        case "Education":
          businessType = "Education";
          break;
        case "Human Health and Social Work Activities":
          businessType = "Human Health and Social Work Activities";
          break;
        case "Arts, Entertainment and Recreation":
          businessType = "Arts, Entertainment and Recreation";
          break;
        case "Other Service Activities":
          businessType = "Other Service Activities";
          break;
        case "Other":
          businessType = "Other";
          break;
        default:
          businessType = "Other Service Activities"; // Map all other categories to Other Service Activities
      }

      const surveyBy: "company" | "consultant" | "other" =
        o.surveyBy === "company" ? "company" : "other";

      return {
        ...o,
        businessType,
        surveyBy,
      };
    };

    return {
      externalId:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `ext-${Date.now()}`,
      userId: "",
      org: normalizeOrg(payload.org),
      results: payload.results.map((r) => ({
        index: r.index,
        part: r.part,
        question: r.question,
        selectedItems: r.selectedIndices.map((idx, i) => ({
          index: idx,
          label: r.selectedLabels[i],
        })),
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
      const r = await fetch(
        `${
          process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"
        }/api/survey-submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(tkn ? { Authorization: `Bearer ${tkn}` } : {}),
          },
          body: JSON.stringify({ data }),
        }
      );
      const j = await r.json();
      if (!r.ok) {
        console.error(j);
        alert(j?.error?.message || "Failed to submit.");
        return;
      }
      alert(
        `✅ Survey submitted successfully!\n\nStatus: ${g.label}\nScore: ${payload.score.percentage}%\n\nRedirecting to dashboard...`
      );
      
      // Clear form data after successful submission
      clearFormData();
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Wait 2 seconds to let user see the success message
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
          <div className="subtitle">
            Solid speedometers • Anchor lenses • Adaptive questions • Client
            report at the end
          </div>
        </div>
        <button className="ghost" onClick={resetAll} title="Reset all answers">
          ↻ Reset
        </button>
      </div>

      {/* Progress */}
      <div className="progress-wrap" aria-label="progress">
        <div className="progress-outer">
          <div
            className="progress-inner"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="step-label">
          Step {step + 1} of {stepsCount + 1}
        </div>
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
              <label>
                Company Name <span className="hint">(required)</span>
              </label>
              <input
                type="text"
                value={org.companyName}
                onChange={(e) =>
                  setOrg({ ...org, companyName: e.target.value })
                }
                placeholder="e.g., Raweyah"
              />
            </div>
            <div className="field">
              <label>Contact Person</label>
              <input
                type="text"
                value={org.contactPerson}
                onChange={(e) =>
                  setOrg({ ...org, contactPerson: e.target.value })
                }
                placeholder="e.g., Mishal"
              />
            </div>
            <div className="field">
              <label>
                Email <span className="hint">(required)</span>
              </label>
              <input
                type="email"
                autoComplete="email"
                value={org.email}
                onChange={(e) => setOrg({ ...org, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                type="tel"
                value={org.phone}
                onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                placeholder="+966…"
              />
            </div>
            <div className="field">
              <label>
                Business Type <span className="hint">(required)</span>
              </label>
              <select
                value={org.businessType}
                onChange={(e) =>
                  setOrg({ ...org, businessType: e.target.value })
                }
              >
                <option value="">Select…</option>
                <option>Agriculture, Forestry and Fishing</option>
                <option>Mining and Quarrying</option>
                <option>Manufacturing</option>
                <option>Electricity, Gas, Steam and Air Conditioning Supply</option>
                <option>Water Supply, Sewerage and Waste Management</option>
                <option>Construction</option>
                <option>Wholesale and Retail Trade</option>
                <option>Transportation and Storage</option>
                <option>Accommodation and Food Service Activities</option>
                <option>Information and Communication</option>
                <option>Financial and Insurance Activities</option>
                <option>Real Estate Activities</option>
                <option>Professional, Scientific and Technical Activities</option>
                <option>Administrative and Support Service Activities</option>
                <option>Public Administration and Defense</option>
                <option>Education</option>
                <option>Human Health and Social Work Activities</option>
                <option>Arts, Entertainment and Recreation</option>
                <option>Other Service Activities</option>
                <option>Other</option>
              </select>
            </div>
            {org.businessType === "Other" && (
              <div className="field">
                <label>Other business type</label>
                <input
                  type="text"
                  value={org.businessTypeOther}
                  onChange={(e) =>
                    setOrg({ ...org, businessTypeOther: e.target.value })
                  }
                  placeholder="Describe"
                />
              </div>
            )}
            <div className="field full">
              <label>
                Survey By <span className="hint">(required)</span>
              </label>
              <div className="row">
                <label className="radio">
                  <input
                    type="radio"
                    checked={org.surveyBy === "company"}
                    onChange={() =>
                      setOrg({
                        ...org,
                        surveyBy: "company",
                        department: "",
                        departmentOther: "",
                      })
                    }
                  />
                  <span>By the Company</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    checked={org.surveyBy === "department"}
                    onChange={() => setOrg({ ...org, surveyBy: "department" })}
                  />
                  <span>By department</span>
                </label>
              </div>
            </div>
            {org.surveyBy === "department" && (
              <div className="field full">
                <label>
                  Department <span className="hint">(required)</span>
                </label>
                <div className="grid-2">
                  <select
                    value={org.department}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        department: e.target.value,
                        ...(e.target.value !== "Other"
                          ? { departmentOther: "" }
                          : {}),
                      })
                    }
                  >
                    <option value="">Select…</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>Operations</option>
                    <option>HR</option>
                    <option>Finance</option>
                    <option>IT</option>
                    <option>Customer Support</option>
                    <option>R&amp;D</option>
                    <option>Procurement</option>
                    <option>Legal</option>
                    <option>Other</option>
                  </select>
                  {org.department === "Other" && (
                    <input
                      type="text"
                      placeholder="Other department"
                      value={org.departmentOther}
                      onChange={(e) =>
                        setOrg({ ...org, departmentOther: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Details are stored locally and included in the Strapi payload.
          </p>
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
                    <label
                      key={i}
                      className={`opt ${current === i ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={current === i}
                        onChange={() => choose(qi, i)}
                      />
                      <span>{label.split(" (")[0]}</span>
                    </label>
                  ))}
                </div>
                <div className="meta">
                  <span className="chip">Automation</span>
                  <a
                    className="mini"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    1 = none → 5 = API + monitoring
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer nav */}
      <div className="footer-nav">
        <div className="actions d-flex justify-content-between">
          <button
            className="nav ghost dark"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            ‹ Back
          </button>
          {step < stepsCount ? (
            <button
              className=" btn"
              disabled={!pageValid}
              onClick={() => setStep((s) => Math.min(stepsCount, s + 1))}
            >
              Next ›
            </button>
          ) : (
            <button
              className="nav primary"
              disabled={submitting || !pageValid}
              onClick={onSubmit}
            >
              {submitting ? "Submitting…" : "Submit Module 1"}
            </button>
          )}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        :root {
          --ink: #0b1220;
          --muted: #6b7a99;
          --bg: #f7f8fc;
          --panel: #ffffff;
          --border: #e6e9f2;
          --accent: #0b72ff;
        }
        * {
          box-sizing: border-box;
        }
        body {
          background: var(--bg);
        }
        .shell {
          max-width: 960px;
          margin: 0 auto;
          padding: 22px;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .title {
          font-weight: 800;
        }
        .subtitle {
          color: var(--muted);
          font-size: 0.9rem;
        }
        .ghost {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
        }
        .ghost.dark {
          background: #0b1220;
          color: #fff;
          border-color: #0b1220;
        }
        .brand .title {
          font-size: 1.25rem;
        }
        .progress-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 10px 0 18px;
        }
        .progress-outer {
          flex: 1;
          height: 10px;
          background: #edf1f7;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-inner {
          height: 100%;
          background: ${g.gradient};
        }
        .step-label {
          color: var(--muted);
          font-size: 0.9rem;
          min-width: max-content;
        }
        .section h2 {
          margin: 0 0 4px;
        }
        .muted {
          color: var(--muted);
        }
        .card.panel {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 900px) {
          .grid-2 {
            grid-template-columns: 1fr 1fr;
          }
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .radio {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hint {
          font-size: 0.85rem;
          color: var(--muted);
        }
        .q-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .q-card {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px;
        }
        .q-text {
          font-weight: 600;
          margin-bottom: 10px;
        }
        .options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .opt {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
        }
        .opt input {
          display: none;
        }
        .opt.active {
          border-color: var(--ink);
          box-shadow: 0 0 0 2px #0b12200f;
        }
        .meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }
        .chip {
          background: #eef4ff;
          color: #2846a0;
          border: 1px solid #d7e5ff;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.8rem;
        }
        .mini {
          color: #556bad;
          text-decoration: none;
          font-size: 0.85rem;
        }
        .footer-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 18px 0;
        }
        .nav {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
          cursor: pointer;
        }
        .nav.primary {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #fff;
          border-color: #4f46e5;
          font-weight: 700;
          font-size: 16px;
          padding: 16px 32px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .nav.primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #3730a3 0%, #6d28d9 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }
        
        .nav.primary:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        
        .nav.primary:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .nav.primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .nav.primary:hover::before {
          left: 100%;
        }
        .nav:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        input,
        select {
          background: #fff;
          color: #0f172a;
          border: 1px solid #e6e8f0;
          border-radius: 10px;
          padding: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        input:focus,
        select:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
        
        input::placeholder {
          color: #64748b;
        }
        
        /* Ensure all form elements have proper text color */
        textarea {
          background: #fff;
          color: #0f172a;
          border: 1px solid #e6e8f0;
          border-radius: 10px;
          padding: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }
        
        textarea::placeholder {
          color: #64748b;
        }
        
        /* Override any inherited dark styles */
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="password"],
        input[type="number"] {
          background: #fff !important;
          color: #0f172a !important;
        }
        
        /* Ensure all inputs without explicit type have proper styling */
        input:not([type]),
        input[type=""] {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e6e8f0 !important;
        }
        
        /* Additional specificity for form inputs */
        .field input,
        .field input[type="text"],
        .field input[type="email"],
        .field input[type="tel"] {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid #e6e8f0 !important;
        }
      `}</style>
    </div>
  );
}
