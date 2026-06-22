'use client'

import { useState, useEffect } from 'react'
import { calculateAndSaveRanking, getRankingForSeason } from '@/actions/ranking'
import { Button } from '@/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface RankingEntry {
  id: string
  position: number
  totalPrizes: number
  totalPoints: number
  validPoints: number
  user: { nickname: string; email: string } | null
}

export default function RankingPage() {
  const params = useParams()
  const seasonId = params.seasonId as string

  const [rankings, setRankings] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRanking()
  }, [seasonId])

  async function loadRanking() {
    try {
      const data = await getRankingForSeason(seasonId)
      setRankings(data as RankingEntry[])
    } catch (err) {
      setError('Error loading ranking')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCalculate() {
    setCalculating(true)
    setError('')

    try {
      await calculateAndSaveRanking(seasonId)
      await loadRanking()
    } catch (err) {
      setError('Error calculating ranking')
      console.error(err)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="p-6 max-w-7xl mx-auto">
        <Link href={`/dashboard/seasons/${seasonId}`}>
          <Button variant="outline" className="mb-6">
            ← Volver a Temporada
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-600">Ranking Actual</h1>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <Button onClick={handleCalculate} disabled={calculating} className="bg-orange-600">
            {calculating ? 'Calculando...' : 'Calcular Ranking'}
          </Button>
        </div>

        {/* Legend */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Cómo funciona:</strong> Total = Premios + Aciertos válidos
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>
                <strong>Premios:</strong> Dinero real ganado (10+ aciertos)
              </li>
              <li>
                <strong>Aciertos:</strong> Puntos por semanas sin premio (tabla 4-9 aciertos)
              </li>
              <li>
                <strong>Válidos:</strong> Aciertos solo cuentan si cobraste al menos un premio
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clasificación</CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.length === 0 ? (
              <p className="text-gray-600">
                No hay datos de ranking. Crea jornadas e ingresa predicciones.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-center p-3 font-semibold">Pos.</th>
                      <th className="text-left p-3 font-semibold">Usuario</th>
                      <th className="text-center p-3 font-semibold">Premios (€)</th>
                      <th className="text-center p-3 font-semibold">Aciertos</th>
                      <th className="text-center p-3 font-semibold">Válidos</th>
                      <th className="text-center p-3 font-semibold bg-orange-100">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((ranking, idx) => (
                      <tr
                        key={ranking.id}
                        className={
                          idx === 0
                            ? 'bg-yellow-50 border-b font-semibold'
                            : 'border-b hover:bg-gray-50'
                        }
                      >
                        <td className="text-center p-3">
                          {ranking.position === 1
                            ? '🥇'
                            : ranking.position === 2
                              ? '🥈'
                              : ranking.position === 3
                                ? '🥉'
                                : ranking.position}
                        </td>
                        <td className="p-3">{ranking.user?.nickname || 'Unknown'}</td>
                        <td className="text-center p-3">
                          €{ranking.totalPrizes.toFixed(2)}
                        </td>
                        <td className="text-center p-3">
                          {ranking.totalPoints.toFixed(2)}
                        </td>
                        <td className="text-center p-3 text-gray-600">
                          {ranking.validPoints.toFixed(2)}
                        </td>
                        <td className="text-center p-3 bg-orange-100 font-semibold">
                          {(ranking.totalPrizes + ranking.validPoints).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        {rankings.length > 0 && (
          <Card className="mt-8 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold mb-2">💡 Notas:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • {rankings[rankings.length - 1]?.user?.nickname || 'El último'} paga la
                  camiseta
                </li>
                <li>
                  • Recalcula después de agregar jornadas o actualizar predicciones
                </li>
                <li>
                  • Los aciertos se validan una vez que un usuario cobre un premio
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
