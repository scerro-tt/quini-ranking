'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'

interface Jornada {
  id: string
  seasonId: string
  weekNumber: number
  prizeU?: number
}

interface JornadaWithPrizes extends Jornada {
  premioTotal?: number
  numAcertantes?: number
}

export default function AdminPremiosPage() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [jornadas, setJornadas] = useState<JornadaWithPrizes[]>([])
  const [loading, setLoading] = useState(true)
  const [premios, setPremios] = useState<Record<string, { total: number; acertantes: number }>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadSeasons()
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      loadJornadas(selectedSeason)
    }
  }, [selectedSeason])

  async function loadSeasons() {
    try {
      const response = await fetch('/api/seasons')
      if (response.ok) {
        const data = await response.json()
        setSeasons(data.seasons || [])
      }
    } catch (err) {
      setError('Error cargando temporadas')
    } finally {
      setLoading(false)
    }
  }

  async function loadJornadas(seasonId: string) {
    try {
      const response = await fetch(`/api/seasons/${seasonId}/jornadas`)
      if (response.ok) {
        const data = await response.json()
        setJornadas(data.jornadas || [])
        // Inicializar premios
        const initialPremios: any = {}
        data.jornadas.forEach((j: Jornada) => {
          initialPremios[j.id] = { total: 0, acertantes: 0 }
        })
        setPremios(initialPremios)
      }
    } catch (err) {
      setError('Error cargando jornadas')
    }
  }

  async function handleSavePremios(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      for (const [jornadaId, data] of Object.entries(premios)) {
        if (data.total > 0) {
          const response = await fetch(`/api/jornadas/${jornadaId}/premios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalAmount: data.total,
              numWinners: data.acertantes,
            }),
          })

          if (!response.ok) {
            throw new Error('Error saving premio')
          }
        }
      }
      setSuccess('✓ Premios guardados correctamente')
    } catch (err) {
      setError('Error al guardar premios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="p-6 max-w-7xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-600">Admin - Ingresar Premios</h1>
        <p className="text-sm text-gray-600 mt-2">
          Configura los premios totales y número de acertantes por jornada
        </p>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Season Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Seleccionar Temporada</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="">Elige una temporada...</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name} ({season._count?.jornadas || 0} jornadas)
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedSeason && (
          <form onSubmit={handleSavePremios} className="space-y-4">
            {jornadas.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">No hay jornadas en esta temporada</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {jornadas.map((jornada) => (
                  <Card key={jornada.id}>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-6 items-end">
                        {/* Jornada Info */}
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            Jornada {jornada.weekNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(jornada.matchDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>

                        {/* Premio Total */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Premio Total (€)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={premios[jornada.id]?.total || 0}
                            onChange={(e) =>
                              setPremios({
                                ...premios,
                                [jornada.id]: {
                                  ...premios[jornada.id],
                                  total: parseFloat(e.target.value) || 0,
                                },
                              })
                            }
                            disabled={saving}
                            placeholder="0.00"
                          />
                        </div>

                        {/* Número de Acertantes */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Número de Acertantes
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={premios[jornada.id]?.acertantes || 0}
                            onChange={(e) =>
                              setPremios({
                                ...premios,
                                [jornada.id]: {
                                  ...premios[jornada.id],
                                  acertantes: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            disabled={saving}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* Calculo U */}
                      {premios[jornada.id]?.total > 0 && premios[jornada.id]?.acertantes > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>U (premio del 10):</strong> €
                            {(premios[jornada.id].total / premios[jornada.id].acertantes).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? 'Guardando...' : 'Guardar Todos los Premios'}
                </Button>
              </>
            )}
          </form>
        )}
      </main>
    </div>
  )
}
