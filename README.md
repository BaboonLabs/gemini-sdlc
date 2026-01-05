# SDLC Command Center

> 🚀 30+ MCP tools for full software development lifecycle automation with Gemini CLI

## Installation

### As Gemini Extension (Recommended)

```bash
gemini extensions install https://github.com/BaboonLabs/gemini-sdlc
```

### Manual Installation

```bash
# With uv (recommended)
uvx --from git+https://github.com/BaboonLabs/gemini-sdlc gemini-sdlc

# Or pip
pip install git+https://github.com/BaboonLabs/gemini-sdlc
```

## Features

### 8 Phases, 30+ Tools

| Phase | Tools |
|-------|-------|
| **Discovery & Planning** | `analyze_codebase`, `estimate_effort`, `create_project_plan` |
| **Requirements** | `parse_requirements`, `generate_api_spec` |
| **Design** | `design_database_schema`, `generate_architecture_diagram` |
| **Development** | `scaffold_component`, `run_command`, `analyze_dependencies` |
| **Testing** | `generate_test_cases`, `run_tests`, `analyze_code_quality` |
| **Deployment** | `generate_dockerfile`, `generate_github_actions`, `generate_cloud_run_config` |
| **Monitoring** | `generate_logging_config`, `generate_health_check` |
| **Maintenance** | `check_outdated_deps`, `generate_changelog`, `analyze_git_history` |

## Usage Examples

```
> Analyze this codebase and estimate effort for adding user authentication

> Generate a REST API spec for a "products" resource

> Create a Dockerfile for this Python FastAPI app

> Set up GitHub Actions CI/CD deploying to Cloud Run

> Generate test cases for the UserService class
```

## Requirements

- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip
- Gemini CLI

## Development

```bash
# Clone
git clone https://github.com/BaboonLabs/gemini-sdlc
cd gemini-sdlc

# Install dependencies
uv sync

# Run locally
uv run python -m src.server
```

## License

MIT © [Baboon Labs](https://baboonlabs.com)
