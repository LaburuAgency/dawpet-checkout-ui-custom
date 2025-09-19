# HomeSentry Checkout UI Custom - Modern Development Stack

The HomeSentry Checkout UI Settings app provides **advanced checkout customization using modern development tools** including Webpack, Preact, and SASS. This approach combines the benefits of VTEX IO's version-controlled deployments with contemporary JavaScript and CSS development practices.

The main advantages of this modern approach over traditional [admin interface customization](https://help.vtex.com/tutorial/configure-template-in-smartcheckout-update--ToTE5XB39t0SwtHgpgwSv?locale=en) include:

- **Component-based architecture** with Preact for maintainable UI elements
- **Modern SASS** with modular stylesheets and design system variables
- **Automated build process** with Webpack for optimized production bundles
- **A/B testing capabilities** through VTEX IO's version management
- **Safe rollbacks** to previous app versions
- **Development tooling** with hot reloading, linting, and formatting

## Development Setup

### Prerequisites
- [VTEX IO CLI](https://vtex.io/docs/recipes/development/vtex-io-cli-installment-and-command-reference) installed
- Node.js and npm for development dependencies
- Access to HomeSentry VTEX account

### Initial Setup

1. **Clone and Install Dependencies**
   ```bash
   git clone [repository-url]
   cd homesentry-checkout-ui-custom
   npm install
   ```

2. **VTEX Account Configuration**
   ```bash
   vtex login homesentry
   vtex whoami  # Verify you're logged into correct account
   ```

3. **Development Workspace**
   ```bash
   vtex workspace create dev-checkout-[your-name]
   vtex workspace use dev-checkout-[your-name]
   ```

### Development Workflow

1. **Start Development Mode**
   ```bash
   npm run watch  # Automatically rebuilds on file changes
   vtex link      # Link app to development workspace
   ```

2. **Make Changes**
   - Edit source files in `src/checkout6/`
   - Components: `src/checkout6/components/`
   - Modules: `src/checkout6/modules/`
   - Styles: `src/checkout6/styles/`

3. **Test Changes**
   - Access your store's checkout in the development workspace
   - Verify functionality across different checkout steps
   - Test on mobile and desktop viewports

4. **Build for Production**
   ```bash
   npm run build    # Create optimized production build
   npm run lint     # Verify code quality
   ```

5. **Deploy to Production**
   ```bash
   vtex publish                              # Publish new app version
   vtex workspace create prod-checkout --production
   vtex workspace use prod-checkout
   vtex install                              # Install in production workspace
   vtex workspace promote                    # Promote to master after testing
   ```

## Project Architecture

### Modern Build System
The app uses a sophisticated build process that compiles modern JavaScript and SASS into optimized checkout files:

```
Source Files (src/checkout6/) → Webpack Build → Output (checkout-ui-custom/)
├── components/               →                → checkout6-custom.js (29.9 KiB)
├── modules/                  →                → checkout6-custom.css (12.7 KiB)
├── styles/                   →                └── checkout6-custom.js.LICENSE.txt
└── index.js
```

### Component System
- **CartTitle**: "Resumen de la compra" header for cart step
- **CouponTitle**: "¿Tienes un cupón de descuento?" in summary section
- **RecommendedProducts**: Dynamic product carousel using VTEX API
- **CheckoutHeader**: Custom header component (currently disabled)

### Event-Driven Modules
- **eventHandlers**: Central coordination for checkout step changes
- **cartCheckboxes**: Terms and privacy acceptance with validation
- **formEnhancements**: Internationalization and placeholder improvements
- **checkoutSteps**: Visual progress indicator
- **shippingInfo**: Dynamic shipping information display

### Current Active Features

#### Cart Step (`#/cart`)
- Cart summary title with elegant styling
- Coupon section title in summary template
- Product recommendations carousel
- Required terms and privacy checkboxes
- International customer support (document/phone fields)

#### Form Enhancements
- Spanish placeholder text for input fields
- Terms and conditions acceptance validation
- Enhanced empty cart experience with gradient styling

#### Visual Improvements
- Responsive design optimized for mobile and desktop
- BEM methodology CSS architecture
- Modern SASS with `@use` syntax (no deprecation warnings)

## Deployment and Version Management

### How It Works
Once deployed, the compiled scripts are automatically linked to your checkout and used to customize the user experience. The app uses VTEX IO's `checkout-ui-custom` builder to inject the compiled files into the checkout flow.

### Version Control
⚠️ **Important**: Checkout scripts are linked to specific app versions. Each published version is immutable, enabling:
- **Safe rollbacks** to previous working versions
- **A/B testing** between different checkout experiences
- **Gradual deployments** through workspace promotion

VTEX's Housekeeper service automatically updates app versions in accounts, ensuring stores receive the latest improvements while maintaining the ability to rollback if needed.

### Production Considerations
- Always test thoroughly in development workspace before promotion
- Monitor checkout conversion rates after deploying new versions
- Keep customizations minimal to avoid breaking core checkout functionality
- Use semantic versioning for clear version management
