'use client'

import { useState, useEffect } from 'react'
import { generateInvitation, listInvitations } from '@/actions/invitations'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'

interface Invitation {
  id: string
  email: string
  nickname: string
  used: boolean
  createdAt: string
  expiresAt: string
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
  })

  useEffect(() => {
    loadInvitations()
  }, [])

  async function loadInvitations() {
    try {
      const data = await listInvitations()
      setInvitations(data as Invitation[])
    } catch (err) {
      setError('Error loading invitations')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateInvitation(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!formData.email || !formData.nickname) {
      setError('Email y nickname son requeridos')
      return
    }

    setCreating(true)

    try {
      const result = await generateInvitation(formData.email, formData.nickname)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage(`✓ Invitación creada: ${result.invitationUrl}`)
        setFormData({ email: '', nickname: '' })
        await loadInvitations()
      }
    } catch (err) {
      setError('Error creating invitation')
    } finally {
      setCreating(false)
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
        <h1 className="text-3xl font-bold text-orange-600">Admin - Generar Invitaciones</h1>
        <p className="text-sm text-gray-600 mt-2">Crea invitaciones para los 4 usuarios autorizados</p>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Create Invitation Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Nueva Invitación</CardTitle>
            <CardDescription>Ingresa el email y nickname del usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-4 bg-green-50 text-green-800 rounded-md text-sm space-y-2">
                  <p className="font-semibold">{successMessage}</p>
                  <p className="text-xs">
                    Copia el link y envíalo al usuario por email. Válido por 30 días.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(successMessage.split(': ')[1])
                    }}
                    className="text-green-700 underline hover:font-semibold text-xs"
                  >
                    Copiar link
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={creating}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nickname</label>
                  <Input
                    type="text"
                    placeholder="usuario_nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    disabled={creating}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={creating}>
                {creating ? 'Creando...' : 'Generar Invitación'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invitations List */}
        <Card>
          <CardHeader>
            <CardTitle>Invitaciones Generadas</CardTitle>
            <CardDescription>
              {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Cargando...</p>
            ) : invitations.length === 0 ? (
              <p className="text-gray-600">No hay invitaciones aún</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Nickname</th>
                      <th className="text-center p-3 font-semibold">Estado</th>
                      <th className="text-left p-3 font-semibold">Creada</th>
                      <th className="text-left p-3 font-semibold">Expira</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{inv.email}</td>
                        <td className="p-3">{inv.nickname}</td>
                        <td className="text-center p-3">
                          {inv.used ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              Usada
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 text-xs">
                          {new Date(inv.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="p-3 text-gray-600 text-xs">
                          {new Date(inv.expiresAt).toLocaleDateString('es-ES')}
                        </td>
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
