# ozzobot

Compatibility shim package that forwards to `ozzo`.

This package exists to maintain backwards compatibility for existing installations that reference the legacy `ozzobot` package name.

## Usage

This package is automatically installed as part of the ozzo workspace and requires no manual configuration.

All functionality is provided by the main `ozzo` package.

## Migration

If you're using `ozzobot` directly, please migrate to `ozzo`:

```bash
# Old
npm install ozzobot

# New
npm install ozzo
```

Update your imports:

```javascript
// Old
import { something } from 'ozzobot';

// New
import { something } from 'ozzo';
```

## License

Same as the main ozzo package.
