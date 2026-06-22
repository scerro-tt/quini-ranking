'use client'

import { useState, useEffect } from 'react'
import { getSeasonById } from '@/actions/seasons'
import { getJornadasForSeason, createJornada, updatePrizeU } from '@/actions/jornadas'
import { getRankingForSeason } from '@/actions/ranking'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Season {
  id: string
  name: string
  startDate: string
  endDate?: string
}

interface Jornada {
  id: string
  weekNumber: number
  matchDate: string
  prizeU: number
}

export default function SeasonDetailPage() {
  const params = useParams()
  const seasonId = params.seasonId as string

  const [season, setSeason] = useState<Season | null>(null)
  const [jornadas, setJornadas] = useState<Jornada[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    weekNumber: 1,
    matchDate: new Date().toISOString().split('T')[0],
    prizeU: 1.5,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [seasonId])

  async function loadData() {
    try {
      const [seasonData, jornadasData] = await Promise.all([
        getSeasonById(seasonId),
        getJornadasForSeason(seasonId),
      ])
      setSeason(seasonData as Season)
      setJornadas(jornadasData as Jornada[])
    } catch (err) {
      setError('Error loading season data')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateJornada(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const result = await createJornada(
        seasonId,
        formData.weekNumber,
        new Date(formData.matchDate),
        formData.prizeU
      )

      if ('error' in result) {
        setError(result.error)
      } else {
        setFormData({
          weekNumber: formData.weekNumber + 1,
          matchDate: new Date().toISOString().split('T')[0],
          prizeU: 1.5,
        })
        setShowForm(false)
        await loadData()
      }
    } catch (err) {
      setError('Error creating jornada')
    }
  }

  async function handleUpdatePrizeU(jornadaId: string, newPrizeU: number) {
    try {
      await updatePrizeU(jornadaId, newPrizeU)
      await loadData()
    } catch (err) {
      setError('Error updating prize')
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="p-6 max-w-7xl mx-auto">
        <Link href="/dashboard/seasons">
          <Button variant="outline" className="mb-6">
            ← Volver a Temporadas
          </Button>
        </Link>
        {season && <h1 className="text-3xl font-bold text-orange-600">{season.name}</h1>}
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Create Jornada Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nueva Jornada</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateJornada} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Semana</label>
                    <Input
                      type="number"
                      min="1"
                      max="42"
                      value={formData.weekNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, weekNumber: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha</label>
                    <Input
                      type="date"
                      value={formData.matchDate}
                      onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Premio U (€)</label>
                    <Input
                      type="number"
                      min="1.5"
                      step="0.01"
                      value={formData.prizeU}
                      onChange={(e) =>
                        setFormData({ ...formData, prizeU: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Crear</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-8">
            + Nueva Jornada
          </Button>
        )}

        {/* Jornadas List */}
        {jornadas.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">No hay jornadas yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jornadas.map((jornada) => (
              <Card key={jornada.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Semana {jornada.weekNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(jornada.matchDate).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Premio U: €{jornada.prizeU.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/jornadas/${jornada.id}`}>
                        <Button>Ver Predicciones</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ranking Button */}
        {jornadas.length > 0 && (
          <div className="mt-12">
            <Link href={`/dashboard/seasons/${seasonId}/ranking`}>
              <Button className="w-full" size="lg">
                Ver Ranking
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
