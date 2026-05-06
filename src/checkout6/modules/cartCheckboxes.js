import { $, createElementWithHTML, insertBefore } from '../utils/dom.js'

export const addCartCheckboxes = () => {
  let checkboxesAdded = false

  const preventClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const checkButtonState = () => {
    const cartLink = $.select('#cart-to-orderform')
    if (!cartLink) {
      return
    }

    const termsChecked = $.select('#terms-checkbox')?.checked || false
    const privacyChecked = $.select('#privacy-checkbox')?.checked || false

    if (termsChecked && privacyChecked) {
      cartLink.removeAttribute('disabled')
      cartLink.classList.remove('disabled-link')
      cartLink.style.opacity = '1'
      cartLink.style.pointerEvents = 'auto'
      cartLink.style.cursor = 'pointer'
      cartLink.removeEventListener('click', preventClick)
    } else {
      cartLink.setAttribute('disabled', 'true')
      cartLink.classList.add('disabled-link')
      cartLink.style.opacity = '0.5'
      cartLink.style.pointerEvents = 'none'
      cartLink.style.cursor = 'not-allowed'
      cartLink.addEventListener('click', preventClick)
    }
  }

  const createCheckboxes = (cartLink) => {
    const checkboxesHTML = `
      <div class="cart-checkboxes-container">
        <div class="checkbox-item">
          <input type="checkbox" id="terms-checkbox" name="terms-checkbox">
          <label for="terms-checkbox">Acepto los <a href="/politicas-de-envio" target="_blank" rel="noopener noreferrer">términos y condiciones</a></label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="privacy-checkbox" name="privacy-checkbox">
          <label for="privacy-checkbox">Acepto la <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">política de tratamiento de datos</a></label>
        </div>
      </div>
    `

    const checkboxesContainer = createElementWithHTML(checkboxesHTML)
    insertBefore(checkboxesContainer, cartLink)

    // Add event listeners
    $.select('#terms-checkbox')?.addEventListener('change', checkButtonState)
    $.select('#privacy-checkbox')?.addEventListener('change', checkButtonState)

    checkboxesAdded = true
  }

  const initializeCheckboxes = () => {
    // Use MutationObserver instead of interval for better performance
    const observer = new MutationObserver(() => {
      const cartLink = $.select('#cart-to-orderform')

      if (cartLink && !checkboxesAdded) {
        // Always disable initially
        cartLink.setAttribute('disabled', 'true')
        cartLink.classList.add('disabled-link')
        cartLink.style.opacity = '0.5'
        cartLink.style.pointerEvents = 'none'
        cartLink.style.cursor = 'not-allowed'
        cartLink.addEventListener('click', preventClick)

        // Add checkboxes if not present
        if (!$.select('#terms-checkbox')) {
          createCheckboxes(cartLink)
        }

        checkButtonState()
        observer.disconnect() // Stop observing once initialized
      }
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Fallback timeout to prevent infinite observation
    setTimeout(() => {
      observer.disconnect()
    }, 10000)
  }

  // Initialize
  initializeCheckboxes()
}
