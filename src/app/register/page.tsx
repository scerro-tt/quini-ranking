'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/actions/auth'
import { login } from '@/actions/auth'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({
    email: false,
    nickname: false,
    password: false,
    confirmPassword: false,
  })
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  })

  const passwordMatch = formData.password === formData.confirmPassword
  const passwordValid = formData.password.length >= 6
  const nicknameValid = formData.nickname.length >= 3

  const isFormValid =
    formData.email &&
    nicknameValid &&
    passwordValid &&
    passwordMatch

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.nickname) {
      setError('Email y nickname son requeridos')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!passwordMatch) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const result = await register(
        formData.email,
        formData.nickname,
        formData.password
      )

      if (result.error) {
        setError(result.error)
      } else {
        // Auto-login after registration
        await login(formData.email, formData.password)
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleBlur(field: string) {
    setTouched({ ...touched, [field]: true })
  }

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
          <p className="text-gray-600">Únete a la comunidad de apostadores</p>
        </div>

        {/* Register Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl">Crear tu cuenta</CardTitle>
            <p className="text-sm text-gray-600">Completa los datos para registrarte</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-start gap-3">
                  <span className="text-lg mt-0.5">⚠️</span>
                  <div>
                    <p className="font-semibold">Error al registrarse</p>
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
                    className={formData.email ? 'border-green-300' : ''}
                    required
                  />
                  {formData.email && <span className="absolute right-3 top-3 text-green-600">✓</span>}
                </div>
              </div>

              {/* Nickname Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="tu_usuario (mín. 3 caracteres)"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                    onBlur={() => handleBlur('nickname')}
                    disabled={loading}
                    className={nicknameValid && formData.nickname ? 'border-green-300' : ''}
                    required
                  />
                  {nicknameValid && formData.nickname && (
                    <span className="absolute right-3 top-3 text-green-600">✓</span>
                  )}
                </div>
                {touched.nickname && formData.nickname && !nicknameValid && (
                  <p className="text-xs text-orange-600">Mínimo 3 caracteres</p>
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
                    className={passwordValid && formData.password ? 'border-green-300' : ''}
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
                {touched.password && formData.password && !passwordValid && (
                  <p className="text-xs text-orange-600">Mínimo 6 caracteres</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    onBlur={() => handleBlur('confirmPassword')}
                    disabled={loading}
                    className={
                      passwordMatch && formData.confirmPassword ? 'border-green-300' : ''
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-600 hover:text-gray-900 text-lg"
                    disabled={loading}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {touched.confirmPassword &&
                  formData.confirmPassword &&
                  !passwordMatch && (
                    <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
                  )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Registrando...
                  </span>
                ) : (
                  'Crear Cuenta'
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

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-orange-600 hover:text-orange-700 underline transition-colors"
                  >
                    Ingresar aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <span className="text-2xl">🔐</span>
            <p className="text-gray-600 text-xs mt-1">Seguro</p>
          </div>
          <div>
            <span className="text-2xl">⚡</span>
            <p className="text-gray-600 text-xs mt-1">Rápido</p>
          </div>
          <div>
            <span className="text-2xl">🎯</span>
            <p className="text-gray-600 text-xs mt-1">Fácil</p>
          </div>
        </div>
      </div>
    </div>
  )
}
