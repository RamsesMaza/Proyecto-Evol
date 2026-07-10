# Documentación Técnica - Pro Evol (American Certification Service)

Plataforma educativa y comercial fullstack con paneles por roles, autenticación avanzada,
cursos tipo Canvas/Blackboard, e-commerce, módulo de cotizaciones, marketing, y más.

---

## 1. Arquitectura de Software

### 1.1 Estilo Arquitectónico General

**Monolito Modular** (no microservicios). Backend y frontend separados en dos carpetas dentro de un mismo repositorio, pero el backend sirve el frontend compilado como archivos estáticos en producción. Esto evita la complejidad de microservicios (red, despliegue independiente, consistencia eventual) mientras mantiene una separación clara de responsabilidades.

```
┌─────────────────────────────────────────────────────┐
│                    Railway (Docker)                  │
│  ┌──────────────────────────────────────────────┐   │
│  │         Express Server (Node.js)              │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │ Routes  │→│Controller│→│   Models      │   │   │
│  │  │ (REST)  │ │(Validate)│ │(Business Logic)│   │   │
│  │  └────┬────┘ └────┬─────┘ └──────┬───────┘   │   │
│  │       │           │              │           │   │
│  │  ┌────▼───────────▼──────────────▼───────┐   │   │
│  │  │          Middleware Chain              │   │   │
│  │  │  (Auth, Roles, RateLimit, Error)      │   │   │
│  │  └────────────────────────────────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │ Prisma   │ │ Passport │ │ External API  │   │   │
│  │  │ ORM (DB) │ │ (Google) │ │ (Brevo, MP,   │   │   │
│  │  │          │ │          │ │  Twilio,      │   │   │
│  │  │          │ │          │ │  reCAPTCHA)   │   │   │
│  │  └──────────┘ └──────────┘ └──────────────┘   │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │      Static Files (React SPA compilada)  │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│                      ↑ HTTP/HTTPS                    │
│              ┌───────────────┐                        │
│              │  Browser      │                        │
│              │  (React SPA)  │                        │
│              └───────────────┘                        │
└─────────────────────────────────────────────────────┘
```

### 1.2 Patrón Arquitectónico Backend: MVC + Service Layer

El backend implementa una variante del patrón **Modelo-Vista-Controlador (MVC)** adaptada a APIs REST, donde la "Vista" son los JSON responses y el "Modelo" se divide en dos sub-capas:

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **Routes** | `routes/` | Definición de endpoints, HTTP method, path, middleware chain |
| **Controller** | `controllers/` | Validación de entrada (Zod), orquestación, response HTTP, manejo de errores |
| **Service/Model** | `models/` | Lógica de negocio, reglas de dominio, operaciones con base de datos |
| **Data Access** | Prisma ORM | Queries a MySQL, migraciones, typing |

**Flujo de una solicitud:**

```
HTTP Request
    ↓
Middleware global (helmet, cors, rate-limit, cookie-parser, passport)
    ↓
Route matching (/api/auth/login)
    ↓
Middleware específico (authenticate, requireRole)
    ↓
Controller.validate (Zod schema validation)
    ↓
Controller method (orquesta, llama a Model)
    ↓
Model method (lógica de negocio, Prisma queries)
    ↓
Prisma ORM → MySQL
    ↓
Response JSON ← Controller ← Model
    ↓
Error? → errorHandler (AppError → status code, ZodError → 400, resto → 500 + Sentry)
```

### 1.3 Patrón Arquitectónico Frontend: Component-Based + Context/Provider

El frontend sigue la arquitectura de **Componentes de React** con **Context API** para estado global y **SCSS Modules** para estilos encapsulados.

```
┌─────────────────────────────────────────────────┐
│                    App                           │
│  ┌───────────────────────────────────────────┐  │
│  │          Provider Tree                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │  Auth    │ │  Toast   │ │   Cart   │  │  │
│  │  │ Provider │ │ Provider │ │ Provider │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │              Router (React Router)         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │  /       │ │  /login  │ │ /panel   │  │  │
│  │  │  (Home)  │ │  (Auth)  │ │(Paneles) │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │           Lazy Loading (Suspense)          │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │      ErrorBoundary (React Component)       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 1.4 Capas del Frontend

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **Pages** | `pages/` | Páginas completas (lazy loaded), composición de componentes |
| **Components** | `components/` | UI components agrupados por feature/panel |
| **Context** | `context/` | Estado global (auth, cart, toast) |
| **Services** | `services/` | Clientes HTTP, llamadas a API |
| **Styles** | `styles/` + `.module.scss` | Estilos globales y por componente |

### 1.5 Arquitectura General del Sistema

```
Monorepo (Pro Evol)
│
├── backend/          → API REST (Express + Prisma + MySQL)
│   ├── src/
│   │   ├── index.ts  → Bootstrap: middlewares, routes, static files, graceful shutdown
│   │   ├── routes/   → Definición de endpoints
│   │   ├── controllers/ → Validación y orquestación
│   │   ├── models/    → Lógica de negocio y acceso a datos
│   │   ├── middleware/ → Cross-cutting: auth, roles, validación, errores
│   │   ├── lib/       → Utilidades: JWT, email, SMS, logger, Sentry
│   │   └── shared/    → Código compartido: errores personalizados
│   ├── prisma/        → Schema + seeds
│   └── Dockerfile
│
├── front/            → SPA (React + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/    → Lazy-loaded pages
│   │   ├── components/ → UI components por panel
│   │   ├── context/  → Estado global (Auth, Cart, Toast)
│   │   ├── services/ → API clients
│   │   ├── routes/   → Router config
│   │   └── styles/   → Global styles
│   └── vite.config.ts
│
├── railway.json      → Config Railway
├── Dockerfile         → Multi-stage build
└── .github/workflows/ci.yml → CI/CD
```

### 1.6 Patrones de Diseño Implementados

| Patrón | Implementación | Ubicación |
|--------|---------------|-----------|
| **MVC (Modelo-Vista-Controlador)** | Separación en routes/controllers/models con responsabilidades bien definidas | `routes/`, `controllers/`, `models/` |
| **Service Layer** | Los Models encapsulan toda la lógica de negocio; los controllers son delgados | `models/AuthModel.ts`, `models/CourseModel.ts` |
| **Repository** | Prisma ORM abstrae el acceso a datos subyacente (MySQL) | Toda consulta a DB vía `prisma.*` |
| **Singleton** | Instancia única del cliente Prisma, logger Pino, conexiones externas | `lib/prisma.ts`, `lib/logger.ts` |
| **Factory** | Creación de errores personalizados según el tipo (`AppError`, `ValidationError`, `UnauthorizedError`) | `shared/errors.ts` |
| **Strategy** | Estrategia de autenticación intercambiable (JWT, Google OAuth) | `lib/passport.ts`, `middleware/auth.ts` |
| **Chain of Responsibility (Middleware Chain)** | Pipeline de middlewares de Express: cada middleware decide si procesa o pasa al siguiente | `index.ts` (app.use), `routes/*.ts` |
| **Decorator** | Los middlewares `authenticate`, `requireRole`, `validate` "decoran" los handlers añadiendo comportamiento | `middleware/auth.ts`, `middleware/roleGuard.ts`, `middleware/validate.ts` |
| **Adapter** | Adaptadores para servicios externos (Brevo email, Twilio SMS, MercadoPago, reCAPTCHA) | `lib/email.ts`, `lib/sms.ts` |
| **Observer / Pub-Sub** | Sistema de notificaciones: eventos → notificaciones a usuarios | `models/NotificationModel.ts`, WebSocket (futuro) |
| **Proxy** | Vite dev server proxy: `/api` → `localhost:3000` | `vite.config.ts` |
| **Lazy Loading** | React.lazy() + Suspense para carga diferida de páginas | `routes/AppRouter.tsx` |
| **Provider / Context** | Inyección de estado global vía React Context API | `context/AuthContext.tsx`, `context/CartContext.tsx` |
| **Error Boundry** | Captura de errores en el árbol de componentes React | `components/ErrorBoundary.tsx` |
| **Debounced Save** | Actualización diferida del progreso de cursos (localStorage + API) | `components/UserPanel/Courses/CourseView.tsx` |
| **DTO (Data Transfer Object)** | Los controladores devuelven objetos planos (no entidades de BD) con solo los campos necesarios | Todos los controllers (`res.json(...)`) |
| **Rate Limiter** | Control de tasa de solicitudes por ruta | `index.ts`, `routes/auth.routes.ts` |
| **Graceful Shutdown** | Captura de SIGTERM/SIGINT para cerrar conexiones limpiamente | `index.ts:137-147` |

### 1.7 Principios SOLID Aplicados

| Principio | Aplicación |
|-----------|-----------|
| **S**ingle Responsibility | Cada archivo tiene una responsabilidad única: routes definen rutas, controllers validan/orquestan, models tienen lógica de negocio, lib/ tiene utilidades |
| **O**pen/Closed | Nuevos módulos se agregan creando nuevos archivos en routes/controllers/models sin modificar los existentes. Ej: agregar un módulo `reports` requiere crear `reports.routes.ts` + `ReportsController.ts` + `ReportsModel.ts` |
| **L**iskov Substitution | Las clases de error (`AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`) son intercambiables; todas son capturadas por `errorHandler` |
| **I**nterface Segregation | Los schemas Zod definen contratos específicos para cada operación (loginSchema, registerSchema, etc.) en lugar de un schema de Usuario gigante |
| **D**ependency Inversion | Los controllers dependen de abstracciones (Models), no de implementaciones concretas de BD. Prisma ORM es una abstracción sobre MySQL |

### 1.8 Flujo de Datos Completo: Login con 2FA

```
Browser                          Backend                              MySQL
  │                                 │                                    │
  │  POST /api/auth/login           │                                    │
  │  { email, password, captcha }   │                                    │
  │ ──────────────────────────────► │                                    │
  │                                 │  verifyRecaptcha()                 │
  │                                 │  findUnique({ email })             │
  │                                 │ ──────────────────────────────────►│
  │                                 │ ◄──────────────────────────────────│
  │                                 │  comparePassword()                 │
  │                                 │  if 2FA enabled:                   │
  │                                 │    generatePartialToken()          │
  │                                 │    generateOtp() → send2faOtpEmail │
  │                                 │    create(OtpCode)                 │
  │                                 │ ──────────────────────────────────►│
  │  { requires2FA, method,        │                                    │
  │    partialToken }               │                                    │
  │ ◄────────────────────────────── │                                    │
  │                                 │                                    │
  │  POST /api/auth/verify-2fa      │                                    │
  │  { partialToken, code, captcha }│                                    │
  │ ──────────────────────────────► │                                    │
  │                                 │  verifyRecaptcha()                 │
  │                                 │  verifyToken(partialToken)         │
  │                                 │  findFirst(OtpCode)                │
  │                                 │ ──────────────────────────────────►│
  │                                 │ ◄──────────────────────────────────│
  │                                 │  hashOtp() → compare codes         │
  │                                 │  generateAccessToken()             │
  │                                 │  generateRefreshToken()            │
  │                                 │  create(UserSession)               │
  │                                 │ ──────────────────────────────────►│
  │  { accessToken,                │                                    │
  │    refreshToken (httpOnly),     │                                    │
  │    user: { id, email, role }   │                                    │
  │ ◄────────────────────────────── │                                    │
```

### 1.9 Seguridad en Capas (Defense in Depth)

```
Capa 1: HTTPS (TLS) ─── Railway maneja SSL/TLS automáticamente
Capa 2: Helmet ──────── HTTP headers de seguridad (CSP, XSS, etc.)
Capa 3: CORS ────────── Orígenes permitidos configurados
Capa 4: Rate Limiting ── 100 req/15min general, 20 auth, 5 OTP, 3 password reset
Capa 5: reCAPTCHA v2 ── "No soy un robot" en formularios públicos
Capa 6: JWT ─────────── Access token (15min) + Refresh token (7d, httpOnly)
Capa 7: Account Lockout - 5 intentos fallidos → bloqueo 15 min
Capa 8: 2FA ─────────── Segundo factor obligatorio (opcional por usuario)
Capa 9: Role Guard ──── Autorización por rol en cada endpoint
Capa 10: Permission Check - Permisos granulares por módulo (52 permisos)
Capa 11: Input Validation - Zod schema validation en cada request
Capa 12: Error Handling - No exponer stack traces en producción, Sentry
```

---

## 2. Stack Tecnológico General

| Componente | Tecnología | Versión | Propósito |
|-----------|-----------|---------|-----------|
| Runtime Backend | Node.js | 20+ | Servidor JavaScript |
| Framework API | Express | 5.1.0 | REST API |
| Lenguaje | TypeScript | 5.x / 6.0 | Tipado estático |
| ORM | Prisma | 6.19.3 | Capa de datos / MySQL |
| Base de Datos | MySQL | 8.x | Persistencia |
| Frontend Framework | React | 19.2 | UI declarativa |
| Build Frontend | Vite | 8.0 | Bundler / Dev server |
| Routing SPA | React Router | 7.14 | Navegación cliente |
| Estilos | SCSS Modules | 1.99 | CSS encapsulado |
| Auth Externa | Passport.js | 0.7 | Google OAuth |
| Validación | Zod | 4.4 | Schemas de datos |
| Logging | Pino | 10.3 | Logs estructurados |
| Monitoreo | Sentry | 10.63 | Error tracking |
| Pagos | MercadoPago | 2.12 | Pasarela de pagos |
| PDFs | PDFKit | 0.18 | Generación documentos |
| 2FA/TOTP | Speakeasy | 2.0 | Autenticación 2FA |
| QR | QRCode | 1.5 | QR codes |
| SMS | Twilio | 6.0 | Mensajería SMS |
| Email | Brevo (REST) | - | Transaccional |
| CAPTCHA | reCAPTCHA v2 | 3.1 | Anti-bot |
| Gráficos | Recharts | 3.8 | Visualización datos |
| Notificaciones UI | react-icons | 5.6 | Iconos |
| Docker | node:20-alpine | - | Contenedor |

---

## 3. Backend (`backend/`)

### 3.1 Stack

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelo de datos (22 tablas)
│   ├── seed.ts                # Seed básico (categorías, productos, 6 usuarios)
│   ├── seed-full.ts           # Seed completo (12 meses datos + 52 permisos)
│   └── seed-permissions.ts    # Seed solo permisos (52 permisos)
├── src/
│   ├── index.ts               # Entry point: Express app, routes, static files
│   ├── controllers/           # Controladores por módulo
│   │   ├── AuthController.ts
│   │   ├── CourseController.ts
│   │   ├── TiDashboardController.ts
│   │   ├── ProductsController.ts
│   │   ├── OrdersController.ts
│   │   ├── UsersController.ts
│   │   ├── CategoriesController.ts
│   │   ├── CotizacionesController.ts
│   │   ├── NotificationsController.ts
│   │   ├── SettingsController.ts
│   │   ├── MarketingController.ts
│   │   ├── ReportsController.ts
│   │   ├── CertificatesController.ts
│   │   └── MessagesController.ts
│   ├── models/                # Lógica de negocio (Model layer)
│   │   ├── AuthModel.ts
│   │   ├── CourseModel.ts
│   │   ├── LoginAttemptModel.ts
│   │   └── ...
│   ├── routes/                # Definición de rutas Express
│   │   ├── auth.routes.ts
│   │   ├── courses.routes.ts
│   │   ├── products.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── payments.routes.ts
│   │   ├── users.routes.ts
│   │   ├── cotizaciones.routes.ts
│   │   ├── admin-ti.routes.ts
│   │   ├── notifications.routes.ts
│   │   ├── settings.routes.ts
│   │   ├── marketing.routes.ts
│   │   ├── reports.routes.ts
│   │   ├── certificates.routes.ts
│   │   └── messages.routes.ts
│   ├── middleware/
│   │   ├── auth.ts            # authenticate + requireAdmin
│   │   ├── roleGuard.ts       # requireRole(...roles)
│   │   ├── validate.ts        # Validación Zod
│   │   └── errorHandler.ts    # Manejador global de errores
│   ├── lib/
│   │   ├── auth.ts            # JWT, bcrypt, reCAPTCHA, 2FA/TOTP
│   │   ├── passport.ts        # Estrategia Google OAuth
│   │   ├── email.ts           # Brevo REST API (emails transaccionales)
│   │   ├── prisma.ts          # Cliente Prisma singleton
│   │   ├── logger.ts          # Pino logger
│   │   ├── sentry.ts          # Inicialización Sentry
│   │   └── sms.ts             # Twilio SMS
│   └── shared/
│       └── errors.ts          # Clases de error personalizadas
└── Dockerfile                 # Multi-stage build
```

### 3.3 API Routes

| Prefix | Módulo | Auth | Roles |
|--------|--------|------|-------|
| `POST /api/auth/register` | Registro | No | - |
| `POST /api/auth/login` | Login | No | - |
| `POST /api/auth/forgot-password` | Recuperación | No | - |
| `POST /api/auth/verify-otp` | Verificar OTP | No | - |
| `POST /api/auth/reset-password` | Reset password | No | - |
| `POST /api/auth/verify-2fa` | Verificar 2FA | No | - |
| `POST /api/auth/2fa/send-otp` | Reenviar 2FA OTP | No | - |
| `GET /api/auth/2fa/status` | Estado 2FA | Sí | - |
| `POST /api/auth/2fa/setup` | Configurar 2FA | Sí | - |
| `POST /api/auth/2fa/confirm` | Confirmar 2FA | Sí | - |
| `POST /api/auth/2fa/disable` | Desactivar 2FA | Sí | - |
| `POST /api/auth/refresh` | Refresh token | No (cookie) | - |
| `POST /api/auth/logout` | Logout | No (cookie) | - |
| `GET /api/auth/me` | Perfil actual | Sí | - |
| `GET /api/auth/google` | Google OAuth | No | - |
| `GET /api/auth/google/callback` | Callback Google | No | - |
| `GET /api/products` | Listar productos | No | - |
| `GET/POST/PUT/DELETE /api/products/*` | CRUD productos | Sí | ADMIN, SALES |
| `GET /api/categories` | Listar categorías | No | - |
| `GET /api/orders` | Listar pedidos | Sí | - |
| `POST /api/orders` | Crear pedido | Sí | - |
| `GET /api/users/clientes/stats` | Estadísticas clientes | Sí | ADMIN, SALES |
| `GET/POST/PUT/DELETE /api/users/clientes` | CRUD clientes | Sí | ADMIN, SALES |
| `GET /api/cotizaciones` | Cotizaciones | Sí | ADMIN, SALES |
| `POST /api/cotizaciones` | Crear cotización | Sí | ADMIN, SALES |
| `GET /api/admin-ti/dashboard` | Dashboard TI | Sí | ADMIN, TI |
| `GET /api/admin-ti/users` | Gestión usuarios | Sí | ADMIN, TI |
| `GET/POST /api/admin-ti/permissions` | Permisos | Sí | ADMIN, TI |
| `GET /api/admin-ti/audit` | Auditoría | Sí | ADMIN, TI |
| `GET /api/courses` | Cursos publicados | Sí | Todos |
| `GET/POST/PUT/DELETE /api/courses/*` | CRUD cursos | Sí | ADMIN, AUDITOR |
| `POST /api/courses/:id/enroll` | Inscribirse | Sí | USER |
| `PATCH /api/courses/:id/progress` | Actualizar progreso | Sí | USER |
| `GET /api/certificates` | Certificados | Sí | - |
| `GET /api/messages` | Mensajes | Sí | - |
| `GET /api/notifications` | Notificaciones | Sí | - |
| `GET /api/settings` | Configuración | Sí | ADMIN, TI |
| `GET /api/marketing` | Campañas marketing | Sí | ADMIN, MARKETING |
| `GET /api/reports` | Reportes | Sí | ADMIN |
| `GET /api/payments` | Pagos | Sí | - |
| `GET /api/health` | Health check | No | - |

### 3.4 Autenticación y Seguridad

#### JWT (lib/auth.ts)
- **Access token**: 15 minutos de expiración
- **Refresh token**: 7 días, almacenado en httpOnly cookie + tabla `UserSession`
- **Partial token**: 5 minutos, para flujo 2FA
- **Rotación de refresh tokens**: cada refresh invalida el anterior

#### reCAPTCHA v2 ("No soy un robot")
- Verificado en backend vía `verifyRecaptcha()` -> `POST https://www.google.com/recaptcha/api/siteverify`
- No bloqueante: si no hay token o falla, permite el paso con advertencia
- Configurado en todas las rutas de auth (login, register, forgot-password, verify-otp, reset-password, 2fa)

#### 2FA (Autenticación de Dos Factores)
- **Métodos**: Email (OTP), SMS (Twilio), Authenticator (TOTP)
- OTP: 6 dígitos, 5 minutos de expiración, máximo 5 intentos
- Cooldown de 60 segundos entre reenvíos
- Backup codes: 8 códigos de 8 dígitos

#### Rate Limiting
- General: 100 requests / 15 min
- Auth: 20 requests / 15 min
- OTP: 5 requests / 15 min
- Password reset: 3 requests / hora

#### Lockout de cuentas
- 5 intentos fallidos -> 15 minutos de bloqueo
- Contador se resetea al iniciar sesión exitosamente

#### Google OAuth (passport.ts)
- Estrategia `passport-google-oauth20`
- Login automático si el email ya existe (vincula googleId)
- Creación de usuario nuevo si no existe
- Redirección post-login: `{FRONTEND_URL}/login?token=JWT`

### 3.5 Middleware

- **authenticate**: Valida Bearer token JWT, inyecta `req.user`
- **requireAdmin**: Verifica rol ADMIN
- **requireRole(...roles): Verifica que `req.user.role` esté en la lista
- **validate(schema)**: Valida `req.body` con Zod
- **errorHandler**: Captura AppError, ZodError, errores no manejados -> Sentry

### 3.6 Base de Datos (Prisma Schema)

22 modelos principales:

| Modelo | Descripción |
|--------|-------------|
| User | Usuarios del sistema (6 roles: ADMIN, USER, SALES, TI, MARKETING, AUDITOR) |
| OtpCode | Códigos OTP para recuperación y 2FA |
| Category | Categorías de productos |
| Product | Productos del e-commerce |
| Review | Reseñas de productos |
| ProductImage | Imágenes de productos |
| ProductSpec | Especificaciones técnicas |
| Order | Pedidos |
| OrderItem | Items de pedidos |
| Cotizacion | Cotizaciones |
| CotizacionItem | Items de cotización |
| CotizacionActividad | Actividad/historial de cotización |
| Permission | Permisos del sistema |
| RolePermission | Asignación permiso-rol |
| AuditLog | Auditoría de acciones |
| SupportTicket | Tickets de soporte |
| LoginAttempt | Intentos de login |
| UserSession | Sesiones activas (refresh tokens) |
| Notification | Notificaciones |
| SystemSetting | Configuración del sistema |
| Lead | Leads de marketing |
| LeadActivity | Actividad de leads |
| Campaign | Campañas de marketing |
| CampaignResult | Resultados de campañas |
| EmailCampaign | Campañas email |
| SmsCampaign | Campañas SMS |
| Segment | Segmentos de usuarios |
| SegmentMember | Miembros de segmentos |
| Certificate | Certificados |
| Course | Cursos |
| CourseModule | Módulos de cursos |
| CourseMaterial | Materiales de módulos |
| CourseEnrollment | Inscripciones a cursos |
| Message | Mensajería interna |

### 3.7 Sistema de Permisos (52 permisos, 12 módulos)

| Módulo | Permisos | ADMIN | TI | SALES | USER |
|--------|----------|-------|----|-------|------|
| dashboard | view_dashboard, view_sales_chart, view_revenue_chart | ✓ | ✓ | ✓ | ✓ |
| users | view_users, create_users, edit_users, delete_users, view_user_detail | ✓ | ✓ | - | - |
| products | view_products, create_products, edit_products, delete_products | ✓ | ✓ | ✓ | - |
| orders | view_orders, create_orders, edit_orders, delete_orders, manage_order_status | ✓ | ✓ | ✓ | - |
| clientes | view_clientes, create_clientes, edit_clientes, delete_clientes | ✓ | ✓ | ✓ | - |
| finances | view_finances, manage_payments, view_invoices, manage_refunds | ✓ | ✓ | - | - |
| support | view_tickets, create_tickets, assign_tickets, resolve_tickets | ✓ | ✓ | ✓ | ✓ |
| audit | view_audit_log, export_audit_log | ✓ | ✓ | - | - |
| permissions | view_permissions, manage_permissions | ✓ | ✓ | - | - |
| sessions | view_sessions, revoke_sessions | ✓ | ✓ | - | - |
| security | manage_2fa, view_security_logs | ✓ | ✓ | - | ✓ |
| marketing | view_campaigns, create_campaigns, edit_campaigns, delete_campaigns, manage_leads | ✓ | ✓ | - | - |

### 3.8 Seed Data

- **seed.ts**: Categorías, productos, 6 usuarios (uno por rol: ADMIN, USER, SALES, TI, MARKETING, AUDITOR)
- **seed-full.ts**: 12 meses de datos de negocio (pedidos, cotizaciones) + 52 permisos
- **seed-permissions.ts**: Solo los 52 permisos con asignación por rol
- **Ejecución en Docker**: `seed.ts` se ejecuta sincrónicamente, `seed-full.ts` en background (&)

### 3.9 Email Transaccional (Brevo)

- API REST vía `fetch()` (sin SDK)
- Templates HTML para: recuperación de contraseña, 2FA, facturas
- Adjunta PDF de factura a emails de confirmación de pedido
- Siempre loguea el código OTP en consola como fallback
- Puerto 25/465/587 bloqueado en Railway -> usa HTTPS (443)

---

## 4. Frontend (`front/`)

### 4.1 Stack
| Componente | Versión | Propósito |
|-----------|---------|-----------|
| React | 19.2 | UI Library |
| TypeScript | 6.0 | Tipado |
| Vite | 8.0 | Build tool / dev server |
| React Router | 7.14 | Routing SPA |
| SCSS Modules | 1.99 | Estilos encapsulados |
| Recharts | 3.8 | Gráficos |
| react-icons | 5.6 | Iconos |
| react-google-recaptcha | 3.1 | reCAPTCHA v2 widget |
| react-datepicker | 9.1 | Selector de fechas |
| Sentry React | 10.63 | Monitoreo |

### 4.2 Estructura de directorios

```
front/
├── src/
│   ├── main.tsx               # Entry point
│   ├── App.tsx                 # Router + Providers (Auth, Toast, Cart)
│   ├── app.module.scss
│   ├── pages/                  # Páginas (lazy loaded)
│   │   ├── Home.tsx
│   │   ├── Nosotros.tsx
│   │   ├── Solicitudes.tsx
│   │   ├── Servicios.tsx
│   │   ├── Contacto.tsx
│   │   ├── Blog.tsx / BlogPost.tsx
│   │   ├── VerifyCertificate.tsx
│   │   ├── Auth.tsx            # Login/Register/ForgotPassword
│   │   ├── ProductDetail.tsx
│   │   ├── Checkout.tsx / OrderConfirmation.tsx / PendingPayment.tsx
│   │   └── UserPanel.tsx      # Panel router por rol
│   ├── components/
│   │   ├── header/             # Header público
│   │   ├── footer/             # Footer público
│   │   ├── Auth/               # LoginForm, RegisterForm, TwoFactorForm, ForgotPasswordForm
│   │   ├── UserPanel/          # Panel USER
│   │   │   ├── UserPanel.tsx   # Layout del panel usuario
│   │   │   ├── Courses/        # Courses.tsx, CourseView.tsx, CourseCard.tsx, etc.
│   │   │   ├── Profile/        # Perfil de usuario
│   │   │   ├── Orders/         # Historial de pedidos
│   │   │   ├── Certificates/   # Certificados
│   │   │   └── Messages/       # Mensajería
│   │   ├── SalesPanel/         # Panel rol SALES
│   │   │   ├── SalesPanel.tsx
│   │   │   ├── SalesClientes.tsx
│   │   │   ├── SalesProductos.tsx
│   │   │   └── SalesOrders.tsx
│   │   ├── AdminTiPanel/       # Panel rol TI
│   │   │   ├── AdminTiPanel.tsx
│   │   │   ├── AdminTiDashboard.tsx
│   │   │   ├── AdminTiUsers.tsx
│   │   │   ├── AdminTiRoles.tsx
│   │   │   ├── AdminTiAudit.tsx
│   │   │   └── AdminTiSettings.tsx
│   │   ├── AdminPanel/         # Panel rol ADMIN
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── ...
│   │   ├── MarketingPanel/     # Panel rol MARKETING
│   │   │   ├── MarketingPanel.tsx
│   │   │   ├── MarketingCampaigns.tsx
│   │   │   └── MarketingLeads.tsx
│   │   ├── AuditorPanel/       # Panel rol AUDITOR
│   │   │   ├── AuditorPanel.tsx
│   │   │   └── AuditorCourses.tsx
│   │   ├── CartDrawer/         # Carrito lateral
│   │   └── ui/                 # Componentes reutilizables
│   │       └── Skeleton.tsx    # Loading skeletons
│   ├── context/
│   │   ├── AuthContext.tsx     # Estado de autenticación global
│   │   ├── CartContext.tsx     # Estado del carrito
│   │   └── ToastContext.tsx    # Sistema de notificaciones toast
│   ├── services/               # API clients
│   │   ├── httpClient.ts       # Cliente HTTP genérico (refresh automático)
│   │   ├── authApi.ts
│   │   ├── productsApi.ts
│   │   ├── ordersApi.ts
│   │   ├── clientesApi.ts
│   │   ├── coursesApi.ts
│   │   ├── adminTiApi.ts
│   │   └── ...
│   ├── routes/
│   │   └── AppRouter.tsx       # Definición de rutas (lazy loading)
│   └── styles/
│       └── main.scss           # Estilos globales
└── vite.config.ts              # Proxy /api -> localhost:3000
```

### 4.3 Paneles por Rol

El archivo `UserPanel.tsx` es un router que renderiza el panel según el rol:

```
user?.role === "SALES"    -> <SalesPanel />
user?.role === "TI"       -> <AdminTiPanel />
user?.role === "ADMIN"    -> <AdminPanel />
user?.role === "MARKETING" -> <MarketingPanel />
user?.role === "AUDITOR"  -> <AuditorPanel />
default                   -> <UserPanel />
```

#### Panel USER
- Dashboard personal con pedidos recientes, certificados, cursos
- Cursos: vista tipo Canvas/Blackboard con barra de progreso, módulos, materiales
- CourseView: progreso real vía toggle de materiales (localStorage + API debounced)
- Perfil, edición de datos, cambio de contraseña
- Historial de pedidos y certificados
- Mensajería interna

#### Panel SALES
- Dashboard con estadísticas de ventas
- Gestión de clientes (CRUD)
- Gestión de productos (CRUD, compartido con ADMIN)
- Gestión de pedidos y cotizaciones

#### Panel TI
- Dashboard con estadísticas del sistema (usuarios nuevos, órdenes, revenue)
- Gestión de usuarios (CRUD con modales, badges por rol/estado, paginación)
- Gestión de roles y permisos (tarjetas por rol, toggles por permiso, progreso)
- Auditoría (filtros por acción/entidad/fecha, badges de colores, IP copiable)
- Configuración del sistema

#### Panel ADMIN
- Dashboard completo (ventas, revenue, órdenes, usuarios)
- Acceso a todos los módulos del sistema
- Gestión de productos, categorías, pedidos, usuarios

#### Panel MARKETING
- Campañas (email, SMS, redes, eventos)
- Leads (gestión, seguimiento, actividades)
- Segmentos de usuarios

#### Panel AUDITOR
- Gestión de cursos estilo Canvas (dashboard + manage)
- Módulos con edición inline, drag handle, búsqueda
- Materiales por tipo (PDF, PPT, DOC, Video, Link) con iconos y colores
- Vista previa de curso como lo ve el usuario

### 4.4 Autenticación Frontend

AuthContext maneja:
- `user`, `token`, `isAuthenticated`, `loading`
- `partialToken`, `twoFactorRequired`, `twoFactorMethod` (flujo 2FA)
- `login(user, accessToken)`, `logout()`, `updateUser(data)`
- Restaura sesión desde localStorage al montar
- Refresh automático si hay cookie httpOnly pero no accessToken

httpClient:
- `api<T>(base, path, options)` -> fetch con auth headers
- Refresh automático en 401 (con deduplicación de llamadas concurrentes)
- Redirección a `/login` si refresh falla
- `apiFormData<T>` para subida de archivos

### 4.5 reCAPTCHA v2 en Frontend

- Componente `<ReCAPTCHA ref={recaptchaRef} sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} />`
- Renderizado en LoginForm, RegisterForm, TwoFactorForm, ForgotPasswordForm
- `recaptchaRef.current.getValue()` antes de enviar formulario
- `.captchaWrap` CSS para centrar el widget
- `VITE_RECAPTCHA_SITE_KEY` debe estar disponible **en tiempo de compilación** (Docker ARG)

### 4.6 Estilos (SCSS Modules)

- Estética Blackboard/Canvas: color primario `#7c3aed` (púrpura)
- Tarjetas con sombras, bordes redondeados, diseño limpio
- Responsive, animaciones suaves en hover
- Skeletons de carga (PageSkeleton) con variantes por página
- ErrorBoundary con UI de recarga

---

## 5. Despliegue (Railway + Docker)

### 5.1 Dockerfile (backend/Dockerfile)

Multi-stage:
1. **frontend-builder** (node:20-alpine): Compila frontend con Vite, acepta `ARG VITE_RECAPTCHA_SITE_KEY`
2. **builder**: Compila backend TypeScript
3. **runner**: Copia dist + node_modules + prisma + frontend dist

CMD ejecuta:
1. `prisma db push --accept-data-loss`
2. `tsx prisma/seed.ts` (sincrónico)
3. `tsx prisma/seed-full.ts &` (background, no bloquea)
4. `node dist/index.js`

### 5.2 railway.json

```json
{ "build": { "builder": "DOCKERFILE", "dockerfilePath": "backend/Dockerfile" } }
```

### 5.3 Variables de Entorno Requeridas

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Secreto para firmar JWT |
| `RECAPTCHA_SECRET_KEY` | Secret key de reCAPTCHA v2 |
| `VITE_RECAPTCHA_SITE_KEY` | Site key de reCAPTCHA v2 (build arg en Railway) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | URL de callback OAuth (ej: `https://dominio.railway.app/api/auth/google/callback`) |
| `FRONTEND_URL` | URL del frontend (ej: `https://dominio.railway.app`) |
| `CORS_ORIGIN` | Origen permitido por CORS |
| `BREVO_API_KEY` | API key de Brevo |
| `BREVO_FROM` | Email remitente (verificado en Brevo) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de MercadoPago |
| `TWILIO_ACCOUNT_SID` | Twilio SID (para SMS) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Número Twilio |
| `LOG_LEVEL` | Nivel de logging (debug, info, warn, error) |
| `SENTRY_DSN` | DSN de Sentry |

### 5.4 CI/CD (GitHub Actions)

Archivo: `.github/workflows/ci.yml`

- Trigger: push a `main` y `develop`
- Jobs: `backend-tests` y `frontend-build` (paralelos)
- MySQL 8 como service container (127.0.0.1, no localhost)
- `npm install` en vez de `npm ci` (compatibilidad Windows/Linux)
- `prisma db push` antes de tests
- `npx vite build` para frontend (sin `tsc -b` por errores pre-existentes)
- Docker build y push a ghcr.io (tag en minúsculas)

---

## 6. Modelo de Datos - Relaciones Clave

```
User 1---* UserSession
User 1---* OtpCode
User 1---* Order
User 1---* CourseEnrollment
User 1---* Certificate
User 1---* Message (sender/receiver)
User 1---* SupportTicket (creator/assignee)
User 1---* Lead (assignee)
User 1---* Campaign (assignee)
User 1---* Segment (creator)
User 1---* SegmentMember

Category 1---* Product
Product 1---* Review
Product 1---* ProductImage
Product 1---* ProductSpec
Product 1---* OrderItem

Order 1---* OrderItem

Course 1---* CourseModule 1---* CourseMaterial
Course 1---* CourseEnrollment

Permission *---* RolePermission *--- Role (string enum)

Campaign 1---* Lead
Campaign 1---* CampaignResult
Campaign 1---* EmailCampaign
Campaign 1---* SmsCampaign
```

---

## 7. Roles del Sistema

| Rol | Etiqueta | Acceso |
|-----|----------|--------|
| ADMIN | Administrador | Todo el sistema |
| USER | Usuario regular | E-commerce, cursos, perfil |
| SALES | Vendedor | Clientes, productos, pedidos, cotizaciones |
| TI | Soporte TI | Usuarios, permisos, auditoría, config |
| MARKETING | Marketing | Campañas, leads, segmentos |
| AUDITOR | Auditor/Creador de cursos | Cursos (CRUD completo) |

---

## 8. Usuarios de Prueba (Seed)

| Email | Rol | Contraseña |
|-------|-----|------------|
| admin@acsperu.com | ADMIN | password123 |
| usuario@acsperu.com | USER | password123 |
| ventas@acsperu.com | SALES | password123 |
| ti@acsperu.com | TI | password123 |
| marketing@acsperu.com | MARKETING | password123 |
| auditor@acsperu.com | AUDITOR | password123 |

---

## 9. Issues Conocidos y Soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| `npm ci` falla en Linux | Lockfile Windows no incluye `@emnapi/core` para Linux | Usar `npm install` |
| `tsc -b` falla en CI | ~85 errores TS pre-existentes | Usar `npx vite build` directo |
| React Error #31 | Backend nombraba `orderStats` como `sales`, shadoweando el conteo de usuarios | Renombrar a `orderStats` en backend y frontend |
| Cannot read properties of undefined (reading 'length') en CourseView | `modules` undefined | `Array.isArray()` guard |
| Cannot read properties of undefined (reading 'length') en AuditorCourses | `activeModules.reduce` con `materials: undefined` | `?.length || 0` y normalizar con `|| []` |
| Railway no reconoce Variables de Entorno VITE_ | Vite embebe VITE_* en build time | Docker `ARG VITE_RECAPTCHA_SITE_KEY` + `ENV` |
| Railway bloquea SMTP | Puertos 25, 465, 587 bloqueados | Usar API REST Brevo (HTTPS 443) |
| Email no se envía | Railway IP dinámica cambia por contenedor | Deshabilitar restricción IP en Brevo |
| Conexión MySQL falla en Railway | IPv6 no disponible, DNS devuelve AAAA | `dns.setDefaultResultOrder('ipv4first')` |

---

## 10. URLs del Proyecto

- **Producción**: `https://proyecto-evol-production.up.railway.app`
- **Frontend dev**: `http://localhost:5173`
- **Backend dev**: `http://localhost:3000`
- **Google OAuth callback**: `https://proyecto-evol-production.up.railway.app/api/auth/google/callback`
