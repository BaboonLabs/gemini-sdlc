# Baboon Labs - Coding Styleguide

## 1. Frontend Rules (React/TypeScript)
- **Strict Mode**: TypeScript strict mode required.
- **Components**: Functional components only. Hooks > Classes.
- **Styling**: Tailwind CSS only. No inline styles.
- **Structure**: `src/components/ui` for base, `src/components/features` for domain logic.
- **Naming**: PascalCase for components (`UserProfile.tsx`).

## 2. Backend Rules (Node.js/Python)
- **Validation**: Input validation required (Zod/Pydantic) for all endpoints.
- **Errors**: Never swallow errors. Log with context. Return consistent JSON error responses.
- **Async**: Use `async/await`. Avoid callback hell.
- **Logging**: Structured JSON logging only. No `console.log` in production.
- **Secrets**: Load from environment/Secret Manager. Never commit secrets.

## 3. Testing Rules
- **Coverage**: Minimum 80% coverage for new features.
- **Unit**: Test business logic in isolation.
- **Integration**: Test API endpoints with mocked services.
- **E2E**: Critical flows must be covered.

## 4. Security Rules
- **OWASP**: Adhere to OWASP Top 10 mitigation.
- **Dependencies**: No critical/high vulnerabilities allowed.
- **Auth**: Proper Role-Based Access Control (RBAC) on all protected routes.

## 5. Deployment Rules (GCP)
- **Region**: `europe-west1` for all resources.
- **Containers**: Multi-stage Docker builds.
- **CI/CD**: Automated pipelines for testing and deployment.
