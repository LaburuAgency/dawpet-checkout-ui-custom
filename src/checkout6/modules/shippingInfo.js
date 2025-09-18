import { $, createElementWithHTML } from '../utils/dom.js';

export const addShippingInfo = () => {
  const observer = new MutationObserver((mutations, obs) => {
    const container = $.select('.vtex-omnishipping-1-x-SummaryItemGroup');

    if (!container) return;
    if ($.select('.myship')) return;

    // Get shipping information from VTEX checkout
    const logisticsInfo = window.vtexjs?.checkout?.orderForm?.shippingData?.logisticsInfo;
    if (!logisticsInfo || logisticsInfo.length === 0) return;

    const selectedSla = logisticsInfo[0].selectedSla;
    if (!selectedSla) return;
    if ($.select('.myship')) return;

    // Create shipping info element
    const shippingHTML = `
      <div class="myship">
        <p class="warning-envio">
          <span>Tipo de Envío:</span> ${selectedSla}
        </p>
      </div>
    `;

    const shippingDiv = createElementWithHTML(shippingHTML);
    container.appendChild(shippingDiv);
    obs.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};