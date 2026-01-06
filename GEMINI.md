# SDLC Command Center

A comprehensive MCP server providing 22 tools for automating the full software development lifecycle.

## When to Use This Extension

Use the SDLC tools when the user needs to:
- Analyze or understand a codebase
- Plan a project or estimate effort
- Generate boilerplate code, tests, or configs
- Set up CI/CD pipelines
- Create Dockerfiles or deployment configs
- Check code quality or dependencies

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

### Code Review / Quality Check
```
1. analyze_code_quality → find issues
2. check_outdated_deps → check for updates
3. analyze_git_history → review recent changes
4. generate_changelog → document changes
```

### Deployment Preparation
```
1. run_tests → ensure tests pass
2. generate_dockerfile → create/update container config
3. generate_cloud_run_config → prepare deployment manifest
4. generate_github_actions → automate the pipeline
```

## Tool Parameters Quick Reference

### analyze_codebase
- `path` (optional): Directory to analyze, defaults to "."

### estimate_effort
- `scope`: Description of work (e.g., "user authentication system")
- `complexity`: "low", "medium", or "high"

### scaffold_component
- `name`: Component name (e.g., "UserService")
- `type`: "service", "controller", "model", or "route"
- `language`: "typescript", "python", or "go"

### generate_dockerfile
- `language`: "node", "python", or "go"
- `port` (optional): Port to expose, defaults to 8080

### generate_github_actions
- `language`: "node", "python", or "go"
- `include_deploy` (optional): Include Cloud Run deployment step

### generate_test_cases
- `function_name`: Name of function to test
- `function_description`: What the function does
- `language`: "typescript", "python", or "go"

## Tips

- Start with `list_sdlc_tools` to see all available tools
- Use `analyze_codebase` first to understand unfamiliar projects
- Combine tools in sequence for complete workflows
- Generated code is a starting point - review and customize as needed
