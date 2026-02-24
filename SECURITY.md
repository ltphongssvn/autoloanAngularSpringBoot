<!-- SECURITY.md -->
<!-- Project: autoloanAngularSpringBoot (Auto Loan App - Angular + Spring Boot Full-Stack) -->
# Security Best Practices Implementation

## Secret Management Implementation

### 1. Pre-commit Secret Detection Setup

**Installation:**
```bash
pip install pre-commit detect-secrets
```

**Configuration (.pre-commit-config.yaml):**
```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        exclude: .*\.lock|.*\.log|package-lock\.json
```

**Activation:**
```bash
detect-secrets scan > .secrets.baseline
pre-commit install
pre-commit install --hook-type pre-push
```

### 2. Environment Variables Required

#### Frontend (`frontend/environment.ts`) — never commit secrets:
```typescript
// Angular environment (browser-safe only, no secrets)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

#### Backend (`backend/src/main/resources/application.properties`) — never commit production values:
```properties
# Database (Spring Boot / JPA via Unix socket)
spring.datasource.url=jdbc:postgresql://localhost:5432/autoloan_angular_springboot?socketFactory=...
spring.datasource.username=lenovo

# JWT Authentication
app.jwt.secret=your_jwt_secret_key_here
app.jwt.expiration=604800000

# CORS
app.cors.allowed-origins=http://localhost:4200
```

### 3. Security Measures Implemented

| Layer | Tool/Practice | Scope | Purpose |
|-------|--------------|-------|---------|
| Secret Detection | detect-secrets + pre-commit | Monorepo | Prevent secrets from entering codebase |
| .env Protection | pre-commit hook `block-env-files` | Monorepo | Block .env files from being committed |
| Dependencies (Backend) | mvn dependency-check / OWASP | Backend | Scan for vulnerable packages |
| Dependencies (Frontend) | npm audit | Frontend | Scan for vulnerable packages |
| HTTP Headers | Spring Security headers | Backend | OWASP security headers (CSP, X-Frame-Options, etc.) |
| Rate Limiting | Spring Boot rate limiting (Bucket4j or custom filter) | Backend | Prevent brute force / DDoS |
| Input Validation | Jakarta Bean Validation (@Valid, @NotNull, @Size) | Backend | Validate all request payloads via DTOs |
| Input Validation | Angular Reactive Forms + Validators | Frontend | Client-side form validation |
| Authentication | JWT via Spring Security + jjwt | Backend | Stateless token-based auth |
| Authorization | Spring Security @PreAuthorize (roles: Customer / Officer / Underwriter) | Backend | Role-based access control |
| CORS | Spring Security CorsConfigurationSource | Backend | Restrict cross-origin requests |
| SQL Injection | Spring Data JPA (parameterized queries) | Backend | Prevent SQL injection |
| Password Hashing | BCryptPasswordEncoder | Backend | Secure password storage |
| MFA | TOTP-based two-factor auth | Backend | Two-factor authentication |
| Angular Security | Angular built-in XSS protection (template sanitization) | Frontend | Prevent XSS attacks |
| Type Safety | TypeScript strict mode (Angular) + Java strong typing (Spring Boot) | Both | Catch errors at compile time |
| Test Coverage | JaCoCo (80% line / 70% branch) + Vitest coverage | Both | Enforce minimum test coverage |

### 4. Architecture-Specific Security Notes

#### Frontend (Angular)
- **Environment files:** `environment.ts` / `environment.prod.ts` — only browser-safe values (API URLs)
- **No secrets in frontend:** Angular is a client-side SPA; all secrets stay in Spring Boot backend
- **HttpInterceptor:** Attaches JWT Bearer token to all API requests
- **Route Guards:** `AuthGuard` and `RoleGuard` protect dashboard routes client-side

#### Backend (Spring Boot)
- **Spring Security:** All protected endpoints use `@PreAuthorize` with role-based access
- **DTO Validation:** Every endpoint validates input via `@Valid` + Jakarta Bean Validation annotations
- **Security Headers:** Spring Security default headers + custom CSP configuration
- **Rate Limiting:** Applied globally, stricter on auth endpoints
- **CORS:** Configured to allow only the Angular frontend origin
- **JaCoCo:** 80% line coverage, 70% branch coverage, 60% per-class minimum enforced on `mvn verify`

### 5. Pre-commit Workflow

Every commit automatically:
1. Scans for secrets using detect-secrets
2. Blocks commit if new secrets found
3. Blocks .env files from being committed
4. Validates JSON and YAML files
5. Fixes line endings and trailing whitespace
6. Runs Angular lint for code quality
7. Runs Maven compile and unit tests with JaCoCo coverage

**Pre-push:** Runs full coverage verification (`mvn verify`) and build for both Angular and Spring Boot.

**Manual scan:**
```bash
pre-commit run --all-files
```

### 6. Team Guidelines

- Never commit `.env`, `.env.local`, or `.env.*` files
- Never put production secrets in `application.properties` — use environment variables or Spring profiles
- Use environment variables for all credentials
- Run `pre-commit install && pre-commit install --hook-type pre-push` after cloning
- Review `.secrets.baseline` changes carefully
- Rotate any accidentally exposed keys immediately
- Run `mvn dependency-check:check` and `npm audit` regularly
- Keep all dependencies updated
- Angular `environment.ts` holds only browser-safe values (API URLs)
- All secrets belong in the Spring Boot backend — frontend only holds public config

### 7. Dependency Security Audit
```bash
# Backend: check for known vulnerabilities
cd backend && mvn dependency-check:check

# Frontend: check for known vulnerabilities
cd frontend && npm audit

# Frontend: fix automatically where possible
cd frontend && npm audit fix
```

### 8. Test Coverage Enforcement
```bash
# Backend: run tests with JaCoCo coverage check (fails if thresholds not met)
cd backend && mvn verify

# Frontend: run tests with coverage
cd frontend && npx ng test --no-watch --code-coverage
```

**Backend thresholds (enforced by JaCoCo in pom.xml):**
- Global: 80% line coverage, 70% branch coverage
- Per-class: 60% minimum line coverage

## Verification
```bash
$ pre-commit run --all-files
Detect secrets...........................................................Passed
Block Large Binary Files.................................................Passed
Block .env Files.........................................................Passed
Fix Line Endings to LF..................................................Passed
Fix End of Files.........................................................Passed
Trim Trailing Whitespace.................................................Passed
Validate JSON Files......................................................Passed
Validate YAML Files......................................................Passed
Check for Large Files....................................................Passed
```

All secrets removed and pre-commit protection active.
