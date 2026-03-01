# AutoLoan — Angular / Spring Boot

A full-stack auto loan origination platform with role-based dashboards for customers, loan officers, and underwriters.

**Live:** [autoloanangularspringboot.thanhphongle.net](https://autoloanangularspringboot.thanhphongle.net)

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Runtime |
| Spring Boot | 4.0.3 | Web framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA / Hibernate | 6.x | ORM & data access |
| PostgreSQL | 16 | Relational database |
| JWT (jjwt) | — | Stateless token-based auth |
| BCrypt | 12 rounds | Password hashing |
| Maven | 3.9+ | Build & dependency management |
| JaCoCo | — | Code coverage reporting |
| JUnit 5 / MockMvc | — | Unit & integration testing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 19 | SPA framework |
| TypeScript | 5.x | Language |
| Angular Signals | — | Reactive state management |
| Angular Standalone Components | — | Modular component architecture |
| Reactive Forms | — | Form handling & validation |
| Vitest | — | Unit testing |
| ESLint | — | Linting |
| Nginx | 1.29 | Production static file server & reverse proxy |

### Infrastructure & DevOps

| Technology | Purpose |
|---|---|
| Docker | Containerization (multi-stage builds) |
| Railway | Cloud deployment (backend, frontend, PostgreSQL) |
| Nginx | Frontend serving + API reverse proxy |
| GitHub | Source control |
| Git Hooks (pre-commit) | Lint, compile, test gates |
| Cloudflare | DNS & custom domain |

---

## Project Structure
```
autoloanAngularSpringBoot/
├── backend/
│   ├── src/main/java/          # Spring Boot application
│   │   └── com/autoloan/
│   │       ├── config/         # Security, CORS, JWT config
│   │       ├── controller/     # REST API controllers
│   │       ├── model/          # JPA entities
│   │       ├── repository/     # Spring Data repositories
│   │       ├── service/        # Business logic
│   │       └── dto/            # Request/response DTOs
│   ├── src/main/resources/
│   │   ├── application.yml     # App configuration
│   │   └── seed.sql            # Database seed data
│   ├── src/test/               # Backend tests (481 tests)
│   ├── pom.xml
│   └── Dockerfile.backend
├── frontend/
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/         # Route guards (auth)
│   │   │   ├── interceptors/   # HTTP interceptors (auth, API response)
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── services/       # API services
│   │   ├── features/
│   │   │   ├── auth/           # Login, signup, password reset, MFA
│   │   │   ├── dashboard/      # Customer, loan officer, underwriter dashboards
│   │   │   ├── loan/           # Loan form, detail, agreement, status
│   │   │   └── profile/        # User profile
│   │   └── shared/             # Navigation, toast, loading components
│   ├── src/environments/       # Environment configs
│   ├── nginx.conf              # Production Nginx config
│   ├── package.json
│   └── Dockerfile.frontend
├── docker-compose.yml
└── README.md
```

---

## Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- BCrypt password hashing (12 rounds)
- Multi-factor authentication (TOTP)
- Email confirmation flow
- Password reset with secure tokens
- Account lockout after failed attempts
- Role-based access control (CUSTOMER, LOAN_OFFICER, UNDERWRITER)

### Customer Portal
- Multi-step loan application wizard (personal info, vehicle, financial, review, submit)
- Application dashboard with filtering and sorting
- Document upload
- Loan agreement signing
- Application status tracking with history

### Loan Officer Dashboard
- Queue of submitted applications with status filters
- Application review workflow (verify → review → approve/reject)
- Document request capability
- Notes and comments on applications
- Stats cards (pending review, new, verifying)

### Underwriter Dashboard
- Risk assessment queue
- Approval/rejection with interest rate and term setting
- Document review
- Status history audit trail

---

## API Endpoints

### Auth (`/api/auth`)
- `POST /login` — Authenticate user
- `POST /signup` — Register new user
- `DELETE /logout` — Invalidate session
- `GET /me` — Current user info
- `POST /refresh` — Refresh JWT token
- `POST /forgot-password` — Initiate password reset
- `POST /reset-password` — Complete password reset
- `GET /confirm-email` — Confirm email address

### Loans (`/api/loans`)
- `GET /` — List user's applications (paginated)
- `POST /` — Create new application
- `GET /:id` — Get application detail
- `PATCH /:id` — Update application
- `DELETE /:id` — Delete draft application
- `POST /:id/submit` — Submit application
- `POST /:id/sign` — Sign loan agreement
- `GET /:id/agreement_pdf` — Download agreement PDF
- `GET /:id/history` — Status change history

### Loan Officer (`/api/loan-officer/applications`)
- `GET /` — List all applications (paginated, filterable)
- `GET /:id` — Application detail
- `POST /:id/start_verification` — Begin verification
- `PATCH /:id/review` — Move to review
- `POST /:id/approve` — Approve application
- `POST /:id/reject` — Reject application
- `POST /:id/request_documents` — Request additional documents

### Underwriter (`/api/underwriter/applications`)
- `GET /` — List applications for underwriting
- `POST /:id/approve` — Final approval with terms
- `POST /:id/reject` — Reject with reason

---

## Getting Started

### Prerequisites
- Java 21+
- Node.js 20+
- PostgreSQL 16+
- Maven 3.9+

### Backend
```bash
cd backend
cp src/main/resources/application.yml.example src/main/resources/application.yml
# Edit application.yml with your database credentials

mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npx ng serve
# Runs on http://localhost:4200
```

### Docker
```bash
docker-compose up --build
# Backend: http://localhost:8080
# Frontend: http://localhost:80
```

---

## Testing

### Backend (481 tests)
```bash
cd backend
mvn test
# Coverage report: target/site/jacoco/index.html
```

### Frontend (303 tests)
```bash
cd frontend
npx vitest run
```

---

## Deployment (Railway)

Both services deploy to Railway with Docker multi-stage builds:
```bash
# Backend
railway link  # Select backend-angularspringboot
railway up --detach

# Frontend
railway link  # Select frontend-angularspringboot
railway up --detach
```

### Environment Variables

**Backend:**
- `DATABASE_URL` — PostgreSQL connection string (provided by Railway)
- `JWT_SECRET` — Secret key for JWT signing
- `APP_CORS_ALLOWED_ORIGINS` — Comma-separated allowed origins
- `PORT` — Server port (default: 8080)

**Frontend:**
- `PORT` — Nginx listen port (default: 80)
- `BACKEND_URL` — Backend API URL

---

## Git Workflow

- **main** — Production branch
- **develop** — Integration branch
- **feature/*** — Feature branches (merge to develop via `--no-ff`)

Pre-commit hooks enforce: ESLint, Maven compile, backend tests (JaCoCo), frontend tests (Vitest), secret detection, and file size limits.

---

## Seed Data

Default test accounts (password: `password123`): //pragma: allowlist secret

| Email | Role         |
|---|--------------|
| tiffany.chen@example.com | CUSTOMER     |
| officer@example.com | LOAN_OFFICER |
| underwriter@example.com | UNDERWRITER  |

---

## License

Private repository.
