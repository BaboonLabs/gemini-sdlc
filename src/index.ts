import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const server = new Server(
  { name: "gemini-sdlc", version: "3.1.0" },
  { capabilities: { tools: {} } }
);

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const tools = [
  {
    name: "analyze_codebase",
    description: "Analyze codebase structure, languages, and complexity metrics",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to analyze", default: "." }
      }
    }
  },
  {
    name: "estimate_effort",
    description: "Estimate development effort based on scope and complexity",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "string", description: "Description of the feature/project scope" },
        complexity: { type: "string", description: "low, medium, high, or very_high", default: "medium" }
      },
      required: ["scope"]
    }
  },
  {
    name: "create_project_plan",
    description: "Generate a project plan template with milestones",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        description: { type: "string", description: "Project description" },
        phases: { type: "string", description: "Optional custom phases" }
      },
      required: ["name", "description"]
    }
  },
  {
    name: "parse_requirements",
    description: "Parse natural language requirements into structured user stories",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Requirements text" }
      },
      required: ["text"]
    }
  },
  {
    name: "generate_api_spec",
    description: "Generate OpenAPI-style specification for a resource",
    inputSchema: {
      type: "object",
      properties: {
        resource: { type: "string", description: "Name of the resource (e.g., 'users', 'products')" },
        operations: { type: "string", description: "Comma-separated list or 'crud' for all", default: "crud" }
      },
      required: ["resource"]
    }
  },
  {
    name: "design_database_schema",
    description: "Generate database schema from entity descriptions",
    inputSchema: {
      type: "object",
      properties: {
        entities: { type: "string", description: "Comma-separated entity names (e.g., 'users,posts,comments')" },
        database_type: { type: "string", description: "postgresql, mysql, sqlite, mongodb", default: "postgresql" }
      },
      required: ["entities"]
    }
  },
  {
    name: "generate_architecture_diagram",
    description: "Generate Mermaid architecture diagram",
    inputSchema: {
      type: "object",
      properties: {
        components: { type: "string", description: "Comma-separated component names" },
        style: { type: "string", description: "microservices, monolith, serverless", default: "microservices" }
      },
      required: ["components"]
    }
  },
  {
    name: "scaffold_component",
    description: "Generate boilerplate code for a component",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name" },
        component_type: { type: "string", description: "service, controller, model, repository, handler" },
        language: { type: "string", description: "typescript, python, go", default: "typescript" }
      },
      required: ["name", "component_type"]
    }
  },
  {
    name: "run_command",
    description: "Execute a shell command and return output",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Command to execute" },
        cwd: { type: "string", description: "Working directory", default: "." }
      },
      required: ["command"]
    }
  },
  {
    name: "analyze_dependencies",
    description: "Analyze project dependencies from package.json, requirements.txt, etc.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to analyze", default: "." }
      }
    }
  },
  {
    name: "generate_test_cases",
    description: "Generate test cases for a function",
    inputSchema: {
      type: "object",
      properties: {
        function_name: { type: "string", description: "Name of function to test" },
        function_description: { type: "string", description: "What the function does" },
        language: { type: "string", description: "typescript, python, go", default: "typescript" }
      },
      required: ["function_name", "function_description"]
    }
  },
  {
    name: "run_tests",
    description: "Run project tests and return results",
    inputSchema: {
      type: "object",
      properties: {
        test_command: { type: "string", description: "Test command to run", default: "npm test" },
        path: { type: "string", description: "Working directory", default: "." }
      }
    }
  },
  {
    name: "analyze_code_quality",
    description: "Run static analysis and code quality checks",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to analyze", default: "." },
        language: { type: "string", description: "auto, typescript, python, go", default: "auto" }
      }
    }
  },
  {
    name: "generate_dockerfile",
    description: "Generate optimized Dockerfile for a project",
    inputSchema: {
      type: "object",
      properties: {
        language: { type: "string", description: "python, node, go" },
        framework: { type: "string", description: "Optional framework name", default: "" },
        port: { type: "number", description: "Port to expose", default: 3000 }
      },
      required: ["language"]
    }
  },
  {
    name: "generate_github_actions",
    description: "Generate GitHub Actions CI/CD workflow",
    inputSchema: {
      type: "object",
      properties: {
        language: { type: "string", description: "python, node, go" },
        deploy_target: { type: "string", description: "cloud-run, vercel, aws-lambda, kubernetes", default: "cloud-run" }
      },
      required: ["language"]
    }
  },
  {
    name: "generate_cloud_run_config",
    description: "Generate Cloud Run service configuration",
    inputSchema: {
      type: "object",
      properties: {
        service_name: { type: "string", description: "Service name" },
        memory: { type: "string", description: "Memory allocation", default: "512Mi" },
        cpu: { type: "string", description: "CPU allocation", default: "1" },
        min_instances: { type: "number", description: "Minimum instances", default: 0 },
        max_instances: { type: "number", description: "Maximum instances", default: 10 }
      },
      required: ["service_name"]
    }
  },
  {
    name: "generate_logging_config",
    description: "Generate structured logging configuration",
    inputSchema: {
      type: "object",
      properties: {
        language: { type: "string", description: "python, node, go" },
        log_level: { type: "string", description: "debug, info, warn, error", default: "info" }
      },
      required: ["language"]
    }
  },
  {
    name: "generate_health_check",
    description: "Generate health check endpoint code",
    inputSchema: {
      type: "object",
      properties: {
        language: { type: "string", description: "python, node, go", default: "python" }
      }
    }
  },
  {
    name: "check_outdated_deps",
    description: "Check for outdated dependencies",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to analyze", default: "." }
      }
    }
  },
  {
    name: "generate_changelog",
    description: "Generate changelog entry",
    inputSchema: {
      type: "object",
      properties: {
        version: { type: "string", description: "Version number (e.g., '1.2.0')" },
        changes: { type: "string", description: "Newline-separated list of changes" },
        date: { type: "string", description: "Release date (defaults to today)", default: "" }
      },
      required: ["version", "changes"]
    }
  },
  {
    name: "analyze_git_history",
    description: "Analyze recent git commit history",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path to git repository", default: "." },
        days: { type: "number", description: "Number of days to look back", default: 30 }
      }
    }
  },
  {
    name: "create_agent_task",
    description: "Create a task file for an Antigravity IDE agent to execute",
    inputSchema: {
      type: "object",
      properties: {
        project_path: { type: "string", description: "Path to the project directory" },
        task_title: { type: "string", description: "Short title for the task" },
        task_description: { type: "string", description: "Detailed description of what the agent should do" },
        acceptance_criteria: { type: "string", description: "Comma-separated list of acceptance criteria", default: "" },
        priority: { type: "string", description: "low, medium, high, critical", default: "medium" }
      },
      required: ["project_path", "task_title", "task_description"]
    }
  },
  {
    name: "spawn_antigravity",
    description: "Open Antigravity IDE with a specific project folder",
    inputSchema: {
      type: "object",
      properties: {
        project_path: { type: "string", description: "Path to the project directory" },
        create_task: { type: "boolean", description: "Whether to create a task file first", default: false },
        task_description: { type: "string", description: "Task description if create_task is true", default: "" }
      },
      required: ["project_path"]
    }
  },
  {
    name: "list_agent_tasks",
    description: "List all Antigravity agent tasks, optionally filtered by project",
    inputSchema: {
      type: "object",
      properties: {
        project_path: { type: "string", description: "Optional: specific project to check", default: "" },
        status_filter: { type: "string", description: "Filter by status: all, pending, in_progress, completed", default: "all" }
      }
    }
  },
  {
    name: "get_task_status",
    description: "Get the status of an Antigravity agent task",
    inputSchema: {
      type: "object",
      properties: {
        project_path: { type: "string", description: "Path to the project directory" }
      },
      required: ["project_path"]
    }
  },
  {
    name: "assign_to_agent",
    description: "Assign task to Antigravity agent - creates task AND opens IDE in one step. Use this when user says 'use Antigravity', 'assign agent', 'have agent do'",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "What the agent should do" },
        project_path: { type: "string", description: "Project path", default: "." }
      },
      required: ["task"]
    }
  },
  {
    name: "list_sdlc_tools",
    description: "List all available SDLC tools organized by phase",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

function analyzeCodebase(targetPath: string): string {
  const result: any = { path: targetPath, languages: {}, files: 0, dirs: 0, structure: [] };

  const extensions: Record<string, string> = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
    ".go": "Go", ".rs": "Rust", ".java": "Java", ".rb": "Ruby",
    ".php": "PHP", ".cs": "C#", ".cpp": "C++", ".c": "C",
    ".swift": "Swift", ".kt": "Kotlin", ".scala": "Scala",
    ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
    ".json": "JSON", ".yaml": "YAML", ".yml": "YAML",
    ".md": "Markdown", ".sql": "SQL", ".sh": "Shell"
  };

  const ignoreDirs = new Set([".git", "node_modules", "__pycache__", ".venv", "venv",
    "dist", "build", ".next", "target", "vendor"]);

  function walkDir(dirPath: string): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (ignoreDirs.has(entry.name) || entry.name.startsWith(".")) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          result.dirs += 1;
          walkDir(fullPath);
        } else if (entry.isFile()) {
          result.files += 1;
          const ext = path.extname(entry.name).toLowerCase();
          if (ext in extensions) {
            const lang = extensions[ext];
            result.languages[lang] = (result.languages[lang] || 0) + 1;
          }
        }
      }
    } catch (err) {
      // Ignore permission errors
    }
  }

  walkDir(targetPath);

  // Get top-level structure
  try {
    const items = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
      if (!ignoreDirs.has(item.name) && !item.name.startsWith(".")) {
        const icon = item.isDirectory() ? "📁" : "📄";
        result.structure.push(`${icon} ${item.name}`);
      }
    }
  } catch (err: any) {
    result.error = String(err);
  }

  return JSON.stringify(result, null, 2);
}

function estimateEffort(scope: string, complexity: string = "medium"): string {
  const multipliers: Record<string, number> = { low: 0.5, medium: 1.0, high: 2.0, very_high: 3.5 };
  const baseHours = scope.split(/\s+/).length * 2;

  const mult = multipliers[complexity.toLowerCase()] || 1.0;
  const estimated = Math.floor(baseHours * mult);

  return JSON.stringify({
    scope_summary: scope.substring(0, 200),
    complexity: complexity,
    estimated_hours: estimated,
    estimated_days: Math.round(estimated / 8 * 10) / 10,
    confidence: "rough estimate - refine with detailed requirements",
    breakdown: {
      planning: `${Math.floor(estimated * 0.15)}h`,
      development: `${Math.floor(estimated * 0.50)}h`,
      testing: `${Math.floor(estimated * 0.20)}h`,
      deployment: `${Math.floor(estimated * 0.15)}h`
    }
  }, null, 2);
}

function createProjectPlan(name: string, description: string, phases?: string): string {
  const defaultPhases = [
    { phase: "Discovery", duration: "1 week", deliverables: ["Requirements doc", "Tech stack decision"] },
    { phase: "Design", duration: "1 week", deliverables: ["Architecture diagram", "API spec", "Data model"] },
    { phase: "Development", duration: "3 weeks", deliverables: ["Core features", "Unit tests", "Documentation"] },
    { phase: "Testing", duration: "1 week", deliverables: ["Integration tests", "Bug fixes", "Performance tuning"] },
    { phase: "Deployment", duration: "1 week", deliverables: ["CI/CD setup", "Staging deploy", "Production release"] }
  ];

  return JSON.stringify({
    project: name,
    description: description,
    created: new Date().toISOString(),
    phases: defaultPhases,
    total_duration: "7 weeks",
    risks: [
      "Scope creep - mitigate with clear requirements",
      "Technical debt - allocate 20% for refactoring",
      "Dependencies - identify external blockers early"
    ]
  }, null, 2);
}

function parseRequirements(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);
  const stories: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const story = {
      id: `US-${String(i + 1).padStart(3, "0")}`,
      title: lines[i].substring(0, 80),
      description: lines[i],
      acceptance_criteria: [
        "Given the feature is implemented",
        "When a user interacts with it",
        "Then it should work as described"
      ],
      priority: "medium",
      estimate: "TBD"
    };
    stories.push(story);
  }

  return JSON.stringify({
    total_stories: stories.length,
    stories: stories,
    next_steps: [
      "Review and refine each story",
      "Add detailed acceptance criteria",
      "Estimate story points",
      "Prioritize backlog"
    ]
  }, null, 2);
}

function generateApiSpec(resource: string, operations: string = "crud"): string {
  const resourceSingular = resource.replace(/s$/, "");
  const basePath = `/api/${resource}`;

  const ops = operations === "crud"
    ? ["create", "read", "update", "delete"]
    : operations.split(",").map(o => o.trim());

  const endpoints: any[] = [];

  if (ops.includes("create")) {
    endpoints.push({
      method: "POST",
      path: basePath,
      description: `Create a new ${resourceSingular}`,
      request_body: `${resourceSingular}_create_schema`,
      responses: { "201": "Created", "400": "Validation error" }
    });
  }
  if (ops.includes("read")) {
    endpoints.push({
      method: "GET",
      path: basePath,
      description: `List all ${resource}`,
      responses: { "200": `List of ${resource}` }
    });
    endpoints.push({
      method: "GET",
      path: `${basePath}/{id}`,
      description: `Get ${resourceSingular} by ID`,
      responses: { "200": `${resourceSingular} details`, "404": "Not found" }
    });
  }
  if (ops.includes("update")) {
    endpoints.push({
      method: "PUT",
      path: `${basePath}/{id}`,
      description: `Update ${resourceSingular}`,
      request_body: `${resourceSingular}_update_schema`,
      responses: { "200": "Updated", "404": "Not found" }
    });
  }
  if (ops.includes("delete")) {
    endpoints.push({
      method: "DELETE",
      path: `${basePath}/{id}`,
      description: `Delete ${resourceSingular}`,
      responses: { "204": "Deleted", "404": "Not found" }
    });
  }

  return JSON.stringify({
    resource: resource,
    base_path: basePath,
    endpoints: endpoints,
    schemas: {
      [`${resourceSingular}_create_schema`]: { type: "object", properties: {} },
      [`${resourceSingular}_update_schema`]: { type: "object", properties: {} },
      [`${resourceSingular}_response_schema`]: { type: "object", properties: { id: { type: "string" } } }
    }
  }, null, 2);
}

function designDatabaseSchema(entities: string, databaseType: string = "postgresql"): string {
  const entityList = entities.split(",").map(e => e.trim());
  const schemas: any = {};

  for (const entity of entityList) {
    const singular = entity.replace(/s$/, "");
    schemas[entity] = {
      table_name: entity.toLowerCase(),
      columns: [
        { name: "id", type: databaseType !== "mongodb" ? "UUID" : "ObjectId", primary_key: true },
        { name: "created_at", type: "TIMESTAMP", default: "NOW()" },
        { name: "updated_at", type: "TIMESTAMP", default: "NOW()" },
        { name: "name", type: "VARCHAR(255)", nullable: false }
      ],
      indexes: [`idx_${entity.toLowerCase()}_created_at`],
      relationships: []
    };
  }

  return JSON.stringify({
    database_type: databaseType,
    schemas: schemas,
    migrations_needed: true,
    recommendations: [
      "Add proper foreign key relationships",
      "Consider adding soft delete (deleted_at column)",
      "Add appropriate indexes for query patterns"
    ]
  }, null, 2);
}

function generateArchitectureDiagram(components: string, style: string = "microservices"): string {
  const compList = components.split(",").map(c => c.trim());
  const mermaid: string[] = ["graph TB"];
  mermaid.push("    Client[Client/Browser]");

  if (style === "microservices") {
    mermaid.push("    Gateway[API Gateway]");
    mermaid.push("    Client --> Gateway");
    for (const comp of compList) {
      const safeName = comp.replace(/\s+/g, "_");
      mermaid.push(`    ${safeName}[${comp} Service]`);
      mermaid.push(`    Gateway --> ${safeName}`);
      mermaid.push(`    ${safeName} --> DB_${safeName}[(DB)]`);
    }
  } else if (style === "monolith") {
    mermaid.push("    App[Application Server]");
    mermaid.push("    Client --> App");
    mermaid.push("    DB[(Database)]");
    mermaid.push("    App --> DB");
    for (const comp of compList) {
      mermaid.push(`    App --> |${comp}| App`);
    }
  } else { // serverless
    mermaid.push("    APIGW[API Gateway]");
    mermaid.push("    Client --> APIGW");
    for (const comp of compList) {
      const safeName = comp.replace(/\s+/g, "_");
      mermaid.push(`    ${safeName}[λ ${comp}]`);
      mermaid.push(`    APIGW --> ${safeName}`);
    }
  }

  return JSON.stringify({
    style: style,
    components: compList,
    mermaid_diagram: mermaid.join("\n"),
    notes: `Architecture style: ${style} with ${compList.length} main components`
  }, null, 2);
}

function scaffoldComponent(name: string, componentType: string, language: string = "typescript"): string {
  const templates: Record<string, Record<string, string>> = {
    typescript: {
      service: `export class ${name}Service {
  constructor(private readonly repository: ${name}Repository) {}
  
  async findAll(): Promise<${name}[]> {
    return this.repository.findAll();
  }
  
  async findById(id: string): Promise<${name} | null> {
    return this.repository.findById(id);
  }
  
  async create(data: Create${name}Dto): Promise<${name}> {
    return this.repository.create(data);
  }
  
  async update(id: string, data: Update${name}Dto): Promise<${name}> {
    return this.repository.update(id, data);
  }
  
  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}`,
      controller: `import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

@Controller('${name.toLowerCase()}s')
export class ${name}Controller {
  constructor(private readonly service: ${name}Service) {}
  
  @Get()
  findAll() {
    return this.service.findAll();
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }
  
  @Post()
  create(@Body() data: Create${name}Dto) {
    return this.service.create(data);
  }
}`
    },
    python: {
      service: `from typing import List, Optional
from .repository import ${name}Repository
from .models import ${name}, ${name}Create, ${name}Update

class ${name}Service:
    def __init__(self, repository: ${name}Repository):
        self.repository = repository
    
    async def get_all(self) -> List[${name}]:
        return await self.repository.find_all()
    
    async def get_by_id(self, id: str) -> Optional[${name}]:
        return await self.repository.find_by_id(id)
    
    async def create(self, data: ${name}Create) -> ${name}:
        return await self.repository.create(data)
    
    async def update(self, id: str, data: ${name}Update) -> ${name}:
        return await self.repository.update(id, data)
    
    async def delete(self, id: str) -> None:
        await self.repository.delete(id)
`,
      model: `from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ${name}Base(BaseModel):
    name: str

class ${name}Create(${name}Base):
    pass

class ${name}Update(BaseModel):
    name: Optional[str] = None

class ${name}(${name}Base):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
`
    },
    go: {
      service: `package ${name.toLowerCase()}

type Service struct {
    repo Repository
}

func NewService(repo Repository) *Service {
    return &Service{repo: repo}
}

func (s *Service) FindAll(ctx context.Context) ([]${name}, error) {
    return s.repo.FindAll(ctx)
}

func (s *Service) FindByID(ctx context.Context, id string) (*${name}, error) {
    return s.repo.FindByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, input Create${name}Input) (*${name}, error) {
    return s.repo.Create(ctx, input)
}
`,
      handler: `package ${name.toLowerCase()}

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type Handler struct {
    service *Service
}

func NewHandler(s *Service) *Handler {
    return &Handler{service: s}
}

func (h *Handler) GetAll(c *gin.Context) {
    items, err := h.service.FindAll(c.Request.Context())
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, items)
}
`
    }
  };

  const code = templates[language]?.[componentType] || "// Template not found";
  const ext = language === "typescript" ? "ts" : language === "python" ? "py" : "go";

  return JSON.stringify({
    name: name,
    type: componentType,
    language: language,
    filename: `${name.toLowerCase()}.${componentType}.${ext}`,
    code: code
  }, null, 2);
}

function runCommand(command: string, cwd: string = "."): string {
  try {
    const result = execSync(command, {
      cwd: cwd,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 60000
    });

    return JSON.stringify({
      command: command,
      returncode: 0,
      stdout: result.substring(0, 5000),
      stderr: "",
      success: true
    }, null, 2);
  } catch (err: any) {
    const stdout = err.stdout?.toString().substring(0, 5000) || "";
    const stderr = err.stderr?.toString().substring(0, 2000) || "";
    const returncode = err.status || err.code || 1;

    if (err.signal === "SIGTERM") {
      return JSON.stringify({ error: "Command timed out after 60 seconds" }, null, 2);
    }

    return JSON.stringify({
      command: command,
      returncode: returncode,
      stdout: stdout,
      stderr: stderr,
      success: false
    }, null, 2);
  }
}

function analyzeDependencies(targetPath: string = "."): string {
  const deps: any = { detected_managers: [], dependencies: {} };

  // Check package.json
  const pkgJson = path.join(targetPath, "package.json");
  if (fs.existsSync(pkgJson)) {
    deps.detected_managers.push("npm");
    try {
      const data = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
      deps.dependencies.npm = {
        production: Object.keys(data.dependencies || {}),
        development: Object.keys(data.devDependencies || {})
      };
    } catch (err: any) {
      deps.dependencies.npm = { error: String(err) };
    }
  }

  // Check requirements.txt
  const reqTxt = path.join(targetPath, "requirements.txt");
  if (fs.existsSync(reqTxt)) {
    deps.detected_managers.push("pip");
    try {
      const content = fs.readFileSync(reqTxt, "utf8");
      const lines = content.split("\n")
        .map(l => l.trim())
        .filter(l => l && !l.startsWith("#"))
        .map(l => l.split("==")[0].split(">=")[0].split("<=")[0].split("~=")[0].split("@")[0].trim());
      deps.dependencies.pip = lines;
    } catch (err: any) {
      deps.dependencies.pip = { error: String(err) };
    }
  }

  // Check pyproject.toml
  const pyproject = path.join(targetPath, "pyproject.toml");
  if (fs.existsSync(pyproject)) {
    deps.detected_managers.push("uv/poetry");
  }

  // Check go.mod
  const goMod = path.join(targetPath, "go.mod");
  if (fs.existsSync(goMod)) {
    deps.detected_managers.push("go");
  }

  return JSON.stringify(deps, null, 2);
}

function generateTestCases(functionName: string, functionDescription: string, language: string = "typescript"): string {
  const templates: Record<string, string> = {
    typescript: `import { describe, it, expect, beforeEach } from 'vitest';

describe('${functionName}', () => {
  beforeEach(() => {
    // Setup before each test
  });
  
  it('should handle valid input', () => {
    // Arrange
    const input = {};
    
    // Act
    const result = ${functionName}(input);
    
    // Assert
    expect(result).toBeDefined();
  });
  
  it('should handle edge cases', () => {
    // Test with empty input
    expect(() => ${functionName}(null)).toThrow();
  });
  
  it('should handle error conditions', () => {
    // Test error handling
  });
});`,
    python: `import pytest
from unittest.mock import Mock, patch

class Test${functionName.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}:
    def setup_method(self):
        """Setup before each test"""
        pass
    
    def test_valid_input(self):
        # Arrange
        input_data = {}
        
        # Act
        result = ${functionName}(input_data)
        
        # Assert
        assert result is not None
    
    def test_edge_cases(self):
        # Test with empty input
        with pytest.raises(ValueError):
            ${functionName}(None)
    
    def test_error_handling(self):
        # Test error conditions
        pass
`,
    go: `package main

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func Test${functionName.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}ValidInput(t *testing.T) {
    // Arrange
    input := struct{}{}
    
    // Act
    result, err := ${functionName}(input)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, result)
}

func Test${functionName.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("")}EdgeCases(t *testing.T) {
    // Test with nil input
    _, err := ${functionName}(nil)
    assert.Error(t, err)
}
`
  };

  const ext = language === "typescript" ? "ts" : language === "python" ? "py" : "go";

  return JSON.stringify({
    function: functionName,
    description: functionDescription,
    language: language,
    test_file: `${functionName}.test.${ext}`,
    test_code: templates[language] || "// Language not supported",
    coverage_target: "80%"
  }, null, 2);
}

function runTests(testCommand: string = "npm test", targetPath: string = "."): string {
  try {
    const result = execSync(testCommand, {
      cwd: targetPath,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 300000
    } as any);

    const output = result;

    return JSON.stringify({
      command: testCommand,
      success: true,
      returncode: 0,
      output: output.substring(0, 8000),
      summary: "Tests passed"
    }, null, 2);
  } catch (err: any) {
    if (err.signal === "SIGTERM") {
      return JSON.stringify({ error: "Tests timed out after 5 minutes" }, null, 2);
    }

    const output = (err.stdout?.toString() || "") + (err.stderr?.toString() || "");

    return JSON.stringify({
      command: testCommand,
      success: false,
      returncode: err.status || err.code || 1,
      output: output.substring(0, 8000),
      summary: "Tests failed"
    }, null, 2);
  }
}

function analyzeCodeQuality(targetPath: string = ".", language: string = "auto"): string {
  const issues: any[] = [];

  // Detect language if auto
  if (language === "auto") {
    if (fs.existsSync(path.join(targetPath, "package.json"))) {
      language = "typescript";
    } else if (fs.existsSync(path.join(targetPath, "requirements.txt")) ||
      fs.existsSync(path.join(targetPath, "pyproject.toml"))) {
      language = "python";
    } else if (fs.existsSync(path.join(targetPath, "go.mod"))) {
      language = "go";
    }
  }

  function walkDir(dirPath: string): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if ([".git", "node_modules", "__pycache__", "venv"].some(x => dirPath.includes(x))) {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (![".py", ".ts", ".js", ".go"].includes(ext)) {
            continue;
          }

          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const lineNum = i + 1;

              if (line.includes("TODO") || line.includes("FIXME")) {
                issues.push({
                  file: fullPath,
                  line: lineNum,
                  type: "todo",
                  message: line.trim().substring(0, 100)
                });
              }
              if (line.includes("console.log") && [".ts", ".js"].includes(ext)) {
                issues.push({
                  file: fullPath,
                  line: lineNum,
                  type: "debug",
                  message: "console.log found"
                });
              }
              if (line.includes("print(") && ext === ".py" && !content.substring(0, 500).includes("logging")) {
                issues.push({
                  file: fullPath,
                  line: lineNum,
                  type: "debug",
                  message: "print statement found"
                });
              }
              if (line.length > 120) {
                issues.push({
                  file: fullPath,
                  line: lineNum,
                  type: "style",
                  message: "Line too long"
                });
              }
            }
          } catch (err) {
            // Ignore read errors
          }
        }
      }
    } catch (err) {
      // Ignore permission errors
    }
  }

  walkDir(targetPath);

  return JSON.stringify({
    path: targetPath,
    language: language,
    issues_found: issues.length,
    issues: issues.slice(0, 50),
    recommendations: [
      "Consider using a linter (eslint, ruff, golangci-lint)",
      "Remove debug statements before commit",
      "Address TODO/FIXME comments"
    ]
  }, null, 2);
}

function generateDockerfile(language: string, framework: string = "", port: number = 3000): string {
  const dockerfiles: Record<string, string> = {
    python: `FROM python:3.12-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .

EXPOSE ${port}
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${port}"]
`,
    node: `FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE ${port}
CMD ["node", "dist/index.js"]
`,
    go: `FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/server .

EXPOSE ${port}
CMD ["./server"]
`
  };

  return JSON.stringify({
    language: language,
    framework: framework,
    port: port,
    dockerfile: dockerfiles[language] || "# Language not supported",
    build_command: `docker build -t myapp:${language} .`,
    run_command: `docker run -p ${port}:${port} myapp:${language}`
  }, null, 2);
}

function generateGithubActions(language: string, deployTarget: string = "cloud-run"): string {
  const workflows: Record<string, string> = {
    node: `name: CI/CD Pipeline

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
          credentials_json: $\{\{ secrets.GCP_SA_KEY \}\}
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: my-service
          region: europe-west1
          source: .
`,
    python: `name: CI/CD Pipeline

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
          credentials_json: $\{\{ secrets.GCP_SA_KEY \}\}
      - uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: my-service
          region: europe-west1
          source: .
`
  };

  return JSON.stringify({
    language: language,
    deploy_target: deployTarget,
    filename: ".github/workflows/ci-cd.yml",
    workflow: workflows[language] || "# Language not supported",
    required_secrets: deployTarget.includes("cloud") ? ["GCP_SA_KEY"] : []
  }, null, 2);
}

function generateCloudRunConfig(
  serviceName: string,
  memory: string = "512Mi",
  cpu: string = "1",
  minInstances: number = 0,
  maxInstances: number = 10
): string {
  const config = `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: ${serviceName}
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "${minInstances}"
        autoscaling.knative.dev/maxScale: "${maxInstances}"
    spec:
      containerConcurrency: 80
      containers:
        - image: gcr.io/PROJECT_ID/${serviceName}
          resources:
            limits:
              memory: ${memory}
              cpu: ${cpu}
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production
`;

  return JSON.stringify({
    service_name: serviceName,
    filename: "service.yaml",
    config: config,
    deploy_command: `gcloud run services replace service.yaml --region=europe-west1`
  }, null, 2);
}

function generateLoggingConfig(language: string, logLevel: string = "info"): string {
  const configs: Record<string, string> = {
    python: `import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    
    logger = logging.getLogger()
    logger.setLevel(logging.${logLevel.toUpperCase()})
    logger.addHandler(handler)
    return logger

logger = setup_logging()
`,
    node: `import pino from 'pino';

export const logger = pino({
  level: '${logLevel}',
  formatters: {
    level: (label) => { return { level: label }; },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage:
// logger.info({ userId: '123' }, 'User logged in');
// logger.error({ err }, 'Operation failed');
`
  };

  return JSON.stringify({
    language: language,
    log_level: logLevel,
    code: configs[language] || "// Not supported",
    best_practices: [
      "Use structured JSON logging",
      "Include correlation IDs for tracing",
      "Don't log sensitive data (PII, tokens)",
      "Use appropriate log levels"
    ]
  }, null, 2);
}

function generateHealthCheck(language: string = "python"): string {
  const checks: Record<string, string> = {
    python: `from fastapi import APIRouter, Response
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
`,
    node: `import { Router } from 'express';

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
    checks.database = \`unhealthy: \${err.message}\`;
  }
  
  const allHealthy = Object.values(checks).every(v => v === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks
  });
});

export default router;
`
  };

  return JSON.stringify({
    language: language,
    endpoints: ["/health", "/health/ready"],
    code: checks[language] || "// Not supported"
  }, null, 2);
}

function checkOutdatedDeps(targetPath: string = "."): string {
  const results: any = { path: targetPath, package_managers: [] };

  // Check npm
  if (fs.existsSync(path.join(targetPath, "package.json"))) {
    try {
      const result = execSync("npm outdated --json", {
        cwd: targetPath,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000
      } as any);

      if (result.trim()) {
        results.package_managers.push({
          manager: "npm",
          outdated: JSON.parse(result)
        });
      } else {
        results.package_managers.push({
          manager: "npm",
          outdated: {}
        });
      }
    } catch (err: any) {
      results.package_managers.push({
        manager: "npm",
        error: String(err)
      });
    }
  }

  // Check pip
  if (fs.existsSync(path.join(targetPath, "requirements.txt"))) {
    results.package_managers.push({
      manager: "pip",
      command: "pip list --outdated --format=json"
    });
  }

  return JSON.stringify(results, null, 2);
}

function generateChangelog(version: string, changes: string, date: string = ""): string {
  if (!date) {
    date = new Date().toISOString().split("T")[0];
  }

  const changeList = changes.split("\n").map(c => c.trim()).filter(c => c);

  // Categorize changes
  const categories: Record<string, string[]> = { added: [], changed: [], fixed: [], removed: [] };

  for (const change of changeList) {
    const lower = change.toLowerCase();
    if (["add", "new", "create", "implement"].some(x => lower.includes(x))) {
      categories.added.push(change);
    } else if (["fix", "bug", "patch", "resolve"].some(x => lower.includes(x))) {
      categories.fixed.push(change);
    } else if (["remove", "delete", "deprecate"].some(x => lower.includes(x))) {
      categories.removed.push(change);
    } else {
      categories.changed.push(change);
    }
  }

  // Generate markdown
  const md: string[] = [`## [${version}] - ${date}\n`];

  for (const [cat, items] of Object.entries(categories)) {
    if (items.length > 0) {
      md.push(`### ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      for (const item of items) {
        md.push(`- ${item}`);
      }
      md.push("");
    }
  }

  return JSON.stringify({
    version: version,
    date: date,
    markdown: md.join("\n"),
    categories: categories
  }, null, 2);
}

function analyzeGitHistory(targetPath: string = ".", days: number = 30): string {
  try {
    const result = execSync(
      `git log --since="${days} days ago" --pretty=format:"%h|%an|%s" --shortstat`,
      {
        cwd: targetPath,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 30000
      } as any
    );

    const lines = result.trim().split("\n");
    const commits: any[] = [];
    const authors: Record<string, number> = {};

    for (const line of lines) {
      if (line.includes("|")) {
        const parts = line.split("|");
        if (parts.length >= 3) {
          const commit = { hash: parts[0], author: parts[1], message: parts[2] };
          commits.push(commit);
          authors[parts[1]] = (authors[parts[1]] || 0) + 1;
        }
      }
    }

    return JSON.stringify({
      path: targetPath,
      period_days: days,
      total_commits: commits.length,
      authors: authors,
      recent_commits: commits.slice(0, 20)
    }, null, 2);
  } catch (err: any) {
    return JSON.stringify({ error: String(err) }, null, 2);
  }
}

function createAgentTask(
  projectPath: string,
  taskTitle: string,
  taskDescription: string,
  acceptanceCriteria: string = "",
  priority: string = "medium"
): string {
  const antigravityDir = path.join(projectPath, ".antigravity");
  const taskFile = path.join(antigravityDir, "TASK.md");

  // Create directory if needed
  if (!fs.existsSync(antigravityDir)) {
    fs.mkdirSync(antigravityDir, { recursive: true });
  }

  // Parse acceptance criteria
  const criteria = acceptanceCriteria
    ? acceptanceCriteria.split(",").map(c => `- [ ] ${c.trim()}`).join("\n")
    : "- [ ] Implementation complete\n- [ ] Tests pass";

  const content = `# Agent Task: ${taskTitle}

**Status:** pending
**Priority:** ${priority}
**Created:** ${new Date().toISOString()}
**Assigned by:** Gemini CLI Orchestrator

## Description
${taskDescription}

## Acceptance Criteria
${criteria}

## Instructions
1. Read this task carefully
2. Implement the changes described above
3. Run tests to verify the implementation
4. When complete, update Status to "completed" and add a summary below

## Completion Summary
<!-- Agent will fill this in when done -->
`;

  fs.writeFileSync(taskFile, content);

  return JSON.stringify({
    success: true,
    task_file: taskFile,
    task_title: taskTitle,
    status: "pending",
    message: "Task created. Open project in Antigravity to execute."
  }, null, 2);
}

function spawnAntigravity(
  projectPath: string,
  createTask: boolean = false,
  taskDescription: string = ""
): string {
  // Verify path exists
  if (!fs.existsSync(projectPath)) {
    return JSON.stringify({ error: `Path not found: ${projectPath}` }, null, 2);
  }

  // Create task if requested
  if (createTask && taskDescription) {
    createAgentTask(projectPath, "Gemini Task", taskDescription);
  }

  try {
    execSync(`open -a Antigravity "${projectPath}"`, { timeout: 10000 });

    return JSON.stringify({
      success: true,
      project_path: projectPath,
      message: "Antigravity IDE opened with project",
      task_created: createTask && !!taskDescription
    }, null, 2);
  } catch (err: any) {
    return JSON.stringify({
      success: false,
      error: err.message || String(err)
    }, null, 2);
  }
}

function listAgentTasks(projectPath: string = "", statusFilter: string = "all"): string {
  const tasks: any[] = [];

  const checkProject = (projPath: string) => {
    const taskFile = path.join(projPath, ".antigravity", "TASK.md");
    if (fs.existsSync(taskFile)) {
      try {
        const content = fs.readFileSync(taskFile, "utf8");

        // Parse status
        const statusMatch = content.match(/\*\*Status:\*\*\s*(\w+)/);
        const status = statusMatch ? statusMatch[1] : "unknown";

        // Parse title
        const titleMatch = content.match(/# Agent Task:\s*(.+)/);
        const title = titleMatch ? titleMatch[1] : "Unknown Task";

        // Parse created date
        const createdMatch = content.match(/\*\*Created:\*\*\s*(.+)/);
        const created = createdMatch ? createdMatch[1] : "";

        // Parse priority
        const priorityMatch = content.match(/\*\*Priority:\*\*\s*(\w+)/);
        const priority = priorityMatch ? priorityMatch[1] : "medium";

        if (statusFilter === "all" || status === statusFilter) {
          tasks.push({
            project: projPath,
            title: title,
            status: status,
            priority: priority,
            created: created,
            task_file: taskFile
          });
        }
      } catch (err) {
        // Ignore parse errors
      }
    }
  };

  if (projectPath) {
    checkProject(projectPath);
  } else {
    // Check common project directories
    const homeDir = process.env.HOME || "";
    const codeDir = path.join(homeDir, "code");
    if (fs.existsSync(codeDir)) {
      const projects = fs.readdirSync(codeDir, { withFileTypes: true });
      for (const proj of projects) {
        if (proj.isDirectory()) {
          checkProject(path.join(codeDir, proj.name));
        }
      }
    }
  }

  return JSON.stringify({
    total_tasks: tasks.length,
    filter: statusFilter,
    tasks: tasks
  }, null, 2);
}

function getTaskStatus(projectPath: string): string {
  const taskFile = path.join(projectPath, ".antigravity", "TASK.md");

  if (!fs.existsSync(taskFile)) {
    return JSON.stringify({
      exists: false,
      error: "No task file found in project"
    }, null, 2);
  }

  try {
    const content = fs.readFileSync(taskFile, "utf8");

    // Parse all fields
    const statusMatch = content.match(/\*\*Status:\*\*\s*(\w+)/);
    const titleMatch = content.match(/# Agent Task:\s*(.+)/);
    const createdMatch = content.match(/\*\*Created:\*\*\s*(.+)/);
    const priorityMatch = content.match(/\*\*Priority:\*\*\s*(\w+)/);

    // Extract completion summary if present
    const summaryMatch = content.match(/## Completion Summary\n([\s\S]*?)(?=\n##|$)/);
    const summary = summaryMatch
      ? summaryMatch[1].replace(/<!--.*?-->/g, "").trim()
      : "";

    // Count completed acceptance criteria
    const criteriaTotal = (content.match(/- \[[ x]\]/g) || []).length;
    const criteriaComplete = (content.match(/- \[x\]/gi) || []).length;

    return JSON.stringify({
      exists: true,
      project: projectPath,
      title: titleMatch ? titleMatch[1] : "Unknown",
      status: statusMatch ? statusMatch[1] : "unknown",
      priority: priorityMatch ? priorityMatch[1] : "medium",
      created: createdMatch ? createdMatch[1] : "",
      acceptance_criteria: {
        total: criteriaTotal,
        completed: criteriaComplete
      },
      completion_summary: summary || null
    }, null, 2);
  } catch (err: any) {
    return JSON.stringify({
      exists: true,
      error: err.message || String(err)
    }, null, 2);
  }
}

function assignToAgent(task: string, projectPath: string = "."): string {
  const resolvedPath = path.resolve(projectPath);
  
  if (!fs.existsSync(resolvedPath)) {
    return JSON.stringify({ error: `Path not found: ${resolvedPath}` }, null, 2);
  }
  
  // Create task file for tracking
  const antigravityDir = path.join(resolvedPath, ".antigravity");
  if (!fs.existsSync(antigravityDir)) {
    fs.mkdirSync(antigravityDir, { recursive: true });
  }
  
  const taskFile = path.join(antigravityDir, "TASK.md");
  const title = task.length > 50 ? task.substring(0, 47) + "..." : task;
  
  const content = `# Agent Task: ${title}

**Status:** pending
**Priority:** high
**Created:** ${new Date().toISOString()}
**Assigned by:** Gemini CLI Orchestrator

## Task
${task}

## Acceptance Criteria
- [ ] Implementation complete
- [ ] Tests pass

## Completion Summary
<!-- Update status to "completed" and fill this when done -->
`;

  fs.writeFileSync(taskFile, content);
  
  return JSON.stringify({
    success: true,
    task: task,
    project_path: resolvedPath,
    task_file: taskFile,
    next_step: "Now execute: Read .antigravity/TASK.md and complete the task autonomously",
    message: "Task created. Use native agent mode to execute."
  }, null, 2);
}

function listSdlcTools(): string {
  const phases: Record<string, string[]> = {
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
    ],
    "9. Agent Orchestration": [
      "create_agent_task - Create a task for Antigravity IDE agent",
      "spawn_antigravity - Open Antigravity IDE with a project",
      "list_agent_tasks - List all agent tasks",
      "get_task_status - Check task completion status"
    ]
  };

  const totalTools = Object.values(phases).reduce((sum, tools) => sum + tools.length, 0);

  return JSON.stringify({
    total_tools: totalTools,
    phases: phases
  }, null, 2);
}

// =============================================================================
// REQUEST HANDLERS
// =============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let result: string;

  // Type guard to ensure args is an object with string properties
  const getArg = (key: string, defaultValue: string = ""): string => {
    if (args && typeof args === "object" && key in args) {
      const value = (args as any)[key];
      return typeof value === "string" ? value : defaultValue;
    }
    return defaultValue;
  };

  const getArgNumber = (key: string, defaultValue: number = 0): number => {
    if (args && typeof args === "object" && key in args) {
      const value = (args as any)[key];
      return typeof value === "number" ? value : defaultValue;
    }
    return defaultValue;
  };

  try {
    switch (name) {
      case "analyze_codebase":
        result = analyzeCodebase(getArg("path", "."));
        break;
      case "estimate_effort":
        result = estimateEffort(getArg("scope", ""), getArg("complexity", "medium"));
        break;
      case "create_project_plan":
        result = createProjectPlan(getArg("name", ""), getArg("description", ""), getArg("phases"));
        break;
      case "parse_requirements":
        result = parseRequirements(getArg("text", ""));
        break;
      case "generate_api_spec":
        result = generateApiSpec(getArg("resource", ""), getArg("operations", "crud"));
        break;
      case "design_database_schema":
        result = designDatabaseSchema(getArg("entities", ""), getArg("database_type", "postgresql"));
        break;
      case "generate_architecture_diagram":
        result = generateArchitectureDiagram(getArg("components", ""), getArg("style", "microservices"));
        break;
      case "scaffold_component":
        result = scaffoldComponent(getArg("name", ""), getArg("component_type", ""), getArg("language", "typescript"));
        break;
      case "run_command":
        result = runCommand(getArg("command", ""), getArg("cwd", "."));
        break;
      case "analyze_dependencies":
        result = analyzeDependencies(getArg("path", "."));
        break;
      case "generate_test_cases":
        result = generateTestCases(getArg("function_name", ""), getArg("function_description", ""), getArg("language", "typescript"));
        break;
      case "run_tests":
        result = runTests(getArg("test_command", "npm test"), getArg("path", "."));
        break;
      case "analyze_code_quality":
        result = analyzeCodeQuality(getArg("path", "."), getArg("language", "auto"));
        break;
      case "generate_dockerfile":
        result = generateDockerfile(getArg("language", ""), getArg("framework", ""), getArgNumber("port", 3000));
        break;
      case "generate_github_actions":
        result = generateGithubActions(getArg("language", ""), getArg("deploy_target", "cloud-run"));
        break;
      case "generate_cloud_run_config":
        result = generateCloudRunConfig(
          getArg("service_name", ""),
          getArg("memory", "512Mi"),
          getArg("cpu", "1"),
          getArgNumber("min_instances", 0),
          getArgNumber("max_instances", 10)
        );
        break;
      case "generate_logging_config":
        result = generateLoggingConfig(getArg("language", ""), getArg("log_level", "info"));
        break;
      case "generate_health_check":
        result = generateHealthCheck(getArg("language", "python"));
        break;
      case "check_outdated_deps":
        result = checkOutdatedDeps(getArg("path", "."));
        break;
      case "generate_changelog":
        result = generateChangelog(getArg("version", ""), getArg("changes", ""), getArg("date", ""));
        break;
      case "analyze_git_history":
        result = analyzeGitHistory(getArg("path", "."), getArgNumber("days", 30));
        break;
      case "create_agent_task":
        result = createAgentTask(
          getArg("project_path", ""),
          getArg("task_title", ""),
          getArg("task_description", ""),
          getArg("acceptance_criteria", ""),
          getArg("priority", "medium")
        );
        break;
      case "spawn_antigravity":
        result = spawnAntigravity(
          getArg("project_path", ""),
          args && typeof args === "object" && "create_task" in args ? Boolean((args as any).create_task) : false,
          getArg("task_description", "")
        );
        break;
      case "list_agent_tasks":
        result = listAgentTasks(getArg("project_path", ""), getArg("status_filter", "all"));
        break;
      case "get_task_status":
        result = getTaskStatus(getArg("project_path", ""));
        break;
      case "assign_to_agent":
        result = assignToAgent(getArg("task", ""), getArg("project_path", "."));
        break;
      case "list_sdlc_tools":
        result = listSdlcTools();
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: result }]
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: error.message || String(error) }, null, 2) }],
      isError: true
    };
  }
});

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

