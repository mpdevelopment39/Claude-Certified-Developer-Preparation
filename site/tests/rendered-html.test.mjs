import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(process.pid) + "-" + String(Date.now()));
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the CCDV study dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>CCDV Field Guide/);
  assert.match(html, /Build the systems/);
  assert.match(html, /Pass the exam/);
  assert.match(html, /53/);
  assert.match(html, /120/);
  assert.match(html, /25/);
  assert.match(html, /Study by exam weight/);
  assert.match(html, /Train under exam conditions/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("ships the complete curriculum, official prep path, and original practice bank", async () => {
  const [content, hardQuestions, page, packageJson] = await Promise.all([
    readFile(new URL("../app/content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hard-questions.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.equal((content.match(/id: "D[1-8]"/g) ?? []).length, 8);
  assert.equal((content.match(/\{ name: "[^"]+", weight:/g) ?? []).length, 25);
  assert.equal((content.match(/\bQ\(\d+,"D[1-8]"/g) ?? []).length, 63);
  const advancedBank = [...hardQuestions.matchAll(/\bH\((\d+),"(D[1-8])"/g)];
  assert.equal(advancedBank.length, 63);
  assert.deepEqual(
    [...new Set(advancedBank.map((match) => Number(match[1])))].sort((a, b) => a - b),
    Array.from({ length: 63 }, (_, index) => index + 1),
  );
  assert.deepEqual(
    Object.fromEntries(
      Array.from({ length: 8 }, (_, index) => `D${index + 1}`).map((domain) => [
        domain,
        advancedBank.filter((match) => match[2] === domain).length,
      ]),
    ),
    { D1: 9, D2: 19, D3: 3, D4: 2, D5: 11, D6: 7, D7: 5, D8: 7 },
  );
  assert.ok((hardQuestions.match(/\],\[[0-3],[0-3]/g) ?? []).length >= 8);
  assert.doesNotMatch(hardQuestions, /CSS theme|longest name|tell attackers to be polite/i);
  assert.match(content, /export const questions: Question\[\] = hardQuestions/);
  assert.equal((content.match(/duration: "\d+ min"/g) ?? []).length, 5);
  assert.match(content, /MSO Foundations/);
  assert.match(content, /Production-Grade Prompting, Agents & Tool Use/);
  assert.match(content, /Claude Code, MCP & Integration/);
  assert.match(content, /Production Engineering, Evals & Security/);
  assert.match(content, /Accelerators & IP Contribution/);
  assert.match(content, /fullMockQuestionCounts/);
  assert.match(page, /fullMockQuestionCounts\[domain\.id\]/);
  assert.match(page, /setRevealed/);
  assert.match(page, /Check answer/);
  assert.match(page, /live-feedback/);
  assert.match(page, /120 \* 60/);
  assert.match(page, /ccdv-field-guide-progress/);
  assert.match(page, /not recalled, leaked, or live exam items/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
