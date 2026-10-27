# Mateusz Salamon — portfolio (version F)

Static, dependency-free website: dark design optimised for search engines and AI assistants.

SEO and performance review (27 October 2026): see [SEO_PERFORMANCE_AUDIT.md](SEO_PERFORMANCE_AUDIT.md). Local Lighthouse results: mobile Performance 95, desktop Performance 100; Accessibility, Best Practices and SEO 100 on both. Production results must be checked after deployment. Fonts are self-hosted in `assets/fonts/` under the included SIL Open Font License.

## Files
| File | What it is |
|---|---|
| `index.html` | The whole page. SEO meta tags + JSON-LD (Person, FAQPage) in `<head>`. |
| `styles.css` | Colour tokens (`--accent`, `--accent2`), base styles, interactive widgets. |
| `script.js` | Demo widgets: performance chart (period + hover) and market-sessions table (time-zone switch). Demo data only. |
| `assets/logos/` | Technology logos (Devicon, MIT licence). AG Grid logo slot is a placeholder — add the official file. |
| `robots.txt` | Allows search engines and AI crawlers. |
| `llms.txt` | Short plain-text profile for AI assistants. |

## Run locally
Open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Before publishing — fill in
Search `index.html`, `robots.txt` and `llms.txt` for `[` to find placeholders:
- `[your-domain]`, LinkedIn / GitHub handles, CV link, calendar link
- years of experience `[X]`, availability `[month 2026]`, English level, rate
- experience dates `[20XX]`, `[Company] · [Role]`, missing stacks `[stack]`
- certificate names, years, badge images, portrait photo
- `assets/og-image.png` (1200×630) for link previews, `sitemap.xml`

## Changing colours
Edit `--accent` and `--accent2` at the top of `styles.css`.

## Hosting
Any static host works (GitHub Pages, Netlify, Vercel, Azure Static Web Apps). Keep the content in the HTML (no client-side rendering) so search engines and AI assistants can read it.
