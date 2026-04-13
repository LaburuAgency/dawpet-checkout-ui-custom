/**
 * Document Type Selector Module
 * Adds a dropdown selector for document type (Cédula, Pasaporte, Cédula de extranjería)
 * similar to the reference design
 */

let documentTypeContainer = null
let documentTypeObserver = null

const DOCUMENT_TYPES = [
  { value: 'cpf', label: 'Cédula de ciudadanía' },
  { value: 'foreign-id', label: 'Cédula de extranjería' },
  { value: 'nit', label: 'NIT' },
  { value: 'passport', label: 'Pasaporte' },
]

// Persist selected document type in the orderForm without changing clientProfileData.isCorporate
// We use openTextField because customData/setCustomData may not be available in this checkout context.
const OPEN_TEXT_NAMESPACE = 'hs'
const OPEN_TEXT_KEYS = {
  documentType: 'documentType',
  documentTypeLabel: 'documentTypeLabel',
}

const safeJsonParse = (value) => {
  if (!value || typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const toDeferredPromise = (d) =>
  new Promise((resolve, reject) => {
    if (!d || typeof d.done !== 'function' || typeof d.fail !== 'function') {
      reject(new Error('Expected a jQuery Deferred'))
      return
    }
    d.done(resolve).fail(reject)
  })

const getDocumentTypeMeta = (value) => DOCUMENT_TYPES.find((t) => t.value === value) || { value, label: value }

const setOpenTextFieldJson = async (patch) => {
  // VTEX checkout vtexjs uses jQuery Deferred, not native Promises
  if (!window?.vtexjs?.checkout?.getOrderForm || !window?.vtexjs?.checkout?.sendAttachment) return

  const of = await toDeferredPromise(window.vtexjs.checkout.getOrderForm())
  const currentRaw = of?.openTextField?.value || ''
  const current = safeJsonParse(currentRaw) || {}

  // Namespaced payload to avoid collisions with other scripts
  const next = {
    ...current,
    [OPEN_TEXT_NAMESPACE]: {
      ...(current[OPEN_TEXT_NAMESPACE] || {}),
      ...patch,
    },
  }

  // Persist back to orderForm
  await toDeferredPromise(
    window.vtexjs.checkout.sendAttachment('openTextField', {
      value: JSON.stringify(next),
    })
  )
}

const persistSelectedDocumentType = async (documentType) => {
  const meta = getDocumentTypeMeta(documentType)
  await setOpenTextFieldJson({
    [OPEN_TEXT_KEYS.documentType]: meta.value,
    [OPEN_TEXT_KEYS.documentTypeLabel]: meta.label,
  })
}

/**
 * Helper function to update input value and trigger Knockout.js events
 * @param {HTMLElement} input - The input element to update
 * @param {string} value - The value to set
 * @param {boolean} triggerValidation - Whether to trigger blur event for validation (default: false)
 */
const updateInputValue = (input, value, triggerValidation = false) => {
  if (!input) return
  input.value = value
  // Trigger events that Knockout.js listens to
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
  input.dispatchEvent(new Event('keyup', { bubbles: true }))
  // Only trigger blur to validate if explicitly requested
  if (triggerValidation) {
    input.dispatchEvent(new Event('blur', { bubbles: true }))
  }
}

/**
 * Creates and injects the document type selector
 */
const createDocumentTypeSelector = () => {
  // Find the document input field
  const documentInput = document.querySelector('#client-document')
  if (!documentInput) return null

  // Check if selector already exists
  if (document.querySelector('#document-type-selector-container')) {
    return document.querySelector('#document-type-selector-container')
  }

  // Find the parent container
  const documentBox = documentInput.closest('.client-document')
  if (!documentBox) return null

  // Create the selector container
  const container = document.createElement('div')
  container.id = 'document-type-selector-container'
  container.className = 'document-type-selector-wrapper'

  // Create the select element
  const select = document.createElement('select')
  select.id = 'document-type-selector'
  select.className = 'document-type-select'
  select.setAttribute('aria-label', 'Tipo de documento')

  // Add options
  DOCUMENT_TYPES.forEach((type) => {
    const option = document.createElement('option')
    option.value = type.value
    option.textContent = type.label
    select.appendChild(option)
  })

  // Add event listener to update document label and placeholder
  select.addEventListener('change', (e) => {
    // Pass isUserChange: true because this is a user-initiated change
    updateDocumentField(e.target.value, true)
  })

  container.appendChild(select)

  // Insert the selector before the document input
  if (documentInput.parentElement) {
    documentInput.parentElement.insertBefore(container, documentInput)
  } else if (documentBox.contains(documentInput)) {
    // Fallback por si cambia la estructura
    documentInput.before(container)
  } else {
    // Último recurso: al inicio del contenedor
    documentBox.insertBefore(container, documentBox.firstChild)
  }

  return container
}

/**
 * Updates the document field label and placeholder based on selected type
 * @param {string} documentType - The selected document type
 * @param {boolean} isUserChange - Whether this is a user-initiated change (default: false)
 */
const updateDocumentField = (documentType, isUserChange = false) => {
  const documentInput = document.querySelector('#client-document')
  const documentLabel = document.querySelector('label[for="client-document"]')

  if (!documentInput) return

  let label = 'Documento'
  let placeholder = ''

  switch (documentType) {
    case 'cpf':
      label = 'Cédula de ciudadanía'
      placeholder = 'Ej: 1020782291'
      break
    case 'foreign-id':
      label = 'Cédula de extranjería'
      placeholder = 'Ej: 1234567'
      break
    case 'nit':
      label = 'NIT'
      placeholder = 'Ej: 900123456-1'
      break
    case 'passport':
      label = 'Pasaporte'
      placeholder = 'Ej: AB1234567'
      break
  }

  // Update label
  if (documentLabel) {
    documentLabel.innerHTML = label + ' <span class="item-required">*</span>'
  }

  // Update placeholder
  documentInput.setAttribute('placeholder', placeholder)

  // Only clear document field when user explicitly changes types
  // Don't clear on initialization to preserve existing values
  if (isUserChange) {
    updateInputValue(documentInput, '', false)
  }

  // Store document type in a data attribute
  documentInput.setAttribute('data-document-type', documentType)

  // Persist selected type into orderForm.openTextField (non-blocking)
  persistSelectedDocumentType(documentType).catch(() => {
    // Silent fail: do not break checkout UI if VTEX blocks the attachment
  })

  // Handle NIT-specific form modifications
  handleNitFormChanges(documentType, isUserChange)
}

/**
 * Handles form modifications when NIT is selected
 * @param {string} documentType - The selected document type
 * @param {boolean} isUserChange - Whether this is a user-initiated change (default: false)
 */
const handleNitFormChanges = (documentType, isUserChange = false) => {
  const isNit = documentType === 'nit'

  // Get name and last name fields
  const firstNameInput = document.querySelector('#client-first-name')
  const lastNameInput = document.querySelector('#client-last-name')
  const firstNameBox = firstNameInput?.closest('.client-first-name')
  const lastNameBox = lastNameInput?.closest('.client-last-name')

  // Get the name fields wrapper to toggle layout
  const nameFieldsWrapper = document.querySelector('#name-fields-wrapper')

  // Get company data section - ALWAYS HIDE IT
  const companyDataSection = document.querySelector('.box-client-info-pj')

  // ALWAYS hide company data section for all document types
  if (companyDataSection) {
    companyDataSection.style.display = 'none'
    // Fill company fields automatically to avoid validation issues
    const companyNameInput = document.querySelector('#client-company-name')
    const tradeNameInput = document.querySelector('#client-trading-name')
    if (companyNameInput && firstNameInput) {
      // Sync company name with first name (or razón social if NIT)
      const syncCompanyName = (e) => {
        // When user leaves field (blur), trigger validation on synced fields
        const isUserInteraction = e && e.type === 'blur'
        updateInputValue(companyNameInput, firstNameInput.value, isUserInteraction)
        if (tradeNameInput) {
          updateInputValue(tradeNameInput, firstNameInput.value, isUserInteraction)
        }
      }
      firstNameInput.addEventListener('input', syncCompanyName)
      firstNameInput.addEventListener('blur', syncCompanyName)
    }
  }

  if (isNit) {
    // Add nit-mode class to wrapper for single column layout
    if (nameFieldsWrapper) {
      nameFieldsWrapper.classList.add('nit-mode')
    }

    // Hide last name field but sync it with first name for VTEX compatibility
    if (lastNameBox) {
      lastNameBox.style.display = 'none'
      if (lastNameInput) {
        lastNameInput.removeAttribute('required')
        // Sync last name with first name automatically for NIT
        const syncLastName = (e) => {
          if (firstNameInput && firstNameInput.value) {
            // Only trigger validation when user interacts (blur event)
            const isUserInteraction = e && e.type === 'blur'
            updateInputValue(lastNameInput, firstNameInput.value, isUserInteraction)
          }
        }
        // Remove old listeners to avoid duplicates
        firstNameInput?.removeEventListener('input', syncLastName)
        firstNameInput?.removeEventListener('blur', syncLastName)
        // Add new listeners
        firstNameInput?.addEventListener('input', syncLastName)
        firstNameInput?.addEventListener('blur', syncLastName)
      }
    }

    // Modify first name field to be "Razón Social"
    if (firstNameInput) {
      const firstNameLabel = document.querySelector('label[for="client-first-name"]')
      if (firstNameLabel) {
        firstNameLabel.innerHTML = 'Razón Social <span class="item-required">*</span>'
      }
      firstNameInput.setAttribute('placeholder', 'Ej: HomeSentry S.A.S.')
      // Only clear the field when user switches to NIT, not on initialization
      if (isUserChange) {
        updateInputValue(firstNameInput, '', false)
      }
      // Make first name field wider
      if (firstNameBox) {
        firstNameBox.style.width = '100%'
        firstNameBox.style.maxWidth = '100%'
      }
    }
  } else {
    // Remove nit-mode class to restore two column layout
    if (nameFieldsWrapper) {
      nameFieldsWrapper.classList.remove('nit-mode')
    }

    // Restore normal form behavior for persona natural
    if (lastNameBox) {
      lastNameBox.style.display = ''
      if (lastNameInput) {
        // Only clear the field when user switches from NIT, not on initialization
        if (isUserChange) {
          updateInputValue(lastNameInput, '', false)
        }
        lastNameInput.setAttribute('required', 'required')
      }
    }

    if (firstNameInput) {
      const firstNameLabel = document.querySelector('label[for="client-first-name"]')
      if (firstNameLabel) {
        firstNameLabel.innerHTML = 'Nombre <span class="item-required">*</span>'
      }
      firstNameInput.setAttribute('placeholder', 'Nombre')
      // Only clear the field when user switches from NIT, not on initialization
      if (isUserChange) {
        updateInputValue(firstNameInput, '', false)
      }
      if (firstNameBox) {
        firstNameBox.style.width = ''
        firstNameBox.style.maxWidth = ''
      }
    }
  }
}

/**
 * Wraps client-first-name and client-last-name in a flex row container
 */
const wrapNameFields = () => {
  const firstNameBox = document.querySelector('p.client-first-name')
  const lastNameBox = document.querySelector('p.client-last-name')

  // Check if already wrapped
  if (document.querySelector('#name-fields-wrapper')) {
    return
  }

  if (!firstNameBox || !lastNameBox) return

  // Create wrapper div
  const wrapper = document.createElement('div')
  wrapper.id = 'name-fields-wrapper'
  wrapper.className = 'name-fields-wrapper'

  // Get parent element
  const parent = firstNameBox.parentElement
  if (!parent) return

  // Insert wrapper before first name
  parent.insertBefore(wrapper, firstNameBox)

  // Move both fields into wrapper
  wrapper.appendChild(firstNameBox)
  wrapper.appendChild(lastNameBox)
}

/**
 * Adds the document type selector to the profile form
 */
export const addDocumentTypeSelector = () => {
  const hash = window.location.hash

  // Only run on profile/email step
  if (!hash.includes('profile') && !hash.includes('email')) {
    removeDocumentTypeSelector()
    return
  }

  // Wait for the form to be available
  const checkFormInterval = setInterval(() => {
    const documentInput = document.querySelector('#client-document')

    if (documentInput && !document.querySelector('#document-type-selector-container')) {
      clearInterval(checkFormInterval)

      // Wrap name fields in a flex row
      wrapNameFields()

      // Create the selector
      documentTypeContainer = createDocumentTypeSelector()

      // Initialize with default type
      if (documentTypeContainer) {
        const select = document.querySelector('#document-type-selector')
        const currentValue = select ? select.value : 'cpf'
        updateDocumentField(currentValue)
      }

      // Set up observer to re-add selector if DOM changes
      setupDocumentObserver()
    }
  }, 100)

  // Clear interval after 5 seconds to prevent infinite checking
  setTimeout(() => clearInterval(checkFormInterval), 5000)
}

/**
 * Sets up a MutationObserver to watch for DOM changes
 */
const setupDocumentObserver = () => {
  if (documentTypeObserver) {
    documentTypeObserver.disconnect()
  }

  const targetNode = document.querySelector('.client-profile-data')
  if (!targetNode) return

  documentTypeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'subtree') {
        // Check if selector was removed
        if (!document.querySelector('#document-type-selector-container')) {
          const documentInput = document.querySelector('#client-document')
          if (documentInput) {
            documentTypeContainer = createDocumentTypeSelector()
            if (documentTypeContainer) {
              const select = document.querySelector('#document-type-selector')
              if (select) {
                updateDocumentField(select.value)
              }
            }
          }
        }
      }
    })
  })

  documentTypeObserver.observe(targetNode, {
    childList: true,
    subtree: true,
  })
}

/**
 * Removes the document type selector
 */
export const removeDocumentTypeSelector = () => {
  if (documentTypeContainer && document.contains(documentTypeContainer)) {
    documentTypeContainer.remove()
    documentTypeContainer = null
  }

  if (documentTypeObserver) {
    documentTypeObserver.disconnect()
    documentTypeObserver = null
  }
}
