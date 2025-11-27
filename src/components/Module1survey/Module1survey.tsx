"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { RiResetLeftFill } from "react-icons/ri";
import "./Module1survey.css";

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
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 1 – Organizational Foundation & Structure",
    q: "How well do employees understand and follow the documented processes in their daily work?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 2️⃣ Operational Planning & Execution
  {
    part: "Part 2 – Operational Planning & Execution",
    q: "When new goals or strategies are approved, how consistently are they converted into actionable plans?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 2 – Operational Planning & Execution",
    q: "How do you monitor progress and ensure tasks are completed as planned?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 3️⃣ Workflow Efficiency & Systems
  {
    part: "Part 3 – Workflow Efficiency & Systems",
    q: "How do teams manage and track their daily tasks and projects?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 3 – Workflow Efficiency & Systems",
    q: "How often are inefficiencies (e.g., delays, rework, miscommunication) identified and resolved?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 4️⃣ Performance Measurement & Accountability
  {
    part: "Part 4 – Performance Measurement & Accountability",
    q: "How regularly are employee or team performance results reviewed and discussed?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 4 – Performance Measurement & Accountability",
    q: "How clearly are responsibilities and accountability defined for achieving key performance goals (KPIs)?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 5️⃣ Communication, Collaboration & Culture
  {
    part: "Part 5 – Communication, Collaboration & Culture",
    q: "How open and effective is communication across departments and levels of management?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 5 – Communication, Collaboration & Culture",
    q: "How easily can employees provide feedback or raise issues to management?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 6️⃣ Risk, Problem-Solving & Adaptability
  {
    part: "Part 6 – Risk, Problem-Solving & Adaptability",
    q: "How effectively does the company identify and analyze recurring problems or risks?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 6 – Risk, Problem-Solving & Adaptability",
    q: "How well does your organization adapt to new systems, technologies, or market changes?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 7️⃣ Financial Health & Resource Utilization
  {
    part: "Part 7 – Financial Health & Resource Utilization",
    q: "How regularly are costs, budgets, and resource usage reviewed for efficiency?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 7 – Financial Health & Resource Utilization",
    q: "How quickly are financial inefficiencies (losses, revenue leaks) detected and corrected?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 8️⃣ Market Awareness & Benchmarking
  {
    part: "Part 8 – Market Awareness & Benchmarking",
    q: "How often does the company compare its performance with competitors or industry benchmarks?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 8 – Market Awareness & Benchmarking",
    q: "How aware is leadership of changing market trends and competitor strategies?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },

  // 9️⃣ Continuous Improvement & Innovation
  {
    part: "Part 9 – Continuous Improvement & Innovation",
    q: "How often does your organization review and improve its processes, systems, or tools?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
    ],
  },
  {
    part: "Part 9 – Continuous Improvement & Innovation",
    q: "How actively does leadership encourage new ideas or innovation from employees?",
    answers: [
      "Not at all",
      "Rarely / Ad-hoc",
      "Sometimes / Partial",
      "Mostly consistent",
      "Always + well managed",
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

  // Animation management
  const [stepAnimation, setStepAnimation] = useState<
    "slide-in-left" | "slide-in-right" | ""
  >("");
  const prevStepRef = useRef<number>(0);

  // Custom CSS for animations
  useEffect(() => {
    if (typeof window !== "undefined") {
      const styleId = "module1survey-animations";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
        .step-animate {
          animation-duration: 400ms;
          animation-fill-mode: both;
        }
        @keyframes step-slide-in-left {
          from { opacity: 0; transform: translateX(50px);}
          to   { opacity: 1; transform: translateX(0);}
        }
        @keyframes step-slide-in-right {
          from { opacity: 0; transform: translateX(-50px);}
          to   { opacity: 1; transform: translateX(0);}
        }
        .slide-in-left { animation-name: step-slide-in-left;}
        .slide-in-right { animation-name: step-slide-in-right;}
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  // Calculate animation direction on step change
  function animatedSetStep(newStep: number) {
    setStepAnimation(newStep > step ? "slide-in-right" : "slide-in-left");
    setTimeout(() => setStep(newStep), 10); // let animation class be set for rerender step content
    prevStepRef.current = step;
  }

  // Remove animation class after animation ends, so re-animation works
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stepAnimation) return;
    const handler = () => setStepAnimation("");
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener("animationend", handler);
    return () => el.removeEventListener("animationend", handler);
  }, [stepAnimation, step]);

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
          <h3 className=" fw-semibold letter-spacing">
            Ariflex Diagnostic App
          </h3>
          <p className="muted mb-0">
            Solid speedometers • Anchor lenses • Adaptive questions • Client
            report at the end
          </p>
        </div>
        <button
          className="ghost d-flex gap-2 align-items-center"
          onClick={resetAll}
          title="Reset all answers"
        >
          <span>
            <RiResetLeftFill size={24} />
          </span>{" "}
          Reset
        </button>
      </div>

      {/* Progress */}
      <div className="progress-wrap my-4" aria-label="progress">
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
      <div className="section mb-4">
        <h3 className=" fw-semibold letter-spacing">{partName}</h3>
        {partSubtitle && <p className="muted mb-0">{partSubtitle}</p>}
      </div>

      {/* Step content with animation */}
      <div
        ref={contentRef}
        className={stepAnimation ? `step-animate ${stepAnimation}` : ""}
        key={step} // force re-mount to trigger animation
      >
        {/* Step 0: Participant Details */}
        {step === 0 && (
          <section className="card panel">
            <div className="grid-2">
              <div className="field mb-4">
                <label className="form-label text-dark">
                  Company Name <span className="primary-text">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={org.companyName}
                  onChange={(e) =>
                    setOrg({ ...org, companyName: e.target.value })
                  }
                  placeholder="e.g., Raweyah"
                />
              </div>
              <div className="field mb-4">
                <label className="form-label text-dark">Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  value={org.contactPerson}
                  onChange={(e) =>
                    setOrg({ ...org, contactPerson: e.target.value })
                  }
                  placeholder="e.g., Mishal"
                />
              </div>
              <div className="field mb-4">
                <label className="form-label text-dark">
                  Email Address <span className="primary-text">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  autoComplete="email"
                  value={org.email}
                  onChange={(e) => setOrg({ ...org, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>
              <div className="field mb-4">
                <label className="form-label text-dark">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={org.phone}
                  onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                  placeholder="+966…"
                />
              </div>
              <div className="field mb-4">
                <label className="form-label text-dark">
                  Business Type <span className="primary-text">*</span>
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
                  <option>
                    Electricity, Gas, Steam and Air Conditioning Supply
                  </option>
                  <option>Water Supply, Sewerage and Waste Management</option>
                  <option>Construction</option>
                  <option>Wholesale and Retail Trade</option>
                  <option>Transportation and Storage</option>
                  <option>Accommodation and Food Service Activities</option>
                  <option>Information and Communication</option>
                  <option>Financial and Insurance Activities</option>
                  <option>Real Estate Activities</option>
                  <option>
                    Professional, Scientific and Technical Activities
                  </option>
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
                <div className="field mb-4">
                  <label className="form-label text-dark">
                    Other business type <span className="primary-text">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={org.businessTypeOther}
                    onChange={(e) =>
                      setOrg({ ...org, businessTypeOther: e.target.value })
                    }
                    placeholder="Describe"
                  />
                </div>
              )}
              <div className="field full">
                <label className="form-label text-dark">
                  Survey By <span className="primary-text">*</span>
                </label>
                <div className="d-flex gap-3 mt-2">
                  <input
                    type="radio"
                    id="test1"
                    name="radio-group"
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
                  <label className="text-dark" htmlFor="test1">
                    By the Company
                  </label>
                  <input
                    type="radio"
                    id="test2"
                    name="radio-group"
                    checked={org.surveyBy === "department"}
                    onChange={() => setOrg({ ...org, surveyBy: "department" })}
                  />
                  <label className="text-dark" htmlFor="test2">
                    By the department
                  </label>
                </div>
              </div>
              {org.surveyBy === "department" && (
                <div className="field full">
                  <label className="form-label text-dark">
                    Department <span className="primary-text">*</span>
                  </label>
                  <div>
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
                        className="form-control"
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
            <p className="muted mt-5">
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
                  <div className="q-text mb-3">{q.q}</div>
                  <div className=" d-flex gap-3 align-items-center flex-wrap">
                    {q.answers.map((label, i) => (
                      <label
                        key={i}
                        className={`opt  mb-3 ${current === i ? "active" : ""}`}
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
      </div>

      {/* Footer nav */}
      <div className="footer-nav mt-4">
        <button
          className="ghost d-flex gap-2 align-items-center"
          disabled={step === 0}
          onClick={() => animatedSetStep(Math.max(0, step - 1))}
        >
          ‹ Back
        </button>
        {step < stepsCount ? (
          <button
            className="ghost d-flex gap-2 align-items-center"
            disabled={!pageValid}
            onClick={() => animatedSetStep(Math.min(stepsCount, step + 1))}
          >
            Next ›
          </button>
        ) : (
          <button
            className="ghost d-flex gap-2 align-items-center"
            disabled={submitting || !pageValid}
            onClick={onSubmit}
          >
            {submitting ? "Submitting…" : "Submit Module 1"}
          </button>
        )}
      </div>
    </div>
  );
}
