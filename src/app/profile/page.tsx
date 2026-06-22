import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-600">🏆 Quini Ranking</h1>
        <Link href="/dashboard">
          <Button variant="outline">Volver</Button>
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>Tu información de usuario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg mt-1">{session.user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Nombre de usuario</label>
              <p className="text-lg mt-1">{session.user.name}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Funcionalidades de edición de perfil próximamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
