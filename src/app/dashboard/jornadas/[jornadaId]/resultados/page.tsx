'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPredictionWithPartidos, updatePartidoResult } from '@/actions/boleto'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'

interface Partido {
  id: string
  numero: number
  equipo1: string
  equipo2: string
  userPrediction: string
  userPleonoPrediction: number | null
  actualResult?: string
  actualPleonoResult?: number
  isCorrect?: boolean
}

export default function ResultadosPage() {
  const params = useParams()
  const router = useRouter()
  const jornadaId = params.jornadaId as string

  const [loading, setLoading] = useState(true)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [results, setResults] = useState<Record<string, { result: string; pleno: number }>>({})

  useEffect(() => {
    loadPrediction()
  }, [jornadaId])

  async function loadPrediction() {
    try {
      const response = await fetch(`/api/jornadas/${jornadaId}/prediction`)
      if (response.ok) {
        const data = await response.json()
        setPartidos(data.prediction.partidoResults)
        // Inicializar con resultados existentes
        const initialResults: any = {}
        data.prediction.partidoResults.forEach((p: Partido) => {
          initialResults[p.id] = {
            result: p.actualResult || '',
            pleno: p.actualPleonoResult || 0,
          }
        })
        setResults(initialResults)
      }
    } catch (err) {
      setError('Error loading partidos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveResults(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      for (const [partidoId, data] of Object.entries(results)) {
        if (data.result) {
          await updatePartidoResult(partidoId, data.result, data.pleno || 0)
        }
      }
      setSuccess(true)
      setTimeout(() => router.push(`/dashboard/jornadas/${jornadaId}`), 2000)
    } catch (err) {
      setError('Error al guardar resultados')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="p-6 max-w-7xl mx-auto">
        <Link href={`/dashboard/jornadas/${jornadaId}`}>
          <Button variant="outline" className="mb-6">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-600">Ingresar Resultados</h1>
        <p className="text-sm text-gray-600 mt-2">
          Ingresa el resultado final (1/X/2) y goles de cada partido
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
            ✓ Resultados guardados correctamente
          </div>
        )}

        <form onSubmit={handleSaveResults} className="space-y-4">
          {partidos.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600">
                  No hay partidos cargados. Sube un boleto primero.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {partidos.map((partido) => (
                <Card key={partido.id}>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-4 items-center">
                      {/* Partido Info */}
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Partido {partido.numero}</p>
                        <p className="text-sm font-bold">
                          {partido.equipo1} vs {partido.equipo2}
                        </p>
                      </div>

                      {/* Tu Pronóstico */}
                      <div>
                        <p className="text-xs text-gray-600">Tu pronóstico</p>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded font-bold">
                            {partido.userPrediction}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {partido.userPleonoPrediction} goles
                          </span>
                        </div>
                      </div>

                      {/* Resultado */}
                      <div>
                        <label className="text-xs text-gray-600 font-semibold block mb-1">
                          Resultado (1/X/2)
                        </label>
                        <select
                          value={results[partido.id]?.result || ''}
                          onChange={(e) =>
                            setResults({
                              ...results,
                              [partido.id]: {
                                ...results[partido.id],
                                result: e.target.value,
                              },
                            })
                          }
                          disabled={saving}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="">Seleccionar</option>
                          <option value="1">1 (Local gana)</option>
                          <option value="X">X (Empate)</option>
                          <option value="2">2 (Visitante gana)</option>
                        </select>
                      </div>

                      {/* Pleno */}
                      <div>
                        <label className="text-xs text-gray-600 font-semibold block mb-1">
                          Goles
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={results[partido.id]?.pleno || 0}
                          onChange={(e) =>
                            setResults({
                              ...results,
                              [partido.id]: {
                                ...results[partido.id],
                                pleno: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          disabled={saving}
                          placeholder="0"
                        />
                      </div>

                      {/* Acierto */}
                      <div className="text-center">
                        {results[partido.id]?.result &&
                          partido.actualResult &&
                          (results[partido.id].result === partido.actualResult ? (
                            <div className="text-green-600 font-bold">
                              <div className="text-2xl">✓</div>
                              <p className="text-xs">Acertaste</p>
                            </div>
                          ) : (
                            <div className="text-red-600 font-bold">
                              <div className="text-2xl">✗</div>
                              <p className="text-xs">Fallaste</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="submit"
                disabled={saving}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700"
              >
                {saving ? 'Guardando...' : 'Guardar Resultados'}
              </Button>
            </>
          )}
        </form>
      </main>
    </div>
  )
}
