# Digitale Souveränität messbar machen

Frontpage des Forschungsprojekts zur Messung digitaler Souveränität auf Organisationsebene.
Statische Website (HTML / CSS / JS), Netzdiagramm via Chart.js, monochromes Liquid-Glass-Design.

## Lokal ansehen

```
python -m http.server 8753
```
Dann im Browser: http://127.0.0.1:8753

## Struktur

- `index.html` — Single-Page mit allen Sektionen und der interaktiven Radar-Demo
- `styles.css` — Designsystem (Schwarz / Weiß / Grau, Liquid Glass)
- `script.js` — Scroll-Animationen und die interaktive Auswertung
- `impressum.html`, `datenschutz.html` — Rechtsseiten

## Hosting (GitHub Pages)

Settings → Pages → Source: Deploy from a branch → Branch: `main` / `/ (root)`.
Die Seite ist anschließend unter `https://<username>.github.io/<repo>/` erreichbar.
