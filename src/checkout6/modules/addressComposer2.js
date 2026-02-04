/**
 * Address Composer V2 Module
 * Enhanced UI version with visible preview and debounced input handling
 * UI-only mode - no persistence or rehydration
 */

// Constants
const VIA_OPTIONS = [
  'Seleccionar tipo de vía',
  'Avenida',
  'Avenida Calle',
  'Avenida Carrera',
  'Calle',
  'Carrera',
  'Circular',
  'Diagonal',
  'Transversal',
  'Autopista',
  'Kilómetro',
  'Circunvalar',
  'Manzana',
  'Apartado Aéreo',
]

const LOCALIDADES_BOGOTA = [
  'Seleccionar localidad',
  'Usaquén',
  'Chapinero',
  'Santa Fe',
  'San Cristóbal',
  'Usme',
  'Tunjuelito',
  'Bosa',
  'Kennedy',
  'Fontibón',
  'Engativá',
  'Suba',
  'Barrios Unidos',
  'Teusaquillo',
  'Los Mártires',
  'Antonio Nariño',
  'Puente Aranda',
  'La Candelaria',
  'Rafael Uribe Uribe',
  'Ciudad Bolívar',
  'Sumapaz',
]

const WRAPPER_ID = 'hs-address-composer-v2'
const SELECTOR_STREET =
  '#ship-street, input[name="ship-street"], #shipStreet, input[name="street"], input[data-bind*="street"]'
const DEBOUNCE_DELAY = 300

// State variables
let addressComposerContainer = null
let addressComposerObserver = null
let debounceTimer = null
let orderFormUpdateHandler = null

/**
 * Composes address string from components
 * @param {string} via - Street type (Avenida, Calle, etc.)
 * @param {string} n1 - Main street number
 * @param {string} nHash - Number after #
 * @param {string} nDash - Number after -
 * @param {string} localidad - Localidad (only for Bogotá D.C.)
 * @returns {string} Formatted address string
 */
const composeAddress = (via, n1, nHash, nDash, localidad = '') => {
  if (!via || via === VIA_OPTIONS[0]) return ''
  const p1 = via.trim()
  const p2 = n1 ? ` ${String(n1).trim()}` : ''
  const p3 = nHash ? ` # ${String(nHash).trim()}` : ''
  const p4 = nDash ? ` - ${String(nDash).trim()}` : ''
  const baseAddress = `${p1}${p2}${p3}${p4}`.trim()

  // Agregar localidad con pipe si está seleccionada y no es la opción por defecto
  if (localidad && localidad !== LOCALIDADES_BOGOTA[0]) {
    return `${baseAddress} | ${localidad.trim()}`
  }

  return baseAddress
}

/**
 * Dispatches events for VTEX validation (Knockout.js compatibility)
 * @param {HTMLElement} element - Input element to trigger events on
 */
const dispatchInputEvents = (element) => {
  if (!element) return
  const events = ['input', 'change', 'blur']
  events.forEach((eventType) => {
    element.dispatchEvent(new Event(eventType, { bubbles: true }))
    // Some listeners expect a KeyboardEvent-like path; keep it lightweight
  })
}

/**
 * Detecta si el usuario ha seleccionado Bogotá, D.C.
 * @returns {boolean} True si la ciudad es Bogotá y estado es DC
 */
const isBogotaSelected = () => {
  try {
    const address = window.vtexjs?.checkout?.orderForm?.shippingData?.address

    if (!address) return false

    // Normalizar a lowercase para comparaciones
    const cityLower = address.city?.toLowerCase() || ''
    const stateLower = address.state?.toLowerCase() || ''

    // VTEX retorna state como "Bogotá, D.C." (texto completo)
    const isBogota = cityLower.includes('bogotá') || cityLower.includes('bogota')
    const isDC = stateLower.includes('d.c') || stateLower.includes('dc')

    return isBogota && isDC
  } catch (error) {
    console.warn('[AddressComposer2] Error checking Bogotá:', error)
    return false
  }
}

/**
 * Debounced function - updates preview only (for UX smoothness)
 * @param {string} via - Street type value
 * @param {string} n1 - Main number value
 * @param {string} nhash - Hash number value
 * @param {string} ndash - Dash number value
 * @param {string} localidad - Localidad value
 */
const updatePreviewDebounced = (via, n1, nhash, ndash, localidad = '') => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer
  debounceTimer = setTimeout(() => {
    const fullAddress = composeAddress(via, n1, nhash, ndash, localidad)

    // Update preview
    const preview = document.querySelector('#hs-preview-v2')
    if (preview) {
      preview.textContent = fullAddress || 'Dirección'
    }

    console.log('[AddressComposer2] Preview updated:', fullAddress)
  }, DEBOUNCE_DELAY)
}

/**
 * Creates the address composer UI
 * @param {HTMLElement} shipStreet - Native street input element
 * @returns {HTMLElement|null} Wrapper element or null if already exists
 */
const ensureUI = (shipStreet) => {
  // Avoid duplicates
  if (document.getElementById(WRAPPER_ID)) {
    console.log('[AddressComposer2] UI already mounted, skipping')
    return null
  }

  const wrapper = document.createElement('div')
  wrapper.id = WRAPPER_ID
  wrapper.className = 'hs-address-composer-v2'
  wrapper.innerHTML = `
    <div class="hs-address-grid-v2">
        <div class="hs-select-v2">
            <label class="hs-label-v2">Tipo de vía*</label>
            <select id="hs-via-v2" class="hs-select-v2" aria-label="Tipo de vía">
                ${VIA_OPTIONS.map((o) => `<option value="${o}">${o}</option>`).join('')}
            </select>
        </div>
        <input id="hs-n1-v2" class="hs-input-v2" type="text" inputmode="text" placeholder="132" aria-label="Número principal">
        <span class="hs-sep-v2">#</span>
        <input id="hs-nhash-v2" class="hs-input-v2" type="text" inputmode="text" placeholder="20" aria-label="Número #">
        <span class="hs-sep-v2">-</span>
        <input id="hs-ndash-v2" class="hs-input-v2" type="text" inputmode="text" placeholder="25" aria-label="Número -">
    </div>
    <div class="hs-localidad-container-v2" id="hs-localidad-container-v2" style="display: none;">
        <label class="hs-label-v2">Localidad*</label>
        <select id="hs-localidad-v2" class="hs-select-v2" aria-label="Localidad">
            ${LOCALIDADES_BOGOTA.map((o) => `<option value="${o}">${o}</option>`).join('')}
        </select>
    </div>
    <div class="hs-preview-v2" id="hs-preview-v2" aria-live="polite">Dirección</div>
  `

  // Insert before native input
  shipStreet.parentElement.insertBefore(wrapper, shipStreet)

  // Hide native input with inline styles (more persistent than classes against VTEX/Knockout)
  // VTEX overwrites the 'class' attribute, so we use inline styles instead
  shipStreet.setAttribute(
    'style',
    'position: absolute !important; left: -9999px !important; width: 1px !important; height: 1px !important; opacity: 0 !important; pointer-events: none !important;'
  )
  shipStreet.setAttribute('aria-hidden', 'true')

  console.log('[AddressComposer2] UI created successfully with inline styles')
  return wrapper
}

/**
 * Binds event listeners to address inputs
 * @param {HTMLElement} wrapper - Wrapper containing address inputs
 * @param {HTMLElement} shipStreet - Native street input element
 */
const bindEvents = (wrapper, shipStreet) => {
  const via = wrapper.querySelector('#hs-via-v2')
  const n1 = wrapper.querySelector('#hs-n1-v2')
  const nhash = wrapper.querySelector('#hs-nhash-v2')
  const ndash = wrapper.querySelector('#hs-ndash-v2')
  const localidadContainer = wrapper.querySelector('#hs-localidad-container-v2')
  const localidad = wrapper.querySelector('#hs-localidad-v2')

  if (!via || !n1 || !nhash || !ndash) {
    console.error('[AddressComposer2] Failed to find input elements')
    return
  }

  // Use native value setter so Knockout/VTEX bindings detect the change reliably
  const nativeValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set

  // Function to toggle localidad field visibility
  const toggleLocalidadField = () => {
    const isBogota = isBogotaSelected()
    const wasVisible = localidadContainer?.style.display === 'block'

    if (localidadContainer) {
      localidadContainer.style.display = isBogota ? 'block' : 'none'

      // ⚠️ RESETEAR SELECCIÓN cuando sale de Bogotá
      if (!isBogota && wasVisible && localidad) {
        // Usuario salió de Bogotá, resetear el select
        localidad.value = LOCALIDADES_BOGOTA[0] // "Seleccionar localidad"
        localidad.classList.remove('error') // Remover error si existía

        // Actualizar la dirección sin localidad
        onChange()

        console.log('[AddressComposer2] Localidad reseteada (usuario salió de Bogotá)')
      }

      console.log('[AddressComposer2] Localidad field:', isBogota ? 'visible' : 'hidden')
    }
  }

  // Create onChange handler
  const onChange = () => {
    const localidadValue = localidad?.value || ''
    const fullAddress = composeAddress(via.value, n1.value, nhash.value, ndash.value, localidadValue)

    // Update native field IMMEDIATELY (critical for form submission)
    // No debounce here to ensure value is set before user clicks submit
    if (shipStreet) {
      // IMPORTANT:
      // - Updating `.value` changes the *property* but NOT the `value=""` attribute you see in Elements.
      // - VTEX Checkout (Knockout) often listens to input/change to sync the observable.
      // So we set using the native setter and dispatch events.
      if (nativeValueSetter) {
        nativeValueSetter.call(shipStreet, fullAddress)
      } else {
        shipStreet.value = fullAddress
      }

      // ⚠️ VALIDACIÓN OBLIGATORIA DE LOCALIDAD
      const isBogota = isBogotaSelected()
      const hasValidLocalidad = !isBogota || (localidadValue && localidadValue !== LOCALIDADES_BOGOTA[0])

      if (!hasValidLocalidad) {
        // Si está en Bogotá pero no seleccionó localidad válida
        // Agregar clase de error al select
        if (localidad) {
          localidad.classList.add('error')
        }
        console.warn('[AddressComposer2] Localidad requerida en Bogotá')
      } else {
        // Remover clase de error si existe
        if (localidad) {
          localidad.classList.remove('error')
        }
      }

      dispatchInputEvents(shipStreet)

      console.log('[AddressComposer2] Native field updated immediately:', fullAddress)
    }

    // Update preview with debounce for smoother UX
    updatePreviewDebounced(via.value, n1.value, nhash.value, ndash.value, localidadValue)
  }

  // Attach listeners to all inputs
  ;[via, n1, nhash, ndash].forEach((el) => {
    el.addEventListener('input', onChange)
    el.addEventListener('change', onChange)
  })

  // Add listener to localidad if it exists
  if (localidad) {
    localidad.addEventListener('input', onChange)
    localidad.addEventListener('change', onChange)
  }

  // Listen to orderForm updates to detect city changes
  const handleOrderFormUpdate = () => {
    toggleLocalidadField()
  }

  // Guardar referencia para cleanup
  orderFormUpdateHandler = handleOrderFormUpdate

  window.addEventListener('orderFormUpdated.vtex', handleOrderFormUpdate)

  // Initial check
  toggleLocalidadField()

  // Initialize with current values (COMENTADO para prevenir validación prematura)
  // onChange()

  console.log('[AddressComposer2] Event listeners bound successfully')
}

/**
 * Sets up MutationObserver to handle DOM changes
 */
const setupAddressObserver = () => {
  if (addressComposerObserver) {
    addressComposerObserver.disconnect()
  }

  const targetNode = document.querySelector('#shipping-data') || document.querySelector('.ship-address')
  if (!targetNode) {
    console.warn('[AddressComposer2] No target node found for MutationObserver')
    return
  }

  addressComposerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'subtree') {
        // Check if wrapper was removed
        if (!document.getElementById(WRAPPER_ID)) {
          const shipStreet = document.querySelector(SELECTOR_STREET)
          if (shipStreet) {
            console.log('[AddressComposer2] DOM changed, re-creating UI')
            const wrapper = ensureUI(shipStreet)
            if (wrapper) {
              tryHydrateFromOrderForm()
              bindEvents(wrapper, shipStreet)
            }
          }
        }
      }
    })
  })

  addressComposerObserver.observe(targetNode, {
    childList: true,
    subtree: true,
  })

  console.log('[AddressComposer2] MutationObserver set up successfully')
}

/**
 * Main function to add address composer v2
 * Called from eventHandlers on various checkout events
 */
export const addAddressComposer2 = () => {
  // Only run on shipping/delivery step
  const onShippingStep = window.location.hash.includes('shipping') || window.location.hash.includes('delivery')

  if (!onShippingStep) {
    removeAddressComposer2()
    return
  }

  // Find native street input
  const shipStreet = document.querySelector(SELECTOR_STREET)
  if (!shipStreet) {
    console.log('[AddressComposer2] Native street input not found yet')
    return
  }

  // Check if already mounted
  if (document.getElementById(WRAPPER_ID)) {
    console.log('[AddressComposer2] Already mounted, skipping initialization')
    return
  }

  console.log('[AddressComposer2] Initializing...')

  // Create UI
  const wrapper = ensureUI(shipStreet)
  if (!wrapper) return // Already mounted

  // Store reference
  addressComposerContainer = wrapper

  // Bind events
  bindEvents(wrapper, shipStreet)

  // Setup observer
  setupAddressObserver()

  console.log('[AddressComposer2] Initialization complete (UI only mode)')
}

/**
 * Cleanup function to remove address composer v2
 * Called when user navigates away from shipping step
 */
export const removeAddressComposer2 = () => {
  // Remove DOM element
  if (addressComposerContainer && document.contains(addressComposerContainer)) {
    addressComposerContainer.remove()
    addressComposerContainer = null
    console.log('[AddressComposer2] UI removed')
  }

  // Disconnect observer
  if (addressComposerObserver) {
    addressComposerObserver.disconnect()
    addressComposerObserver = null
    console.log('[AddressComposer2] Observer disconnected')
  }

  // Clear debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
    console.log('[AddressComposer2] Debounce timer cleared')
  }

  // Remove orderForm listener
  if (orderFormUpdateHandler) {
    window.removeEventListener('orderFormUpdated.vtex', orderFormUpdateHandler)
    orderFormUpdateHandler = null
    console.log('[AddressComposer2] OrderForm listener removed')
  }
}
