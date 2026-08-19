# Heavy Duty — PWA

App de entrenamiento de alta intensidad (Heavy Duty / HIT). Se instala en el
celular sin tienda de apps y sin compilar nada.

## Los archivos

| Archivo | Cuándo se sube |
|---|---|
| `index.html` | **En cada actualización.** Contiene toda la app: código, íconos y configuración. |
| `sw.js` | **Una sola vez.** No cambia nunca más. |
| `heavyduty-mydata.json` | Nunca al hosting — es tu backup personal. |

## Actualizar la app

1. Reemplazá `index.html` en el repo
2. Esperá a que Netlify termine el deploy
3. Abrí la app con internet — se actualiza sola

Ya no hace falta cerrar y reabrir la app, ni cambiar números de versión: la
página se busca siempre en la red primero, y solo se usa la copia guardada si
no hay conexión (con un límite de 3 segundos para no demorar el arranque).

## Instalar en el celular

Abrí la URL en Chrome → menú ⋮ → **Agregar a pantalla de inicio**.

## Tus datos

Viven en el navegador del celular. Desde ⚙ podés **exportar** un backup y
**importar** uno. Conviene exportar cada tanto: si borrás los datos de Chrome o
cambiás de teléfono, ese archivo es la única copia.

## Para desarrollo

`app.jsx` es el código fuente legible. Después de editarlo:

```
python3 build.py
```

Eso regenera `index.html` con todo adentro. Nunca edites `index.html` a mano.
