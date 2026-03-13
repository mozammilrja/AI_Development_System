# Research Tech Command

Research this technology using adversarial evaluation: $ARGUMENTS

Create an agent team with 3 teammates who take opposing perspectives to produce a balanced, thorough analysis.

Spawn these teammates:

1. **Proponent** — Build the strongest case FOR adopting this technology:
   - Research benefits, success stories, and strengths
   - Find benchmarks, adoption statistics, and ecosystem maturity data
   - Present the best possible argument for adoption
   - Challenge the Critic's objections with counter-evidence
   - Message the Neutral Evaluator with your key findings

2. **Critic** — Build the strongest case AGAINST adopting this technology:
   - Research limitations, failure cases, and risks
   - Find known issues, security vulnerabilities, and maintenance burden data
   - Present the strongest argument against adoption
   - Challenge the Proponent's claims with counter-evidence
   - Message the Neutral Evaluator with your key findings

3. **Neutral Evaluator** — Judge the debate and produce the final report:
   - Listen to both Proponent and Critic findings
   - Evaluate evidence quality from both sides
   - Research the specific project context fit (check our tech stack in CLAUDE.md)
   - Ask clarifying questions to both sides
   - Produce a structured comparison report with:
     - Executive summary
     - Pros vs Cons matrix
     - Risk assessment
     - Recommendation with confidence level
   - Store findings in `docs/knowledge/` directory

The debate structure ensures no single perspective dominates. After all teammates finish, present the Neutral Evaluator's final report.

Refer to `core/agents/teams/research_team.md` for the full team template.
