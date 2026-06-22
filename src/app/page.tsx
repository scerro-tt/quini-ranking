import { Button } from '@/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'
import { auth } from '@/auth'

export default async function Home() {
  const session = await auth()

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-600">🏆 Quini Ranking</h1>
        <div className="flex gap-4">
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">Perfil</Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button>Ingresar</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 text-gray-900">
            El sistema de ranking justo para la Quiniela
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Gana quien apuesta mejor, no quien tiene suerte. Mide premios reales y precisión en tus pronósticos.
          </p>
          {!session && (
            <Link href="/register">
              <Button size="lg">Comenzar ahora</Button>
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">💰 Premios Reales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Los premios que cobres cuentan como dinero directo en tu puntuación.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">📊 Puntos por Puntería</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Cada semana suma puntos por lo cerca que quedaste, ponderado por dificultad.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">🎯 Ranking Dinámico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tu posición se actualiza cada jornada. El que menos suma al final, paga la camiseta.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rules */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle>Cómo funciona</CardTitle>
            <CardDescription>
              Un sistema pensado para que gane quien apuesta mejor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Las dos columnas</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>
                  <strong>Premios (€):</strong> Dinero cobrado cuando el boleto hace 10+ aciertos
                </li>
                <li>
                  <strong>Aciertos (puntos):</strong> Puntos por semanas sin premio, según lo cerca que quedaste
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Puntuación</h3>
              <p className="text-sm text-gray-600">
                Tu posición = Premios + Aciertos válidos. Los aciertos solo cuentan si cobraste al menos un premio.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-sm text-gray-600 border-t">
        <p>Quini Ranking • Sistema transparente de puntuación 🎯</p>
      </footer>
    </main>
  )
}
