import { h, render } from 'preact';
import CouponTitle from '../components/CouponTitle.jsx';

let couponTitleContainer = null;

const insertCouponTitle = () => {
  // Solo ejecutar en el paso del carrito
  if (!window.location.hash.includes('cart')) {
    removeCouponTitle();
    return;
  }

  // Si ya existe el contenedor, no hacer nada
  if (couponTitleContainer && document.contains(couponTitleContainer)) {
    return;
  }

  const summaryTemplate = document.querySelector('.summary-template-holder');
  if (!summaryTemplate) {
    return;
  }

  // Crear el contenedor para el título del cupón
  couponTitleContainer = document.createElement('div');
  couponTitleContainer.id = 'coupon-title-container';

  // Insertar al inicio del summary-template-holder (afterbegin)
  summaryTemplate.insertAdjacentElement('afterbegin', couponTitleContainer);

  // Renderizar el componente
  render(h(CouponTitle), couponTitleContainer);
};

const removeCouponTitle = () => {
  if (couponTitleContainer && document.contains(couponTitleContainer)) {
    couponTitleContainer.remove();
    couponTitleContainer = null;
  }
};

export { insertCouponTitle, removeCouponTitle };