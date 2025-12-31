// src/checkout6/modules/addressComposer.js
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

const SELECTOR_STREET = '#ship-street, input[name="ship-street"]'
const WRAPPER_ID = 'hs-address-composer'

const composeAddress = (via, n1, nHash, nDash) => {
  if (!via || via === VIA_OPTIONS[0]) return ''
  const p1 = via.trim()
  const p2 = n1 ? ` ${n1.trim()}` : ''
  const p3 = nHash ? ` # ${nHash.trim()}` : ''
  const p4 = nDash ? ` - ${nDash.trim()}` : ''
  return `${p1}${p2}${p3}${p4}`.trim()
}

const ensureUI = (shipStreet) => {
  // Evita duplicados
  if (document.getElementById(WRAPPER_ID)) return null

  const wrapper = document.createElement('div')
  wrapper.id = WRAPPER_ID
  wrapper.className = 'hs-address-composer'
  wrapper.innerHTML = `
    <div class="hs-address-grid">
        <div class="hs-select">
            <label class="hs-label">Tipo de vía*</label>
            <select id="hs-via" class="hs-select" aria-label="Tipo de vía">
                ${VIA_OPTIONS.map((o) => `<option value="${o}">${o}</option>`).join('')}
            </select>
        </div>    
        <input id="hs-n1" class="hs-input" type="text" inputmode="numeric" placeholder="12" aria-label="Número principal">
        <span class="hs-sep">#</span>
        <input id="hs-nhash" class="hs-input" type="text" inputmode="numeric" placeholder="12" aria-label="Número #">
        <span class="hs-sep">-</span>
        <input id="hs-ndash" class="hs-input" type="text" inputmode="numeric" placeholder="12" aria-label="Número -">
        <div class="hs-preview" id="hs-preview" aria-live="polite"></div>
    </div>
  `

  shipStreet.parentElement.insertBefore(wrapper, shipStreet)
  shipStreet.classList.add('hs-hidden-ship-street')
  shipStreet.setAttribute('aria-hidden', 'true')
  return wrapper
}

const bindEvents = (wrapper, shipStreet) => {
  const via = wrapper.querySelector('#hs-via')
  const n1 = wrapper.querySelector('#hs-n1')
  const nhash = wrapper.querySelector('#hs-nhash')
  const ndash = wrapper.querySelector('#hs-ndash')
  const preview = wrapper.querySelector('#hs-preview')

  const pushToVTEX = () => {
    const value = composeAddress(via.value, n1.value, nhash.value, ndash.value)
    preview.textContent = value || 'Dirección'
    shipStreet.value = value
    // shipStreet.dispatchEvent(new Event('input', { bubbles: true }))
    // shipStreet.dispatchEvent(new Event('change', { bubbles: true }))
  }

  ;[via, n1, nhash, ndash].forEach((el) => el.addEventListener('input', pushToVTEX))
  // Inicializa preview
  pushToVTEX()
}

// API pública en el mismo estilo que tus otros módulos
export const addAddressComposer = () => {
  // Solo en el paso de envío o cuando exista el campo
  const onShippingStep = window.location.hash.includes('shipping') || window.location.hash.includes('delivery')
  const shipStreet = document.querySelector(SELECTOR_STREET)
  if (!onShippingStep && !shipStreet) return

  const streetEl = shipStreet || document.querySelector(SELECTOR_STREET)
  if (!streetEl) return

  const wrapper = ensureUI(streetEl)
  if (!wrapper) return // ya estaba montado

  bindEvents(wrapper, streetEl)
}
