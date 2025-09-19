import { h, render } from 'preact'
import CartTitle from '../components/CartTitle.jsx'

let cartTitleContainer = null

const insertCartTitle = () => {
  // Solo ejecutar en el paso del carrito
  if (!window.location.hash.includes('cart')) {
    removeCartTitle()
    return
  }

  // Si ya existe el contenedor, no hacer nada
  if (cartTitleContainer && document.contains(cartTitleContainer)) {
    return
  }

  const checkoutContainer = document.querySelector('.checkout-container')
  if (!checkoutContainer) {
    return
  }

  // Crear el contenedor para el título
  cartTitleContainer = document.createElement('div')
  cartTitleContainer.id = 'cart-title-container'

  // Insertar al inicio del checkout-container (afterbegin)
  checkoutContainer.insertAdjacentElement('afterbegin', cartTitleContainer)

  // Renderizar el componente
  render(h(CartTitle), cartTitleContainer)
}

const removeCartTitle = () => {
  if (cartTitleContainer && document.contains(cartTitleContainer)) {
    cartTitleContainer.remove()
    cartTitleContainer = null
  }
}

export { insertCartTitle, removeCartTitle }
