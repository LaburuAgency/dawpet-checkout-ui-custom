import { $ } from '../utils/dom.js'

// Form placeholder management
export const changePlaceholder = () => {
  // Use waitForElement utility instead of setInterval
  $.waitForElement('#cart-coupon', 5000)
    .then((couponField) => {
      couponField.setAttribute('placeholder', 'Introduce el cupón')
    })
    .catch(() => {
      // Element not found within timeout - silent fail
    })
}

export const addPlaceholder = () => {
  const placeholders = {
    '#client-email': 'correo@ejemplo.com',
    '#client-first-name': 'Nombre',
    '#client-last-name': 'Apellido',
  }

  Object.entries(placeholders).forEach(([selector, placeholder]) => {
    const field = $.select(selector)
    if (field) {
      field.setAttribute('placeholder', placeholder)
    }
  })

  // Set document placeholder based on the document type selector's current value
  // This ensures the placeholder is re-applied after VTEX re-renders the form
  const documentField = $.select('#client-document')
  if (documentField) {
    const docTypeSelector = document.querySelector('#document-type-selector')
    const docType = docTypeSelector ? docTypeSelector.value : 'cpf'
    const docPlaceholders = {
      cpf: 'Ej: 1020782291',
      'foreign-id': 'Ej: 1234567',
      nit: 'Ej: 900123456-1',
      passport: 'Ej: AB1234567',
    }
    documentField.setAttribute('placeholder', docPlaceholders[docType] || 'Ej: 1020782291')
  }
}

export const addTermsAndConditions = () => {
  const customMessage = $.select('.custom-privacy-message')
  if (customMessage) {
    customMessage.remove()
  }
}
