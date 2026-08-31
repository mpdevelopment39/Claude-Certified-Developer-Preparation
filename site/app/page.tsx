"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { domains, fullMockQuestionCounts, questions, sourceLinks, type Domain, type Question } from "./content";

type View = "overview" | "curriculum" | "practice" | "sources";
type ExamState = "idle" | "running" | "results";
type AttemptMode = "full" | "quick" | "domain";
type PracticePanel = "launch" | "history";
type HistoryFilter = "all" | AttemptMode;
type DomainExamType = "guided" | "exam" | "sprint";
type DomainDifficulty = "mixed" | Question["difficulty"];
type ResponseFormat = "mixed" | "single" | "multiple";
type DomainExamConfig = {
  examType: DomainExamType;
  difficulty: DomainDifficulty;
  responseFormat: ResponseFormat;
  questionCount: number;
};
type DomainResult = { domainId: string; correct: number; total: number; percent: number };
type ExamAttempt = {
  id: string;
  mode: AttemptMode;
  domainId: string | null;
  title: string;
  startedAt: number;
  completedAt: number;
  durationSeconds: number;
  elapsedSeconds: number;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  domainResults: DomainResult[];
  examType?: DomainExamType;
  difficulty?: DomainDifficulty;
  responseFormat?: ResponseFormat;
};

const progressStorageKey = "ccdv-field-guide-progress";
const historyStorageKey = "ccdv-field-guide-history";

const objectiveKey = (domain: Domain, index: number) => domain.id + "-" + index;
const sameAnswers = (a: number[] = [], b: number[] = []) => {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
};
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const attemptLabels: Record<AttemptMode, string> = {
  full: "Full mock",
  quick: "Scenario Sprint",
  domain: "Domain drill",
};
const examTypeOptions: { id: DomainExamType; label: string; detail: string; secondsPerQuestion: number }[] = [
  { id: "guided", label: "Guided practice", detail: "Relaxed pace · 3 min per question", secondsPerQuestion: 180 },
  { id: "exam", label: "Exam pace", detail: "Official rhythm · 2 min 15 sec per question", secondsPerQuestion: 135 },
  { id: "sprint", label: "Pressure sprint", detail: "Fast decisions · 90 sec per question", secondsPerQuestion: 90 },
];
const difficultyLabels: Record<DomainDifficulty, string> = {
  mixed: "All levels",
  standard: "Standard",
  advanced: "Advanced",
  expert: "Expert",
};
const responseFormatLabels: Record<ResponseFormat, string> = {
  mixed: "Mixed formats",
  single: "Single response",
  multiple: "Multiple response",
};
const filterDomainQuestions = (domainId: string, config: Pick<DomainExamConfig, "difficulty" | "responseFormat">) =>
  questions.filter((question) =>
    question.domain === domainId &&
    (config.difficulty === "mixed" || question.difficulty === config.difficulty) &&
    (config.responseFormat === "mixed" || (config.responseFormat === "multiple" ? question.answers.length > 1 : question.answers.length === 1)),
  );
const formatAttemptDate = (timestamp: number) => new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(timestamp));
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${String(minutes).padStart(2, "0")}m` : `${Math.max(1, minutes)}m`;
};

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [practicePanel, setPracticePanel] = useState<PracticePanel>("launch");
  const [activeDomain, setActiveDomain] = useState("D2");
  const [configuredDomain, setConfiguredDomain] = useState<string | null>(null);
  const [domainExamConfig, setDomainExamConfig] = useState<DomainExamConfig>({
    examType: "exam",
    difficulty: "mixed",
    responseFormat: "mixed",
    questionCount: 5,
  });
  const [attemptConfig, setAttemptConfig] = useState<DomainExamConfig | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [examState, setExamState] = useState<ExamState>("idle");
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [revealed, setRevealed] = useState<number[]>([]);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [examDuration, setExamDuration] = useState(0);
  const [attemptMode, setAttemptMode] = useState<AttemptMode>("quick");
  const [attemptDomain, setAttemptDomain] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState("");
  const [examStartedAt, setExamStartedAt] = useState(0);
  const [history, setHistory] = useState<ExamAttempt[]>([]);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const savedAttemptIds = useRef(new Set<string>());

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(progressStorageKey);
        if (saved) setCompleted(JSON.parse(saved));
        const savedHistory = window.localStorage.getItem(historyStorageKey);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.warn("Unable to restore saved study data", error);
        setHistoryError("Your saved results could not be loaded on this device.");
      }
      setHistoryLoading(false);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(progressStorageKey, JSON.stringify(completed));
  }, [completed, loaded]);

  useEffect(() => {
    if (examState !== "running" || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((time) => {
      const next = Math.max(0, time - 1);
      if (next === 0) window.queueMicrotask(() => setExamState("results"));
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [examState, secondsLeft]);

  const totalObjectives = domains.reduce((sum, domain) => sum + domain.objectives.length, 0);
  const weightedProgress = domains.reduce((total, domain) =>
    total + domain.objectives.reduce((sum, objective, index) =>
      sum + (completed.includes(objectiveKey(domain, index)) ? objective.weight : 0), 0), 0);
  const currentDomain = domains.find((domain) => domain.id === activeDomain) ?? domains[1];
  const setupDomain = domains.find((domain) => domain.id === configuredDomain) ?? null;
  const domainQuestionPool = useMemo(
    () => configuredDomain ? filterDomainQuestions(configuredDomain, domainExamConfig) : [],
    [configuredDomain, domainExamConfig],
  );
  const questionCountOptions = useMemo(() => {
    if (!domainQuestionPool.length) return [];
    return [...new Set([5, 10, 15, domainQuestionPool.length]
      .map((count) => Math.min(count, domainQuestionPool.length)))]
      .filter((count) => count > 0)
      .sort((a, b) => a - b);
  }, [domainQuestionPool.length]);
  const configuredQuestionCount = Math.min(domainExamConfig.questionCount, domainQuestionPool.length);
  const configuredExamType = examTypeOptions.find((option) => option.id === domainExamConfig.examType) ?? examTypeOptions[1];

  useEffect(() => {
    if (!questionCountOptions.length || questionCountOptions.includes(domainExamConfig.questionCount)) return;
    setDomainExamConfig((config) => ({
      ...config,
      questionCount: questionCountOptions.find((count) => count >= config.questionCount) ?? questionCountOptions.at(-1)!,
    }));
  }, [domainExamConfig.questionCount, questionCountOptions]);

  const score = useMemo(() => {
    if (!examQuestions.length) return { correct: 0, percent: 0 };
    const correct = examQuestions.filter((question) => sameAnswers(selections[question.id], question.answers)).length;
    return { correct, percent: Math.round((correct / examQuestions.length) * 100) };
  }, [examQuestions, selections]);

  useEffect(() => {
    if (examState !== "results" || !attemptId || savedAttemptIds.current.has(attemptId)) return;
    savedAttemptIds.current.add(attemptId);
    window.queueMicrotask(() => {
      setSaveState("saving");
      setHistoryError("");
    });

    const domainResults = domains.flatMap((domain) => {
      const group = examQuestions.filter((question) => question.domain === domain.id);
      if (!group.length) return [];
      const correct = group.filter((question) => sameAnswers(selections[question.id], question.answers)).length;
      return [{ domainId: domain.id, correct, total: group.length, percent: Math.round((correct / group.length) * 100) }];
    });
    const correctCount = examQuestions.filter((question) => sameAnswers(selections[question.id], question.answers)).length;
    const attempt: ExamAttempt = {
      id: attemptId,
      mode: attemptMode,
      domainId: attemptMode === "domain" ? attemptDomain : null,
      title: examTitle,
      startedAt: examStartedAt,
      completedAt: Date.now(),
      durationSeconds: examDuration,
      elapsedSeconds: Math.min(examDuration, Math.max(0, examDuration - secondsLeft)),
      questionCount: examQuestions.length,
      answeredCount: examQuestions.filter((question) => (selections[question.id] ?? []).length > 0).length,
      correctCount,
      scorePercent: Math.round((correctCount / examQuestions.length) * 100),
      domainResults,
      ...(attemptConfig ? {
        examType: attemptConfig.examType,
        difficulty: attemptConfig.difficulty,
        responseFormat: attemptConfig.responseFormat,
      } : {}),
    };

    try {
      const nextHistory = [attempt, ...history.filter((item) => item.id !== attempt.id)].slice(0, 200);
      window.localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
      window.queueMicrotask(() => {
        setHistory(nextHistory);
        setSaveState("saved");
      });
    } catch (error) {
      savedAttemptIds.current.delete(attemptId);
      window.queueMicrotask(() => {
        setSaveState("error");
        setHistoryError(error instanceof Error ? error.message : "Unable to save this attempt");
      });
    }
  }, [attemptConfig, attemptDomain, attemptId, attemptMode, examDuration, examQuestions, examStartedAt, examState, examTitle, history, secondsLeft, selections]);

  const filteredHistory = useMemo(
    () => historyFilter === "all" ? history : history.filter((attempt) => attempt.mode === historyFilter),
    [history, historyFilter],
  );

  const historyStats = useMemo(() => {
    const attempts = history.length;
    const average = attempts ? Math.round(history.reduce((sum, attempt) => sum + attempt.scorePercent, 0) / attempts) : 0;
    const best = attempts ? Math.max(...history.map((attempt) => attempt.scorePercent)) : 0;
    const questionsAnswered = history.reduce((sum, attempt) => sum + attempt.answeredCount, 0);
    return { attempts, average, best, questionsAnswered };
  }, [history]);

  const domainHistory = useMemo(() => domains.map((domain) => {
    const results = history.flatMap((attempt) => attempt.domainResults.filter((result) => result.domainId === domain.id));
    const correct = results.reduce((sum, result) => sum + result.correct, 0);
    const total = results.reduce((sum, result) => sum + result.total, 0);
    return { domain, attempts: results.length, correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
  }), [history]);

  const navigate = (next: View) => {
    setView(next);
    setExamState("idle");
    if (next === "practice") {
      setConfiguredDomain(null);
      setPracticePanel("launch");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDomain = (id: string) => {
    setActiveDomain(id);
    setView("curriculum");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDomainPractice = (id: string) => {
    setActiveDomain(id);
    setConfiguredDomain(id);
    setDomainExamConfig({ examType: "exam", difficulty: "mixed", responseFormat: "mixed", questionCount: 5 });
    setExamState("idle");
    setPracticePanel("launch");
    setView("practice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleObjective = (key: string) => {
    setCompleted((items) => items.includes(key) ? items.filter((item) => item !== key) : [...items, key]);
  };

  const startExam = (mode: AttemptMode, domainId?: string, domainConfig?: DomainExamConfig) => {
    let selected: Question[];
    let duration: number;
    let title: string;
    if (mode === "full") {
      selected = shuffle(domains.flatMap((domain) =>
        shuffle(questions.filter((question) => question.domain === domain.id))
          .slice(0, fullMockQuestionCounts[domain.id] ?? 0),
      ));
      duration = 120 * 60;
      title = "Full Blueprint Mock";
    } else if (mode === "domain" && domainId && domainConfig) {
      selected = shuffle(filterDomainQuestions(domainId, domainConfig)).slice(0, domainConfig.questionCount);
      const type = examTypeOptions.find((option) => option.id === domainConfig.examType) ?? examTypeOptions[1];
      duration = selected.length * type.secondsPerQuestion;
      title = `${domains.find((domain) => domain.id === domainId)?.short ?? "Domain"} · ${type.label}`;
    } else {
      selected = shuffle(questions).slice(0, 10);
      duration = 25 * 60;
      title = "Quick Scenario Drill";
    }
    if (!selected.length) return;
    setExamQuestions(selected);
    setAttemptMode(mode);
    setAttemptDomain(mode === "domain" ? domainId ?? null : null);
    setAttemptConfig(mode === "domain" ? domainConfig ?? null : null);
    setAttemptId(window.crypto.randomUUID());
    setExamStartedAt(Date.now());
    setSaveState("idle");
    setExamDuration(duration);
    setSecondsLeft(duration);
    setExamTitle(title);
    setCurrent(0);
    setSelections({});
    setRevealed([]);
    setFlagged([]);
    setExamState("running");
    setView("practice");
    window.scrollTo({ top: 0 });
  };

  const selectOption = (question: Question, option: number) => {
    if (revealed.includes(question.id)) return;
    setSelections((all) => {
      const existing = all[question.id] ?? [];
      const next = question.answers.length > 1
        ? existing.includes(option)
          ? existing.filter((item) => item !== option)
          : existing.length < question.answers.length ? [...existing, option] : existing
        : [option];
      return { ...all, [question.id]: next };
    });
    if (question.answers.length === 1) {
      setRevealed((items) => items.includes(question.id) ? items : [...items, question.id]);
    }
  };

  const revealAnswer = (question: Question) => {
    if ((selections[question.id] ?? []).length !== question.answers.length) return;
    setRevealed((items) => items.includes(question.id) ? items : [...items, question.id]);
  };

  const toggleFlag = (id: number) =>
    setFlagged((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return (hours ? hours + ":" : "") + String(minutes).padStart(hours ? 2 : 1, "0") + ":" + String(secs).padStart(2, "0");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("overview")} aria-label="CCDV Field Guide home">
          <span className="brand-mark">C</span>
          <span>CCDV <b>FIELD GUIDE</b></span>
        </button>
        <div className="exam-chip"><span className="pulse" /> EXAM V1.0 · JUL 2026</div>
        <nav aria-label="Primary navigation">
          {(["overview", "curriculum", "practice", "sources"] as View[]).map((item) => (
            <button key={item} className={view === item ? "active" : ""} onClick={() => navigate(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {view === "overview" && (
        <>
          <section className="hero" id="top">
            <div className="hero-copy">
              <p className="eyebrow"><span>CCDV-F</span> / CERTIFICATION PREP</p>
              <h1>Build the systems.<br /><em>Pass the exam.</em></h1>
              <p className="lede">A focused, blueprint-aligned workspace for mastering the Claude Certified Developer — Foundations exam.</p>
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => navigate("curriculum")}>
                  {completed.length ? "Continue learning" : "Start the curriculum"} <span>→</span>
                </button>
                <button className="text-btn" onClick={() => navigate("practice")}>Open practice lab <span>↗</span></button>
              </div>
            </div>
            <aside className="exam-card" aria-label="Exam format">
              <div className="card-kicker">EXAM FORMAT</div>
              <div className="metric-grid">
                <div><strong>53</strong><span>ITEMS</span></div>
                <div><strong>120</strong><span>MINUTES</span></div>
                <div><strong>720</strong><span>SCALED PASS SCORE</span></div>
                <div><strong>8</strong><span>DOMAINS</span></div>
              </div>
              <div className="card-foot"><span>MULTIPLE CHOICE + RESPONSE</span><span>$125 USD</span></div>
            </aside>
          </section>

          <section className="progress-band" aria-label="Study progress">
            <div>
              <span className="progress-number">{loaded ? completed.length : "—"}</span>
              <span className="progress-label">OF {totalObjectives}<br />SKILLS COMPLETE</span>
            </div>
            <div className="progress-main">
              <div className="progress-copy"><span>BLUEPRINT COVERAGE</span><strong>{Math.round(weightedProgress)}%</strong></div>
              <div className="large-track"><span style={{ width: String(weightedProgress) + "%" }} /></div>
            </div>
            <button className="reset-link" onClick={() => setCompleted([])} disabled={!completed.length}>Reset progress</button>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <div><p className="eyebrow">OFFICIAL BLUEPRINT</p><h2>Study by exam weight</h2></div>
              <p>Start with the skills that carry the most points. Every domain below maps directly to the published CCDV-F blueprint.</p>
            </div>
            <div className="domain-grid">
              {domains.map((domain) => {
                const done = domain.objectives.filter((_, index) => completed.includes(objectiveKey(domain, index))).length;
                return (
                  <button className="domain-card" key={domain.id} onClick={() => openDomain(domain.id)}>
                    <div className="domain-top"><span className={"domain-dot " + domain.color} /><span>{domain.id}</span><strong>{domain.weight}%</strong></div>
                    <h3>{domain.short}</h3>
                    <div className="weight-track"><span className={domain.color} style={{ width: String(Math.max(domain.weight * 2.6, 8)) + "%" }} /></div>
                    <span className="open-label">{done}/{domain.objectives.length} skills <b>↗</b></span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="practice-promo">
            <div><p className="eyebrow">PRACTICE LAB</p><h2>Train under exam conditions.</h2></div>
            <p>Take the complete 53-item, 120-minute blueprint mock or target a weak domain with focused scenario drills.</p>
            <button className="light-btn" onClick={() => startExam("full")}>Start full mock <span>→</span></button>
          </section>
        </>
      )}

      {view === "curriculum" && (
        <section className="page-section">
          <div className="page-intro">
            <p className="eyebrow">CURRICULUM / 25 WEIGHTED SKILLS</p>
            <h1>Know what the exam<br /><em>expects you to build.</em></h1>
            <p>Work through the published objectives. Check off a skill only when you can explain the trade-off and implement it without a tutorial.</p>
          </div>
          <div className="curriculum-layout">
            <aside className="domain-nav" aria-label="Curriculum domains">
              <div className="domain-nav-head"><span>DOMAIN</span><span>WEIGHT</span></div>
              {domains.map((domain) => {
                const done = domain.objectives.every((_, index) => completed.includes(objectiveKey(domain, index)));
                return (
                  <button key={domain.id} className={activeDomain === domain.id ? "active" : ""} onClick={() => setActiveDomain(domain.id)}>
                    <span className={"domain-dot " + domain.color} />
                    <span><b>{domain.id}</b>{domain.short}</span>
                    <strong>{done ? "✓" : String(domain.weight) + "%"}</strong>
                  </button>
                );
              })}
            </aside>

            <article className="domain-detail">
              <div className="detail-head">
                <div>
                  <p className="eyebrow">{currentDomain.id} / {currentDomain.weight}% OF EXAM</p>
                  <h2>{currentDomain.name}</h2>
                </div>
                <button className="small-action" onClick={() => openDomainPractice(currentDomain.id)}>Configure practice →</button>
              </div>
              <p className="domain-summary">{currentDomain.summary}</p>
              <div className="focus-row">
                {currentDomain.focus.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="objective-list">
                {currentDomain.objectives.map((objective, index) => {
                  const key = objectiveKey(currentDomain, index);
                  const done = completed.includes(key);
                  return (
                    <label className={"objective" + (done ? " done" : "")} key={objective.name}>
                      <input type="checkbox" checked={done} onChange={() => toggleObjective(key)} />
                      <span className="checkmark">{done ? "✓" : ""}</span>
                      <span className="objective-copy">
                        <span className="objective-title"><b>{objective.name}</b><em>{objective.weight}%</em></span>
                        <span>{objective.detail}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="docs-block">
                <p className="eyebrow">PRIMARY READING</p>
                {currentDomain.docs.map((doc) => (
                  <a key={doc.url} href={doc.url} target="_blank" rel="noreferrer">{doc.label}<span>↗</span></a>
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

      {view === "practice" && examState === "idle" && (
        <section className="page-section practice-page">
          <div className="page-intro compact">
            <p className="eyebrow">PRACTICE LAB / ORIGINAL QUESTIONS</p>
            <h1>Reason like a<br /><em>Claude developer.</em></h1>
            <p>Scenario-based practice aligned to the official domain weights. Choose the best engineering decision, not merely a plausible one.</p>
          </div>
          <div className="integrity-note">
            <span>◎</span>
            <div><b>Exam integrity</b><p>These are original exam-style questions—not recalled, leaked, or live exam items. Actual exam content is confidential under Anthropic&apos;s NDA.</p></div>
          </div>
          <div className="practice-tabs" role="tablist" aria-label="Practice sections">
            <button role="tab" aria-selected={practicePanel === "launch"} className={practicePanel === "launch" ? "active" : ""} onClick={() => setPracticePanel("launch")}>Practice modes</button>
            <button role="tab" aria-selected={practicePanel === "history"} className={practicePanel === "history" ? "active" : ""} onClick={() => setPracticePanel("history")}>
              Attempt history <span>{history.length}</span>
            </button>
          </div>

          {practicePanel === "launch" ? (
            configuredDomain && setupDomain ? (
              <div className="domain-configurator">
                <button className="config-back" onClick={() => setConfiguredDomain(null)}>← All practice modes</button>
                <div className="config-hero">
                  <div>
                    <p className="eyebrow">{setupDomain.id} / CUSTOM DOMAIN PRACTICE</p>
                    <h2>Build your<br /><em>{setupDomain.short}</em> session.</h2>
                    <p>Choose how you want to train before seeing the first question. Every completed session is saved in your attempt history.</p>
                  </div>
                  <div className="config-domain-card">
                    <span className={"domain-dot " + setupDomain.color} />
                    <b>{setupDomain.id}</b>
                    <strong>{questions.filter((question) => question.domain === setupDomain.id).length}</strong>
                    <span>QUESTIONS AVAILABLE</span>
                  </div>
                </div>

                <div className="config-layout">
                  <div className="config-controls">
                    <fieldset className="config-group">
                      <legend><span>01</span> Practice type</legend>
                      <div className="config-choice-grid three">
                        {examTypeOptions.map((option) => (
                          <button
                            type="button"
                            key={option.id}
                            className={domainExamConfig.examType === option.id ? "active" : ""}
                            onClick={() => setDomainExamConfig((config) => ({ ...config, examType: option.id }))}
                          >
                            <b>{option.label}</b>
                            <span>{option.detail}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="config-group">
                      <legend><span>02</span> Difficulty</legend>
                      <div className="config-choice-grid four">
                        {(["mixed", "standard", "advanced", "expert"] as DomainDifficulty[]).map((difficulty) => {
                          const count = questions.filter((question) => question.domain === setupDomain.id && (difficulty === "mixed" || question.difficulty === difficulty)).length;
                          return (
                            <button
                              type="button"
                              key={difficulty}
                              disabled={!count}
                              className={domainExamConfig.difficulty === difficulty ? "active" : ""}
                              onClick={() => setDomainExamConfig((config) => ({ ...config, difficulty }))}
                            >
                              <b>{difficultyLabels[difficulty]}</b>
                              <span>{count} available</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <fieldset className="config-group">
                      <legend><span>03</span> Response format</legend>
                      <div className="config-choice-grid three compact">
                        {(["mixed", "single", "multiple"] as ResponseFormat[]).map((format) => {
                          const count = filterDomainQuestions(setupDomain.id, { difficulty: domainExamConfig.difficulty, responseFormat: format }).length;
                          return (
                            <button
                              type="button"
                              key={format}
                              disabled={!count}
                              className={domainExamConfig.responseFormat === format ? "active" : ""}
                              onClick={() => setDomainExamConfig((config) => ({ ...config, responseFormat: format }))}
                            >
                              <b>{responseFormatLabels[format]}</b>
                              <span>{count} available</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <fieldset className="config-group">
                      <legend><span>04</span> Number of questions</legend>
                      <div className="question-count-options">
                        {questionCountOptions.map((count) => (
                          <button
                            type="button"
                            key={count}
                            className={configuredQuestionCount === count ? "active" : ""}
                            onClick={() => setDomainExamConfig((config) => ({ ...config, questionCount: count }))}
                          >{count}</button>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <aside className="config-summary">
                    <p className="eyebrow">YOUR SESSION</p>
                    <h3>{setupDomain.short}</h3>
                    <dl>
                      <div><dt>Type</dt><dd>{configuredExamType.label}</dd></div>
                      <div><dt>Difficulty</dt><dd>{difficultyLabels[domainExamConfig.difficulty]}</dd></div>
                      <div><dt>Format</dt><dd>{responseFormatLabels[domainExamConfig.responseFormat]}</dd></div>
                      <div><dt>Questions</dt><dd>{configuredQuestionCount || "—"}</dd></div>
                      <div><dt>Time</dt><dd>{configuredQuestionCount ? formatDuration(configuredQuestionCount * configuredExamType.secondsPerQuestion) : "—"}</dd></div>
                    </dl>
                    <div className="config-promises">
                      <span>✓ Immediate answer feedback</span>
                      <span>✓ Randomized question order</span>
                      <span>✓ Automatic history record</span>
                    </div>
                    <button
                      className="light-btn config-start"
                      disabled={!configuredQuestionCount}
                      onClick={() => startExam("domain", setupDomain.id, { ...domainExamConfig, questionCount: configuredQuestionCount })}
                    >Start configured session <span>→</span></button>
                    {!configuredQuestionCount && <p className="config-warning">No questions match this combination. Choose another difficulty or response format.</p>}
                  </aside>
                </div>
              </div>
            ) : (
            <>
              <div className="practice-modes">
                <button className="mode-card featured" onClick={() => startExam("full")}>
                  <span className="mode-index">01 / FULL SIMULATION</span>
                  <div className="mode-icon">120</div>
                  <h2>Blueprint Mock</h2>
                  <p>53 items · 120 minutes · all 8 domains · single and multiple response</p>
                  <span className="mode-cta">START EXAM <b>→</b></span>
                </button>
                <button className="mode-card" onClick={() => startExam("quick")}>
                  <span className="mode-index">02 / QUICK DRILL</span>
                  <div className="mode-icon">10</div>
                  <h2>Scenario Sprint</h2>
                  <p>10 randomized items · 25 minutes · score and explanations</p>
                  <span className="mode-cta">START DRILL <b>→</b></span>
                </button>
              </div>
              <div className="domain-drills">
                <div className="section-heading mini">
                  <div><p className="eyebrow">TARGETED PRACTICE</p><h2>Drill one domain</h2></div>
                  <p>Use focused sets after reviewing your mock-exam breakdown.</p>
                </div>
                <div className="drill-grid">
                  {domains.map((domain) => (
                    <button key={domain.id} onClick={() => openDomainPractice(domain.id)}>
                      <span className={"domain-dot " + domain.color} />
                      <span><b>{domain.id}</b>{domain.short}</span>
                      <strong>{questions.filter((question) => question.domain === domain.id).length} Q →</strong>
                    </button>
                  ))}
                </div>
              </div>
            </>
            )
          ) : (
            <div className="history-panel">
              <div className="history-heading">
                <div>
                  <p className="eyebrow">YOUR RESULTS / SAVED AUTOMATICALLY</p>
                  <h2>Every attempt,<br />one clear trajectory.</h2>
                </div>
                <p>Compare full mocks, Scenario Sprints, and focused drills. Domain totals combine every question you have completed.</p>
              </div>

              {historyError && <div className="history-alert">{historyError}</div>}
              {historyLoading ? (
                <div className="history-empty"><span>···</span><h3>Loading your results</h3></div>
              ) : history.length === 0 ? (
                <div className="history-empty">
                  <span>◎</span>
                  <h3>Your first result will appear here.</h3>
                  <p>Complete a Blueprint Mock, Scenario Sprint, or domain drill and its score will be saved automatically.</p>
                  <button className="primary-btn" onClick={() => setPracticePanel("launch")}>Start practicing <span>→</span></button>
                </div>
              ) : (
                <>
                  <div className="history-stats">
                    <div><span>ATTEMPTS</span><strong>{historyStats.attempts}</strong></div>
                    <div><span>AVERAGE SCORE</span><strong>{historyStats.average}%</strong></div>
                    <div><span>PERSONAL BEST</span><strong>{historyStats.best}%</strong></div>
                    <div><span>ANSWERS LOGGED</span><strong>{historyStats.questionsAnswered}</strong></div>
                  </div>

                  <section className="domain-performance">
                    <div className="section-heading mini">
                      <div><p className="eyebrow">ALL-TIME PERFORMANCE</p><h2>Results by domain</h2></div>
                      <p>Based on every saved question, across all practice modes.</p>
                    </div>
                    <div className="domain-history-grid">
                      {domainHistory.map(({ domain, attempts, correct, total, percent }) => (
                        <button key={domain.id} disabled={!total} onClick={() => { setActiveDomain(domain.id); navigate("curriculum"); }}>
                          <div className="domain-history-head"><span className={"domain-dot " + domain.color} /><b>{domain.id}</b><strong>{total ? percent + "%" : "—"}</strong></div>
                          <h3>{domain.short}</h3>
                          <div className="result-track"><span style={{ width: String(percent) + "%" }} /></div>
                          <p>{total ? `${correct}/${total} correct · ${attempts} ${attempts === 1 ? "attempt" : "attempts"}` : "No results yet"}</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="attempt-log">
                    <div className="attempt-log-head">
                      <div><p className="eyebrow">TIMELINE</p><h2>Attempt history</h2></div>
                      <div className="history-filters" aria-label="Filter history">
                        {(["all", "full", "quick", "domain"] as HistoryFilter[]).map((filter) => (
                          <button key={filter} className={historyFilter === filter ? "active" : ""} onClick={() => setHistoryFilter(filter)}>
                            {filter === "all" ? "All" : attemptLabels[filter]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="attempt-list">
                      {filteredHistory.length ? filteredHistory.map((attempt) => (
                        <article className="attempt-row" key={attempt.id}>
                          <div className="attempt-date"><b>{formatAttemptDate(attempt.completedAt)}</b><span>{attemptLabels[attempt.mode]}</span></div>
                          <div className="attempt-name">
                            <h3>{attempt.title}</h3>
                            <p>{attempt.correctCount}/{attempt.questionCount} correct · {attempt.answeredCount} answered · {formatDuration(attempt.elapsedSeconds)}</p>
                            {attempt.mode === "domain" && attempt.examType && (
                              <div className="attempt-config">
                                <span>{examTypeOptions.find((option) => option.id === attempt.examType)?.label ?? attempt.examType}</span>
                                {attempt.difficulty && <span>{difficultyLabels[attempt.difficulty]}</span>}
                                {attempt.responseFormat && <span>{responseFormatLabels[attempt.responseFormat]}</span>}
                              </div>
                            )}
                          </div>
                          <div className="attempt-domains" aria-label="Domain scores">
                            {attempt.domainResults.map((result) => <span key={result.domainId}>{result.domainId} <b>{result.percent}%</b></span>)}
                          </div>
                          <strong className={"attempt-score " + (attempt.scorePercent >= 80 ? "high" : attempt.scorePercent >= 65 ? "mid" : "low")}>{attempt.scorePercent}%</strong>
                        </article>
                      )) : <div className="filter-empty">No saved attempts match this filter.</div>}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {view === "practice" && examState === "running" && examQuestions[current] && (
        <section className="exam-workspace">
          <div className="exam-toolbar">
            <div><span className="eyebrow">{examTitle}</span><b>Question {current + 1} of {examQuestions.length}</b></div>
            <div className={"timer" + (secondsLeft < 300 ? " urgent" : "")}><span>TIME LEFT</span><b>{formatTime(secondsLeft)}</b></div>
            <button className="exit-btn" onClick={() => setExamState("idle")}>Exit exam</button>
          </div>
          <div className="question-map" aria-label="Question navigator">
            {examQuestions.map((question, index) => (
              <button
                key={question.id}
                className={(index === current ? "current " : "") +
                  (selections[question.id]?.length ? "answered " : "") +
                  (revealed.includes(question.id) ? (sameAnswers(selections[question.id], question.answers) ? "correct " : "incorrect ") : "") +
                  (flagged.includes(question.id) ? "flagged" : "")}
                onClick={() => setCurrent(index)}
                aria-label={"Question " + (index + 1)}
              >{index + 1}</button>
            ))}
          </div>
          <article className="question-card">
            <div className="question-meta">
              <span>{examQuestions[current].domain} · {domains.find((domain) => domain.id === examQuestions[current].domain)?.short} · {difficultyLabels[examQuestions[current].difficulty]}</span>
              <span>{examQuestions[current].answers.length > 1 ? "SELECT " + examQuestions[current].answers.length : "SELECT ONE"}</span>
            </div>
            <h2>{examQuestions[current].prompt}</h2>
            <div className="options-list">
              {examQuestions[current].options.map((option, index) => {
                const question = examQuestions[current];
                const selected = selections[question.id]?.includes(index);
                const isRevealed = revealed.includes(question.id);
                const isCorrectAnswer = isRevealed && question.answers.includes(index);
                const isWrongAnswer = isRevealed && Boolean(selected) && !question.answers.includes(index);
                return (
                  <button
                    className={(selected ? "selected " : "") + (isCorrectAnswer ? "answer-correct " : "") + (isWrongAnswer ? "answer-wrong" : "")}
                    key={option}
                    onClick={() => selectOption(question, index)}
                    disabled={isRevealed}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                    <span className="option-control">{isCorrectAnswer ? "✓" : isWrongAnswer ? "×" : selected ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
            {examQuestions[current].answers.length > 1 && !revealed.includes(examQuestions[current].id) && (
              <div className="check-answer-row">
                <p>Select {examQuestions[current].answers.length} answers, then check your decision.</p>
                <button
                  className="secondary-btn"
                  onClick={() => revealAnswer(examQuestions[current])}
                  disabled={(selections[examQuestions[current].id] ?? []).length !== examQuestions[current].answers.length}
                >Check answer →</button>
              </div>
            )}
            {revealed.includes(examQuestions[current].id) && (
              <div className={"live-feedback " + (sameAnswers(selections[examQuestions[current].id], examQuestions[current].answers) ? "correct" : "incorrect")} role="status">
                <span>{sameAnswers(selections[examQuestions[current].id], examQuestions[current].answers) ? "✓" : "×"}</span>
                <div>
                  <b>{sameAnswers(selections[examQuestions[current].id], examQuestions[current].answers) ? "Correct" : "Not quite"}</b>
                  <p>{examQuestions[current].explanation}</p>
                  {examQuestions[current].source && <a href={examQuestions[current].source.url} target="_blank" rel="noreferrer">OFFICIAL COURSE · {examQuestions[current].source.label} ↗</a>}
                </div>
              </div>
            )}
            <div className="question-actions">
              <button className={"flag" + (flagged.includes(examQuestions[current].id) ? " active" : "")} onClick={() => toggleFlag(examQuestions[current].id)}>
                {flagged.includes(examQuestions[current].id) ? "★ Flagged for review" : "☆ Flag for review"}
              </button>
              <div>
                <button className="secondary-btn" onClick={() => setCurrent((index) => Math.max(0, index - 1))} disabled={current === 0}>← Previous</button>
                {current < examQuestions.length - 1 ? (
                  <button className="primary-btn flat" onClick={() => setCurrent((index) => index + 1)}>Next <span>→</span></button>
                ) : (
                  <button className="primary-btn flat" onClick={() => setExamState("results")}>Finish exam <span>→</span></button>
                )}
              </div>
            </div>
          </article>
        </section>
      )}

      {view === "practice" && examState === "results" && (
        <section className="page-section results-page">
          <div className="results-hero">
            <div className="score-ring" style={{ "--score": String(score.percent * 3.6) + "deg" } as React.CSSProperties}>
              <div><strong>{score.percent}%</strong><span>RAW SCORE</span></div>
            </div>
            <div>
              <p className="eyebrow">{examTitle} / COMPLETE</p>
              <h1>{score.percent >= 80 ? "Strong result." : score.percent >= 65 ? "Keep building." : "Review the foundations."}</h1>
              <p>You answered {score.correct} of {examQuestions.length} correctly. Anthropic does not publish a raw-to-scaled conversion, so this result is a study indicator—not a predicted 720 scaled score.</p>
              <p className={"save-note " + saveState}>
                {saveState === "saving" && "Saving this result to your history…"}
                {saveState === "saved" && "✓ Result saved to your attempt history"}
                {saveState === "error" && "This result could not be saved yet. Return to results to retry."}
              </p>
              <div className="result-actions">
                <button className="primary-btn" onClick={() => startExam(attemptMode, attemptDomain ?? undefined, attemptConfig ?? undefined)}>Try another set <span>→</span></button>
                <button className="text-btn" onClick={() => { setExamState("idle"); setPracticePanel("history"); }}>View attempt history</button>
                <button className="text-btn" onClick={() => { setExamState("idle"); setPracticePanel("launch"); }}>Back to practice</button>
              </div>
            </div>
          </div>
          <div className="breakdown">
            <div className="section-heading mini"><div><p className="eyebrow">PERFORMANCE</p><h2>Domain breakdown</h2></div></div>
            <div className="breakdown-list">
              {domains.filter((domain) => examQuestions.some((question) => question.domain === domain.id)).map((domain) => {
                const group = examQuestions.filter((question) => question.domain === domain.id);
                const correct = group.filter((question) => sameAnswers(selections[question.id], question.answers)).length;
                const percent = Math.round((correct / group.length) * 100);
                return (
                  <button key={domain.id} onClick={() => { setActiveDomain(domain.id); navigate("curriculum"); }}>
                    <span className={"domain-dot " + domain.color} /><span><b>{domain.id}</b>{domain.short}</span>
                    <div className="result-track"><span style={{ width: String(percent) + "%" }} /></div>
                    <strong>{correct}/{group.length}</strong>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="review-section">
            <div className="section-heading mini">
              <div><p className="eyebrow">ANSWER REVIEW</p><h2>Understand every decision</h2></div>
              <p>Correct answers are shown in green; your incorrect selections are marked in red.</p>
            </div>
            <div className="review-list">
              {examQuestions.map((question, index) => {
                const isCorrect = sameAnswers(selections[question.id], question.answers);
                return (
                  <details key={question.id} className={"review " + (isCorrect ? "correct" : "incorrect")} open={!isCorrect}>
                    <summary><span>{isCorrect ? "✓" : "×"}</span><b>{index + 1}. {question.prompt}</b><em>{question.domain}</em></summary>
                    <div className="review-body">
                      {question.options.map((option, optionIndex) => (
                        <p key={option} className={(question.answers.includes(optionIndex) ? "right-answer " : "") + (selections[question.id]?.includes(optionIndex) && !question.answers.includes(optionIndex) ? "wrong-answer" : "")}>
                          <b>{String.fromCharCode(65 + optionIndex)}</b>{option}
                        </p>
                      ))}
                      <div className="explanation">
                        <b>WHY</b>{question.explanation}
                        {question.source && <a href={question.source.url} target="_blank" rel="noreferrer">OFFICIAL COURSE · {question.source.label} ↗</a>}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {view === "sources" && (
        <section className="page-section sources-page">
          <div className="page-intro compact">
            <p className="eyebrow">REFERENCE DESK</p>
            <h1>Study from the<br /><em>source of truth.</em></h1>
            <p>Start with Anthropic Academy&apos;s five-course CCDV-F preparation path, then use the primary product documentation to verify how the platform behaves today.</p>
          </div>
          <div className="source-grid">
            {sourceLinks.map((source, index) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{source.label}</b><p>{source.detail}</p></div>
                <strong>↗</strong>
              </a>
            ))}
          </div>
          <div className="about-card">
            <p className="eyebrow">ABOUT THIS GUIDE</p>
            <h2>Independent, blueprint-aligned, and built for practice.</h2>
            <p>This project is not affiliated with, endorsed by, or sponsored by Anthropic. Exam facts and objective weights are drawn from the CCDV-F Exam Guide v1.0, effective July 2026. Product behavior evolves, so verify implementation details against the current official documentation.</p>
          </div>
        </section>
      )}

      <footer>
        <button className="brand" onClick={() => navigate("overview")}><span className="brand-mark">C</span><span>CCDV <b>FIELD GUIDE</b></span></button>
        <p>Independent preparation tool · Not affiliated with Anthropic</p>
        <span>CCDV-F · V1.0 · 2026</span>
      </footer>
    </main>
  );
}
