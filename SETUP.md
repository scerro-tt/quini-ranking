# Setup: Quini Ranking System

## Arquitectura

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (local o Railway)
- **Auth**: NextAuth.js
- **Email**: Resend.com
- **ORM**: Prisma
- **Styling**: Tailwind CSS

## Instalación local

### Prerequisitos
- Node.js 18+ 
- PostgreSQL 14+ (local o container)

### 1. Clonar e instalar dependencias

```bash
cd /Users/platomico/Desktop/projects/quini
npm install
```

### 2. Configurar PostgreSQL local

Opción A: Con Homebrew (macOS)
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar el servidor
brew services start postgresql@15

# Crear base de datos
createdb quini_dev
```

Opción B: Con Docker
```bash
docker run --name postgres-quini \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=quini_dev \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Configurar variables de entorno

El archivo `.env.local` ya existe con valores por defecto:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quini_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
RESEND_API_KEY="" # Obtener en https://resend.com
```

Ajusta si tu PostgreSQL tiene credenciales diferentes.

### 4. Ejecutar migraciones de base de datos

```bash
npm run db:push
```

Esto crea todas las tablas según el schema de Prisma.

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app estará en http://localhost:3000

### 6. Probar la app

- Ir a http://localhost:3000
- Registrar una cuenta
- Explorar el dashboard

## Configuración de Emails (Resend)

1. Crear cuenta en https://resend.com
2. Obtener API key
3. Agregar en `.env.local`:
   ```env
   RESEND_API_KEY="re_your_key_here"
   ```

## Estructura del proyecto

```
src/
├── app/                      # Next.js app router
│   ├── api/auth/            # API routes para NextAuth
│   ├── dashboard/           # Páginas protegidas
│   ├── login/               # Página de login
│   ├── register/            # Página de registro
│   └── page.tsx             # Home
├── actions/                 # Server actions
│   └── auth.ts              # Autenticación
├── components/              # Componentes React reutilizables
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── theme-provider.tsx
├── lib/
│   ├── db.ts                # Cliente de Prisma
│   └── utils.ts             # Funciones utilitarias
├── auth.ts                  # Configuración de NextAuth
├── auth.config.ts           # Providers y callbacks
└── middleware.ts            # Protección de rutas

prisma/
├── schema.prisma            # Schema de base de datos
└── migrations/              # Migraciones automáticas

```

## Schema de Base de Datos

### Tablas principales:

1. **User** - Usuarios del sistema
2. **Season** - Temporadas (ej: 2025-2026)
3. **Jornada** - Semanas/jornadas de la temporada
4. **Prediction** - Predicciones de cada usuario por jornada
5. **Prize** - Premios cobrados
6. **RankingResult** - Resultado final del ranking
7. **EmailLog** - Log de emails enviados

## Desarrollo: Próximas fases

### Phase 1: Core completado ✓
- Auth con email/password
- Scaffold de páginas
- Database schema
- Componentes UI básicos

### Phase 2: Gestión de Temporadas
- Crear/editar temporadas
- Gestionar participantes
- Agregar jornadas

### Phase 3: Sistema de Puntuación
- Cargar premios reales
- Ingresar aciertos
- Calcular puntos automáticamente
- Generar ranking

### Phase 4: UI de Ranking
- Dashboard con ranking en vivo
- Gráficos de progreso
- Estadísticas por usuario

### Phase 5: Emails
- Notificaciones de cambios en ranking
- Resumen semanal
- Alertas de premios

### Phase 6: Deployment
- Deploy a Railway
- Configurar PostgreSQL en Railway
- Setup de dominio personalizado

## Deploy a Railway

### Prerequisitos
- Cuenta en https://railway.app
- Railway CLI instalado

### Pasos

1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Copiar DATABASE_URL a Railway
4. Agregar variables de entorno:
   ```
   NEXTAUTH_URL=https://tu-dominio.railway.app
   NEXTAUTH_SECRET=generate-una-nueva-key-segura
   RESEND_API_KEY=tu-key
   ```
5. Conectar tu repo GitHub
6. Hacer deploy

```bash
railway login
railway link
railway up
```

## Troubleshooting

### Error: "Can't reach database server"
- Verificar que PostgreSQL está corriendo: `psql -U postgres -d quini_dev`
- Verificar DATABASE_URL en .env.local

### Error: "NEXTAUTH_SECRET is not set"
- Asegurarse que NEXTAUTH_SECRET está en .env.local

### Error: "User table doesn't exist"
- Correr: `npm run db:push`

## Útiles

```bash
# Ver base de datos con Prisma Studio
npm run db:studio

# Crear nueva migración
npm run db:migrate -- --name migration_name

# Ver logs de development
npm run dev

# Build para producción
npm run build
npm start
```

## Notas

- El NEXTAUTH_SECRET debe ser diferente en producción
- Las migraciones se ejecutan automáticamente
- El ORM Prisma genera tipos TypeScript automáticamente
- Los Server Actions se ejecutan en el servidor, seguros para secrets

## Soporte

Ver `/src/lib/utils.ts` para funciones de cálculo de Quiniela.
Ver `prisma/schema.prisma` para la estructura completa de datos.
