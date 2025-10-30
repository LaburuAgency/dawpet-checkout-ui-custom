/**
 * Phone Template Module
 * Detects the phone template div and adds a class selector for styling
 * Target: <div data-bind="template: {name: phoneTemplate(), afterRender: window.vtex.i18n.translateHtml }">
 */

let phoneTemplateObserver = null

/**
 * Finds and marks the phone template div with a unique class
 */
const markPhoneTemplate = () => {
  // Find all divs with data-bind attribute
  const allDivs = document.querySelectorAll('div[data-bind]')

  for (const div of allDivs) {
    const dataBind = div.getAttribute('data-bind')

    // Check if this is the phone template div
    if (dataBind && dataBind.includes('phoneTemplate()') && dataBind.includes('afterRender')) {
      // Add a class if it doesn't already have it
      if (!div.classList.contains('phone-template-container')) {
        div.classList.add('phone-template-container')
      }
      return div
    }
  }

  return null
}

/**
 * Sets up a MutationObserver to watch for the phone template div
 */
const setupPhoneTemplateObserver = () => {
  if (phoneTemplateObserver) {
    phoneTemplateObserver.disconnect()
  }

  const targetNode = document.querySelector('.client-profile-data') || document.querySelector('.box-client-info-pf')
  if (!targetNode) return

  phoneTemplateObserver = new MutationObserver(() => {
    // Check if phone template needs marking
    if (!document.querySelector('.phone-template-container')) {
      markPhoneTemplate()
    }
  })

  phoneTemplateObserver.observe(targetNode, {
    childList: true,
    subtree: true,
  })
}

/**
 * Adds the phone template selector
 */
export const addPhoneTemplateSelector = () => {
  const hash = window.location.hash

  // Only run on profile/email step
  if (!hash.includes('profile') && !hash.includes('email')) {
    removePhoneTemplateSelector()
    return
  }

  // Try to mark the phone template immediately
  const phoneDiv = markPhoneTemplate()

  // If not found, set up observer to watch for it
  if (!phoneDiv) {
    // Use interval to check for the phone template div
    const checkInterval = setInterval(() => {
      const found = markPhoneTemplate()

      if (found) {
        clearInterval(checkInterval)
        setupPhoneTemplateObserver()
      }
    }, 100)

    // Clear interval after 5 seconds
    setTimeout(() => clearInterval(checkInterval), 5000)
  } else {
    // Setup observer even if found
    setupPhoneTemplateObserver()
  }
}

/**
 * Removes the phone template selector
 */
export const removePhoneTemplateSelector = () => {
  if (phoneTemplateObserver) {
    phoneTemplateObserver.disconnect()
    phoneTemplateObserver = null
  }

  // Remove the class from the phone template div
  const phoneDiv = document.querySelector('.phone-template-container')
  if (phoneDiv) {
    phoneDiv.classList.remove('phone-template-container')
  }
}
