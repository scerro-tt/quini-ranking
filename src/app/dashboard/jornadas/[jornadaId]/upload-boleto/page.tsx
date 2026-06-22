'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { uploadAndProcessBoleto } from '@/actions/boleto'
import { Button } from '@/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'

export default function UploadBoletoPage() {
  const params = useParams()
  const router = useRouter()
  const jornadaId = params.jornadaId as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [preview, setPreview] = useState<string>('')
  const [extractedData, setExtractedData] = useState<any>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setLoading(true)

    try {
      // Crear preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setPreview(base64.split(',')[1])
      }
      reader.readAsDataURL(file)

      // Leer archivo y convertir a base64
      const fileData = await file.arrayBuffer()
      const buffer = Buffer.from(fileData)
      const base64Image = buffer.toString('base64')
      const mediaType = file.type

      // Procesar con Claude Vision
      const result = await uploadAndProcessBoleto(jornadaId, base64Image, mediaType)

      if (result.error) {
        setError(result.error)
      } else {
        setExtractedData(result.extractedData)
        setSuccess(true)
      }
    } catch (err) {
      setError('Error al procesar archivo')
    } finally {
      setLoading(false)
    }
  }

  if (success && extractedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <nav className="p-6 max-w-7xl mx-auto">
          <Link href={`/dashboard/jornadas/${jornadaId}`}>
            <Button variant="outline" className="mb-6">
              ← Volver
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-orange-600">✓ Boleto Procesado</h1>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pb-12">
          <Card className="bg-green-50 border-green-200 mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-green-700 mb-4">¡Boleto cargado exitosamente!</h2>
              <p className="text-green-700 mb-4">
                Se extrajeron <strong>{extractedData.partidos.length}</strong> partidos de tu boleto.
              </p>
              <p className="text-sm text-green-600 mb-6">
                Confidence: {extractedData.confidence}
              </p>
              <Link href={`/dashboard/jornadas/${jornadaId}`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Continuar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Extracted Partidos */}
          <Card>
            <CardHeader>
              <CardTitle>Partidos Extraídos</CardTitle>
              <CardDescription>
                Revisa que los datos se hayan extraído correctamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-center p-3 font-semibold">Nº</th>
                      <th className="text-left p-3 font-semibold">Equipos</th>
                      <th className="text-center p-3 font-semibold">Pronóstico</th>
                      <th className="text-center p-3 font-semibold">Pleno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.partidos.map((partido: any) => (
                      <tr key={partido.numero} className="border-b hover:bg-gray-50">
                        <td className="text-center p-3 font-semibold">{partido.numero}</td>
                        <td className="p-3">
                          <div className="text-sm">
                            <strong>{partido.equipo1}</strong>
                            <br />
                            vs
                            <br />
                            <strong>{partido.equipo2}</strong>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded font-bold">
                            {partido.prediction}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                            {partido.pleonoPrediction} goles
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <nav className="p-6 max-w-7xl mx-auto">
        <Link href={`/dashboard/jornadas/${jornadaId}`}>
          <Button variant="outline" className="mb-6">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-orange-600">Subir Boleto</h1>
        <p className="text-sm text-gray-600 mt-2">
          Sube una foto de tu boleto apostado y la IA lo leerá automáticamente
        </p>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>Carga tu Boleto</CardTitle>
            <CardDescription>
              Toma una foto clara del boleto apostado. La IA leerá los partidos y pronósticos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

            {preview && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold">Preview:</label>
                <img
                  src={`data:image/jpeg;base64,${preview}`}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border border-gray-300"
                />
              </div>
            )}

            <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50">
              <div className="text-4xl mb-4">📸</div>
              <label htmlFor="boleto-upload" className="cursor-pointer">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Click aquí o arrastra una imagen
                </p>
                <p className="text-xs text-gray-600">
                  JPG, PNG. Máximo 10MB
                </p>
                <input
                  id="boleto-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin text-2xl mb-4">⏳</div>
                <p className="text-gray-600 font-semibold">
                  Procesando imagen con IA...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Esto puede tomar unos segundos
                </p>
              </div>
            )}

            {!loading && (
              <Button
                variant="outline"
                onClick={() => document.getElementById('boleto-upload')?.click()}
                className="w-full"
              >
                Seleccionar Archivo
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Foto clara y bien iluminada</li>
              <li>✓ Todo el boleto visible en la imagen</li>
              <li>✓ Sin sombras ni reflejos</li>
              <li>✓ Texto legible</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
