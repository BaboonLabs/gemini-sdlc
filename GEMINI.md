# SDLC Command Center

A comprehensive MCP server providing 26 tools for automating the full software development lifecycle, including Antigravity IDE agent orchestration.

## When to Use This Extension

Use the SDLC tools when the user needs to:
- Analyze or understand a codebase
- Plan a project or estimate effort
- Generate boilerplate code, tests, or configs
- Set up CI/CD pipelines
- Create Dockerfiles or deployment configs
- Check code quality or dependencies
- **Assign tasks to Antigravity IDE agents**

---

## ⚡ IMPORTANT: Antigravity vs Jules

**Antigravity** is a LOCAL IDE agent. **Jules** is a CLOUD agent.

| User Says | Use This Tool | From Server |
|-----------|---------------|-------------|
| "use Antigravity", "open in Antigravity", "Antigravity agent" | `spawn_antigravity` | gemini-sdlc |
| "assign to agent", "have agent do", "send to local agent" | `assign_to_agent` | gemini-sdlc |
| "check agent status", "agent progress" | `get_task_status` | gemini-sdlc |
| "list agent tasks", "show tasks" | `list_agent_tasks` | gemini-sdlc |
| "use Jules", "send to Jules", "Jules agent" | `start_new_jules_task` | julesServer |

**Default behavior:**
- If user says "agent" without specifying → Ask which: Antigravity (local) or Jules (cloud)
- If user says "Antigravity" → Use gemini-sdlc tools
- If user says "Jules" → Use julesServer

---

## Tools by Phase

### Phase 1: Discovery & Planning
| Tool | Use When |
|------|----------|
| `analyze_codebase` | User asks to understand project structure, tech stack, or file organization |
| `estimate_effort` | User needs time estimates for features or projects |
| `create_project_plan` | User wants a structured plan with milestones |

### Phase 2: Requirements
| Tool | Use When |
|------|----------|
| `parse_requirements` | User has natural language requirements to convert to user stories |
| `generate_api_spec` | User needs OpenAPI spec for an endpoint or resource |

### Phase 3: Design & Architecture
| Tool | Use When |
|------|----------|
| `design_database_schema` | User describes entities and needs SQL schema |
| `generate_architecture_diagram` | User wants a visual system diagram (outputs Mermaid) |

### Phase 4: Development
| Tool | Use When |
|------|----------|
| `scaffold_component` | User needs boilerplate for service, controller, model, or route |
| `run_command` | User needs to execute shell commands |
| `analyze_dependencies` | User wants to inspect project dependencies |

### Phase 5: Testing
| Tool | Use When |
|------|----------|
| `generate_test_cases` | User needs unit tests for a function or class |
| `run_tests` | User wants to execute the test suite |
| `analyze_code_quality` | User wants to find TODOs, debug statements, or code issues |

### Phase 6: Deployment
| Tool | Use When |
|------|----------|
| `generate_dockerfile` | User needs a Dockerfile for Node.js, Python, or Go |
| `generate_github_actions` | User wants CI/CD workflow for GitHub |
| `generate_cloud_run_config` | User needs Google Cloud Run deployment config |

### Phase 7: Monitoring
| Tool | Use When |
|------|----------|
| `generate_logging_config` | User needs structured logging setup |
| `generate_health_check` | User needs health/readiness endpoint code |

### Phase 8: Maintenance
| Tool | Use When |
|------|----------|
| `check_outdated_deps` | User wants to find outdated packages |
| `generate_changelog` | User needs changelog entry from a list of changes |
| `analyze_git_history` | User wants to review recent commit history |

### Phase 9: Agent Orchestration (Antigravity)
| Tool | Use When |
|------|----------|
| `assign_to_agent` | User says "assign agent", "send to agent", "have agent do X" - creates task AND opens IDE |
| `create_agent_task` | User wants to create a task file without opening IDE |
| `spawn_antigravity` | User says "open in Antigravity", "launch Antigravity" |
| `list_agent_tasks` | User says "list tasks", "show agent tasks", "what tasks are pending" |
| `get_task_status` | User says "check status", "is agent done", "task progress" |

---

## Agent Orchestration Examples

### Assign task to Antigravity (local IDE agent)
```
User: "Have Antigravity fix the login bug"
→ Use assign_to_agent with task="fix the login bug"

User: "Open this project in Antigravity"  
→ Use spawn_antigravity with project_path="."

User: "Check if the agent finished"
→ Use get_task_status with project_path="."
```

### Assign task to Jules (cloud agent)
```
User: "Have Jules fix the login bug"
→ Use start_new_jules_task (from julesServer)
```

---

## Usage Patterns

### New Project Setup
```
1. analyze_codebase → understand existing structure
2. create_project_plan → define phases and milestones
3. scaffold_component → generate initial code structure
4. generate_dockerfile → containerize the app
5. generate_github_actions → set up CI/CD
```

### Feature Development
```
1. parse_requirements → convert requirements to user stories
2. generate_api_spec → define the API contract
3. scaffold_component → create the implementation skeleton
4. generate_test_cases → write tests first (TDD)
5. run_tests → verify implementation
```

### Delegate to Agent
```
1. analyze_codebase → understand the project
2. assign_to_agent → create task and open Antigravity
3. get_task_status → check when complete
```

---

## Tool Parameters Quick Reference

### assign_to_agent (RECOMMENDED for agent work)
- `task`: What the agent should do (e.g., "fix the login bug")
- `project_path` (optional): Defaults to current directory

### spawn_antigravity
- `project_path` (optional): Defaults to current directory

### get_task_status
- `project_path` (optional): Defaults to current directory

### list_agent_tasks
- `project_path` (optional): Filter to specific project
- `status_filter` (optional): "all", "pending", "completed"

---

## Tips

- Start with `list_sdlc_tools` to see all available tools
- Use `analyze_codebase` first to understand unfamiliar projects
- For quick agent delegation: just say "assign agent: <task>"
- Check agent progress with "check agent status"
