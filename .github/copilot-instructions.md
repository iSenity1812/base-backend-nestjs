# Account Service - AI Coding Assistant Instructions

## Architecture Overview

This is a **NestJS microservice** using a **package-based domain architecture** with shared libraries. The service follows **CQRS patterns** and includes microservice communication capabilities.

### Core Structure

- **`src/`**: Main application code with domain packages
- **`libs/common`**: Shared utilities, base classes, decorators, types
- **`libs/core`**: Infrastructure services (database, cache, gateway, health)
- **`config/`**: Environment-based configuration using the `config` npm package

### Package-Based Domains

Each domain is organized as a self-contained package under `src/account/packages/`:

- **`account-user/`**: User management with CQRS commands/handlers
- **`account-authenticate/`**: Authentication with pluggable strategies (password, OpenID)

Each package includes: `controllers/`, `services/`, `dtos/`, `entities/`, `commands/`, `interfaces/`

## Key Patterns & Conventions

### 1. Dynamic Module Configuration

```typescript
// Use forRoot() pattern for configurable modules
AuthenticateModule.forRoot({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '1h',
});
```

### 2. CQRS Operations Mapping

- Commands are mapped to operations via `OperationsMap` in each package
- Gateway service routes operations to appropriate command handlers
- Use `ACCOUNT_OPERATION` constants from `@app/common/constants`

### 3. Base Classes Pattern

Extend base classes for consistent patterns:

- **Entities**: `BaseEntity` (includes id, createdAt, updatedAt)
- **Services**: `BaseCRUDService<T>` for standard CRUD operations
- **Controllers**: `BaseCRUDController<T>` for REST endpoints

### 4. Import Aliases

Always use these path aliases (configured in tsconfig/jest):

- `@app/common/*` → `libs/common/src/*`
- `@app/core/*` → `libs/core/src/*`
- `src/*` → `src/*`

## Development Workflow

### Database Management

```bash
# Generate migration
pnpm run migration:generate --name=MigrationName

# Run migrations
pnpm run migration:run

# Create/run seeds
pnpm run seed:create --name=SeedName
pnpm run seed:run
```

### Development Commands

```bash
pnpm dev              # Start with watch mode
pnpm lint             # ESLint with auto-fix
pnpm test:watch       # Jest in watch mode
pnpm test:e2e         # End-to-end tests
```

### Docker Development

- PostgreSQL runs via `docker-compose.yml` on port 5432
- Default credentials: postgres/postgres
- Database config in `config/default.js`

## Service Integration

### Microservice Gateway

- `GatewayService` handles inter-service communication
- Register clients with transport options (TCP/Kafka)
- Operations are routed through CQRS command bus

### Authentication Architecture

- **Multi-strategy**: Password + OpenID Connect support
- **JWT Access Tokens**: Stateless with configurable expiration
- **Refresh Tokens**: Database-stored with session management
- **Role Mapping**: User roles → Token roles via `UserRoleToTokenRoleMapper`

### Configuration

Environment-specific configs in `config/`:

- `default.js` - Base configuration
- `local.js` - Local overrides
- `custom-environment-variables.js` - Environment variable mapping

## Common Tasks

### Adding New Authentication Strategy

1. Implement `IAuthStrategy` interface
2. Register in `AccountAuthenticateModule.forRoot()`
3. Add strategy to `AUTH_STRATEGIES` provider

### Creating New Package

1. Follow package structure: `controllers/`, `services/`, `dtos/`, `entities/`
2. Create module with `forRoot()` if configurable
3. Export from main domain module (`AccountModule`)

### Adding CQRS Operations

1. Create command class implementing `ICommand`
2. Create command handler with `@CommandHandler()`
3. Add to `OperationsMap` with operation constant
4. Register in module providers

## Code Style Notes

- Unused variables prefixed with `_` are ignored by ESLint
- Use `pnpm` for package management
- Prettier + ESLint configured for consistent formatting
- TypeScript strict mode enabled
