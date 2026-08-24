import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const examAttempts = sqliteTable(
  "exam_attempts",
  {
    id: text("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    mode: text("mode").notNull(),
    domainId: text("domain_id"),
    title: text("title").notNull(),
    startedAt: integer("started_at").notNull(),
    completedAt: integer("completed_at").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    elapsedSeconds: integer("elapsed_seconds").notNull(),
    questionCount: integer("question_count").notNull(),
    answeredCount: integer("answered_count").notNull(),
    correctCount: integer("correct_count").notNull(),
    scorePercent: integer("score_percent").notNull(),
    domainResults: text("domain_results").notNull(),
  },
  (table) => [
    index("idx_exam_attempts_device_completed").on(
      table.deviceId,
      table.completedAt,
    ),
  ],
);
