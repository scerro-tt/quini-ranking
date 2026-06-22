# 🏆 Quini Ranking System

Sistema web completo para gestionar un ranking justo de la Quiniela (lotería de deportes). Mide quien apuesta mejor, no quien tiene suerte.

## ✨ Características

- 📊 **Sistema de Puntuación Dual**: Premios reales + puntos por puntería
- 🎯 **Ranking Dinámico**: Se actualiza cada jornada
- 💰 **Gestión de Premios**: Registra premios reales cobrados
- 📈 **Estadísticas**: Visualiza tu progreso a lo largo de la temporada
- 📧 **Notificaciones por Email**: Resumen semanal y cambios en ranking
- 🔐 **Autenticación Segura**: Email + contraseña
- 🚀 **Listo para producción**: Deploy a Railway con PostgreSQL

## 🏗️ Arquitectura

```
Frontend (React + Next.js 14)
         ↓
Backend (Next.js API Routes)
         ↓
Database (PostgreSQL + Prisma)
```

**Tech Stack:**
- Next.js 14 + TypeScript
- NextAuth.js v5 (autenticación)
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Resend (emails)

## 🚀 Inicio Rápido

### Instalación

1. **Clonar el proyecto**
   ```bash
   cd /Users/platomico/Desktop/projects/quini
   ```

2. **Instalar dependencias**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar PostgreSQL local**
   
   Con Homebrew:
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   createdb quini_dev
   ```
   
   O con Docker:
   ```bash
   docker run --name postgres-quini \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=quini_dev \
     -p 5432:5432 \
     -d postgres:15
   ```

4. **Ejecutar migraciones**
   ```bash
   npm run db:push
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. Abrir http://localhost:3000

## 📖 Documentación

- **[SETUP.md](./SETUP.md)** - Guía completa de instalación y configuración
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detalles técnicos de la arquitectura (próximamente)

## 🎮 Cómo Usar

### Para Usuarios

1. **Registrarse** - Crear cuenta con email y contraseña
2. **Dashboard** - Ver y gestionar temporadas
3. **Temporadas** - Crear nueva temporada (ej: 2025-2026)
4. **Jornadas** - Agregar semanas y cargar premios
5. **Pronósticos** - Registrar tus aciertos
6. **Ranking** - Ver tu posición en tiempo real

### Sistema de Puntuación

**Dos columnas se suman:**

1. **Premios (€)** - Dinero real cobrado (10+ aciertos)
2. **Aciertos (puntos)** - Puntos por semanas sin premio

**Tabla de aciertos:**
```
Aciertos:  4    5    6     7     8     9     10
%:         5%   8%   13%   22%   40%   65%   100%
```

Puntos = (% según aciertos) × U
- U = Premio que cobró el de 10 aciertos esa jornada
- Mínimo U = 1.50 € (para jornadas muy fáciles)

**Regla importante:** Los aciertos solo cuentan si cobras al menos un premio en toda la temporada.

## 📁 Estructura del Proyecto

```
quini/
├── src/
│   ├── app/                    # Páginas Next.js
│   │   ├── api/auth/          # Rutas de autenticación
│   │   ├── dashboard/         # Dashboard protegido
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── profile/           # Perfil de usuario
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Home
│   │   └── globals.css        # CSS global
│   ├── components/            # Componentes React
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── theme-provider.tsx
│   ├── actions/               # Server Actions
│   │   └── auth.ts            # Lógica de autenticación
│   ├── lib/                   # Utilidades
│   │   ├── db.ts              # Cliente Prisma
│   │   └── utils.ts           # Funciones auxiliares
│   ├── auth.ts                # Configuración NextAuth
│   ├── auth.config.ts         # Providers y callbacks
│   └── middleware.ts          # Protección de rutas
├── prisma/
│   ├── schema.prisma          # Schema de BD
│   └── migrations/            # Migraciones
├── public/                    # Archivos estáticos
├── .env.local                 # Variables de entorno
├── .env.example               # Template de env
├── SETUP.md                   # Guía de instalación
├── README.md                  # Este archivo
├── package.json
└── tsconfig.json
```

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|------------|
| `User` | Usuarios del sistema |
| `Season` | Temporadas (ej: 2025-2026) |
| `Jornada` | Semanas/jornadas de cada temporada |
| `Prediction` | Pronósticos por usuario/jornada |
| `Prize` | Premios cobrados |
| `RankingResult` | Ranking final calculado |
| `EmailLog` | Log de emails enviados |

## 🔧 Comandos Disponibles

```bash
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Build para producción
npm start                # Ejecutar en producción
npm run db:push          # Sincronizar schema con BD
npm run db:studio        # Abrir Prisma Studio
npm run db:migrate       # Crear nueva migración
npm run lint             # Linter
```

## 🌍 Deployment a Railway

### Requisitos
- Cuenta en [railway.app](https://railway.app)
- Railway CLI: `npm install -g @railway/cli`

### Pasos

1. **Crear proyecto en Railway**
   ```bash
   railway login
   railway init
   ```

2. **Agregar PostgreSQL**
   - En dashboard de Railway: Add → PostgreSQL
   - Copiar DATABASE_URL

3. **Configurar variables de entorno**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://tu-dominio.railway.app
   NEXTAUTH_SECRET=generar-nueva-key-segura
   RESEND_API_KEY=tu-key-de-resend
   NODE_ENV=production
   ```

4. **Conectar y deploy**
   ```bash
   railway link
   railway up
   ```

## 📧 Configuración de Emails

1. Crear cuenta en [resend.com](https://resend.com)
2. Obtener API key
3. Agregar en `.env.local`:
   ```env
   RESEND_API_KEY="re_your_key"
   ```

## 🛠️ Desarrollo

### Agregar página nueva
```bash
# Crear archivo src/app/nueva-pagina/page.tsx
```

### Agregar tabla a la BD
1. Editar `prisma/schema.prisma`
2. Ejecutar: `npm run db:push`

### Crear Server Action
```typescript
// src/actions/tuAccion.ts
'use server'

export async function miAccion(data: string) {
  // Código que se ejecuta en el servidor
  return { success: true }
}
```

## 🐛 Troubleshooting

**Error: "Can't reach database server"**
- Verificar PostgreSQL corre: `psql -U postgres`
- Revisar DATABASE_URL en `.env.local`

**Error: "NEXTAUTH_SECRET is not set"**
- Asegurarse que está en `.env.local`

**Error: "User table doesn't exist"**
- Ejecutar: `npm run db:push`

## 📋 Roadmap

- [x] Autenticación con email/password
- [x] Schema de base de datos
- [x] Dashboard básico
- [ ] CRUD de temporadas
- [ ] Gestión de jornadas
- [ ] Sistema de cálculo de puntuación
- [ ] UI de ranking
- [ ] Sistema de notificaciones por email
- [ ] Gráficos de progreso
- [ ] Exportación a CSV
- [ ] API pública (próximo)

## 📞 Soporte

Para reportar bugs o sugerencias: crear un issue en el repositorio.

## 📄 Licencia

Privado - Proyecto personal.

---

Hecho con ❤️ para los amantes de la Quiniela
