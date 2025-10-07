import { NextRequest, NextResponse } from "next/server";

type ResultItem = {
  index: number;
  part: string;
  question: string;
  selectedIndices: number[];
  selectedLabels: string[];
};

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

type Payload = {
  org: Org;
  results: ResultItem[];
  score: { totalPoints: number; maxPoints: number; percentage: number };
  redFlags: number;
  completion: number;
  timestamp: string;
};

function mapToStrapi(payload: Payload) {
  return {
    externalId: crypto.randomUUID(),
    userId: "", // optionally fill from your auth/session
    org: payload.org,
    results: payload.results.map((r) => ({
      index: r.index,
      part: r.part,
      question: r.question,
      selectedItems: r.selectedIndices.map((idx, i) => ({
        index: idx,
        label: r.selectedLabels[i],
      })),
    })),
    score: {
      totalPoints: payload.score.totalPoints,
      maxPoints: payload.score.maxPoints,
      percentage: payload.score.percentage
    },
    redFlags: payload.redFlags,
    completion: payload.completion,
    timestamp: payload.timestamp,
    submittedAt: new Date().toISOString(),
    version: "1.0"
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Payload;
    const data = mapToStrapi(payload);

    const res = await fetch(`${process.env.STRAPI_URL}/api/survey-submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`
      },
      body: JSON.stringify({ data })
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json }, { status: res.status });
    }
    return NextResponse.json(json.data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}

// (Optional) List latest submissions
export async function GET() {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/survey-submissions?sort=createdAt:desc&pagination[pageSize]=10`,
    { headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` }, next: { revalidate: 0 } }
  );
  const json = await res.json();
  return NextResponse.json(json);
}
