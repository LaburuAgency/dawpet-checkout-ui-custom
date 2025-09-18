# HomeSentry Checkout UI Custom - VTEX IO + Webpack + Preact + SASS

This VTEX IO Checkout UI Settings app uses modern development tools including Webpack, Preact, and SASS for checkout6 customization.

## Architecture

- **VTEX IO**: Modern VTEX platform with checkout6 UI customization
- **Webpack**: Bundles JavaScript and SASS files into optimized checkout files
- **Preact**: Lightweight React alternative for interactive checkout components  
- **SASS**: CSS preprocessor with variables, mixins, and modular stylesheets

## Development Setup

### Install Dependencies
```bash
npm install
```

### Development Commands

```bash
# Build for production
npm run build

# Build for development with source maps
npm run build:dev

# Watch for changes and rebuild automatically
npm run watch

# Format code
npm run format

# Lint JavaScript/JSX files
npm run lint
```

### VTEX IO Commands

```bash
# Link app for development
vtex link

# Publish new version
vtex publish

# Install in workspace
vtex install
```

## Project Structure

```
src/
└── checkout6/
    ├── components/
    │   └── CheckoutHeader.jsx
    ├── styles.scss
    └── index.js
```

## Built Files

Webpack compiles source files into the `checkout-ui-custom/` directory:

- `checkout6-custom.css` - Compiled SASS styles
- `checkout6-custom.js` - Bundled JavaScript with Preact components

## SASS Features

- **Variables**: Consistent colors, spacing, and typography for HomeSentry brand
- **Nested selectors**: Clean, hierarchical CSS structure
- **Responsive design**: Mobile-first approach with breakpoints
- **Custom properties**: Empty cart styling, international checkout fields

## Preact Components

- **CheckoutHeader**: Custom header component with HomeSentry branding
- **Component composition**: Reusable UI elements for checkout enhancement

## Current Customizations

### International Checkout Support
```scss
// Document and phone display options for international customers
.document-box { display: block; }
.phone-box { display: block; }
```

### Enhanced Empty Cart Experience
- Gradient background with soft decorative elements
- Responsive design for mobile and desktop
- Custom button styling with hover states

### Custom Header
- HomeSentry branding
- Progress indicator for checkout flow
- Responsive layout

## Build Process

1. **Source files** in `src/checkout6/` are processed by Webpack
2. **SASS** is compiled to optimized CSS with modern API
3. **JSX** is transpiled to vanilla JavaScript using Babel
4. **Output files** are generated in `checkout-ui-custom/` directory
5. **VTEX IO** automatically applies these files to checkout6 pages

## Development Workflow

1. Edit source files in `src/checkout6/`
2. Run `npm run watch` for automatic rebuilding
3. Test changes with `vtex link`
4. Build production version with `npm run build`
5. Publish with `vtex publish`

## Customization Examples

### Adding SASS Variables

```scss
// src/checkout6/styles.scss
$brand-primary: #16a34a;
$brand-secondary: #3b82f6;

.my-component {
  background-color: $brand-primary;
}
```

### Creating Preact Components

```jsx
// src/checkout6/components/MyComponent.jsx
import { h } from 'preact';

const MyComponent = ({ title }) => {
  return h('div', { className: 'my-component' }, title);
};

export default MyComponent;
```

### Component Usage

```js
// src/checkout6/index.js
import { h, render } from 'preact';
import MyComponent from './components/MyComponent.jsx';

render(h(MyComponent, { title: 'Hello' }), document.getElementById('target'));
```

## VTEX IO Benefits

- **Version Control**: All customizations are versioned and can be rolled back
- **A/B Testing**: Deploy different versions to test checkout improvements
- **Safe Deployments**: Test in development workspace before production
- **Modern Stack**: Use modern JavaScript and CSS tools with VTEX platform

## Notes

- **Checkout6 only**: Focused on modern VTEX IO checkout experience
- **Modern SASS API**: Uses latest SASS features without deprecation warnings
- **Preact aliases**: React-like development with smaller bundle size
- **Source maps**: Available in development mode for debugging
- **Production builds**: Minified and optimized for VTEX deployment