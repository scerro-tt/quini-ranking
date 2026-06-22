import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cálculo de puntos según aciertos (tabla del documento Quiniela)
const HITS_PERCENTAGE: { [key: number]: number } = {
  4: 0.05,
  5: 0.08,
  6: 0.13,
  7: 0.22,
  8: 0.4,
  9: 0.65,
  10: 1.0,
}

export function calculateAciertosPoints(hits: number, prizeU: number): number {
  if (hits < 4) return 0
  if (hits > 10) return 0 // Para 11+ se usa premio real

  const percentage = HITS_PERCENTAGE[hits] || 0
  const minU = Math.max(prizeU, 1.5)
  return percentage * minU
}

// Validar email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Formatear dinero
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Formatear puntos
export function formatPoints(points: number): string {
  return points.toFixed(2)
}
