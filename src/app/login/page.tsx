'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })

  const isFormValid = formData.email && formData.password && formData.password.length >= 6

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleBlur(field: 'email' | 'password') {
    setTouched({ ...touched, [field]: true })
  }

  const emailError = touched.email && !formData.email ? 'Email es requerido' : ''
  const passwordError = touched.password && !formData.password ? 'Contraseña es requerida' : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-orange-100 rounded-full mb-4">
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quini Ranking</h1>
          <p className="text-gray-600">Sistema justo de puntuación para la Quiniela</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl">Bienvenido de vuelta</CardTitle>
            <p className="text-sm text-gray-600">Ingresa a tu cuenta para continuar</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-start gap-3">
                  <span className="text-lg mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold">Error al iniciar sesión</p>
                    <p className="text-xs mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    onBlur={() => handleBlur('email')}
                    disabled={loading}
                    className={`pr-10 ${
                      emailError
                        ? 'border-red-300 focus:ring-red-200'
                        : formData.email
                          ? 'border-green-300'
                          : ''
                    }`}
                    required
                  />
                  {formData.email && !emailError && (
                    <span className="absolute right-3 top-3 text-green-600">✓</span>
                  )}
                </div>
                {emailError && (
                  <p className="text-xs text-red-600">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onBlur={() => handleBlur('password')}
                    disabled={loading}
                    className={`pr-10 ${
                      passwordError
                        ? 'border-red-300 focus:ring-red-200'
                        : formData.password
                          ? 'border-green-300'
                          : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 text-lg"
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-600">{passwordError}</p>
                )}
                {formData.password && formData.password.length < 6 && (
                  <p className="text-xs text-orange-600">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">o</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-orange-600 hover:text-orange-700 underline transition-colors"
                  >
                    Registrarse aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <span className="text-2xl">💰</span>
            <p className="text-gray-600 text-xs mt-1">Premios Reales</p>
          </div>
          <div>
            <span className="text-2xl">📊</span>
            <p className="text-gray-600 text-xs mt-1">Ranking Justo</p>
          </div>
          <div>
            <span className="text-2xl">🎯</span>
            <p className="text-gray-600 text-xs mt-1">Puntuación Clara</p>
          </div>
        </div>
      </div>
    </div>
  )
}
