# Internationalization (i18n)

Matcher supports multiple languages with automatic detection and manual selection.

## Supported Languages

- **English (en)** - Default
- **Portuguese (pt)**
- **Spanish (es)**
- **French (fr)**
- **Italian (it)**

## How It Works

1. **Auto-detection**: On first visit, the app detects the browser/system language
2. **Fallback**: If the detected language is not supported, English is used
3. **Manual selection**: Users can change language in Settings
4. **Persistence**: Selected language is saved in localStorage and user settings

## Usage in Components

```svelte
<script>
  import { _ } from 'svelte-i18n';
</script>

<h1>{$_('home.title')}</h1>
<p>{$_('home.noMoreCards')}</p>

<!-- With variables -->
<p>{$_('matches.youMatched', { values: { name: 'Alex' } })}</p>
```

## Translation Files

All translations are in `/src/lib/i18n/locales/`:
- `en.json` - English
- `pt.json` - Portuguese
- `es.json` - Spanish
- `fr.json` - French
- `it.json` - Italian

## Adding New Translations

1. Add the key to all locale files
2. Use the same structure across all languages
3. Test with different locales

## Translation Keys Structure

```
{
  "app": { ... },
  "common": { ... },
  "auth": { ... },
  "home": { ... },
  "matches": { ... },
  "chat": { ... },
  "settings": { ... },
  "subscribe": { ... },
  "terms": { ... },
  "privacy": { ... },
  "navigation": { ... },
  "errors": { ... }
}
```

