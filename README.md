# Comaket Service — Repository Map

> Staff Engineering Reference Document
> Framework: NestJS 10.x | Database: MongoDB (Mongoose) | Language: TypeScript

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Directories](#key-directories)
- [Core Architectural Modules](#core-architectural-modules)
- [Authentication & Authorization](#authentication--authorization)
- [State Management & Services](#state-management--services)
- [API Utilities & Query Patterns](#api-utilities--query-patterns)
- [Shared Components](#shared-components)
- [Global Configuration](#global-configuration)
- [Enums & Constants](#enums--constants)
- [Response Format Contract](#response-format-contract)
- [Patterns & Conventions](#patterns--conventions)
- [External Services](#external-services)

---

## Project Overview

Comaket is a multi-vendor marketplace API where creators showcase and sell products through storefronts. The platform supports three distinct selling models with different business rules, fees, and workflows.

| Property | Value |
|---|---|
| API Prefix | `/api/v1` |
| API Docs (Swagger) | `/api-docs` |
| Database | MongoDB (default: `mongodb://localhost:27017/comaket`) |
| Rate Limiting | 60 requests/minute/IP |
| Auth Strategy | JWT Bearer + Google OAuth 2.0 |

---

## Key Directories

```
comaket-service/
├── src/
│   ├── config/                  # Environment-based configuration
│   ├── common/                  # Shared utilities across all modules
│   ├── auth/                    # Authentication & token management
│   ├── users/                   # User accounts & profiles
│   ├── creators/                # Creator profiles & subscription plans
│   ├── stores/                  # Creator storefronts
│   ├── listings/                # Product listings (core business logic)
│   ├── orders/                  # Order processing & status lifecycle
│   ├── payments/                # Paystack payment integration
│   ├── admin/                   # Admin dashboard & moderation tools
│   ├── reviews/                 # Product & seller ratings
│   ├── categories/              # Product categorization
│   ├── cart/                    # Shopping cart management
│   ├── media/                   # File uploads via Cloudinary
│   ├── notifications/           # Email & in-app notifications
│   ├── follows/                 # Creator follow system
│   ├── featured-works/          # Creator portfolio showcase
│   ├── saved-products/          # User wishlist / favourites
│   ├── shipping-addresses/      # Delivery address management
│   └── scripts/                 # Database seeding scripts
├── test/                        # E2E tests (jest)
├── src/main.ts                  # Application entry point
├── src/app.module.ts            # Root module
└── src/app.controller.ts        # Health check endpoint
```

---

## Core Architectural Modules

Each module follows a strict four-layer structure. Never deviate from this when adding a new module.

```
{module}/
├── {module}.module.ts           # NestJS module definition (imports, providers, exports)
├── {module}.controller.ts       # Route handlers — HTTP layer only, no business logic
├── {module}.service.ts          # Business logic & DB operations
├── schemas/
│   └── {entity}.schema.ts       # Mongoose schema — always extends BaseSchema
└── dto/
    └── {action}-{entity}.dto.ts # Validated input shapes using class-validator
```

### Module Inventory

| Module | Service Size | Purpose |
|---|---|---|
| `listings` | ~1,105 lines | Core: 3 selling types, status workflows, fee logic |
| `orders` | ~1,002 lines | Order lifecycle, totals, shipping |
| `creators` | ~436 lines | Creator profiles, plan management |
| `stores` | — | Storefronts (plan-gated: 1–3 stores) |
| `payments` | — | Paystack transactions, payouts |
| `auth` | — | JWT, OTP, password reset, Google OAuth |
| `users` | — | Profiles, avatar, location |
| `admin` | — | Statistics, moderation, approval |
| `reviews` | — | Ratings on products/sellers |
| `categories` | — | Hierarchical product categories |
| `cart` | — | Session-based cart items |
| `media` | — | Cloudinary upload & management |
| `notifications` | — | Email dispatch + in-app queue |
| `follows` | — | Creator follow/unfollow |
| `featured-works` | — | Portfolio items per creator |
| `saved-products` | — | Wishlist (user ↔ listing relation) |
| `shipping-addresses` | — | User saved delivery addresses |

---

## Authentication & Authorization

### Files

| File | Role |
|---|---|
| `src/auth/auth.controller.ts` | Public auth endpoints |
| `src/auth/auth.service.ts` | JWT creation, bcrypt, OTP, token blacklist |
| `src/auth/auth.module.ts` | Passport + JwtModule registration |
| `src/auth/strategies/jwt.strategyy.ts` | Passport JWT strategy (note: double `y` in filename) |
| `src/auth/guards/jwt-auth.guard.ts` | `@UseGuards(JwtAuthGuard)` — protects endpoints |
| `src/auth/guards/optional-jwt.auth.guard.ts` | Optional JWT — public endpoints that benefit from user context |
| `src/common/guards/roles.guard.ts` | RBAC — checks `@Roles()` metadata against `user.role` |

### Auth Endpoints

| Method | Path | Access |
|---|---|---|
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `POST` | `/auth/google` | Public |
| `POST` | `/auth/verify-email` | Public |
| `POST` | `/auth/resend-verification` | Public |
| `POST` | `/auth/forgot-password` | Public |
| `POST` | `/auth/reset-password` | Public |
| `POST` | `/auth/logout` | JWT required |

### Authorization Pattern

```typescript
// Endpoint requires valid JWT
@UseGuards(JwtAuthGuard)

// Endpoint restricted to specific roles
@Roles(UserRole.Admin, UserRole.SuperAdmin)
@UseGuards(JwtAuthGuard, RolesGuard)

// Extract authenticated user in handler
@GetUser() user: JwtPayload          // full payload { sub, email, role }
@GetUser('sub') userId: string       // single field
```

### Security Details

- Passwords: bcrypt (10 salt rounds), never returned in responses
- Reset tokens: 32-byte random hex, bcrypt-hashed before DB storage, 1hr expiry
- OTP: 6-digit code, 10-minute expiry
- Token blacklist: in-memory `Set` on logout
- JWT expiry: 30 days (configurable via env)

---

## State Management & Services

There is no client-side state management. This is a pure REST API. State is managed at the service layer via MongoDB documents.

### Service Layer Rules

- Services inject Mongoose models via `@InjectModel(Entity.name)`
- Services throw typed `HttpException` subclasses (`NotFoundException`, `ConflictException`, `ForbiddenException`, etc.)
- Services return typed `Document` objects or `PaginatedResponse<T>`
- Services are exported from their module when consumed cross-module
- Internal updates use `model.findByIdAndUpdate()` with `{ new: true }`

### Cross-Module Dependencies (examples)

```
AuthService      → UsersService (create, findByEmail, updateInternal)
OrdersService    → ListingsService, PaymentsService
ListingsService  → StoresService, CreatorsService
NotificationsService → (consumed by Auth, Orders, Payments)
AdminService     → UsersService, ListingsService, OrdersService
```

---

## API Utilities & Query Patterns

### Pagination

All list endpoints accept `PaginationDto` as a `@Query()` parameter.

**File:** `src/common/dto/pagination.dto.ts`

```typescript
class PaginationDto {
  page?: number = 1;           // @Min(1)
  perPage?: number = 20;       // @Min(1) @Max(100)
  sort?: string = '-createdAt'; // '-' prefix = descending
  search?: string;
}
```

**Usage:** `GET /listings?page=2&perPage=10&sort=-createdAt&search=jacket`

### Paginated Response Shape

**File:** `src/common/interfaces/paginated-response.interface.ts`

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
```

The `TransformInterceptor` detects this shape automatically and moves pagination metadata into `meta.pagination`.

### Mongoose Query Conventions

```typescript
// Soft delete filter — always exclude deleted documents
model.find({ isDeleted: { $ne: true } })

// Exclude sensitive fields inline when needed
model.findById(id).select('+password')

// Populate relations
model.findById(id).populate('store', 'name slug')

// Sorting from PaginationDto
const sortObj = sort.startsWith('-')
  ? { [sort.slice(1)]: -1 }
  : { [sort]: 1 };
```

---

## Shared Components

### Decorators (`src/common/decorators/`)

| Decorator | Usage | Purpose |
|---|---|---|
| `@GetUser(field?)` | Controller param | Extracts `request.user` or a field from it |
| `@ResponseMessage(msg)` | Controller method | Sets custom success message in `meta.message` |
| `@Roles(...roles)` | Controller method | Declares required roles for `RolesGuard` |

### Guards (`src/common/guards/`, `src/auth/guards/`)

| Guard | File | Purpose |
|---|---|---|
| `JwtAuthGuard` | `auth/guards/jwt-auth.guard.ts` | Validates JWT Bearer token |
| `OptionalJwtAuthGuard` | `auth/guards/optional-jwt.auth.guard.ts` | JWT if present, public if not |
| `RolesGuard` | `common/guards/roles.guard.ts` | RBAC using `@Roles()` metadata |

### Interceptors (`src/common/interceptors/`)

| Interceptor | File | Purpose |
|---|---|---|
| `TransformInterceptor` | `transform.interceptor.ts` | Wraps all responses in `{ meta, data }` |

Applied globally in `main.ts`.

### Filters (`src/common/filters/`)

| Filter | File | Purpose |
|---|---|---|
| `AllExceptionsFilter` | `http-exception.filter.ts` | Catches all exceptions, returns `{ meta, data: null }` |

Applied globally in `main.ts`.

### Base Schema (`src/common/schemas/base-schema.ts`)

All Mongoose schemas must extend `BaseSchema`. It provides soft-delete fields excluded from queries by default.

```typescript
export class BaseSchema {
  @Prop({ type: Boolean, default: false, select: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null, select: false })
  deletedAt: Date;

  // Auto-added via @Schema({ timestamps: true })
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Global Configuration

### Files

| File | Responsibility |
|---|---|
| `src/config/app.config.ts` | App name, port, JWT, Google OAuth, Paystack, Cloudinary, Nodemailer, upload limits, commission rates |
| `src/config/database.config.ts` | MongoDB URI |
| `src/config/contants.ts` | All enums and role/plan constants |

### Key Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/comaket` | Database connection |
| `JWT_SECRET` | — | JWT signing key |
| `JWT_EXPIRES_IN` | `30d` | Token expiry |
| `GOOGLE_CLIENT_ID` | — | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth |
| `PAYSTACK_SECRET_KEY` | — | Paystack API |
| `CLOUDINARY_CLOUD_NAME` | — | Media hosting |
| `CLOUDINARY_API_KEY` | — | Media hosting |
| `CLOUDINARY_API_SECRET` | — | Media hosting |
| `MAIL_HOST` | — | SMTP server |
| `MAIL_USER` | — | SMTP username |
| `MAIL_PASS` | — | SMTP password |
| `CORS_ORIGIN` | `localhost:3000,3001` | Allowed origins |

---

## Enums & Constants

**File:** `src/config/contants.ts`

### UserRole
```typescript
enum UserRole { User, Creator, Admin, SuperAdmin }
```

### AuthProvider
```typescript
enum AuthProvider { Local, Google }
```

### CreatorPlan
```typescript
enum CreatorPlan { Starter, Pro, Business }
// Starter: free (1 store)
// Pro: ₦3,000/mo (3 stores, featured works)
// Business: ₦8,000/mo (unlimited stores)
```

### ListingType (Core Business Logic)
```typescript
enum ListingType { SelfListing, Consignment, DirectPurchase }
// SelfListing:    Creator lists & ships own item — 5% platform commission
// Consignment:    Platform holds item, ships for creator — 10–15% commission
// DirectPurchase: Platform buys item outright from creator
```

### ListingStatus (Full Workflow)
```
Draft → InReview → Approved | Rejected
Approved → AwaitingFee → AwaitingProduct → PriceOffered ↔ CounterOffer
→ Live → Sold | Suspended | Expired | Delisted
```

### OrderStatus
```
Pending → Confirmed → Processing → Shipped → Delivered → Completed
                                                        ↘ Cancelled → Refunded
```

### PaymentStatus
```
Pending → Processing → Success | Failed | Refunded
```

### NotificationType
Listing status changes, order updates, payment events, follow events.

---

## Response Format Contract

All responses — success and error — follow this exact shape. Never return raw objects from controllers.

### Success Response
```json
{
  "meta": {
    "statusCode": 200,
    "success": true,
    "message": "Custom message or 'Success'",
    "timestamp": "2026-03-10T10:30:45.123Z",
    "path": "/api/v1/listings"
  },
  "data": { }
}
```

### Success Response with Pagination
```json
{
  "meta": {
    "statusCode": 200,
    "success": true,
    "message": "Success",
    "timestamp": "...",
    "path": "/api/v1/listings?page=1&perPage=20",
    "pagination": {
      "total": 150,
      "page": 1,
      "perPage": 20,
      "totalPages": 8
    }
  },
  "data": [ ]
}
```

### Auth Response (token injected into meta)
```json
{
  "meta": {
    "statusCode": 201,
    "success": true,
    "message": "Registration successful",
    "timestamp": "...",
    "path": "/api/v1/auth/register",
    "token": "eyJhbGci..."
  },
  "data": { }
}
```

### Error Response
```json
{
  "meta": {
    "statusCode": 400,
    "success": false,
    "message": "Validation failed",
    "timestamp": "...",
    "path": "/api/v1/auth/register",
    "errors": ["email should not be empty", "firstName is too short"]
  },
  "data": null
}
```

---

## Patterns & Conventions

### Adding a New Module (Checklist)

1. Create folder: `src/{feature}/`
2. Create schema extending `BaseSchema` with `@Schema({ timestamps: true })`
3. Create service injecting `@InjectModel(Entity.name)`
4. Create controller with `@ApiTags('{feature}')` and guard decorators
5. Create DTOs using `class-validator` + `@ApiProperty()`
6. Register schema in module with `MongooseModule.forFeature([...])`
7. Import module in `src/app.module.ts`
8. Export service if consumed by other modules

### Controller Template

```typescript
@ApiTags('feature')
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Item created')
  @Post()
  create(@GetUser('sub') userId: string, @Body() dto: CreateFeatureDto) {
    return this.featureService.create(userId, dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.featureService.findAll(pagination);
  }
}
```

### Service Template

```typescript
@Injectable()
export class FeatureService {
  constructor(@InjectModel(Feature.name) private featureModel: Model<Feature>) {}

  async create(userId: string, dto: CreateFeatureDto): Promise<Feature> {
    const existing = await this.featureModel.findOne({ ... });
    if (existing) throw new ConflictException('Already exists');
    return this.featureModel.create({ ...dto, user: userId });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponse<Feature>> {
    const { page, perPage, sort, search } = pagination;
    const skip = (page - 1) * perPage;
    const filter = { isDeleted: { $ne: true }, ...(search && { title: new RegExp(search, 'i') }) };
    const [items, total] = await Promise.all([
      this.featureModel.find(filter).sort({ [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 }).skip(skip).limit(perPage),
      this.featureModel.countDocuments(filter),
    ]);
    return { items, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }
}
```

### DTO Template

```typescript
export class CreateFeatureDto {
  @ApiProperty({ example: 'My Item' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFeatureDto extends PartialType(CreateFeatureDto) {}
```

---

## External Services

| Service | Package | Config Key | Purpose |
|---|---|---|---|
| MongoDB | `mongoose`, `@nestjs/mongoose` | `MONGODB_URI` | Primary database |
| Cloudinary | `cloudinary` v2.9 | `CLOUDINARY_*` | Image/video uploads (5MB max, 10 files max) |
| Paystack | `axios` (HTTP) | `PAYSTACK_SECRET_KEY` | Payment processing & payouts |
| Google OAuth | `passport-google-oauth20` | `GOOGLE_CLIENT_*` | Social authentication |
| Nodemailer | `nodemailer` v8 | `MAIL_*` | Transactional emails (OTP, password reset, notifications) |

---

*Last updated: 2026-03-10*
