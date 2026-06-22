'use client'

import { useState, useEffect } from 'react'
import { getPredictionsForJornada, createOrUpdatePrediction } from '@/actions/predictions'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { auth } from '@/auth'

interface Prediction {
  id: string
  userId: string
  user: { nickname: string }
  hits: number
  points: number
  notes?: string
}

export default function JornadaDetailPage() {
  const params = useParams()
  const jornadaId = params.jornadaId as string

  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [myPrediction, setMyPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ hits: 10, notes: '' })
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [jornadaId])

  async function loadData() {
    try {
      const sessionData = await auth()
      setSession(sessionData)

      const predictions = await getPredictionsForJornada(jornadaId)
      setPredictions(predictions as Prediction[])

      // Find current user's prediction
      const myPred = predictions.find((p: any) => p.userId === sessionData?.user?.id)
      if (myPred) {
        setMyPrediction(myPred as Prediction)
        setFormData({ hits: myPred.hits, notes: myPred.notes || '' })
      }
    } catch (err) {
      setError('Error loading predictions')
    } finally {
      setLoading(false)
    }
  }

  async function handleSavePrediction(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (formData.hits < 0 || formData.hits > 14) {
      setError('Hits must be between 0-14')
      return
    }

    try {
      await createOrUpdatePrediction(jornadaId, formData.hits, formData.notes)
      await loadData()
    } catch (err) {
      setError('Error saving prediction')
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
        <h1 className="text-3xl font-bold text-orange-600">Predicciones Jornada</h1>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* My Prediction Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mi Predicción</CardTitle>
            <CardDescription>Ingresa tus aciertos para esta jornada</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePrediction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Aciertos (0-14)</label>
                <Input
                  type="number"
                  min="0"
                  max="14"
                  value={formData.hits}
                  onChange={(e) => setFormData({ ...formData, hits: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
                <Input
                  placeholder="Ej: Boleto jugado..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full">
                {myPrediction ? 'Actualizar' : 'Guardar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* All Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Predicciones de Todos</CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.length === 0 ? (
              <p className="text-gray-600">No hay predicciones yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Usuario</th>
                      <th className="text-center p-2">Aciertos</th>
                      <th className="text-center p-2">Puntos</th>
                      <th className="text-left p-2">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((pred) => (
                      <tr key={pred.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{pred.user.nickname}</td>
                        <td className="text-center p-2 font-semibold">{pred.hits}</td>
                        <td className="text-center p-2">{pred.points.toFixed(2)}</td>
                        <td className="p-2 text-gray-600">{pred.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
