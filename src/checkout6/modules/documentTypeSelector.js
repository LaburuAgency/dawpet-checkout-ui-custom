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
]

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

  console.log(documentBox)

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
    updateDocumentField(e.target.value)
  })

  container.appendChild(select)

  console.log(container, documentInput.parentElement)

  // Insert the selector before the document input
 // Insertar el selector ANTES del input (mismo padre del input)
if (documentInput.parentElement) {
  documentInput.parentElement.insertBefore(container, documentInput);
} else if (documentBox.contains(documentInput)) {
  // Fallback por si cambia la estructura
  documentInput.before(container);
} else {
  // Último recurso: al inicio del contenedor
  documentBox.insertBefore(container, documentBox.firstChild);
}

  

  return container
}

/**
 * Updates the document field label and placeholder based on selected type
 */
const updateDocumentField = (documentType) => {
  const documentInput = document.querySelector('#client-document')
  const documentLabel = document.querySelector('label[for="client-document"]')

  if (!documentInput) return

  let label = 'Documento'
  let placeholder = ''
  let mask = ''

  switch (documentType) {
    case 'cpf':
      label = 'Cédula de ciudadanía'
      placeholder = 'Ej: 1020782291'
      mask = 'numeric'
      break
    case 'foreign-id':
      label = 'Cédula de extranjería'
      placeholder = 'Ej: 1234567'
      mask = 'alphanumeric'
      break
  }

  // Update label
  if (documentLabel) {
    documentLabel.innerHTML = label + ' <span class="item-required">*</span>'
  }

  // Update placeholder
  documentInput.setAttribute('placeholder', placeholder)

  // Store document type in a data attribute
  documentInput.setAttribute('data-document-type', documentType)
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

      // Create the selector
      documentTypeContainer = createDocumentTypeSelector()

      // Initialize with default type
      if (documentTypeContainer) {
        updateDocumentField('cpf')
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