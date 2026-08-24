export type Objective = { name: string; weight: number; detail: string };
export type Domain = {
  id: string;
  name: string;
  short: string;
  weight: number;
  color: string;
  summary: string;
  focus: string[];
  objectives: Objective[];
  docs: { label: string; url: string }[];
};

export const domains: Domain[] = [
  {
    id: "D1", name: "Agents and Workflows", short: "Agents & Workflows", weight: 14.7, color: "coral",
    summary: "Choose the right degree of autonomy, construct reliable Claude agents, and manage multi-step execution without losing control of context or side effects.",
    focus: ["Workflow vs. agent decisions", "Agent SDK and custom loops", "Manager and subagent patterns", "Memory and context isolation"],
    objectives: [
      { name: "Agent Architecture", weight: 4.5, detail: "Compare deterministic workflows, autonomous agents, manager/supervisor hierarchies, and subagent delegation." },
      { name: "Agent Construction with Claude", weight: 5.3, detail: "Build with the Claude Agent SDK or a custom harness; evaluate managed and self-hosted deployment; enforce deterministic controls with hooks." },
      { name: "Agent Patterns and Frameworks", weight: 4.9, detail: "Apply tool-use loops, subagents, memory, context-window management, and framework abstractions such as LangGraph or PydanticAI." },
    ],
    docs: [
      { label: "Building effective agents", url: "https://www.anthropic.com/research/building-effective-agents" },
      { label: "Agent SDK overview", url: "https://platform.claude.com/docs/en/agent-sdk/overview" },
    ],
  },
  {
    id: "D2", name: "Applications and Integration", short: "Applications & Integration", weight: 33.1, color: "gold",
    summary: "Translate requirements into production software and integrate Claude through APIs, SDKs, streaming, vision, tools, caching, and batch processing.",
    focus: ["Requirements and lifecycle", "Messages API mechanics", "Streaming and batch trade-offs", "Schemas and content boundaries", "Configuration and versioning"],
    objectives: [
      { name: "Understanding Requirements", weight: 3.4, detail: "Derive functional and infrastructure requirements from business goals and solution architecture." },
      { name: "Systems Life Cycle", weight: 2.8, detail: "Apply lifecycle concepts across development, implementation, operations, maintenance, and retirement." },
      { name: "Claude API Mechanics", weight: 6.8, detail: "Use messages, tools, streaming, vision, thinking, caching, provider integrations, data-access patterns, and batch APIs." },
      { name: "Software Engineering Foundations", weight: 7.4, detail: "Apply REST, JSON, asynchronous programming, version control, SDLC integration, code review, and safe refactoring." },
      { name: "Claude Application Design", weight: 8.6, detail: "Design for instruction interpretation, content boundaries, schemas, session hygiene, interfaces, and plugin management." },
      { name: "Configuration Management", weight: 4.1, detail: "Manage CLAUDE.md, settings.json, model pinning, prompt versions, and plugin dependencies." },
    ],
    docs: [
      { label: "Messages API", url: "https://platform.claude.com/docs/en/api/messages/create" },
      { label: "Streaming", url: "https://platform.claude.com/docs/en/build-with-claude/streaming" },
      { label: "Message Batches", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing" },
    ],
  },
  {
    id: "D3", name: "Claude Code", short: "Claude Code", weight: 3.1, color: "blue",
    summary: "Operate and configure Claude Code across interactive and automated workflows, using the right customization surface for each need.",
    focus: ["Rules, Skills, Commands, Agents", "CLAUDE.md hierarchy", "Headless and streaming modes", "Repository and settings setup"],
    objectives: [
      { name: "Claude Code Operation", weight: 3.1, detail: "Use Rules, Skills, Commands, Agents, Agent Memory, session controls, slash commands, headless, streaming, auto mode, CLAUDE.md hierarchy, and settings." },
    ],
    docs: [
      { label: "Explore the .claude directory", url: "https://code.claude.com/docs/en/claude-directory" },
      { label: "Claude Code settings", url: "https://code.claude.com/docs/en/settings" },
    ],
  },
  {
    id: "D4", name: "Eval, Testing, and Debugging", short: "Eval, Testing & Debugging", weight: 2.6, color: "mint",
    summary: "Identify failure classes, isolate whether problems originate in integration code or model output, and select a proportionate recovery strategy.",
    focus: ["Error taxonomy", "Trace analysis", "Integration vs. model failures", "Recovery and observability"],
    objectives: [
      { name: "Debugging and Error Handling", weight: 2.6, detail: "Identify error types, choose recovery strategies, analyze traces, and isolate integration-layer faults from model-output faults." },
    ],
    docs: [
      { label: "Evaluate and ship", url: "https://platform.claude.com/docs/en/home" },
      { label: "API errors", url: "https://platform.claude.com/docs/en/api/errors" },
    ],
  },
  {
    id: "D5", name: "Model Selection and Optimization", short: "Models & Optimization", weight: 16.8, color: "violet",
    summary: "Understand LLM behavior, select an appropriate Claude tier, and balance quality, latency, token usage, caching, and cost.",
    focus: ["Tokens and context windows", "Sampling and non-determinism", "Thinking and effort controls", "Model tier trade-offs", "Caching and token budgets"],
    objectives: [
      { name: "LLM Fundamentals", weight: 5.2, detail: "Understand tokens, context windows, sampling, non-determinism, next-token generation, thinking controls, and zero-/one-/few-shot prompting." },
      { name: "Technical Fundamentals", weight: 6.1, detail: "Apply core application concepts such as SDK wrappers around REST APIs, asynchronous I/O, and WebSockets." },
      { name: "Model Selection and Trade-offs", weight: 2.7, detail: "Choose among Opus, Sonnet, and Haiku classes while balancing capability, latency, cost, feature support, and version changes." },
      { name: "Cost and Token Management", weight: 2.8, detail: "Track usage, model cost, set token budgets, and apply prompt caching and cache checkpoints." },
    ],
    docs: [
      { label: "Models overview", url: "https://platform.claude.com/docs/en/about-claude/models/overview" },
      { label: "Prompt caching", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching" },
      { label: "Pricing", url: "https://platform.claude.com/docs/en/about-claude/pricing" },
    ],
  },
  {
    id: "D6", name: "Prompt and Context Engineering", short: "Prompt & Context", weight: 11, color: "pink",
    summary: "Place clear instructions, examples, and constraints in the right layers, while keeping long-running context relevant, compact, and safe to consume.",
    focus: ["Instruction hierarchy", "Few-shot examples", "Context pruning and compaction", "Structured outputs", "Validation and defensive parsing"],
    objectives: [
      { name: "Context Engineering", weight: 3.8, detail: "Manage context windows, prevent drift and bloat, prune tool output, compact history, and isolate context through subagents or stages." },
      { name: "Prompt Engineering", weight: 4.6, detail: "Write clear instructions, place them correctly, add examples and constraints, refine iteratively, and sanitize untrusted input." },
      { name: "Output Handling", weight: 2.6, detail: "Generate structured outputs, validate responses, parse defensively, and remain skeptical of confident model output." },
    ],
    docs: [
      { label: "Prompt engineering overview", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview" },
      { label: "Manage tool context", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context" },
    ],
  },
  {
    id: "D7", name: "Security and Safety", short: "Security & Safety", weight: 8.1, color: "green",
    summary: "Treat external content as untrusted, layer guardrails, minimize privileges, and protect identities, credentials, private data, and destructive operations.",
    focus: ["Prompt injection and jailbreaks", "Trust boundaries and data leakage", "Least privilege", "Hooks as deterministic controls", "Secrets and identity"],
    objectives: [
      { name: "AI Application Security", weight: 3.2, detail: "Mitigate prompt injection and jailbreaks; protect PII and prevent data leakage while preserving authentication, authorization, confidentiality, and integrity." },
      { name: "Guardrails and Safe Deployment", weight: 2.3, detail: "Layer content policy and deterministic controls using privacy, identity, access management, and least privilege." },
      { name: "Claude Hooks", weight: 1.0, detail: "Use hooks to block destructive actions and enforce controls independently of model compliance." },
      { name: "Identity, Secrets, and Key Management", weight: 1.6, detail: "Verify identities, authorize access, scope credentials, store API keys safely, rotate secrets, and monitor authorized use." },
    ],
    docs: [
      { label: "Safeguards and guardrails", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails" },
      { label: "Claude Code permissions", url: "https://code.claude.com/docs/en/permissions" },
      { label: "Hooks guide", url: "https://code.claude.com/docs/en/hooks-guide" },
    ],
  },
  {
    id: "D8", name: "Tools and MCPs", short: "Tools & MCPs", weight: 10.6, color: "orange",
    summary: "Define reliable tool contracts, dispatch and validate calls, build reusable MCP servers, and choose between tools, Skills, built-ins, and MCP.",
    focus: ["Tool schemas and descriptions", "Client- vs. server-side execution", "Approval and error patterns", "MCP primitives and transports", "Customization trade-offs"],
    objectives: [
      { name: "Tool Implementation", weight: 4.4, detail: "Implement function calling, descriptions, input schemas, dispatch, validation, error handling, approval, and focused toolsets." },
      { name: "MCP Server Development", weight: 2.1, detail: "Build, deploy, and integrate servers exposing tools, resources, and prompts over stdio or Streamable HTTP." },
      { name: "Agentic Customization", weight: 4.1, detail: "Choose between built-in tools, custom tools, Skills, and MCP based on reusability, execution needs, scope, and maintenance." },
    ],
    docs: [
      { label: "Tool use", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview" },
      { label: "MCP specification", url: "https://modelcontextprotocol.io/specification/latest" },
    ],
  },
];

export type Question = {
  id: number;
  domain: string;
  prompt: string;
  options: string[];
  answers: number[];
  explanation: string;
};

const Q = (id: number, domain: string, prompt: string, options: string[], answers: number[], explanation: string): Question =>
  ({ id, domain, prompt, options, answers, explanation });

export const questions: Question[] = [
  Q(1,"D1","A refund process has fixed validation, approval, and notification steps. Every transition must be auditable. What should the team build first?",["An open-ended autonomous agent","A deterministic workflow with bounded model steps","A swarm of peer agents","A memory-first conversational agent"],[1],"A deterministic workflow fits known steps, strict transitions, and auditability; autonomy adds unnecessary variance."),
  Q(2,"D1","A research task branches unpredictably as evidence is discovered and requires choosing tools at runtime. Which architecture best fits?",["A fixed linear pipeline","A single prompt with no tools","An agentic loop with explicit stopping conditions","A nightly batch job only"],[2],"Dynamic planning and tool choice justify an agentic loop, bounded by budgets and stop conditions."),
  Q(3,"D1","A manager agent delegates legal, technical, and financial analysis. What is the strongest reason to use subagents?",["They guarantee correct answers","They isolate specialized context and return focused results","They remove the need for validation","They make all work deterministic"],[1],"Subagents provide specialization and context isolation; they do not guarantee correctness."),
  Q(4,"D1","An agent keeps calling the same failing tool. Which two controls are most appropriate?",["Unlimited retries","A retry budget with backoff","A termination condition for repeated failures","A larger context window"],[1,2],"Bounded retries and a repeated-failure stop condition prevent runaway loops while allowing transient recovery."),
  Q(5,"D1","A team needs a lightweight two-step classify-then-route process. What is the best starting point?",["Adopt a complex graph framework immediately","Implement a simple composable workflow and add abstraction only when needed","Use one agent per label","Store every request in long-term memory"],[1],"Start with the simplest architecture that satisfies the requirements; frameworks should earn their complexity."),
  Q(6,"D1","A production agent may delete cloud resources. Which control should be outside the model's reasoning loop?",["A polite system-prompt warning","A deterministic pre-action authorization check","A longer tool description","A few-shot example"],[1],"Irreversible actions need deterministic authorization or hook enforcement independent of model compliance."),
  Q(7,"D1","A long agent run accumulates large raw tool responses. What should the harness do?",["Keep every byte forever","Prune or summarize stale tool results while preserving decisions","Raise temperature","Repeat the system prompt after every tool call"],[1],"Pruning and compaction reduce context bloat while retaining the information required for later decisions."),
  Q(8,"D1","When is self-hosting a custom agent harness most justified?",["When the team needs maximum infrastructure abstraction","When the team needs control over execution, state, and compliance boundaries","Whenever a task uses one tool","Only for local prototypes"],[1],"Self-hosting is most valuable when execution, data, state, or compliance controls require direct ownership."),

  Q(9,"D2","Ten thousand independent documents must be summarized overnight; latency is flexible and cost matters most. Which API pattern fits?",["Synchronous Messages calls from the UI","Message Batches","A persistent WebSocket per document","One giant prompt containing every document"],[1],"Batch processing is designed for high-volume asynchronous work that can tolerate delayed completion."),
  Q(10,"D2","A chat UI must render tokens as they arrive. Which transport behavior should the client handle?",["Polling a database only","Server-Sent Events from a streaming Messages response","Uploading a ZIP archive","A cron job"],[1],"Messages streaming delivers incremental events over SSE for responsive interfaces."),
  Q(11,"D2","An API request includes a system role inside the messages array and fails validation. What is the correction?",["Rename it to admin","Send system instructions through the top-level system parameter","Put the system content in max_tokens","Convert it to a tool result"],[1],"The Messages API accepts system instructions in the top-level system parameter, not as a message role."),
  Q(12,"D2","A response ends with stop_reason equal to tool_use. What must the application do next?",["Treat it as a complete final answer","Execute the requested tool, return a matching tool_result, and continue the loop","Retry the same request unchanged","Discard the tool input"],[1],"tool_use transfers control to the client or harness, which executes and returns the correlated result."),
  Q(13,"D2","A response ends because max_tokens was reached. What is the primary interpretation?",["Authentication failed","The generated output may be incomplete","The model selected a tool","The prompt cache expired"],[1],"max_tokens means generation hit the configured output limit and may have been truncated."),
  Q(14,"D2","A service receives intermittent 429 responses. Which recovery is appropriate?",["Retry immediately in a tight loop","Use bounded exponential backoff and respect retry guidance","Change the prompt wording","Parse the body as a successful model answer"],[1],"Rate limits are transient integration errors; bounded backoff is the appropriate recovery."),
  Q(15,"D2","A request returns 401 for every retry. What should the developer inspect first?",["Temperature","API credentials and authorization configuration","Few-shot examples","Context compaction"],[1],"Persistent 401 errors point to authentication or credential configuration, not model behavior."),
  Q(16,"D2","A browser client would need to embed the Anthropic API key. What is the safer design?",["Obfuscate the key in JavaScript","Proxy requests through a controlled backend that holds the secret","Store the key in localStorage","Put the key in the system prompt"],[1],"Long-lived provider credentials belong on a trusted server, not in distributable browser code."),
  Q(17,"D2","A team changes a production prompt and model alias simultaneously, then quality drops. Which practice would have improved diagnosis?",["Disable version control","Version prompts and pin model versions so changes can be isolated","Increase all token limits","Move logic into CSS"],[1],"Independent versioning and model pinning make regressions reproducible and attributable."),
  Q(18,"D2","A tool accepts an order identifier and quantity. Which schema is strongest?",["A free-form string with examples in comments","A JSON schema with explicit types, required fields, and constraints","No schema; let the model guess","An HTML form serialized as text"],[1],"Explicit machine-validatable schemas reduce ambiguity and allow defensive validation."),
  Q(19,"D2","A feature accepts PDFs and images. What should requirements discovery establish before implementation? Select two.",["Supported media types and size limits","Latency and privacy requirements","The developer's preferred font","A guarantee that model output is always correct"],[0,1],"Input constraints, latency, and privacy are functional and infrastructure requirements that shape the design."),
  Q(20,"D2","A refactor touches authentication, billing, and every API route at once. What is the safer approach?",["Merge without tests","Use staged, reviewable changes with tests and rollback points","Ask the model to remember the old behavior","Skip version control until complete"],[1],"Incremental changes, verification, and rollback points reduce blast radius in large refactors."),
  Q(21,"D2","A user begins a new unrelated task in the same long session. What helps session hygiene?",["Keep all previous tool output active","Start a clean session or compact to relevant context","Repeat every earlier message","Add unrelated documents"],[1],"Fresh or compacted context prevents stale instructions and data from contaminating the new task."),
  Q(22,"D2","A response must populate a database record. What is the best consumption pattern?",["Trust natural-language prose and regex it","Request structured output and validate it against the application schema","Use the longest possible prompt","Accept missing fields silently"],[1],"Structured generation plus application-side validation creates a reliable boundary."),
  Q(23,"D2","A streaming client reconnects after a network interruption. What should its design prioritize?",["Idempotency, event handling, and clear retry semantics","Randomly duplicating requests","Ignoring partial state","Increasing temperature"],[0],"Streaming integrations need deliberate partial-state, retry, and idempotency handling."),
  Q(24,"D2","A team wants the same application behavior in development and production. Which two controls help most?",["Pin versions and track configuration in source control","Use environment-specific secrets outside source control","Edit production manually without records","Depend on floating plugin versions"],[0,1],"Versioned configuration plus environment-specific secret injection supports repeatable deployments without exposing credentials."),
  Q(25,"D2","A request contains a large stable policy prefix and a small changing user query. How should caching be arranged?",["Place the stable prefix before the cache breakpoint","Put changing timestamps at the beginning","Reorder tools on each call","Cache only the final answer"],[0],"Prompt caching relies on a stable shared prefix; changing early content invalidates later cache segments."),

  Q(26,"D3","A convention should be shared with every contributor to one repository. Where does it belong?",["A committed project CLAUDE.md","A personal settings.local.json only","The API key environment variable","A transient chat message only"],[0],"Project CLAUDE.md is versionable team context; personal overrides should remain local."),
  Q(27,"D3","A command must be blocked before execution even if Claude decides it is useful. What should enforce this?",["A vague CLAUDE.md sentence","A permission rule or deterministic hook","A longer conversation","Auto memory"],[1],"Permissions and hooks enforce boundaries; CLAUDE.md guidance is not a security guarantee."),

  Q(28,"D4","Valid API responses arrive, but a downstream parser fails only when an optional field is absent. Where is the defect most likely?",["Provider authentication","The integration layer's parsing assumptions","The model context window","DNS"],[1],"The trace isolates the fault after a valid response, pointing to defensive parsing in the integration layer."),

  Q(29,"D5","A high-volume classifier has simple labels, strict latency, and a validated quality target met by a smaller model. What is the best model choice?",["Always the largest tier","The smallest tier that meets measured quality requirements","A random tier per request","The tier with the longest name"],[1],"Choose the least expensive, fastest model that meets validated task quality."),
  Q(30,"D5","A difficult planning task consistently fails on multi-step reasoning. Which change should be tested first?",["Reduce all context to one sentence","Use a more capable model or appropriate thinking configuration and evaluate","Remove validation","Increase randomness without measurement"],[1],"Capability and thinking settings should be evaluated against the difficult task, with cost and latency measured."),
  Q(31,"D5","Why can the same prompt produce different valid outputs?",["LLMs are deterministic databases","Token sampling and probabilistic next-token generation introduce variation","REST forces randomness","JSON schemas change network routing"],[1],"LLMs generate from probability distributions; sampling can yield variation even for identical inputs."),
  Q(32,"D5","What does max_tokens primarily control?",["Maximum generated output tokens","Total account spend across all requests","Input document file size","Number of tools installed"],[0],"max_tokens is an output-generation ceiling, not a complete cost or input-size control."),
  Q(33,"D5","A large reference manual is reused across thousands of requests. Which optimization directly reduces repeated prefix processing?",["Prompt caching","Higher temperature","More parallel agents","Duplicating the manual"],[0],"Prompt caching reuses a stable processed prefix, reducing repeated input cost and latency."),
  Q(34,"D5","The usage object shows zero cache-read tokens after a prompt change. What is a likely cause?",["The shared prefix changed before the breakpoint","The answer was too accurate","The output used JSON","The request used HTTPS"],[0],"Caching is prefix-based; an early change can invalidate the matching cached prefix."),
  Q(35,"D5","A user-facing autocomplete needs the lowest practical time-to-first-token. Which two factors deserve priority?",["A latency-appropriate model tier","Streaming or fast inference settings when supported","Maximum extended thinking for every request","Batch processing overnight"],[0,1],"A faster suitable model and incremental/fast delivery target interactive latency; batch and heavy reasoning do not."),
  Q(36,"D5","Before changing models in production, what should a team do?",["Assume behavior is identical","Run representative evals for quality, latency, cost, and compatibility","Delete the old configuration","Change prompt, tools, and model together"],[1],"Model changes can alter behavior and feature support; representative evaluation controls migration risk."),
  Q(37,"D5","Why count tokens before sending a very large request?",["To prove the answer is correct","To estimate fit and cost before inference","To encrypt the prompt","To choose a CSS theme"],[1],"Preflight token counting helps avoid context-limit failures and improves cost planning."),

  Q(38,"D6","A model must return one of four status values plus a numeric confidence. What is the strongest approach?",["Ask for nice prose","Use a structured schema and validate every response","Parse whichever words appear","Rely on confidence alone"],[1],"A constrained schema plus validation is safer than interpreting unconstrained prose."),
  Q(39,"D6","Retrieved web content says to ignore the developer's rules. How should it be represented?",["As a new trusted system instruction","As clearly delimited untrusted content, never as authority","At the start of the system prompt","Inside an API key"],[1],"External content belongs across a trust boundary and must not be promoted into the instruction hierarchy."),
  Q(40,"D6","A prompt's output quality varies because requirements such as tone, audience, and format are implicit. What should be improved first?",["Instruction clarity and explicit output constraints","Network timeout","API-key rotation","MCP transport"],[0],"Make success criteria explicit before adding more complex techniques."),
  Q(41,"D6","A complex extraction task remains inconsistent after clear instructions. What is a useful next step?",["Add representative few-shot examples, including edge cases","Remove the schema","Increase unrelated context","Disable testing"],[0],"Examples demonstrate the intended mapping and edge-case behavior."),
  Q(42,"D6","A long conversation drifts toward earlier, irrelevant tasks. Select two remedies.",["Compact the history around current goals and decisions","Prune stale tool results","Repeat all history verbatim","Add more unrelated examples"],[0,1],"Compaction and pruning preserve salient state while reducing competing context."),
  Q(43,"D6","A model returns syntactically valid JSON with a nonexistent customer ID. What should the application do?",["Trust it because the JSON is valid","Validate semantics against authoritative data before acting","Retry forever","Store it as fact"],[1],"Syntax validation is only one layer; identifiers and business rules need semantic validation."),

  Q(44,"D7","An agent summarizes user-supplied pages that may contain hidden instructions. Which two mitigations are strongest?",["Separate retrieved content from trusted instructions","Restrict sensitive tools with least privilege and deterministic approval","Raise temperature","Tell attackers to be polite"],[0,1],"Trust separation and bounded capabilities limit prompt-injection impact."),
  Q(45,"D7","A support tool needs to read account status but never modify it. What credential scope should it receive?",["Administrator access","Read-only access to the required resource","The developer's personal token","No authentication"],[1],"Least privilege limits both accidents and adversarial use."),
  Q(46,"D7","Where should a production API secret be stored?",["Committed in settings.json","A managed secret store or protected environment configuration","Inside CLAUDE.md","In frontend source code"],[1],"Secrets require protected storage, controlled access, rotation, and auditability."),
  Q(47,"D7","A model output may contain PII that must not reach logs. What should the system do?",["Log everything for convenience","Apply data-minimization and redaction controls before logging","Hide it with CSS","Increase max_tokens"],[1],"Logging is a data boundary; minimize and redact sensitive data before it enters observability systems."),

  Q(48,"D8","A tool updates a bank transfer. Which design is most important?",["A broad description such as do_finance","Typed inputs, authorization, idempotency, and explicit user approval","No validation to reduce latency","Let the model invent account IDs"],[1],"High-impact tools need precise contracts and deterministic controls around authorization and duplicate execution."),
  Q(49,"D8","A tool returns an error. How should the harness represent it?",["As a successful fabricated result","As a structured tool result with actionable error context","By ending the process silently","By editing the system prompt"],[1],"Structured failures let the model or workflow recover without confusing errors for success."),
  Q(50,"D8","An internal inventory capability must be reused by several AI applications and maintained independently. What is the best fit?",["Copy its prompt into every app","Expose it through an MCP server","Paste inventory into every context","Create a CSS plugin"],[1],"MCP provides a reusable, application-independent integration surface."),
  Q(51,"D8","Which MCP primitive is model-invoked to perform an external action?",["Tool","Resource","Prompt","Theme"],[0],"Tools are executable, model-controlled capabilities; resources provide data and prompts provide templates."),
  Q(52,"D8","A local MCP integration runs as a subprocess. Which transport is the natural fit?",["stdio","SMTP","FTP","A public unauthenticated endpoint"],[0],"stdio is designed for a client-launched local server exchanging protocol messages over standard streams."),
  Q(53,"D8","A reusable deployment checklist contains instructions and reference material but does not need external execution. Which customization best fits?",["A Skill","A remote MCP server","A destructive hook","A database credential"],[0],"A Skill packages reusable knowledge and workflow instructions; MCP is useful when an external capability or shared service is needed."),
];

export const sourceLinks = [
  { label: "Certification page", detail: "Anthropic Partner Academy", url: "https://anthropic-partners.skilljar.com/claude-certified-developer-foundations-certification" },
  { label: "Independent exam guide", detail: "Blueprint and exam facts", url: "https://claudecertificationguide.com/ccdv-f" },
  { label: "Claude Platform docs", detail: "API, models, tools, prompting", url: "https://platform.claude.com/docs/en/home" },
  { label: "Claude Code docs", detail: "Configuration and operation", url: "https://code.claude.com/docs/en/overview" },
  { label: "MCP specification", detail: "Protocol and server primitives", url: "https://modelcontextprotocol.io/specification/latest" },
];
