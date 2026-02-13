/**
 * Address Composer V2 Module
 * Enhanced UI version with visible preview and debounced input handling
 * Supports hydration from saved addresses in orderForm
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
 * Parses a composed address string back into its components.
 * Inverse of composeAddress().
 * @param {string} addressStr - e.g. "Avenida Carrera 32 # 32 - 32 | Chapinero"
 * @returns {{ via: string, n1: string, nHash: string, nDash: string, localidad: string } | null}
 */
const parseAddress = (addressStr) => {
  if (!addressStr || typeof addressStr !== 'string') return null

  const str = addressStr.trim()
  if (!str) return null

  // 1. Separate localidad (after " | ")
  let baseAddress = str
  let localidad = ''
  const pipeIdx = str.indexOf(' | ')
  if (pipeIdx !== -1) {
    baseAddress = str.substring(0, pipeIdx).trim()
    localidad = str.substring(pipeIdx + 3).trim()
  }

  // 2. Separate hash and dash numbers: split by " # " then " - "
  let leftPart = baseAddress
  let nHash = ''
  let nDash = ''
  const hashIdx = baseAddress.indexOf(' # ')
  if (hashIdx !== -1) {
    leftPart = baseAddress.substring(0, hashIdx).trim()
    const rightPart = baseAddress.substring(hashIdx + 3).trim()
    const dashIdx = rightPart.indexOf(' - ')
    if (dashIdx !== -1) {
      nHash = rightPart.substring(0, dashIdx).trim()
      nDash = rightPart.substring(dashIdx + 3).trim()
    } else {
      nHash = rightPart
    }
  }

  // 3. Extract via type: match longest option first
  const sortedVias = VIA_OPTIONS.slice(1).sort((a, b) => b.length - a.length)
  let via = ''
  let n1 = ''
  for (const option of sortedVias) {
    if (leftPart.startsWith(option)) {
      via = option
      n1 = leftPart.substring(option.length).trim()
      break
    }
  }

  if (!via) return null

  return { via, n1, nHash, nDash, localidad }
}

/**
 * Tries to hydrate address composer fields from the existing order form address.
 * Called when the composer is created to pre-fill fields for users with saved addresses.
 * @param {HTMLElement} shipStreet - Native street input element
 */
const tryHydrateFromOrderForm = (shipStreet) => {
  try {
    // Try native input first, then orderForm
    const addressStr =
      shipStreet?.value ||
      window.vtexjs?.checkout?.orderForm?.shippingData?.address?.street ||
      ''

    if (!addressStr) {
      console.log('[AddressComposer2] No address to hydrate from')
      return
    }

    const parsed = parseAddress(addressStr)
    if (!parsed) {
      console.log('[AddressComposer2] Could not parse address for hydration:', addressStr)
      return
    }

    // Set field values
    const viaEl = document.querySelector('#hs-via-v2')
    const n1El = document.querySelector('#hs-n1-v2')
    const nHashEl = document.querySelector('#hs-nhash-v2')
    const nDashEl = document.querySelector('#hs-ndash-v2')
    const localidadEl = document.querySelector('#hs-localidad-v2')

    if (viaEl) viaEl.value = parsed.via
    if (n1El) n1El.value = parsed.n1
    if (nHashEl) nHashEl.value = parsed.nHash
    if (nDashEl) nDashEl.value = parsed.nDash
    if (localidadEl && parsed.localidad) localidadEl.value = parsed.localidad

    // Update preview immediately (no debounce for hydration)
    const preview = document.querySelector('#hs-preview-v2')
    if (preview) {
      preview.textContent = addressStr
    }

    console.log('[AddressComposer2] Hydrated from order form:', parsed)
  } catch (error) {
    console.warn('[AddressComposer2] Error hydrating from order form:', error)
  }
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
        <input id="hs-n1-v2" class="hs-input-v2" type="text" inputmode="text" placeholder="132" aria-label="Número principal" required>
        <span class="hs-sep-v2">#</span>
        <input id="hs-nhash-v2" class="hs-input-v2" type="text" inputmode="text" placeholder="20" aria-label="Número #" required>
        <span class="hs-sep-v2">-</span>
        <input id="hs-ndash-v2" class="hs-input-v2" type="text" inputmode="text" placeholder="25" aria-label="Número -" required>
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

    // ⚠️ VALIDACIÓN DE TODOS LOS CAMPOS REQUERIDOS
    const hasValidVia = via.value && via.value !== VIA_OPTIONS[0]
    const hasN1 = n1.value.trim() !== ''
    const hasNHash = nhash.value.trim() !== ''
    const hasNDash = ndash.value.trim() !== ''
    const isBogota = isBogotaSelected()
    const hasValidLocalidad = !isBogota || (localidadValue && localidadValue !== LOCALIDADES_BOGOTA[0])

    // Aplicar/remover clase de error en cada campo
    via.classList.toggle('error', !hasValidVia)
    n1.classList.toggle('error', !hasN1)
    nhash.classList.toggle('error', !hasNHash)
    ndash.classList.toggle('error', !hasNDash)
    if (localidad) {
      localidad.classList.toggle('error', isBogota && !hasValidLocalidad)
    }

    const allValid = hasValidVia && hasN1 && hasNHash && hasNDash && hasValidLocalidad
    const fullAddress = allValid ? composeAddress(via.value, n1.value, nhash.value, ndash.value, localidadValue) : ''

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

      dispatchInputEvents(shipStreet)

      if (!allValid) {
        console.warn('[AddressComposer2] Campos requeridos faltantes')
      } else {
        console.log('[AddressComposer2] Native field updated immediately:', fullAddress)
      }
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
  // If an observer is already active, don't recreate it
  if (addressComposerObserver) {
    return
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
              tryHydrateFromOrderForm(shipStreet)
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

  // ALWAYS set up the observer when on shipping step.
  // This ensures we detect when Knockout renders the address form
  // (e.g. user clicks "Modificar la dirección seleccionada" from saved addresses list)
  setupAddressObserver()

  // Find native street input
  const shipStreet = document.querySelector(SELECTOR_STREET)
  if (!shipStreet) {
    console.log('[AddressComposer2] Native street input not found yet, observer will handle it')
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

  // Hydrate fields from saved address (if any)
  tryHydrateFromOrderForm(shipStreet)

  console.log('[AddressComposer2] Initialization complete')
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
