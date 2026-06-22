'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPredictionWithPartidos, updatePartidoResult } from '@/actions/boleto'
import { updateJornadaPremios } from '@/actions/jornadas'
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
}

export default function ResultadosPremiosPage() {
  const params = useParams()
  const router = useRouter()
  const jornadaId = params.jornadaId as string

  const [activeTab, setActiveTab] = useState<'resultados' | 'premios'>('resultados')
  const [loading, setLoading] = useState(true)
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [results, setResults] = useState<Record<string, { result: string; pleno: number }>>({})
  const [premios, setPremios] = useState({
    premio10: 0,
    premio11: 0,
    premio12: 0,
    premio13: 0,
    premio14: 0,
    premio15: 0,
  })

  useEffect(() => {
    loadPrediction()
  }, [jornadaId])

  async function loadPrediction() {
    try {
      const response = await fetch(`/api/jornadas/${jornadaId}/prediction`)
      if (response.ok) {
        const data = await response.json()
        setPartidos(data.prediction.partidoResults)
        const initialResults: any = {}
        data.prediction.partidoResults.forEach((p: Partido) => {
          initialResults[p.id] = {
            result: '',
            pleno: 0,
          }
        })
        setResults(initialResults)
      }
    } catch (err) {
      setError('Error cargando partidos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveResults(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      for (const [partidoId, data] of Object.entries(results)) {
        if (data.result) {
          await updatePartidoResult(partidoId, data.result, data.pleno || 0)
        }
      }
      setSuccess('✓ Resultados guardados correctamente')
    } catch (err) {
      setError('Error al guardar resultados')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePremios(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateJornadaPremios(jornadaId, premios)
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
        <Link href={`/dashboard/jornadas/${jornadaId}`}>
          <Button variant="outline" className="mb-6">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-600">Resultados y Premios</h1>
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

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('resultados')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'resultados'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            📊 Resultados
          </button>
          <button
            onClick={() => setActiveTab('premios')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'premios'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            💰 Premios
          </button>
        </div>

        {/* Tab: Resultados */}
        {activeTab === 'resultados' && (
          <form onSubmit={handleSaveResults} className="space-y-4">
            {partidos.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600">
                    No hay partidos. Sube un boleto primero.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {partidos.map((partido) => (
                  <Card key={partido.id}>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-sm font-semibold text-gray-600">Partido {partido.numero}</p>
                          <p className="text-sm font-bold">
                            {partido.equipo1} vs {partido.equipo2}
                          </p>
                        </div>

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
                            <option value="1">1</option>
                            <option value="X">X</option>
                            <option value="2">2</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-gray-600 font-semibold block mb-1">
                            Goles (Pleno al Quince)
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
        )}

        {/* Tab: Premios */}
        {activeTab === 'premios' && (
          <form onSubmit={handleSavePremios} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Premios por Aciertos</CardTitle>
                <CardDescription>
                  Ingresa el premio para cada número de aciertos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { key: 'premio15', label: '15 Aciertos' },
                    { key: 'premio14', label: '14 Aciertos' },
                    { key: 'premio13', label: '13 Aciertos' },
                    { key: 'premio12', label: '12 Aciertos' },
                    { key: 'premio11', label: '11 Aciertos' },
                    { key: 'premio10', label: '10 Aciertos (U)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {label} (€)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={premios[key as keyof typeof premios] || 0}
                        onChange={(e) =>
                          setPremios({
                            ...premios,
                            [key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        disabled={saving}
                        placeholder="0.00"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-11 bg-orange-600 hover:bg-orange-700"
            >
              {saving ? 'Guardando...' : 'Guardar Premios'}
            </Button>
          </form>
        )}
      </main>
    </div>
  )
}
