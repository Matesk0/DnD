---
name: multi-agent-orchestration
description: Guidelines for selecting, invoking, and coordinating the local specialized subagent team (manager, plan, design, code, frontend, backend) for specific development tasks.
---

# Multi-Agent Orchestration Skill

## Overview
This skill provides structured workflows for utilizing the local subagents (`manager`, `plan`, `design`, `code`, `frontend`, and `backend`) to accelerate and isolate coding, design, planning, and verification tasks.

---

## Agent Team Reference

| Agent Name | Primary Specialty | Typical Task Assignment |
| :--- | :--- | :--- |
| **`manager`** | Orchestration & validation | Orchestrating multi-file features; validating final test correctness. |
| **`plan`** | Specification & breakdown | Drafting technical specs, database schemas, and step-by-step roadmaps. |
| **`design`** | UX/UI assets, colors, and layouts | Styling components, creating custom themes, generating graphics. |
| **`code`** | Core TypeScript & component logic | Writing pure functions, React Native components, and shared interfaces. |
| **`frontend`** | Testing, browser validation, & SSR safety | Writing Jest unit tests, verifying document checks, managing scratch files. |
| **`backend`** | Database, API, & server configurations | Writing REST/GraphQL endpoints, Supabase rules, server logic. |

---

## Orchestration Workflow

When a non-trivial task or feature request is received, the orchestrator should follow these steps:

### Step 1: Specification & Design (Plan Phase)
1. Invoke the **`plan`** agent to analyze requirements, map out monorepo dependencies, and create a technical specification.
2. If the task has user-facing visual requirements, invoke the **`design`** agent in parallel to establish HSL color tokens, select symbols, or generate assets.

### Step 2: Implementation (Build Phase)
1. Invoke the **`code`** agent (and/or **`backend`** agent for database tasks) with the spec and layout instructions generated in Step 1.
2. Have the agent build out the isolated slices of functionality.

### Step 3: Verification & Test (Verify Phase)
1. Invoke the **`frontend`** agent to create unit tests validating the implemented logic.
2. Instruct the subagent to run `npm test` locally to verify that all test assertions pass.

### Step 4: Final Validation
1. The orchestrator must run `npm test` at the root workspace level one final time before completing the task.

---

## Tool Call Templates

### 1. Invoking the Manager
When delegating a large feature to the manager agent:
```json
{
  "Subagents": [
    {
      "TypeName": "manager",
      "Role": "RPG Companion Project Manager",
      "Prompt": "Orchestrate the implementation of the character sheet export feature. First request a spec from 'plan', then coordinate the code changes."
    }
  ]
}
```

### 2. Invoking Specialized Agents (from Manager)
```json
{
  "Subagents": [
    {
      "TypeName": "code",
      "Role": "RPG Companion Core Developer",
      "Prompt": "Implement the tabletop modifier calculations helper functions in src/utils/math.ts according to the provided plan."
    }
  ]
}
```

---

## Core Rules for Subagent Operation
1. **Rule of Tests**: Every subagent MUST run `npm test` after creating or modifying project files to ensure changes do not introduce regressions.
2. **Context Scope**: Subagents should inherit the workspace context (`inherit` workspace mode) to ensure they operate on the shared codebase.
3. **Communication**: Subagents must use the `send_message` tool to report completion or request clarification from their invoker.
