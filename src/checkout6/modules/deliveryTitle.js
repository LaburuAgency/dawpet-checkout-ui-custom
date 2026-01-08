/**
 * Module to update the delivery section title
 * Changes "Entrega" to "Tipo de entrega"
 */

const updateDeliveryTitle = () => {
  // Solo ejecutar en el paso del carrito
  if (!window.location.hash.includes('cart')) {
    return
  }

  const deliveryTitle = document.querySelector('.srp-main-title')

  if (deliveryTitle && deliveryTitle.textContent.trim() === 'Entrega') {
    deliveryTitle.textContent = 'Tipo de entrega'
  }
}

export { updateDeliveryTitle }
