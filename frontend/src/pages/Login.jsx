import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login({
        correo: email,
        contraseña: password
      })
    } catch (error) {
      console.error('Error en login:', error)
      setError(error.message || 'Error al iniciar sesión. Verifique sus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo y título */}
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">EA</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">
                Industrias El Ángel
              </h1>
              <p className="text-text-secondary text-sm">
                Sistema interno de administración
              </p>
            </div>
          </div>

          {/* Formulario de login */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary text-center">
                Iniciar Sesión
              </h2>
              <p className="text-text-secondary text-center text-sm">
                Ingrese sus credenciales para acceder al sistema
              </p>
            </div>

            {/* Mostrar errores */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de correo electrónico */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="usuario@elangel.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-text-muted hover:text-text-secondary" />
                    ) : (
                      <Eye className="h-5 w-5 text-text-muted hover:text-text-secondary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Enlace de recuperar contraseña */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  disabled={isLoading}
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>

              {/* Botón de iniciar sesión */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4">
        <p className="text-center text-xs text-text-muted">
          © 2025 Industrias El Ángel. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
