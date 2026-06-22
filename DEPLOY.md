# 🚀 Despliegue en Railway

## Requisitos

- Cuenta en [railway.app](https://railway.app)
- Railway CLI instalado (ya lo tienes: v4.27.6)
- GitHub conectado con Railway

## Paso 1: Autenticar en Railway

```bash
railway login
```

Esto abrirá una ventana del navegador para que te autentiques con tu cuenta de Railway.

## Paso 2: Crear Proyecto en Railway

```bash
cd /Users/platomico/Desktop/projects/quini
railway init
```

Te pedirá que:
1. Selecciones si es un proyecto nuevo o existente (nuevo)
2. Nombres el proyecto (puedes usar "quini-ranking")

## Paso 3: Agregar PostgreSQL

Hay dos opciones:

### Opción A: Con Railway CLI (automático)

```bash
railway add
```

Selecciona PostgreSQL de la lista y sigue los prompts.

### Opción B: Dashboard de Railway (manual)

1. Ir a https://railway.app/dashboard
2. Seleccionar el proyecto "quini-ranking"
3. Click en "Add Service" → PostgreSQL
4. Esperar a que esté listo

## Paso 4: Configurar Variables de Entorno

Railway automáticamente agrega `DATABASE_URL`. Necesitas agregar estas:

```bash
railway variables set NEXTAUTH_URL="https://tu-dominio-railway.railway.app"
railway variables set NEXTAUTH_SECRET="generar-nueva-key-segura"
railway variables set RESEND_API_KEY="tu-resend-key-aqui"
railway variables set NODE_ENV="production"
```

### Generar NEXTAUTH_SECRET seguro:

```bash
openssl rand -base64 32
```

Copia el output y úsalo arriba.

## Paso 5: Conectar GitHub (opcional pero recomendado)

En dashboard de Railway:

1. Proyecto → Settings
2. "Connect Repository" → Selecciona `quini-ranking`
3. Railway hará auto-deploy cada vez que hagas push a main

## Paso 6: Desplegar

### Opción A: Con CLI

```bash
railway up
```

### Opción B: Con Dashboard

1. Railway ejecutará auto-deploy si conectaste GitHub
2. O puedes hacer push a main y esperará trigger

## Paso 7: Ver Logs

```bash
railway logs
```

## Paso 8: Obtener URL Pública

```bash
railway open
```

O ve al dashboard y busca el dominio bajo "Domains".

Será algo como: `https://quini-ranking.railway.app`

## Troubleshooting

### Error: "DATABASE_URL not found"
- Verificar que PostgreSQL fue agregado: `railway variables`
- Si falta, re-correr "Paso 3"

### Error: "NEXTAUTH_SECRET is not set"
- Correr: `railway variables set NEXTAUTH_SECRET="tu-secret"`

### Error: "Build failed"
- Ver logs: `railway logs`
- Verificar que prisma migrations se ejecutan

### Rebuild forzado

```bash
railway redeploy
```

## Estructura de Costos

- **PostgreSQL**: ~$12/mes (crédito $5/mes)
- **Next.js App**: Incluido en plan gratis
- **Total**: Generalmente cubierto por crédito free ($5/mes)

## Monitoreo

```bash
# Ver status actual
railway status

# Ver variables
railway variables

# Ver logs en vivo
railway logs -f

# SSH a la instancia
railway shell
```

## Custom Domain (opcional)

1. Dashboard → Proyecto → Domain
2. Agregar tu dominio
3. Apuntar DNS a Railway (instrucciones en dashboard)

## Próximos Pasos

1. Registrarte en https://tudominio.railway.app
2. Probar registro e ingreso
3. Ver dashboard
4. Cambiar NEXTAUTH_URL a tu dominio real
5. Disfrutar 🎉

---

**Nota:** Railway tiene soporte 24/7 en https://docs.railway.app/
