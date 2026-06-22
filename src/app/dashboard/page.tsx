import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'
import { logout } from '@/actions/auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-600">🏆 Quini Ranking</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600">
            Hola, <strong>{session.user.name}</strong>
          </span>
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Perfil
            </Button>
          </Link>
          <form action={logout}>
            <Button variant="outline" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Seasons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Temporadas</CardTitle>
              <CardDescription>Gestiona y visualiza temporadas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Aún no hay temporadas activas. Crea una para comenzar.
              </p>
              <Link href="/dashboard/seasons">
                <Button className="w-full">Ver temporadas</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Jornadas Card */}
          <Card>
            <CardHeader>
              <CardTitle>Jornadas</CardTitle>
              <CardDescription>Carga resultados y premios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Sigue el progreso de cada jornada de la temporada.
              </p>
              <Link href="/dashboard/jornadas">
                <Button className="w-full" disabled>
                  Ver jornadas (próximamente)
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Ranking Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking</CardTitle>
              <CardDescription>Visualiza la clasificación actual</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Mira dónde estás en el ranking según premios y aciertos.
              </p>
              <Link href="/dashboard/ranking">
                <Button className="w-full" disabled>
                  Ver ranking (próximamente)
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Tu desempeño en la temporada</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Premios cobrados, aciertos y puntos acumulados.
              </p>
              <Link href="/dashboard/stats">
                <Button className="w-full" disabled>
                  Ver estadísticas (próximamente)
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bienvenido al dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Próximos pasos:</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Crear una temporada (ej: 2025-2026)</li>
                <li>Agregar jornadas de la temporada</li>
                <li>Cargar premios reales por jornada</li>
                <li>Ingresar tus pronósticos y aciertos</li>
                <li>Ver el ranking actualizado automáticamente</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
