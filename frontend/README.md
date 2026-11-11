# Frontend de NicaAcro

Consulte el archivo `README.md` de la carpeta principal para configurar la API, MongoDB e iniciar el proyecto completo.

En esta carpeta puede ejecutar `npm ci` y después `npm run dev`. Por defecto, Vite envía `/api` al backend en `http://localhost:3000`. Para cambiar el destino, use `VITE_PROXY_TARGET` en `frontend/.env.local` y reinicie Vite.

Comprobaciones disponibles: `npm run build`, `npm run lint` y `npm test`. Las pruebas usan respuestas simuladas; no escriben en MongoDB.
