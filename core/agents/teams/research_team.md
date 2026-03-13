# Research Team Template

## Team Structure
- **Team size**: 3 teammates
- **Pattern**: Adversarial debate — proponent vs critic, judged by neutral evaluator
- **Estimated tasks per teammate**: 3-4

## Dependency Graph
```
Proponent ────────┐
                  ├──→ Neutral Evaluator (judges debate)
Critic ───────────┘
```
Proponent and Critic work in parallel. Neutral Evaluator listens to both and produces the final report.

## Teammate Definitions

### 1. Proponent
**Spawn prompt:**
> Build the strongest possible case FOR adopting: {{TECHNOLOGY}}.
> Research and present:
> - Key benefits and competitive advantages
> - Success stories and adoption statistics
> - Ecosystem maturity (libraries, community, documentation)
> - Benchmarks and performance data
> - How well it fits our current tech stack (see CLAUDE.md)
> Share your findings with the Neutral Evaluator teammate.
> When the Critic shares objections, respond with counter-evidence.
> Be thorough but honest — don't cherry-pick.

**Focus:** Benefits, strengths, adoption evidence

### 2. Critic
**Spawn prompt:**
> Build the strongest possible case AGAINST adopting: {{TECHNOLOGY}}.
> Research and present:
> - Limitations, risks, and known failure cases
> - Security vulnerabilities or maintenance burden
> - Migration costs and learning curve
> - Lock-in risks and alternatives
> - Incompatibilities with our current tech stack (see CLAUDE.md)
> Share your findings with the Neutral Evaluator teammate.
> When the Proponent shares benefits, challenge them with counter-evidence.
> Be thorough but honest — don't exaggerate risks.

**Focus:** Risks, limitations, costs, alternatives

### 3. Neutral Evaluator
**Spawn prompt:**
> Judge the debate between Proponent and Critic regarding: {{TECHNOLOGY}}.
> Your job:
> 1. Listen to findings from both Proponent and Critic
> 2. Evaluate the quality of evidence from each side
> 3. Research our specific project context (check CLAUDE.md and `configs/`)
> 4. Ask clarifying questions to both sides if needed
> 5. Produce a structured research report with:
>    - Executive summary (2-3 sentences)
>    - Pros vs Cons comparison matrix
>    - Risk assessment (impact × probability)
>    - Recommendation: Adopt / Don't Adopt / Investigate Further
>    - Confidence level: Low / Medium / High
> 6. Save the report to `knowledge/` directory
> Be impartial — your value is in balanced judgment, not advocacy.

**File ownership:** `knowledge/`

## Placeholders
- `{{TECHNOLOGY}}` — The technology, library, pattern, or approach to evaluate

## Best Practices
- The adversarial structure prevents confirmation bias
- Proponent and Critic should directly engage with each other's arguments
- Neutral Evaluator should weigh evidence quality, not just quantity
- Final report should be actionable — include next steps regardless of recommendation
- Store findings in knowledge/ for future reference
