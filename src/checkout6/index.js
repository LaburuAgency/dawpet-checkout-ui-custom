import { h, render } from 'preact';
import CheckoutHeader from './components/CheckoutHeader.jsx';
import { initializeCheckout, setupEventListeners } from './modules/eventHandlers.js';
import './styles.scss';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 HomeSentry Checkout6 - DOMContentLoaded event fired');

  // Render custom header component
  const headerContainer = document.querySelector('#header-container');
  if (headerContainer) {
    console.log('✅ Header container found, rendering CheckoutHeader component');
    render(<CheckoutHeader />, headerContainer);
    console.log('✅ CheckoutHeader component rendered successfully');
  } else {
    console.log('⚠️ Header container not found (#header-container)');
  }

  // Initialize checkout functionality
  console.log('🔧 Initializing checkout functionality...');
  initializeCheckout();
  console.log('✅ Checkout initialization completed');

  // Setup event listeners for dynamic behavior
  console.log('🎧 Setting up event listeners...');
  setupEventListeners();
  console.log('✅ Event listeners setup completed');

  console.log('🎯 HomeSentry Checkout6 initialization complete!');
});