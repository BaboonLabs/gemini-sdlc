# gemini-sdlc

A Gemini CLI extension providing 22 tools for full software development lifecycle automation. Covers discovery, requirements, design, development, testing, deployment, monitoring, and maintenance phases.

## Installation

```bash
gemini extensions install https://github.com/BaboonLabs/gemini-sdlc
```

## Tools

### Discovery and Planning

| Tool | Description |
|------|-------------|
| `analyze_codebase` | Analyze project structure, languages, and file organization |
| `estimate_effort` | Estimate development effort based on scope and complexity |
| `create_project_plan` | Generate project plan template with milestones |

### Requirements

| Tool | Description |
|------|-------------|
| `parse_requirements` | Convert natural language requirements into structured user stories |
| `generate_api_spec` | Generate OpenAPI-style specification for a resource |

### Design and Architecture

| Tool | Description |
|------|-------------|
| `design_database_schema` | Generate database schema from entity descriptions |
| `generate_architecture_diagram` | Create Mermaid architecture diagrams |

### Development

| Tool | Description |
|------|-------------|
| `scaffold_component` | Generate boilerplate code for services, controllers, models |
| `run_command` | Execute shell commands and return output |
| `analyze_dependencies` | Analyze project dependencies from package.json, requirements.txt |

### Testing

| Tool | Description |
|------|-------------|
| `generate_test_cases` | Generate test code for a function |
| `run_tests` | Execute project tests and return results |
| `analyze_code_quality` | Run static analysis and code quality checks |

### Deployment

| Tool | Description |
|------|-------------|
| `generate_dockerfile` | Create optimized Dockerfile for Python, Node, or Go projects |
| `generate_github_actions` | Generate GitHub Actions CI/CD workflow |
| `generate_cloud_run_config` | Generate Cloud Run service configuration |

### Monitoring

| Tool | Description |
|------|-------------|
| `generate_logging_config` | Generate structured logging configuration |
| `generate_health_check` | Generate health check endpoint code |

### Maintenance

| Tool | Description |
|------|-------------|
| `check_outdated_deps` | Check for outdated dependencies |
| `generate_changelog` | Generate changelog entry from a list of changes |
| `analyze_git_history` | Analyze recent git commit history |

### Utility

| Tool | Description |
|------|-------------|
| `list_sdlc_tools` | List all available tools organized by phase |

## Usage Examples

Analyze a codebase:

```
Analyze the current project structure and summarize the tech stack
```

Generate a Dockerfile:

```
Create a Dockerfile for this Node.js project
```

Set up CI/CD:

```
Generate a GitHub Actions workflow for this Python project that deploys to Cloud Run
```

Create test cases:

```
Generate test cases for the UserService class
```

## Requirements

- Gemini CLI v0.4.0 or later
- Node.js 18 or later

## Development

Clone and link for local development:

```bash
git clone https://github.com/BaboonLabs/gemini-sdlc.git
cd gemini-sdlc
npm install
npm run build
gemini extensions link .
```

## License

MIT

## Author

BaboonLabs