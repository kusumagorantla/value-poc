# .NET Development Best Practices — JARVIS Traceability Demo

> **Purpose:** A **demo-ready**, agent-consumable coding standard for the JARVIS Process Result Traceability prototype (.NET 8 Web API).
> **Source:** Distilled and simplified from *"Development Standards and Guidelines for Custom .Net"* (Method One / AMBG, v0.0.4, owner Yogesh Palavalli). The original is a 40-page reference; this file keeps only what a BMAD Dev agent (Amelia) needs to **apply during a live build**, with concrete rules and code.
> **How to use in BMAD:** place this file in `docs/org/` (or `devLoadAlwaysFiles`) so it is loaded as standing context for every implementation story.

---

## 0. Demo Guardrails (read first)

Keep the demo simple but disciplined. Apply the **must-haves** always; treat **nice-to-haves** as optional if time is short.

| Priority | Practice | Why it matters for the demo |
|---|---|---|
| ✅ Must | Nullable + warnings-as-errors, analyzers on | Clean build is graded evidence |
| ✅ Must | Async all the way, no blocking calls | Low-latency synchronous PLC path (VIB rule) |
| ✅ Must | Structured logging of every recording attempt | VIB "no data loss / log all failures" rule |
| ✅ Must | Input validation + auth on the API | VIB "non-anonymous" + degraded-mode rules |
| ✅ Must | xUnit tests for the recording function | Live change-request agility |
| 🔶 Nice | SonarQube/StyleCop scan | Extra quality evidence |
| 🔶 Nice | Code metrics report | Shows maintainability discipline |

---

## 1. Project Setup & Conventions

### 1.1 Target framework & solution shape
- Target **.NET 8.0** (LTS). One solution, three projects:
  ```
  Jarvis.Api          → ASP.NET Core Web API (BUC-2 endpoints)
  Jarvis.Core         → recording function + domain model (BUC-0, BUC-1)
  Jarvis.Tests        → xUnit unit/integration tests
  ```
- Enable strictness in every `.csproj` — this is the single biggest quality win for a demo:
  ```xml
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnableNETAnalyzers>true</EnableNETAnalyzers>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
  </PropertyGroup>
  ```

### 1.2 Naming (C# coding conventions)
- **PascalCase** for classes, methods, public members, records; **camelCase** for locals/params; **_camelCase** for private fields; **interfaces** prefixed `I`.
- Async methods end in `Async`. Use meaningful domain names from the VIB (`ProcessResult`, `ProcessStep`, `StationMode`).
- Prefer `record` types for immutable DTOs (payloads in/out of the API).

### 1.3 One shared `.editorconfig`
Commit a single `.editorconfig` at repo root so style rules (IDExxxx) and quality rules (CAxxxx) are enforced identically for humans and the AI agent. Set core rules to `warning` and security rules to `error`.

---

## 2. Coding Guidelines (applied, not linked)

### 2.1 Framework design — Do / Avoid
- **Do** keep the recording function a single, interface-driven service (`IProcessResultRecorder`) — the VIB says the function is *always the same regardless of trigger*.
- **Do** use dependency injection for everything (DbContext, recorder, logger).
- **Avoid** business logic in controllers — controllers only validate, delegate, and map responses.
- **Avoid** static mutable state; it breaks the async, concurrent PLC path.

### 2.2 Exceptions — record, don't crash
The VIB demands *"record by all means, no data loss."* Encode that as policy, not heroics:
- Never let an exception drop a recording. Catch, log the **raw payload**, persist in **degraded mode**, and return a **detailed status**.
```csharp
public async Task<RecordResult> RecordAsync(ProcessResultPayload payload, CancellationToken ct)
{
    try
    {
        var validated = _validator.Validate(payload); // may downgrade, not reject
        await _repository.SaveAsync(validated, ct);
        return RecordResult.Success(validated.Mode); // Full or Degraded
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Recording failed; persisting raw payload {@Payload}", payload);
        await _repository.SaveRawFailureAsync(payload, ex, ct); // never lose data
        return RecordResult.Rejected(ex.Message);              // exceptional only
    }
}
```

### 2.3 Design patterns worth using in the demo
- **Repository** over `DbContext` for testability.
- **Result object** (`RecordResult` with `Success | Degraded | Rejected`) instead of throwing across the API boundary — maps cleanly to VIB's "detailed status".
- **Options pattern** (`IOptions<T>`) for config (latency thresholds, auth keys).

---

## 3. High-Performance Code (the latency rule)

The VIB's synchronous mode means the PLC **waits** for the response before releasing the carrier — software delay = machine bottleneck. So:

- **Async all the way.** Every I/O call is `await`ed; never `.Result` or `.Wait()`.
- Pass `CancellationToken` through the whole call chain.
- Keep the hot path allocation-light: no LINQ-heavy loops on the recording path, reuse compiled queries.
- Use `AsNoTracking()` for read-only context lookups (BUC-0 model reads).
- Add a lightweight **latency guard**: log a warning if a recording round-trip exceeds the configured threshold (e.g. 200 ms for the demo).

> If you need to prove performance live, the original standards recommend Visual Studio's **Diagnostic/Profiling tools** and **Application Insights** — for the demo, a Grafana panel over a `recording_latency_ms` metric is enough.

---

## 4. Code Quality Tools & Metrics

Keep it light but visible for the demo:

- **Always on:** built-in Roslyn analyzers (already enabled in §1.1).
- **One extra scan:** add `SonarAnalyzer.CSharp` or `StyleCop.Analyzers` as a NuGet package — zero-cost, runs on build.
- **Target metrics** (from the standard, use as demo talking points):

| Metric | Target |
|---|---|
| Maintainability Index | ≥ 40 (green) |
| Code Coverage | 70–80% |
| Cyclomatic Complexity | ≤ 10–15 per method |
| Defect Density | ≤ 0.06 (green) |
| SAST High findings | 0 before test stage |

Generate metrics via **Analyze → Calculate Code Metrics** in Visual Studio, or `dotnet` CLI.

---

## 5. Unit Testing (proves live agility)

- Framework: **xUnit** (recommended default for new .NET). One test project, `Jarvis.Tests`.
- Cover the three VIB behaviors explicitly — these become your live-demo proof:
  1. **Full record** — complete payload persists correctly.
  2. **Degraded record** — missing non-key context still records, flagged degraded.
  3. **Rejected + logged** — exceptional payload is logged with raw data, never silently dropped.
```csharp
[Fact]
public async Task Records_In_Degraded_Mode_When_Optional_Context_Missing()
{
    var payload = TestData.PayloadWithoutTooling();
    var result = await _recorder.RecordAsync(payload, default);
    Assert.Equal(RecordStatus.Degraded, result.Status);
}
```
- **Best practices:** Arrange-Act-Assert; one logical assert per test; no infrastructure in unit tests (mock the repository); name tests `Method_Scenario_Expected`.
- Add **integration tests** with `WebApplicationFactory` to hit the real BUC-2 endpoint against an in-memory/PostgreSQL test container — this is what runs Valeo's sample test cases.

---

## 6. Secure Delivery (right-sized for a demo)

Apply the relevant **OWASP Top 10** items; skip the enterprise SAST/DAST pipeline for the demo but keep the code secure-by-default:

| OWASP risk | Demo action |
|---|---|
| Broken Access Control | API is **non-anonymous** — API key or JWT on every endpoint (VIB rule). |
| Injection | Use EF Core parameterized queries; validate/whitelist all payload fields. |
| Cryptographic Failures | No secrets in code — use `appsettings`/user-secrets/env vars; TLS on. |
| Security Misconfiguration | Disable detailed errors in non-dev; lock down CORS. |
| Vulnerable Components | Pin NuGet versions; run `dotnet list package --vulnerable`. |
| Logging & Monitoring Failures | Structured logs for every attempt (already required by VIB). |

> **Rule from the standard:** fix all **High**-severity findings before the test stage; run the preliminary best-practice check *before* any SAST/DAST scan.

---

## 7. AI-Assisted Development (log it for the challenge)

The prototype is built AI-natively, so treat the assistant as a first-class tool **and record its use**:

- Use **GitHub Copilot** (completions + chat) and **IntelliCode** in the IDE for scaffolding, tests, and debugging.
- **Capture evidence for the AI Engineering Log:** prompts used, what the agent generated, what you corrected, and why. Every human correction of AI output is exactly the "evidence of review & corrective action" the challenge rewards.
- Keep AI output honest: it must still pass analyzers, tests, and the security rules above before commit.

---

## 8. Definition of Done (demo checklist)

A story is done when:
- [ ] Builds clean with `TreatWarningsAsErrors` + analyzers on.
- [ ] Async end-to-end; no blocking calls on the recording path.
- [ ] Every recording attempt logged (full / degraded / rejected) with raw payload on failure.
- [ ] API endpoint authenticated and payload validated; input/response documented (Swagger).
- [ ] xUnit tests cover full + degraded + rejected paths; green in CI.
- [ ] No High SAST findings; no vulnerable NuGet packages.
- [ ] AI usage (prompts + corrections) captured for the Engineering Log.

---

*Derived from AMBG "Development Standards and Guidelines for Custom .Net" — simplified to a demo-ready, agent-loadable standard for the JARVIS BMAD build.*
