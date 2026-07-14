# Google FindMy Card Tracker

Card de Lovelace para Home Assistant que muestra tus dispositivos de **Google Find My Device** (o cualquier `device_tracker` con GPS) en un mapa interactivo Leaflet, con foco en analizar el **recorrido histórico**: inicio y fin del trayecto, marcadores numerados, flechas de dirección, reproducción animada, estadísticas del viaje y exportación a GPX/KML.

Implementación propia (no es un fork), pensada como alternativa ampliada a las cards clásicas de Find My Device para Home Assistant.

## Funcionalidades

- 🗺️ Mapa interactivo Leaflet + OpenStreetMap, con lista de dispositivos, filtros de rango histórico (1/3/7/14 días) y filtro de precisión GPS.
- 🏁 **Marcador de inicio** del recorrido (punto más antiguo del rango seleccionado).
- 🔴 **Marcador de fin** (punto más reciente / ubicación actual).
- 🔢 **Marcadores numerados** en los puntos intermedios del historial, para seguir el orden del trayecto.
- ➜ **Flechas de dirección** dibujadas sobre la línea de recorrido, indicando el sentido del movimiento.
- 🎞️ **Reproducción del recorrido**: controles de play/pausa, barra de progreso (scrub), velocidad (1x–25x) y reinicio, con un marcador que recorre el trayecto y gira según el rumbo (bearing) entre puntos.
- 📊 **Estadísticas**: distancia total, duración, velocidad media, velocidad máxima, número de puntos, hora de inicio y fin — calculado con la fórmula de Haversine.
- 📁 **Exportación GPX/KML**: descarga el recorrido del dispositivo seleccionado como `.gpx` o `.kml` para abrir en Google Earth, Strava, GPX Studio, etc.
- 🎛️ Editor visual completo (sin YAML) para activar/desactivar cada función.

## Instalación

### HACS (recomendado)

1. En Home Assistant → HACS → menú ⋮ → **Repositorios personalizados**.
2. Añade la URL: `https://github.com/davicho16/googlefindmy-card-tracker`
3. Categoría: **Dashboard** (Frontend/Plugin).
4. Instala **Google FindMy Card Tracker** desde la lista de HACS.
5. Recarga la caché del navegador (Ctrl+F5) tras instalar.

### Manual

1. Descarga `googlefindmy-card-tracker.js` de este repositorio.
2. Cópialo a `config/www/googlefindmy-card-tracker.js` en tu instalación de Home Assistant.
3. Ve a **Configuración → Paneles de control → Recursos** y añade:
   - URL: `/local/googlefindmy-card-tracker.js`
   - Tipo de recurso: **Módulo JavaScript**
4. Recarga la página.

## Configuración

### Editor visual

Añade la card "Google FindMy Card Tracker" desde el editor de dashboard y usa el formulario para configurar entidades y opciones sin escribir YAML.

### YAML

```yaml
type: custom:googlefindmy-card-tracker
title: "Mis Dispositivos"
entities:
  - device_tracker.iphone
  - device_tracker.airpods
  - entity: device_tracker.llaves
    name: "Mis Llaves"
    icon: mdi:key

# Visualización general
show_last_seen: true
show_location_name: true
enable_actions: true
keep_device_list_pinned: false
show_path_lines: true
filter_keywords: ""
history_days: 3
accuracy_filter: 0

# Funciones de recorrido
show_start_end_markers: true
show_numbered_markers: true
show_direction_arrows: true
enable_playback: true
show_statistics: true
enable_export: true
```

## Opciones de la card

| Opción | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `title` | string | `"Find My Devices"` | Título del encabezado. |
| `entities` | list | **requerido** | Entidades `device_tracker` a mostrar. |
| `show_last_seen` | boolean | `true` | Muestra "última vez visto" en la tarjeta del dispositivo. |
| `show_location_name` | boolean | `true` | Muestra el nombre/dirección de la ubicación. |
| `enable_actions` | boolean | `true` | Habilita acciones (p. ej. reproducir sonido, si el integration lo soporta). |
| `keep_device_list_pinned` | boolean | `false` | Deja la barra lateral de dispositivos siempre visible. |
| `show_path_lines` | boolean | `true` | Dibuja la línea que conecta el historial. |
| `filter_keywords` | string | `""` | Filtra entidades por palabra clave, separadas por coma. |
| `history_days` | number | `3` | Rango de historial por defecto (1/3/7/14 días). |
| `accuracy_filter` | number | `0` | Descarta puntos con precisión GPS peor que N metros (0 = desactivado). |
| `show_start_end_markers` | boolean | `true` | 🏁 Marcador de inicio y 🔴 marcador de fin del recorrido. |
| `show_numbered_markers` | boolean | `true` | 🔢 Numera los puntos intermedios del historial. |
| `show_direction_arrows` | boolean | `true` | ➜ Flechas de dirección sobre la línea de recorrido. |
| `enable_playback` | boolean | `true` | 🎞️ Barra de reproducción del recorrido. |
| `show_statistics` | boolean | `true` | 📊 Panel de estadísticas del trayecto. |
| `enable_export` | boolean | `true` | 📁 Botones de exportación GPX/KML. |

### Formato de entidad extendido

```yaml
entities:
  - entity: device_tracker.iphone
    name: "iPhone de Juan"
    icon: mdi:cellphone-iphone
  - device_tracker.llaves   # forma simplificada, solo entity_id
```

## Cómo usar cada función

- **Filtros (📅)**: elige el rango histórico (1d/3d/7d/14d) y ajusta el filtro de precisión GPS.
- **Estadísticas (📊)**: abre el panel con distancia, duración, velocidad media/máxima y nº de puntos del recorrido cargado, con acceso directo a la exportación.
- **Reproducción (🎞️)**: pulsa ▶️ para animar un marcador que recorre el trayecto en orden cronológico, gira según el rumbo, y puedes arrastrar la barra de progreso o cambiar la velocidad (1x–25x). ⏮️ reinicia.
- **Exportar GPX/KML (📁)**: genera y descarga el recorrido actualmente cargado (respetando los filtros aplicados) en formato `.gpx` o `.kml`.

## Requisitos

- Home Assistant 2023.1 o superior.
- Integración Google Find My Device (o cualquier `device_tracker` con atributos `latitude`/`longitude`).
- Integración `recorder` habilitada (para el historial de ubicaciones).
- Conexión a internet (tiles de OpenStreetMap y librería Leaflet vía CDN).

## Solución de problemas

- **No aparece ningún dispositivo**: revisa que las entidades existan en Herramientas de desarrollo → Estados y que tengan atributos `latitude`/`longitude`.
- **El mapa no carga**: revisa la consola del navegador; puede deberse a bloqueo de CDN (unpkg.com) por un adblocker o firewall.
- **No hay historial**: verifica que `recorder` esté activo y que el dispositivo tenga datos históricos en ese rango de tiempo.
- **Las flechas no aparecen**: la librería `leaflet-polylinedecorator` se carga desde CDN; si falla la carga, el resto de la card sigue funcionando sin flechas.

## Licencia

MIT — ver [LICENSE](LICENSE).

Este proyecto es una implementación independiente, inspirada conceptualmente en la idea de tarjetas de mapa para Find My Device en Home Assistant, con foco específico en el análisis de recorridos (playback, estadísticas y exportación GPX/KML).
