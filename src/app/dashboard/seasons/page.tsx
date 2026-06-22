'use client'

import { useState, useEffect } from 'react'
import { getSeasonsForUser, createSeason, deleteSeason } from '@/actions/seasons'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

interface Season {
  id: string
  name: string
  startDate: string
  endDate?: string
  isActive: boolean
  _count: { jornadas: number }
}

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    loadSeasons()
  }, [])

  async function loadSeasons() {
    try {
      const data = await getSeasonsForUser()
      setSeasons(data as Season[])
    } catch (err) {
      setError('Error loading seasons')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.startDate) {
      setError('Name and start date are required')
      return
    }

    try {
      const result = await createSeason(
        formData.name,
        new Date(formData.startDate),
        formData.endDate ? new Date(formData.endDate) : undefined
      )

      if ('error' in result) {
        setError(result.error)
      } else {
        setFormData({ name: '', startDate: new Date().toISOString().split('T')[0], endDate: '' })
        setShowForm(false)
        await loadSeasons()
      }
    } catch (err) {
      setError('Error creating season')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this season and all its data?')) return

    try {
      await deleteSeason(id)
      await loadSeasons()
    } catch (err) {
      setError('Error deleting season')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="p-6 max-w-7xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-6">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-600">Temporadas</h1>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Create Season Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nueva Temporada</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <Input
                    placeholder="2025-2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha inicio</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha fin (opcional)</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
            + Nueva Temporada
          </Button>
        )}

        {/* Seasons List */}
        {loading ? (
          <p className="text-gray-600">Cargando...</p>
        ) : seasons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">No hay temporadas yet. Create one to start!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {seasons.map((season) => (
              <Card key={season.id}>
                <CardHeader>
                  <CardTitle className="text-orange-600">{season.name}</CardTitle>
                  <CardDescription>
                    {new Date(season.startDate).toLocaleDateString('es-ES')}
                    {season.endDate &&
                      ` - ${new Date(season.endDate).toLocaleDateString('es-ES')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {season._count.jornadas} jornadas
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/seasons/${season.id}`}>
                      <Button className="flex-1">Ver</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(season.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
