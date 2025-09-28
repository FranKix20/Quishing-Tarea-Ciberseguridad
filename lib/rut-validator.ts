/**
 * Utilidades para validación y formateo de RUT chileno
 * El RUT (Rol Único Tributario) es el identificador único usado en Chile
 */

/**
 * Formatea un RUT agregando puntos y guión según el estándar chileno
 * @param rutInput - RUT sin formato (ej: "123456789")
 * @returns RUT formateado (ej: "12.345.678-9")
 */
export function formatRut(rutInput: string): string {
  // Remover todos los caracteres no numéricos excepto 'k' o 'K' (dígito verificador)
  const cleanedRutString = rutInput.replace(/[^0-9kK]/g, "").toLowerCase()

  if (cleanedRutString.length < 2) return cleanedRutString

  // Separar número del RUT y dígito verificador
  const rutNumberPortion = cleanedRutString.slice(0, -1)
  const verificationDigitCharacter = cleanedRutString.slice(-1)

  // Aplicar formato con puntos cada tres dígitos
  const formattedRutNumber = rutNumberPortion.replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return `${formattedRutNumber}-${verificationDigitCharacter}`
}

/**
 * Valida si un RUT chileno es matemáticamente correcto
 * Utiliza el algoritmo oficial de validación del dígito verificador
 * @param rutToValidate - RUT a validar (puede estar formateado o no)
 * @returns true si el RUT es válido, false en caso contrario
 */
export function validateRut(rutToValidate: string): boolean {
  // Limpiar formato del RUT
  const cleanedRutForValidation = rutToValidate.replace(/[^0-9kK]/g, "").toLowerCase()

  if (cleanedRutForValidation.length < 2) return false

  const rutNumberForCalculation = cleanedRutForValidation.slice(0, -1)
  const providedVerificationDigit = cleanedRutForValidation.slice(-1)

  // Calcular dígito verificador usando el algoritmo oficial chileno
  let calculationSum = 0
  let digitMultiplier = 2

  // Recorrer dígitos del RUT de derecha a izquierda
  for (let digitIndex = rutNumberForCalculation.length - 1; digitIndex >= 0; digitIndex--) {
    calculationSum += Number.parseInt(rutNumberForCalculation[digitIndex]) * digitMultiplier
    // El multiplicador va de 2 a 7 y luego vuelve a 2
    digitMultiplier = digitMultiplier === 7 ? 2 : digitMultiplier + 1
  }

  const divisionRemainder = calculationSum % 11
  const expectedVerificationDigit =
    divisionRemainder === 0 ? "0" : divisionRemainder === 1 ? "k" : (11 - divisionRemainder).toString()

  return expectedVerificationDigit === providedVerificationDigit
}

/**
 * Verifica si un RUT tiene el formato visual correcto (XX.XXX.XXX-X)
 * @param rutToCheck - RUT a verificar formato
 * @returns true si tiene el formato correcto, false en caso contrario
 */
export function isValidRutFormat(rutToCheck: string): boolean {
  // Expresión regular para formato chileno estándar: XX.XXX.XXX-X
  const chileanRutFormatRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/
  return chileanRutFormatRegex.test(rutToCheck)
}
