"use client";

import { useEffect, useMemo, useState } from "react";
import { domains, questions, sourceLinks, type Domain, type Question } from "./content";

type View = "overview" | "curriculum" | "practice" | "sources";
type ExamState = "idle" | "running" | "results";

const objectiveKey = (domain: Domain, index: number) => domain.id + "-" + index;
const sameAnswers = (a: number[] = [], b: number[] = []) => {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
};
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [activeDomain, setActiveDomain] = useState("D2");
  const [completed, setCompleted] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [examState, setExamState] = useState<ExamState>("idle");
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [current, setCurrent] = useState(0);
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [examDuration, setExamDuration] = useState(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ccdv-field-guide-progress");
      if (saved) setCompleted(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem("ccdv-field-guide-progress", JSON.stringify(completed));
  }, [completed, loaded]);

  useEffect(() => {
    if (examState !== "running" || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [examState, secondsLeft]);

  useEffect(() => {
    if (examState === "running" && examDuration > 0 && secondsLeft === 0) setExamState("results");
  }, [secondsLeft, examDuration, examState]);

  const totalObjectives = domains.reduce((sum, domain) => sum + domain.objectives.length, 0);
  const weightedProgress = domains.reduce((total, domain) =>
    total + domain.objectives.reduce((sum, objective, index) =>
      sum + (completed.includes(objectiveKey(domain, index)) ? objective.weight : 0), 0), 0);
  const currentDomain = domains.find((domain) => domain.id === activeDomain) ?? domains[1];

  const score = useMemo(() => {
    if (!examQuestions.length) return { correct: 0, percent: 0 };
    const correct = examQuestions.filter((question) => sameAnswers(selections[question.id], question.answers)).length;
    return { correct, percent: Math.round((correct / examQuestions.length) * 100) };
  }, [examQuestions, selections]);

  const navigate = (next: View) => {
    setView(next);
    if (next !== "practice") setExamState("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDomain = (id: string) => {
    setActiveDomain(id);
    setView("curriculum");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleObjective = (key: string) => {
    setCompleted((items) => items.includes(key) ? items.filter((item) => item !== key) : [...items, key]);
  };

  const startExam = (mode: "full" | "quick" | "domain", domainId?: string) => {
    let selected: Question[];
    let duration: number;
    let title: string;
    if (mode === "full") {
      selected = shuffle(questions);
      duration = 120 * 60;
      title = "Full Blueprint Mock";
    } else if (mode === "domain" && domainId) {
      selected = shuffle(questions.filter((question) => question.domain === domainId));
      duration = Math.max(15, Math.round(selected.length * 2.25)) * 60;
      title = (domains.find((domain) => domain.id === domainId)?.short ?? "Domain") + " Drill";
    } else {
      selected = shuffle(questions).slice(0, 10);
      duration = 25 * 60;
      title = "Quick Scenario Drill";
    }
    setExamQuestions(selected);
    setExamDuration(duration);
    setSecondsLeft(duration);
    setExamTitle(title);
    setCurrent(0);
    setSelections({});
    setFlagged([]);
    setExamState("running");
    setView("practice");
    window.scrollTo({ top: 0 });
  };

  const selectOption = (question: Question, option: number) => {
    setSelections((all) => {
      const existing = all[question.id] ?? [];
      const next = question.answers.length > 1
        ? existing.includes(option) ? existing.filter((item) => item !== option) : [...existing, option]
        : [option];
      return { ...all, [question.id]: next };
    });
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
                <button className="small-action" onClick={() => startExam("domain", currentDomain.id)}>Practice domain →</button>
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
                <button key={domain.id} onClick={() => startExam("domain", domain.id)}>
                  <span className={"domain-dot " + domain.color} />
                  <span><b>{domain.id}</b>{domain.short}</span>
                  <strong>{questions.filter((question) => question.domain === domain.id).length} Q →</strong>
                </button>
              ))}
            </div>
          </div>
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
                className={(index === current ? "current " : "") + (selections[question.id]?.length ? "answered " : "") + (flagged.includes(question.id) ? "flagged" : "")}
                onClick={() => setCurrent(index)}
                aria-label={"Question " + (index + 1)}
              >{index + 1}</button>
            ))}
          </div>
          <article className="question-card">
            <div className="question-meta">
              <span>{examQuestions[current].domain} · {domains.find((domain) => domain.id === examQuestions[current].domain)?.short}</span>
              <span>{examQuestions[current].answers.length > 1 ? "SELECT " + examQuestions[current].answers.length : "SELECT ONE"}</span>
            </div>
            <h2>{examQuestions[current].prompt}</h2>
            <div className="options-list">
              {examQuestions[current].options.map((option, index) => {
                const selected = selections[examQuestions[current].id]?.includes(index);
                return (
                  <button className={selected ? "selected" : ""} key={option} onClick={() => selectOption(examQuestions[current], index)}>
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                    <span className="option-control">{selected ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
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
              <div className="result-actions">
                <button className="primary-btn" onClick={() => startExam(examQuestions.length === 53 ? "full" : "quick")}>Try another set <span>→</span></button>
                <button className="text-btn" onClick={() => setExamState("idle")}>Back to practice</button>
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
                      <div className="explanation"><b>WHY</b>{question.explanation}</div>
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
            <p>The certification blueprint tells you what to learn. Primary product documentation tells you how the platform behaves today.</p>
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
