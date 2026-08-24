import { env } from "cloudflare:workers";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { examAttempts } from "../../../db/schema";
import { domains, questions } from "../../content";

type AttemptMode = "full" | "quick" | "domain";
type SelectionMap = Record<string, number[]>;

const sameAnswers = (a: number[] = [], b: number[] = []) => {
  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);
  return left.length === right.length && left.every((value, index) => value === right[index]);
};

async function ensureHistorySchema() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS exam_attempts (
      id TEXT PRIMARY KEY NOT NULL,
      device_id TEXT NOT NULL,
      mode TEXT NOT NULL,
      domain_id TEXT,
      title TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      elapsed_seconds INTEGER NOT NULL,
      question_count INTEGER NOT NULL,
      answered_count INTEGER NOT NULL,
      correct_count INTEGER NOT NULL,
      score_percent INTEGER NOT NULL,
      domain_results TEXT NOT NULL
    )`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_exam_attempts_device_completed
      ON exam_attempts(device_id, completed_at)`),
  ]);
}

function validDeviceId(value: string | null) {
  return Boolean(value && /^[a-zA-Z0-9-]{16,80}$/.test(value));
}

export async function GET(request: Request) {
  try {
    const deviceId = new URL(request.url).searchParams.get("deviceId");
    if (!validDeviceId(deviceId)) {
      return Response.json({ error: "A valid deviceId is required" }, { status: 400 });
    }

    await ensureHistorySchema();
    const rows = await getDb()
      .select()
      .from(examAttempts)
      .where(eq(examAttempts.deviceId, deviceId!))
      .orderBy(desc(examAttempts.completedAt))
      .limit(200);

    return Response.json({
      attempts: rows.map((row) => ({
        ...row,
        domainResults: JSON.parse(row.domainResults),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load history";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: string;
      deviceId?: string;
      mode?: AttemptMode;
      domainId?: string | null;
      title?: string;
      startedAt?: number;
      completedAt?: number;
      durationSeconds?: number;
      remainingSeconds?: number;
      questionIds?: number[];
      selections?: SelectionMap;
    };

    if (!payload.id || !validDeviceId(payload.deviceId ?? null)) {
      return Response.json({ error: "Attempt id and deviceId are required" }, { status: 400 });
    }
    if (!payload.mode || !["full", "quick", "domain"].includes(payload.mode)) {
      return Response.json({ error: "A valid attempt mode is required" }, { status: 400 });
    }

    const questionIds = Array.isArray(payload.questionIds) ? payload.questionIds : [];
    const selectedQuestions = questionIds
      .map((id) => questions.find((question) => question.id === id))
      .filter((question) => question !== undefined);
    if (!selectedQuestions.length || selectedQuestions.length !== questionIds.length) {
      return Response.json({ error: "The attempt contains invalid questions" }, { status: 400 });
    }

    const selections = payload.selections ?? {};
    const correctCount = selectedQuestions.filter((question) =>
      sameAnswers(selections[String(question.id)], question.answers),
    ).length;
    const answeredCount = selectedQuestions.filter((question) =>
      (selections[String(question.id)] ?? []).length > 0,
    ).length;
    const domainResults = domains
      .map((domain) => {
        const group = selectedQuestions.filter((question) => question.domain === domain.id);
        if (!group.length) return null;
        const correct = group.filter((question) =>
          sameAnswers(selections[String(question.id)], question.answers),
        ).length;
        return {
          domainId: domain.id,
          correct,
          total: group.length,
          percent: Math.round((correct / group.length) * 100),
        };
      })
      .filter((result) => result !== null);

    const durationSeconds = Math.max(0, Number(payload.durationSeconds) || 0);
    const remainingSeconds = Math.max(0, Number(payload.remainingSeconds) || 0);
    const startedAt = Number(payload.startedAt) || Date.now();
    const completedAt = Number(payload.completedAt) || Date.now();
    const attempt = {
      id: payload.id,
      deviceId: payload.deviceId!,
      mode: payload.mode,
      domainId: payload.mode === "domain" ? payload.domainId ?? null : null,
      title: payload.title?.slice(0, 120) || "Practice attempt",
      startedAt,
      completedAt,
      durationSeconds,
      elapsedSeconds: Math.min(durationSeconds, Math.max(0, durationSeconds - remainingSeconds)),
      questionCount: selectedQuestions.length,
      answeredCount,
      correctCount,
      scorePercent: Math.round((correctCount / selectedQuestions.length) * 100),
      domainResults: JSON.stringify(domainResults),
    };

    await ensureHistorySchema();
    await getDb().insert(examAttempts).values(attempt).onConflictDoNothing();
    const [stored] = await getDb()
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.id, attempt.id), eq(examAttempts.deviceId, attempt.deviceId)))
      .limit(1);

    return Response.json({
      attempt: { ...stored, domainResults: JSON.parse(stored.domainResults) },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save attempt";
    return Response.json({ error: message }, { status: 500 });
  }
}
