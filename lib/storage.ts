/**
 * Sistema de almacenamiento local para intentos de login
 * Utiliza localStorage para persistir datos de intentos de acceso
 */

/**
 * Interfaz que define la estructura de un intento de login
 */
export interface LoginAttemptRecord {
  id: string // Identificador único del intento
  rut: string // RUT ingresado por el usuario
  password: string // Contraseña ingresada (para análisis de seguridad)
  timestamp: string // Fecha y hora del intento en formato ISO
  success: boolean // Si el intento fue exitoso o no
  ipAddress?: string // Dirección IP del usuario (opcional)
  userAgent?: string // Información del navegador del usuario (opcional)
}

/**
 * Guarda un nuevo intento de login en el almacenamiento local
 * @param attemptData - Datos del intento sin ID ni timestamp (se generan automáticamente)
 */
export function saveLoginAttempt(attemptData: Omit<LoginAttemptRecord, "id" | "timestamp">): void {
  const completeLoginAttempt: LoginAttemptRecord = {
    ...attemptData,
    id: crypto.randomUUID(), // Generar ID único
    timestamp: new Date().toISOString(), // Timestamp actual en formato ISO
  }

  const existingLoginAttempts = getLoginAttempts()
  existingLoginAttempts.push(completeLoginAttempt)

  // Mantener solo los últimos 100 intentos para evitar saturar el almacenamiento
  const limitedAttemptsHistory = existingLoginAttempts.slice(-100)

  localStorage.setItem("banco_chile_login_attempts", JSON.stringify(limitedAttemptsHistory))
}

/**
 * Recupera todos los intentos de login almacenados
 * @returns Array de intentos de login o array vacío si no hay datos
 */
export function getLoginAttempts(): LoginAttemptRecord[] {
  try {
    const storedAttemptsData = localStorage.getItem("banco_chile_login_attempts")
    return storedAttemptsData ? JSON.parse(storedAttemptsData) : []
  } catch (storageError) {
    console.error("Error al leer intentos de login desde localStorage:", storageError)
    return []
  }
}

/**
 * Elimina todos los intentos de login almacenados
 */
export function clearLoginAttempts(): void {
  localStorage.removeItem("banco_chile_login_attempts")
}

/**
 * Obtiene todos los intentos de login para un RUT específico
 * @param targetRut - RUT para filtrar los intentos
 * @returns Array de intentos de login para el RUT especificado
 */
export function getAttemptsByRut(targetRut: string): LoginAttemptRecord[] {
  return getLoginAttempts().filter((attemptRecord) => attemptRecord.rut === targetRut)
}

/**
 * Obtiene intentos de login recientes dentro de un período de tiempo
 * Útil para implementar límites de intentos y protección contra ataques de fuerza bruta
 * @param timeWindowInMinutes - Ventana de tiempo en minutos (por defecto 60 minutos)
 * @returns Array de intentos de login dentro del período especificado
 */
export function getRecentAttempts(timeWindowInMinutes = 60): LoginAttemptRecord[] {
  const timeThresholdDate = new Date(Date.now() - timeWindowInMinutes * 60 * 1000)
  return getLoginAttempts().filter((attemptRecord) => new Date(attemptRecord.timestamp) > timeThresholdDate)
}
