import { h, render } from 'preact';
import CheckoutHeader from './components/CheckoutHeader.jsx';
import { initializeCheckout, setupEventListeners } from './modules/eventHandlers.js';
import './styles.scss';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 HomeSentry Checkout6 - Initialized');

  // // Render custom header component (with safe fallback)
  // let headerContainer = document.querySelector('#header-container')
  // if (!headerContainer) {
  //   headerContainer = document.getElementById('hs-checkout-header')
  //   if (!headerContainer) {
  //     headerContainer = document.createElement('div')
  //     headerContainer.id = 'hs-checkout-header'
  //     // Insert near the top of the page to ensure visibility
  //     document.body.prepend(headerContainer)
  //   }
  // }

  // render(<CheckoutHeader />, headerContainer)

  // Initialize checkout functionality
  initializeCheckout();

  // Setup event listeners for dynamic behavior
  setupEventListeners();
});