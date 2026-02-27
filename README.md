# Groove Web Preview

Sitio React + Vite listo para publicar en GitHub Pages del repo:

- `https://github.com/juanmaacampos/groove-web-preview`

## Deploy en GitHub Pages

1. Verifica el remoto:

	```bash
	git remote -v
	```

	Debe apuntar a:

	- `https://github.com/juanmaacampos/groove-web-preview.git`

2. Publica:

	```bash
	npm run deploy
	```

3. En GitHub, ve a **Settings → Pages** y configura:

	- **Source**: `Deploy from a branch`
	- **Branch**: `gh-pages`
	- **Folder**: `/ (root)`

4. URL esperada:

	- `https://juanmaacampos.github.io/groove-web-preview/`

## Notas

- La base de Vite ya está configurada para este repo en producción: `/groove-web-preview/`.
- El proyecto no usa `CNAME` en esta variante preview, para evitar conflictos con dominio personalizado.
