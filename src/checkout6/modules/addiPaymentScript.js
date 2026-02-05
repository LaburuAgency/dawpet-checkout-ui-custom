const ADDI_SCRIPT_URL = 'https://s3.amazonaws.com/statics.addi.com/vtex/js/vtex-checkout-co.bundle.min.js'

let addiScriptLoaded = false

export const loadAddiPaymentScript = () => {
  if (addiScriptLoaded) return

  window.addiAllySlug = 'homesentry-ecommerce'

  const script = document.createElement('script')
  script.src = ADDI_SCRIPT_URL
  document.head.appendChild(script)

  addiScriptLoaded = true
}
