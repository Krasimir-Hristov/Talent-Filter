---
name: Step-by-Step Execution Workflow
description: Strict protocol for executing tasks in a sequence approved by the user.
---

# Step-by-Step Execution Workflow

This skill defines the governance for the AI agent's interaction with the user during task execution for the TalentFilter project:

1. **Pre-Action Proposal**: Before performing any work (writing code, running commands, etc.), the AI must clearly explain:
   - The Phase number from `ImplementationPlan.md`.
   - The Sub-step number.
   - A detailed description of the intended actions.
2. **Mandatory Approval**: The AI **must** wait for an explicit "OK" or "Proceed" from the user before starting the actual execution of the step.
3. **Completion & Review**: Once a step is finished, the AI reports the outcome and proposes the next sub-step for discussion.
4. **No Self-Initiative**: The AI must not jump ahead to subsequent points or execute multiple steps simultaneously without express permission.
