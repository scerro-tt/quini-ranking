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
              <CardDescription>Gestiona temporadas y jornadas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Crea temporadas, agrega jornadas e ingresa predicciones.
              </p>
              <Link href="/dashboard/seasons">
                <Button className="w-full">Ir a Temporadas</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Start Card */}
          <Card>
            <CardHeader>
              <CardTitle>Comenzar</CardTitle>
              <CardDescription>Guía rápida de primeros pasos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">
                1. Crea una temporada
              </p>
              <p className="text-sm text-gray-600">
                2. Agrega jornadas
              </p>
              <p className="text-sm text-gray-600">
                3. Ingresa predicciones
              </p>
              <p className="text-sm text-gray-600">
                4. Calcula ranking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Sistema de Puntuación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Total = Premios + Aciertos válidos</strong>
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                <strong>Premios (€):</strong> Dinero real cuando haces 10+ aciertos
              </li>
              <li>
                <strong>Aciertos:</strong> Puntos por semanas sin premio (tabla 4-9 aciertos)
              </li>
              <li>
                <strong>Regla importante:</strong> Los aciertos solo cuentan si cobraste al menos
                un premio en toda la temporada
              </li>
            </ul>
            <p className="text-xs opacity-75 mt-2">
              Quien menos suma al final, paga la camiseta.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
