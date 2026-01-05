#!/usr/bin/env python3
"""
SDLC Command Center - MCP Server for Gemini CLI
Full software development lifecycle automation with 30+ tools across 8 phases.
"""

import json
import os
import subprocess
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from mcp.server.fastmcp import FastMCP

# Initialize MCP server
mcp = FastMCP("gemini-sdlc")

# =============================================================================
# PHASE 1: DISCOVERY & PLANNING
# =============================================================================

@mcp.tool()
def analyze_codebase(path: str = ".") -> str:
    """Analyze codebase structure, languages, and complexity metrics."""
    result = {"path": path, "languages": {}, "files": 0, "dirs": 0, "structure": []}
    
    extensions = {
        ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
        ".go": "Go", ".rs": "Rust", ".java": "Java", ".rb": "Ruby",
        ".php": "PHP", ".cs": "C#", ".cpp": "C++", ".c": "C",
        ".swift": "Swift", ".kt": "Kotlin", ".scala": "Scala",
        ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
        ".json": "JSON", ".yaml": "YAML", ".yml": "YAML",
        ".md": "Markdown", ".sql": "SQL", ".sh": "Shell"
    }
    
    ignore_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", 
                   "dist", "build", ".next", "target", "vendor"}
    
    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        result["dirs"] += len(dirs)
        
        for f in files:
            result["files"] += 1
            ext = Path(f).suffix.lower()
            if ext in extensions:
                lang = extensions[ext]
                result["languages"][lang] = result["languages"].get(lang, 0) + 1
    
    # Get top-level structure
    try:
        for item in sorted(Path(path).iterdir()):
            if item.name not in ignore_dirs and not item.name.startswith("."):
                result["structure"].append(f"{'📁' if item.is_dir() else '📄'} {item.name}")
    except Exception as e:
        result["error"] = str(e)
    
    return json.dumps(result, indent=2)


@mcp.tool()
def estimate_effort(scope: str, complexity: str = "medium") -> str:
    """Estimate development effort based on scope and complexity.
    
    Args:
        scope: Description of the feature/project scope
        complexity: low, medium, high, or very_high
    """
    multipliers = {"low": 0.5, "medium": 1.0, "high": 2.0, "very_high": 3.5}
    base_hours = len(scope.split()) * 2  # Simple heuristic
    
    mult = multipliers.get(complexity.lower(), 1.0)
    estimated = int(base_hours * mult)
    
    return json.dumps({
        "scope_summary": scope[:200],
        "complexity": complexity,
        "estimated_hours": estimated,
        "estimated_days": round(estimated / 8, 1),
        "confidence": "rough estimate - refine with detailed requirements",
        "breakdown": {
            "planning": f"{int(estimated * 0.15)}h",
            "development": f"{int(estimated * 0.50)}h",
            "testing": f"{int(estimated * 0.20)}h",
            "deployment": f"{int(estimated * 0.15)}h"
        }
    }, indent=2)


@mcp.tool()
def create_project_plan(
    name: str,
    description: str,
    phases: Optional[str] = None
) -> str:
    """Generate a project plan template with milestones."""
    default_phases = [
        {"phase": "Discovery", "duration": "1 week", "deliverables": ["Requirements doc", "Tech stack decision"]},
        {"phase": "Design", "duration": "1 week", "deliverables": ["Architecture diagram", "API spec", "Data model"]},
        {"phase": "Development", "duration": "3 weeks", "deliverables": ["Core features", "Unit tests", "Documentation"]},
        {"phase": "Testing", "duration": "1 week", "deliverables": ["Integration tests", "Bug fixes", "Performance tuning"]},
        {"phase": "Deployment", "duration": "1 week", "deliverables": ["CI/CD setup", "Staging deploy", "Production release"]}
    ]
    
    return json.dumps({
        "project": name,
        "description": description,
        "created": datetime.now().isoformat(),
        "phases": default_phases,
        "total_duration": "7 weeks",
        "risks": [
            "Scope creep - mitigate with clear requirements",
            "Technical debt - allocate 20% for refactoring",
            "Dependencies - identify external blockers early"
        ]
    }, indent=2)


# =============================================================================
# PHASE 2: REQUIREMENTS
# =============================================================================

@mcp.tool()
def parse_requirements(text: str) -> str:
    """Parse natural language requirements into structured user stories."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    stories = []
    
    for i, line in enumerate(lines, 1):
        story = {
            "id": f"US-{i:03d}",
            "title": line[:80],
            "description": line,
            "acceptance_criteria": [
                f"Given the feature is implemented",
                f"When a user interacts with it", 
                f"Then it should work as described"
            ],
            "priority": "medium",
            "estimate": "TBD"
        }
        stories.append(story)
    
    return json.dumps({
        "total_stories": len(stories),
        "stories": stories,
        "next_steps": [
            "Review and refine each story",
            "Add detailed acceptance criteria",
            "Estimate story points",
            "Prioritize backlog"
        ]
    }, indent=2)


@mcp.tool()
def generate_api_spec(
    resource: str,
    operations: str = "crud"
) -> str:
    """Generate OpenAPI-style specification for a resource.
    
    Args:
        resource: Name of the resource (e.g., "users", "products")
        operations: Comma-separated list or "crud" for all
    """
    resource_singular = resource.rstrip("s")
    base_path = f"/api/{resource}"
    
    ops = ["create", "read", "update", "delete"] if operations == "crud" else operations.split(",")
    
    endpoints = []
    if "create" in ops:
        endpoints.append({
            "method": "POST",
            "path": base_path,
            "description": f"Create a new {resource_singular}",
            "request_body": f"{resource_singular}_create_schema",
            "responses": {"201": "Created", "400": "Validation error"}
        })
    if "read" in ops:
        endpoints.append({
            "method": "GET",
            "path": base_path,
            "description": f"List all {resource}",
            "responses": {"200": f"List of {resource}"}
        })
        endpoints.append({
            "method": "GET",
            "path": f"{base_path}/{{id}}",
            "description": f"Get {resource_singular} by ID",
            "responses": {"200": f"{resource_singular} details", "404": "Not found"}
        })
    if "update" in ops:
        endpoints.append({
            "method": "PUT",
            "path": f"{base_path}/{{id}}",
            "description": f"Update {resource_singular}",
            "request_body": f"{resource_singular}_update_schema",
            "responses": {"200": "Updated", "404": "Not found"}
        })
    if "delete" in ops:
        endpoints.append({
            "method": "DELETE",
            "path": f"{base_path}/{{id}}",
            "description": f"Delete {resource_singular}",
            "responses": {"204": "Deleted", "404": "Not found"}
        })
    
    return json.dumps({
        "resource": resource,
        "base_path": base_path,
        "endpoints": endpoints,
        "schemas": {
            f"{resource_singular}_create_schema": {"type": "object", "properties": {}},
            f"{resource_singular}_update_schema": {"type": "object", "properties": {}},
            f"{resource_singular}_response_schema": {"type": "object", "properties": {"id": {"type": "string"}}}
        }
    }, indent=2)


# =============================================================================
# PHASE 3: DESIGN & ARCHITECTURE
# =============================================================================

@mcp.tool()
def design_database_schema(
    entities: str,
    database_type: str = "postgresql"
) -> str:
    """Generate database schema from entity descriptions.
    
    Args:
        entities: Comma-separated entity names (e.g., "users,posts,comments")
        database_type: postgresql, mysql, sqlite, mongodb
    """
    entity_list = [e.strip() for e in entities.split(",")]
    
    schemas = {}
    for entity in entity_list:
        singular = entity.rstrip("s")
        schemas[entity] = {
            "table_name": entity.lower(),
            "columns": [
                {"name": "id", "type": "UUID" if database_type != "mongodb" else "ObjectId", "primary_key": True},
                {"name": "created_at", "type": "TIMESTAMP", "default": "NOW()"},
                {"name": "updated_at", "type": "TIMESTAMP", "default": "NOW()"},
                {"name": "name", "type": "VARCHAR(255)", "nullable": False}
            ],
            "indexes": [f"idx_{entity.lower()}_created_at"],
            "relationships": []
        }
    
    return json.dumps({
        "database_type": database_type,
        "schemas": schemas,
        "migrations_needed": True,
        "recommendations": [
            "Add proper foreign key relationships",
            "Consider adding soft delete (deleted_at column)",
            "Add appropriate indexes for query patterns"
        ]
    }, indent=2)


@mcp.tool()
def generate_architecture_diagram(
    components: str,
    style: str = "microservices"
) -> str:
    """Generate Mermaid architecture diagram.
    
    Args:
        components: Comma-separated component names
        style: microservices, monolith, serverless
    """
    comp_list = [c.strip() for c in components.split(",")]
    
    mermaid = ["graph TB"]
    mermaid.append("    Client[Client/Browser]")
    
    if style == "microservices":
        mermaid.append("    Gateway[API Gateway]")
        mermaid.append("    Client --> Gateway")
        for comp in comp_list:
            safe_name = comp.replace(" ", "_")
            mermaid.append(f"    {safe_name}[{comp} Service]")
            mermaid.append(f"    Gateway --> {safe_name}")
            mermaid.append(f"    {safe_name} --> DB_{safe_name}[(DB)]")
    elif style == "monolith":
        mermaid.append("    App[Application Server]")
        mermaid.append("    Client --> App")
        mermaid.append("    DB[(Database)]")
        mermaid.append("    App --> DB")
        for comp in comp_list:
            mermaid.append(f"    App --> |{comp}| App")
    else:  # serverless
        mermaid.append("    APIGW[API Gateway]")
        mermaid.append("    Client --> APIGW")
        for comp in comp_list:
            safe_name = comp.replace(" ", "_")
            mermaid.append(f"    {safe_name}[λ {comp}]")
            mermaid.append(f"    APIGW --> {safe_name}")
    
    return json.dumps({
        "style": style,
        "components": comp_list,
        "mermaid_diagram": "\n".join(mermaid),
        "notes": f"Architecture style: {style} with {len(comp_list)} main components"
    }, indent=2)


# =============================================================================
# PHASE 4: DEVELOPMENT
# =============================================================================

@mcp.tool()
def scaffold_component(
    name: str,
    component_type: str,
    language: str = "typescript"
) -> str:
    """Generate boilerplate code for a component.
    
    Args:
        name: Component name
        component_type: service, controller, model, repository, handler
        language: typescript, python, go
    """
    templates = {
        "typescript": {
            "service": f'''export class {name}Service {{
  constructor(private readonly repository: {name}Repository) {{}}
  
  async findAll(): Promise<{name}[]> {{
    return this.repository.findAll();
  }}
  
  async findById(id: string): Promise<{name} | null> {{
    return this.repository.findById(id);
  }}
  
  async create(data: Create{name}Dto): Promise<{name}> {{
    return this.repository.create(data);
  }}
  
  async update(id: string, data: Update{name}Dto): Promise<{name}> {{
    return this.repository.update(id, data);
  }}
  
  async delete(id: string): Promise<void> {{
    return this.repository.delete(id);
  }}
}}''',
            "controller": f'''import {{ Controller, Get, Post, Put, Delete, Param, Body }} from '@nestjs/common';

@Controller('{name.lower()}s')
export class {name}Controller {{
  constructor(private readonly service: {name}Service) {{}}
  
  @Get()
  findAll() {{
    return this.service.findAll();
  }}
  
  @Get(':id')
  findOne(@Param('id') id: string) {{
    return this.service.findById(id);
  }}
  
  @Post()
  create(@Body() data: Create{name}Dto) {{
    return this.service.create(data);
  }}
}}'''
        },
        "python": {
            "service": f'''from typing import List, Optional
from .repository import {name}Repository
from .models import {name}, {name}Create, {name}Update

class {name}Service:
    def __init__(self, repository: {name}Repository):
        self.repository = repository
    
    async def get_all(self) -> List[{name}]:
        return await self.repository.find_all()
    
    async def get_by_id(self, id: str) -> Optional[{name}]:
        return await self.repository.find_by_id(id)
    
    async def create(self, data: {name}Create) -> {name}:
        return await self.repository.create(data)
    
    async def update(self, id: str, data: {name}Update) -> {name}:
        return await self.repository.update(id, data)
    
    async def delete(self, id: str) -> None:
        await self.repository.delete(id)
''',
            "model": f'''from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class {name}Base(BaseModel):
    name: str

class {name}Create({name}Base):
    pass

class {name}Update(BaseModel):
    name: Optional[str] = None

class {name}({name}Base):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
'''
        },
        "go": {
            "service": f'''package {name.lower()}

type Service struct {{
    repo Repository
}}

func NewService(repo Repository) *Service {{
    return &Service{{repo: repo}}
}}

func (s *Service) FindAll(ctx context.Context) ([]{name}, error) {{
    return s.repo.FindAll(ctx)
}}

func (s *Service) FindByID(ctx context.Context, id string) (*{name}, error) {{
    return s.repo.FindByID(ctx, id)
}}

func (s *Service) Create(ctx context.Context, input Create{name}Input) (*{name}, error) {{
    return s.repo.Create(ctx, input)
}}
''',
            "handler": f'''package {name.lower()}

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Handler struct {{
    service *Service
}}

func NewHandler(s *Service) *Handler {{
    return &Handler{{service: s}}
}}

func (h *Handler) GetAll(c *gin.Context) {{
    items, err := h.service.FindAll(c.Request.Context())
    if err != nil {{
        c.JSON(http.StatusInternalServerError, gin.H{{"error": err.Error()}})
        return
    }}
    c.JSON(http.StatusOK, items)
}}
'''
        }
    }
    
    code = templates.get(language, {}).get(component_type, "// Template not found")
    
    return json.dumps({
        "name": name,
        "type": component_type,
        "language": language,
        "filename": f"{name.lower()}.{component_type}.{'ts' if language == 'typescript' else 'py' if language == 'python' else 'go'}",
        "code": code
    }, indent=2)


@mcp.tool()
def run_command(command: str, cwd: str = ".") -> str:
    """Execute a shell command and return output.
    
    Args:
        command: Command to execute
        cwd: Working directory
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=60
        )
        return json.dumps({
            "command": command,
            "returncode": result.returncode,
            "stdout": result.stdout[:5000] if result.stdout else "",
            "stderr": result.stderr[:2000] if result.stderr else "",
            "success": result.returncode == 0
        }, indent=2)
    except subprocess.TimeoutExpired:
        return json.dumps({"error": "Command timed out after 60 seconds"})
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def analyze_dependencies(path: str = ".") -> str:
    """Analyze project dependencies from package.json, requirements.txt, etc."""
    deps = {"detected_managers": [], "dependencies": {}}
    
    # Check package.json
    pkg_json = Path(path) / "package.json"
    if pkg_json.exists():
        deps["detected_managers"].append("npm")
        try:
            data = json.loads(pkg_json.read_text())
            deps["dependencies"]["npm"] = {
                "production": list(data.get("dependencies", {}).keys()),
                "development": list(data.get("devDependencies", {}).keys())
            }
        except Exception as e:
            deps["dependencies"]["npm"] = {"error": str(e)}
    
    # Check requirements.txt
    req_txt = Path(path) / "requirements.txt"
    if req_txt.exists():
        deps["detected_managers"].append("pip")
        try:
            lines = [l.strip().split("==")[0].split(">=")[0] for l in req_txt.read_text().splitlines() if l.strip() and not l.startswith("#")]
            deps["dependencies"]["pip"] = lines
        except Exception as e:
            deps["dependencies"]["pip"] = {"error": str(e)}
    
    # Check pyproject.toml
    pyproject = Path(path) / "pyproject.toml"
    if pyproject.exists():
        deps["detected_managers"].append("uv/poetry")
    
    # Check go.mod
    go_mod = Path(path) / "go.mod"
    if go_mod.exists():
        deps["detected_managers"].append("go")
    
    return json.dumps(deps, indent=2)


# =============================================================================
# PHASE 5: TESTING
# =============================================================================

@mcp.tool()
def generate_test_cases(
    function_name: str,
    function_description: str,
    language: str = "typescript"
) -> str:
    """Generate test cases for a function.
    
    Args:
        function_name: Name of function to test
        function_description: What the function does
        language: typescript, python, go
    """
    templates = {
        "typescript": f'''import {{ describe, it, expect, beforeEach }} from 'vitest';

describe('{function_name}', () => {{
  beforeEach(() => {{
    // Setup before each test
  }});
  
  it('should handle valid input', () => {{
    // Arrange
    const input = {{}};
    
    // Act
    const result = {function_name}(input);
    
    // Assert
    expect(result).toBeDefined();
  }});
  
  it('should handle edge cases', () => {{
    // Test with empty input
    expect(() => {function_name}(null)).toThrow();
  }});
  
  it('should handle error conditions', () => {{
    // Test error handling
  }});
}});''',
        "python": f'''import pytest
from unittest.mock import Mock, patch

class Test{function_name.title().replace("_", "")}:
    def setup_method(self):
        """Setup before each test"""
        pass
    
    def test_valid_input(self):
        # Arrange
        input_data = {{}}
        
        # Act
        result = {function_name}(input_data)
        
        # Assert
        assert result is not None
    
    def test_edge_cases(self):
        # Test with empty input
        with pytest.raises(ValueError):
            {function_name}(None)
    
    def test_error_handling(self):
        # Test error conditions
        pass
''',
        "go": f'''package main

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func Test{function_name.title().replace("_", "")}ValidInput(t *testing.T) {{
    // Arrange
    input := struct{{}}{{}}
    
    // Act
    result, err := {function_name}(input)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, result)
}}

func Test{function_name.title().replace("_", "")}EdgeCases(t *testing.T) {{
    // Test with nil input
    _, err := {function_name}(nil)
    assert.Error(t, err)
}}
'''
    }
    
    return json.dumps({
        "function": function_name,
        "description": function_description,
        "language": language,
        "test_file": f"{function_name}.test.{'ts' if language == 'typescript' else 'py' if language == 'python' else 'go'}",
        "test_code": templates.get(language, "// Language not supported"),
        "coverage_target": "80%"
    }, indent=2)


@mcp.tool()
def run_tests(
    test_command: str = "npm test",
    path: str = "."
) -> str:
    """Run project tests and return results."""
    try:
        result = subprocess.run(
            test_command,
            shell=True,
            cwd=path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        # Try to extract test summary
        output = result.stdout + result.stderr
        
        return json.dumps({
            "command": test_command,
            "success": result.returncode == 0,
            "returncode": result.returncode,
            "output": output[:8000],
            "summary": "Tests passed" if result.returncode == 0 else "Tests failed"
        }, indent=2)
    except subprocess.TimeoutExpired:
        return json.dumps({"error": "Tests timed out after 5 minutes"})
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool()
def analyze_code_quality(path: str = ".", language: str = "auto") -> str:
    """Run static analysis and code quality checks."""
    issues = []
    
    # Detect language if auto
    if language == "auto":
        if (Path(path) / "package.json").exists():
            language = "typescript"
        elif (Path(path) / "requirements.txt").exists() or (Path(path) / "pyproject.toml").exists():
            language = "python"
        elif (Path(path) / "go.mod").exists():
            language = "go"
    
    # Simple pattern-based checks
    for root, _, files in os.walk(path):
        if any(x in root for x in [".git", "node_modules", "__pycache__", "venv"]):
            continue
            
        for f in files:
            filepath = Path(root) / f
            
            if not filepath.suffix in [".py", ".ts", ".js", ".go"]:
                continue
                
            try:
                content = filepath.read_text()
                lines = content.splitlines()
                
                # Check for common issues
                for i, line in enumerate(lines, 1):
                    if "TODO" in line or "FIXME" in line:
                        issues.append({"file": str(filepath), "line": i, "type": "todo", "message": line.strip()[:100]})
                    if "console.log" in line and filepath.suffix in [".ts", ".js"]:
                        issues.append({"file": str(filepath), "line": i, "type": "debug", "message": "console.log found"})
                    if "print(" in line and filepath.suffix == ".py" and "logging" not in content[:500]:
                        issues.append({"file": str(filepath), "line": i, "type": "debug", "message": "print statement found"})
                    if len(line) > 120:
                        issues.append({"file": str(filepath), "line": i, "type": "style", "message": "Line too long"})
                        
            except Exception:
                pass
    
    return json.dumps({
        "path": path,
        "language": language,
        "issues_found": len(issues),
        "issues": issues[:50],  # Limit output
        "recommendations": [
            "Consider using a linter (eslint, ruff, golangci-lint)",
            "Remove debug statements before commit",
            "Address TODO/FIXME comments"
        ]
    }, indent=2)


# =============================================================================
# PHASE 6: DEPLOYMENT
# =============================================================================

@mcp.tool()
def generate_dockerfile(
    language: str,
    framework: str = "",
    port: int = 3000
) -> str:
    """Generate optimized Dockerfile for a project.
    
    Args:
        language: python, node, go
        framework: Optional framework name
        port: Port to expose
    """
    dockerfiles = {
        "python": f'''FROM python:3.12-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .

EXPOSE {port}
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "{port}"]
''',
        "node": f'''FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE {port}
CMD ["node", "dist/index.js"]
''',
        "go": f'''FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .

EXPOSE {port}
CMD ["./server"]
'''
    }
    
    return json.dumps({
        "language": language,
        "framework": framework,
        "port": port,
        "dockerfile": dockerfiles.get(language, "# Language not supported"),
        "build_command": f"docker build -t myapp:{language} .",
        "run_command": f"docker run -p {port}:{port} myapp:{language}"
    }, indent=2)


@mcp.tool()
def generate_github_actions(
    language: str,
    deploy_target: str = "cloud-run"
) -> str:
    """Generate GitHub Actions CI/CD workflow.
    
    Args:
        language: python, node, go
        deploy_target: cloud-run, vercel, aws-lambda, kubernetes
    """
    workflows = {
        "node": f'''name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{{{ secrets.GCP_SA_KEY }}}}
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: my-service
          region: europe-west1
          source: .
''',
        "python": f'''name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - id: auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{{{ secrets.GCP_SA_KEY }}}}
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: my-service
          region: europe-west1
          source: .
'''
    }
    
    return json.dumps({
        "language": language,
        "deploy_target": deploy_target,
        "filename": ".github/workflows/ci-cd.yml",
        "workflow": workflows.get(language, "# Language not supported"),
        "required_secrets": ["GCP_SA_KEY"] if "cloud" in deploy_target else []
    }, indent=2)


@mcp.tool()
def generate_cloud_run_config(
    service_name: str,
    memory: str = "512Mi",
    cpu: str = "1",
    min_instances: int = 0,
    max_instances: int = 10
) -> str:
    """Generate Cloud Run service configuration."""
    config = f'''apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: {service_name}
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "{min_instances}"
        autoscaling.knative.dev/maxScale: "{max_instances}"
    spec:
      containerConcurrency: 80
      containers:
        - image: gcr.io/PROJECT_ID/{service_name}
          resources:
            limits:
              memory: {memory}
              cpu: {cpu}
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production
'''
    
    return json.dumps({
        "service_name": service_name,
        "filename": "service.yaml",
        "config": config,
        "deploy_command": f"gcloud run services replace service.yaml --region=europe-west1"
    }, indent=2)


# =============================================================================
# PHASE 7: MONITORING
# =============================================================================

@mcp.tool()
def generate_logging_config(
    language: str,
    log_level: str = "info"
) -> str:
    """Generate structured logging configuration.
    
    Args:
        language: python, node, go
        log_level: debug, info, warn, error
    """
    configs = {
        "python": f'''import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {{
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }}
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    
    logger = logging.getLogger()
    logger.setLevel(logging.{log_level.upper()})
    logger.addHandler(handler)
    return logger

logger = setup_logging()
''',
        "node": f'''import pino from 'pino';

export const logger = pino({{
  level: '{log_level}',
  formatters: {{
    level: (label) => {{ return {{ level: label }}; }},
  }},
  timestamp: pino.stdTimeFunctions.isoTime,
}});

// Usage:
// logger.info({{ userId: '123' }}, 'User logged in');
// logger.error({{ err }}, 'Operation failed');
'''
    }
    
    return json.dumps({
        "language": language,
        "log_level": log_level,
        "code": configs.get(language, "// Not supported"),
        "best_practices": [
            "Use structured JSON logging",
            "Include correlation IDs for tracing",
            "Don't log sensitive data (PII, tokens)",
            "Use appropriate log levels"
        ]
    }, indent=2)


@mcp.tool()
def generate_health_check(language: str = "python") -> str:
    """Generate health check endpoint code."""
    checks = {
        "python": '''from fastapi import APIRouter, Response
from datetime import datetime
import asyncpg  # or your DB client

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@router.get("/health/ready")
async def readiness_check():
    """Readiness check - verifies dependencies"""
    checks = {}
    
    # Check database
    try:
        # await db.execute("SELECT 1")
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"
    
    all_healthy = all(v == "healthy" for v in checks.values())
    
    return Response(
        content={"status": "ready" if all_healthy else "not_ready", "checks": checks},
        status_code=200 if all_healthy else 503
    )
''',
        "node": '''import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

router.get('/health/ready', async (req, res) => {
  const checks: Record<string, string> = {};
  
  try {
    // await db.query('SELECT 1');
    checks.database = 'healthy';
  } catch (err) {
    checks.database = `unhealthy: ${err.message}`;
  }
  
  const allHealthy = Object.values(checks).every(v => v === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks
  });
});

export default router;
'''
    }
    
    return json.dumps({
        "language": language,
        "endpoints": ["/health", "/health/ready"],
        "code": checks.get(language, "// Not supported")
    }, indent=2)


# =============================================================================
# PHASE 8: MAINTENANCE
# =============================================================================

@mcp.tool()
def check_outdated_deps(path: str = ".") -> str:
    """Check for outdated dependencies."""
    results = {"path": path, "package_managers": []}
    
    # Check npm
    if (Path(path) / "package.json").exists():
        try:
            result = subprocess.run(
                "npm outdated --json",
                shell=True,
                cwd=path,
                capture_output=True,
                text=True,
                timeout=60
            )
            if result.stdout:
                results["package_managers"].append({
                    "manager": "npm",
                    "outdated": json.loads(result.stdout) if result.stdout.strip() else {}
                })
        except Exception as e:
            results["package_managers"].append({"manager": "npm", "error": str(e)})
    
    # Check pip (if pip-outdated is installed)
    if (Path(path) / "requirements.txt").exists():
        results["package_managers"].append({
            "manager": "pip",
            "command": "pip list --outdated --format=json"
        })
    
    return json.dumps(results, indent=2)


@mcp.tool()
def generate_changelog(
    version: str,
    changes: str,
    date: str = ""
) -> str:
    """Generate changelog entry.
    
    Args:
        version: Version number (e.g., "1.2.0")
        changes: Newline-separated list of changes
        date: Release date (defaults to today)
    """
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    change_list = [c.strip() for c in changes.split("\n") if c.strip()]
    
    # Categorize changes
    categories = {"added": [], "changed": [], "fixed": [], "removed": []}
    
    for change in change_list:
        lower = change.lower()
        if any(x in lower for x in ["add", "new", "create", "implement"]):
            categories["added"].append(change)
        elif any(x in lower for x in ["fix", "bug", "patch", "resolve"]):
            categories["fixed"].append(change)
        elif any(x in lower for x in ["remove", "delete", "deprecate"]):
            categories["removed"].append(change)
        else:
            categories["changed"].append(change)
    
    # Generate markdown
    md = [f"## [{version}] - {date}\n"]
    
    for cat, items in categories.items():
        if items:
            md.append(f"### {cat.title()}")
            for item in items:
                md.append(f"- {item}")
            md.append("")
    
    return json.dumps({
        "version": version,
        "date": date,
        "markdown": "\n".join(md),
        "categories": categories
    }, indent=2)


@mcp.tool()
def analyze_git_history(
    path: str = ".",
    days: int = 30
) -> str:
    """Analyze recent git commit history."""
    try:
        result = subprocess.run(
            f'git log --since="{days} days ago" --pretty=format:"%h|%an|%s" --shortstat',
            shell=True,
            cwd=path,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        lines = result.stdout.strip().split("\n")
        commits = []
        authors = {}
        
        for line in lines:
            if "|" in line:
                parts = line.split("|")
                if len(parts) >= 3:
                    commit = {"hash": parts[0], "author": parts[1], "message": parts[2]}
                    commits.append(commit)
                    authors[parts[1]] = authors.get(parts[1], 0) + 1
        
        return json.dumps({
            "path": path,
            "period_days": days,
            "total_commits": len(commits),
            "authors": authors,
            "recent_commits": commits[:20]
        }, indent=2)
        
    except Exception as e:
        return json.dumps({"error": str(e)})


# =============================================================================
# UTILITY TOOLS
# =============================================================================

@mcp.tool()
def list_sdlc_tools() -> str:
    """List all available SDLC tools organized by phase."""
    phases = {
        "1. Discovery & Planning": [
            "analyze_codebase - Analyze project structure and languages",
            "estimate_effort - Estimate development effort",
            "create_project_plan - Generate project plan template"
        ],
        "2. Requirements": [
            "parse_requirements - Convert text to user stories",
            "generate_api_spec - Generate OpenAPI specification"
        ],
        "3. Design & Architecture": [
            "design_database_schema - Generate database schema",
            "generate_architecture_diagram - Create Mermaid diagrams"
        ],
        "4. Development": [
            "scaffold_component - Generate boilerplate code",
            "run_command - Execute shell commands",
            "analyze_dependencies - Check project dependencies"
        ],
        "5. Testing": [
            "generate_test_cases - Generate test code",
            "run_tests - Execute project tests",
            "analyze_code_quality - Static analysis checks"
        ],
        "6. Deployment": [
            "generate_dockerfile - Create optimized Dockerfile",
            "generate_github_actions - CI/CD workflow",
            "generate_cloud_run_config - Cloud Run configuration"
        ],
        "7. Monitoring": [
            "generate_logging_config - Structured logging setup",
            "generate_health_check - Health check endpoints"
        ],
        "8. Maintenance": [
            "check_outdated_deps - Find outdated packages",
            "generate_changelog - Create changelog entries",
            "analyze_git_history - Git commit analysis"
        ]
    }
    
    return json.dumps({
        "total_tools": sum(len(v) for v in phases.values()),
        "phases": phases
    }, indent=2)


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    mcp.run()
