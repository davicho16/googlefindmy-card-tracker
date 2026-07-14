/*!
 * Google FindMy Card Tracker
 * A Home Assistant Lovelace card for Google Find My Device / device_tracker entities.
 * Adds route playback, start/end + numbered markers, direction arrows,
 * trip statistics and GPX/KML export on top of an interactive Leaflet map.
 *
 * Repository: https://github.com/davicho16/googlefindmy-card-tracker
 * License: MIT
 */
(() => {
  "use strict";

  const CARD_VERSION = "1.0.4";
  const CARD_TAG = "googlefindmy-card-tracker";
  const EDITOR_TAG = "googlefindmy-card-tracker-editor";

  const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  const DECORATOR_JS =
    "https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js";

  // Vendored Leaflet CSS, injected directly into the card's Shadow DOM.
  // (An external <link> inside a shadow root is timing/CSP-sensitive; inlining
  // avoids both problems entirely.)
  const LEAFLET_CSS_INLINE = `
/* required styles */

.leaflet-pane,
.leaflet-tile,
.leaflet-marker-icon,
.leaflet-marker-shadow,
.leaflet-tile-container,
.leaflet-pane > svg,
.leaflet-pane > canvas,
.leaflet-zoom-box,
.leaflet-image-layer,
.leaflet-layer {
	position: absolute;
	left: 0;
	top: 0;
	}
.leaflet-container {
	overflow: hidden;
	}
.leaflet-tile,
.leaflet-marker-icon,
.leaflet-marker-shadow {
	-webkit-user-select: none;
	   -moz-user-select: none;
	        user-select: none;
	  -webkit-user-drag: none;
	}
/* Prevents IE11 from highlighting tiles in blue */
.leaflet-tile::selection {
	background: transparent;
}
/* Safari renders non-retina tile on retina better with this, but Chrome is worse */
.leaflet-safari .leaflet-tile {
	image-rendering: -webkit-optimize-contrast;
	}
/* hack that prevents hw layers "stretching" when loading new tiles */
.leaflet-safari .leaflet-tile-container {
	width: 1600px;
	height: 1600px;
	-webkit-transform-origin: 0 0;
	}
.leaflet-marker-icon,
.leaflet-marker-shadow {
	display: block;
	}
.leaflet-container .leaflet-overlay-pane svg {
	max-width: none !important;
	max-height: none !important;
	}
.leaflet-container .leaflet-marker-pane img,
.leaflet-container .leaflet-shadow-pane img,
.leaflet-container .leaflet-tile-pane img,
.leaflet-container img.leaflet-image-layer,
.leaflet-container .leaflet-tile {
	max-width: none !important;
	max-height: none !important;
	width: auto;
	padding: 0;
	}

.leaflet-container img.leaflet-tile {
	mix-blend-mode: plus-lighter;
}

.leaflet-container.leaflet-touch-zoom {
	-ms-touch-action: pan-x pan-y;
	touch-action: pan-x pan-y;
	}
.leaflet-container.leaflet-touch-drag {
	-ms-touch-action: pinch-zoom;
	touch-action: none;
	touch-action: pinch-zoom;
}
.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom {
	-ms-touch-action: none;
	touch-action: none;
}
.leaflet-container {
	-webkit-tap-highlight-color: transparent;
}
.leaflet-container a {
	-webkit-tap-highlight-color: rgba(51, 181, 229, 0.4);
}
.leaflet-tile {
	filter: inherit;
	visibility: hidden;
	}
.leaflet-tile-loaded {
	visibility: inherit;
	}
.leaflet-zoom-box {
	width: 0;
	height: 0;
	-moz-box-sizing: border-box;
	     box-sizing: border-box;
	z-index: 800;
	}
.leaflet-overlay-pane svg {
	-moz-user-select: none;
	}

.leaflet-pane         { z-index: 400; }

.leaflet-tile-pane    { z-index: 200; }
.leaflet-overlay-pane { z-index: 400; }
.leaflet-shadow-pane  { z-index: 500; }
.leaflet-marker-pane  { z-index: 600; }
.leaflet-tooltip-pane   { z-index: 650; }
.leaflet-popup-pane   { z-index: 700; }

.leaflet-map-pane canvas { z-index: 100; }
.leaflet-map-pane svg    { z-index: 200; }

.leaflet-vml-shape {
	width: 1px;
	height: 1px;
	}
.lvml {
	behavior: url(#default#VML);
	display: inline-block;
	position: absolute;
	}


/* control positioning */

.leaflet-control {
	position: relative;
	z-index: 800;
	pointer-events: visiblePainted;
	pointer-events: auto;
	}
.leaflet-top,
.leaflet-bottom {
	position: absolute;
	z-index: 1000;
	pointer-events: none;
	}
.leaflet-top {
	top: 0;
	}
.leaflet-right {
	right: 0;
	}
.leaflet-bottom {
	bottom: 0;
	}
.leaflet-left {
	left: 0;
	}
.leaflet-control {
	float: left;
	clear: both;
	}
.leaflet-right .leaflet-control {
	float: right;
	}
.leaflet-top .leaflet-control {
	margin-top: 10px;
	}
.leaflet-bottom .leaflet-control {
	margin-bottom: 10px;
	}
.leaflet-left .leaflet-control {
	margin-left: 10px;
	}
.leaflet-right .leaflet-control {
	margin-right: 10px;
	}


/* zoom and fade animations */

.leaflet-fade-anim .leaflet-popup {
	opacity: 0;
	-webkit-transition: opacity 0.2s linear;
	   -moz-transition: opacity 0.2s linear;
	        transition: opacity 0.2s linear;
	}
.leaflet-fade-anim .leaflet-map-pane .leaflet-popup {
	opacity: 1;
	}
.leaflet-zoom-animated {
	-webkit-transform-origin: 0 0;
	    -ms-transform-origin: 0 0;
	        transform-origin: 0 0;
	}
svg.leaflet-zoom-animated {
	will-change: transform;
}

.leaflet-zoom-anim .leaflet-zoom-animated {
	-webkit-transition: -webkit-transform 0.25s cubic-bezier(0,0,0.25,1);
	   -moz-transition:    -moz-transform 0.25s cubic-bezier(0,0,0.25,1);
	        transition:         transform 0.25s cubic-bezier(0,0,0.25,1);
	}
.leaflet-zoom-anim .leaflet-tile,
.leaflet-pan-anim .leaflet-tile {
	-webkit-transition: none;
	   -moz-transition: none;
	        transition: none;
	}

.leaflet-zoom-anim .leaflet-zoom-hide {
	visibility: hidden;
	}


/* cursors */

.leaflet-interactive {
	cursor: pointer;
	}
.leaflet-grab {
	cursor: -webkit-grab;
	cursor:    -moz-grab;
	cursor:         grab;
	}
.leaflet-crosshair,
.leaflet-crosshair .leaflet-interactive {
	cursor: crosshair;
	}
.leaflet-popup-pane,
.leaflet-control {
	cursor: auto;
	}
.leaflet-dragging .leaflet-grab,
.leaflet-dragging .leaflet-grab .leaflet-interactive,
.leaflet-dragging .leaflet-marker-draggable {
	cursor: move;
	cursor: -webkit-grabbing;
	cursor:    -moz-grabbing;
	cursor:         grabbing;
	}

.leaflet-marker-icon,
.leaflet-marker-shadow,
.leaflet-image-layer,
.leaflet-pane > svg path,
.leaflet-tile-container {
	pointer-events: none;
	}

.leaflet-marker-icon.leaflet-interactive,
.leaflet-image-layer.leaflet-interactive,
.leaflet-pane > svg path.leaflet-interactive,
svg.leaflet-image-layer.leaflet-interactive path {
	pointer-events: visiblePainted;
	pointer-events: auto;
	}

/* visual tweaks */

.leaflet-container {
	background: #ddd;
	outline-offset: 1px;
	}
.leaflet-container a {
	color: #0078A8;
	}
.leaflet-zoom-box {
	border: 2px dotted #38f;
	background: rgba(255,255,255,0.5);
	}


/* general typography */
.leaflet-container {
	font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
	font-size: 12px;
	font-size: 0.75rem;
	line-height: 1.5;
	}


/* general toolbar styles */

.leaflet-bar {
	box-shadow: 0 1px 5px rgba(0,0,0,0.65);
	border-radius: 4px;
	}
.leaflet-bar a {
	background-color: #fff;
	border-bottom: 1px solid #ccc;
	width: 26px;
	height: 26px;
	line-height: 26px;
	display: block;
	text-align: center;
	text-decoration: none;
	color: black;
	}
.leaflet-bar a,
.leaflet-control-layers-toggle {
	background-position: 50% 50%;
	background-repeat: no-repeat;
	display: block;
	}
.leaflet-bar a:hover,
.leaflet-bar a:focus {
	background-color: #f4f4f4;
	}
.leaflet-bar a:first-child {
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	}
.leaflet-bar a:last-child {
	border-bottom-left-radius: 4px;
	border-bottom-right-radius: 4px;
	border-bottom: none;
	}
.leaflet-bar a.leaflet-disabled {
	cursor: default;
	background-color: #f4f4f4;
	color: #bbb;
	}

.leaflet-touch .leaflet-bar a {
	width: 30px;
	height: 30px;
	line-height: 30px;
	}
.leaflet-touch .leaflet-bar a:first-child {
	border-top-left-radius: 2px;
	border-top-right-radius: 2px;
	}
.leaflet-touch .leaflet-bar a:last-child {
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	}

/* zoom control */

.leaflet-control-zoom-in,
.leaflet-control-zoom-out {
	font: bold 18px 'Lucida Console', Monaco, monospace;
	text-indent: 1px;
	}

.leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out  {
	font-size: 22px;
	}


/* layers control */

.leaflet-control-layers {
	box-shadow: 0 1px 5px rgba(0,0,0,0.4);
	background: #fff;
	border-radius: 5px;
	}
.leaflet-control-layers-toggle {
	width: 36px;
	height: 36px;
	}
.leaflet-touch .leaflet-control-layers-toggle {
	width: 44px;
	height: 44px;
	}
.leaflet-control-layers .leaflet-control-layers-list,
.leaflet-control-layers-expanded .leaflet-control-layers-toggle {
	display: none;
	}
.leaflet-control-layers-expanded .leaflet-control-layers-list {
	display: block;
	position: relative;
	}
.leaflet-control-layers-expanded {
	padding: 6px 10px 6px 6px;
	color: #333;
	background: #fff;
	}
.leaflet-control-layers-scrollbar {
	overflow-y: scroll;
	overflow-x: hidden;
	padding-right: 5px;
	}
.leaflet-control-layers-selector {
	margin-top: 2px;
	position: relative;
	top: 1px;
	}
.leaflet-control-layers label {
	display: block;
	font-size: 13px;
	font-size: 1.08333em;
	}
.leaflet-control-layers-separator {
	height: 0;
	border-top: 1px solid #ddd;
	margin: 5px -10px 5px -6px;
	}


/* attribution and scale controls */

.leaflet-container .leaflet-control-attribution {
	background: #fff;
	background: rgba(255, 255, 255, 0.8);
	margin: 0;
	}
.leaflet-control-attribution,
.leaflet-control-scale-line {
	padding: 0 5px;
	color: #333;
	line-height: 1.4;
	}
.leaflet-control-attribution a {
	text-decoration: none;
	}
.leaflet-control-attribution a:hover,
.leaflet-control-attribution a:focus {
	text-decoration: underline;
	}
.leaflet-attribution-flag {
	display: inline !important;
	vertical-align: baseline !important;
	width: 1em;
	height: 0.6669em;
	}
.leaflet-left .leaflet-control-scale {
	margin-left: 5px;
	}
.leaflet-bottom .leaflet-control-scale {
	margin-bottom: 5px;
	}
.leaflet-control-scale-line {
	border: 2px solid #777;
	border-top: none;
	line-height: 1.1;
	padding: 2px 5px 1px;
	white-space: nowrap;
	-moz-box-sizing: border-box;
	     box-sizing: border-box;
	background: rgba(255, 255, 255, 0.8);
	text-shadow: 1px 1px #fff;
	}
.leaflet-control-scale-line:not(:first-child) {
	border-top: 2px solid #777;
	border-bottom: none;
	margin-top: -2px;
	}
.leaflet-control-scale-line:not(:first-child):not(:last-child) {
	border-bottom: 2px solid #777;
	}

.leaflet-touch .leaflet-control-attribution,
.leaflet-touch .leaflet-control-layers,
.leaflet-touch .leaflet-bar {
	box-shadow: none;
	}
.leaflet-touch .leaflet-control-layers,
.leaflet-touch .leaflet-bar {
	border: 2px solid rgba(0,0,0,0.2);
	background-clip: padding-box;
	}


/* popup */

.leaflet-popup {
	position: absolute;
	text-align: center;
	margin-bottom: 20px;
	}
.leaflet-popup-content-wrapper {
	padding: 1px;
	text-align: left;
	border-radius: 12px;
	}
.leaflet-popup-content {
	margin: 13px 24px 13px 20px;
	line-height: 1.3;
	font-size: 13px;
	font-size: 1.08333em;
	min-height: 1px;
	}
.leaflet-popup-content p {
	margin: 17px 0;
	margin: 1.3em 0;
	}
.leaflet-popup-tip-container {
	width: 40px;
	height: 20px;
	position: absolute;
	left: 50%;
	margin-top: -1px;
	margin-left: -20px;
	overflow: hidden;
	pointer-events: none;
	}
.leaflet-popup-tip {
	width: 17px;
	height: 17px;
	padding: 1px;

	margin: -10px auto 0;
	pointer-events: auto;

	-webkit-transform: rotate(45deg);
	   -moz-transform: rotate(45deg);
	    -ms-transform: rotate(45deg);
	        transform: rotate(45deg);
	}
.leaflet-popup-content-wrapper,
.leaflet-popup-tip {
	background: white;
	color: #333;
	box-shadow: 0 3px 14px rgba(0,0,0,0.4);
	}
.leaflet-container a.leaflet-popup-close-button {
	position: absolute;
	top: 0;
	right: 0;
	border: none;
	text-align: center;
	width: 24px;
	height: 24px;
	font: 16px/24px Tahoma, Verdana, sans-serif;
	color: #757575;
	text-decoration: none;
	background: transparent;
	}
.leaflet-container a.leaflet-popup-close-button:hover,
.leaflet-container a.leaflet-popup-close-button:focus {
	color: #585858;
	}
.leaflet-popup-scrolled {
	overflow: auto;
	}


/* div icon */

.leaflet-div-icon {
	background: #fff;
	border: 1px solid #666;
	}


/* Tooltip */
.leaflet-tooltip {
	position: absolute;
	padding: 6px;
	background-color: #fff;
	border: 1px solid #fff;
	border-radius: 3px;
	color: #222;
	white-space: nowrap;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	pointer-events: none;
	box-shadow: 0 1px 3px rgba(0,0,0,0.4);
	}
.leaflet-tooltip.leaflet-interactive {
	cursor: pointer;
	pointer-events: auto;
	}
.leaflet-tooltip-top:before,
.leaflet-tooltip-bottom:before,
.leaflet-tooltip-left:before,
.leaflet-tooltip-right:before {
	position: absolute;
	pointer-events: none;
	border: 6px solid transparent;
	background: transparent;
	content: "";
	}

/* Directions */

.leaflet-tooltip-bottom {
	margin-top: 6px;
}
.leaflet-tooltip-top {
	margin-top: -6px;
}
.leaflet-tooltip-bottom:before,
.leaflet-tooltip-top:before {
	left: 50%;
	margin-left: -6px;
	}
.leaflet-tooltip-top:before {
	bottom: 0;
	margin-bottom: -12px;
	border-top-color: #fff;
	}
.leaflet-tooltip-bottom:before {
	top: 0;
	margin-top: -12px;
	margin-left: -6px;
	border-bottom-color: #fff;
	}
.leaflet-tooltip-left {
	margin-left: -6px;
}
.leaflet-tooltip-right {
	margin-left: 6px;
}
.leaflet-tooltip-left:before,
.leaflet-tooltip-right:before {
	top: 50%;
	margin-top: -6px;
	}
.leaflet-tooltip-left:before {
	right: 0;
	margin-right: -12px;
	border-left-color: #fff;
	}
.leaflet-tooltip-right:before {
	left: 0;
	margin-left: -12px;
	border-right-color: #fff;
	}

@media print {
	.leaflet-control {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
		}
	}

  `;

  const _scriptPromises = {};
  function loadScriptOnce(src) {
    if (_scriptPromises[src]) return _scriptPromises[src];
    _scriptPromises[src] = new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-gfm-src="${src}"]`)) {
        resolve();
        return;
      }
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.dataset.gfmSrc = src;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(el);
    });
    return _scriptPromises[src];
  }

  function loadCSSOnce(href) {
    if (document.querySelector(`link[data-gfm-href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.gfmHref = href;
    document.head.appendChild(link);
  }

  async function ensureLeaflet() {
    loadCSSOnce(LEAFLET_CSS);
    if (!window.L) {
      await loadScriptOnce(LEAFLET_JS);
    }
    if (!window.L.Symbol) {
      try {
        await loadScriptOnce(DECORATOR_JS);
      } catch (e) {
        console.warn("[googlefindmy-card-tracker] leaflet-polylinedecorator no disponible:", e);
      }
    }
    return window.L;
  }

  function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function bearingDegrees(lat1, lon1, lat2, lon2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const toDeg = (r) => (r * 180) / Math.PI;
    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function escapeXML(str) {
    return String(str ?? "").replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = String(str ?? "");
    return div.innerHTML;
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function formatDuration(ms) {
    if (!ms || ms < 0) return "0 min";
    const totalMin = Math.round(ms / 60000);
    const days = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const min = totalMin % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (min || parts.length === 0) parts.push(`${min}min`);
    return parts.join(" ");
  }

  function formatDistance(km) {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(2)} km`;
  }

  function formatTime(date) {
    if (!date) return "-";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function buildGPX(points, name) {
    const trkpts = points
      .map((p) => {
        const ext =
          p.accuracy != null
            ? `      <extensions><gfm:accuracy xmlns:gfm="https://github.com/davicho16/googlefindmy-card-tracker">${p.accuracy}</gfm:accuracy></extensions>\n`
            : "";
        return `    <trkpt lat="${p.lat}" lon="${p.lon}">\n      <time>${p.timestamp.toISOString()}</time>\n${ext}    </trkpt>`;
      })
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="googlefindmy-card-tracker ${CARD_VERSION}" xmlns="http://www.topografix.com/GPX/1/1">\n  <metadata>\n    <name>${escapeXML(
      name
    )}</name>\n    <time>${new Date().toISOString()}</time>\n  </metadata>\n  <trk>\n    <name>${escapeXML(
      name
    )}</name>\n    <trkseg>\n${trkpts}\n    </trkseg>\n  </trk>\n</gpx>\n`;
  }

  function buildKML(points, name) {
    const coords = points.map((p) => `${p.lon},${p.lat},0`).join(" ");
    const placemarks = points
      .map((p, i) => {
        const isStart = i === 0;
        const isEnd = i === points.length - 1;
        const label = isStart ? "Inicio" : isEnd ? "Fin" : `Punto ${i}`;
        return `    <Placemark>\n      <name>${escapeXML(label)}</name>\n      <TimeStamp><when>${p.timestamp.toISOString()}</when></TimeStamp>\n      <description>Precisión: ${
          p.accuracy != null ? Math.round(p.accuracy) + " m" : "N/D"
        }</description>\n      <Point><coordinates>${p.lon},${p.lat},0</coordinates></Point>\n    </Placemark>`;
      })
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>${escapeXML(
      name
    )}</name>\n    <Style id="gfmLine">\n      <LineStyle><color>ff2196f3</color><width>4</width></LineStyle>\n    </Style>\n    <Placemark>\n      <name>${escapeXML(
      name
    )} - Recorrido</name>\n      <styleUrl>#gfmLine</styleUrl>\n      <LineString>\n        <tessellate>1</tessellate>\n        <coordinates>${coords}</coordinates>\n      </LineString>\n    </Placemark>\n${placemarks}\n  </Document>\n</kml>\n`;
  }

  function computeStats(points) {
    if (!points || points.length === 0) {
      return { distanceKm: 0, durationMs: 0, avgSpeed: 0, maxSpeed: 0, count: 0, start: null, end: null };
    }
    if (points.length === 1) {
      return {
        distanceKm: 0,
        durationMs: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        count: 1,
        start: points[0].timestamp,
        end: points[0].timestamp,
      };
    }
    let distance = 0;
    let maxSpeed = 0;
    for (let i = 1; i < points.length; i++) {
      const d = haversineMeters(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
      distance += d;
      const dtHours = (points[i].timestamp - points[i - 1].timestamp) / 3600000;
      if (dtHours > 0) {
        const speed = d / 1000 / dtHours;
        if (speed > maxSpeed && speed < 300) maxSpeed = speed;
      }
    }
    const durationMs = points[points.length - 1].timestamp - points[0].timestamp;
    const durationHours = durationMs / 3600000;
    const avgSpeed = durationHours > 0 ? distance / 1000 / durationHours : 0;
    return {
      distanceKm: distance / 1000,
      durationMs,
      avgSpeed,
      maxSpeed,
      count: points.length,
      start: points[0].timestamp,
      end: points[points.length - 1].timestamp,
    };
  }

  const DEFAULT_CONFIG = {
    title: "Find My Devices",
    entities: [],
    show_last_seen: true,
    show_location_name: true,
    enable_actions: true,
    keep_device_list_pinned: false,
    show_path_lines: true,
    filter_keywords: "",
    history_days: 3,
    accuracy_filter: 0,
    show_start_end_markers: true,
    show_numbered_markers: true,
    show_direction_arrows: true,
    enable_playback: true,
    show_statistics: true,
    enable_export: true,
  };

  class GoogleFindMyCardTracker extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = null;
      this._hass = null;
      this._built = false;
      this._map = null;
      this._layerGroup = null;
      this._decorator = null;
      this._selectedEntityId = null;
      this._points = [];
      this._panelState = { devices: false, filters: false, stats: false, playback: false };
      this._runtimeFilters = { days: 3, accuracy: 0 };
      this._playback = {
        timer: null,
        index: 0,
        speed: 1,
        playing: false,
        marker: null,
      };
    }

    setConfig(config) {
      if (!config || !Array.isArray(config.entities) || config.entities.length === 0) {
        throw new Error("Debes definir al menos una entidad en 'entities'.");
      }
      this._config = { ...DEFAULT_CONFIG, ...config };
      this._runtimeFilters.days = this._config.history_days;
      this._runtimeFilters.accuracy = this._config.accuracy_filter;
      if (this._built) {
        this._renderShell();
      }
    }

    getCardSize() {
      return 7;
    }

    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }

    static getStubConfig() {
      return { entities: [] };
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      if (!this._built) {
        this._build();
      }
      this._updateDeviceList();
      if (first && this._config.entities.length > 0) {
        const first_entity = this._resolveEntities()[0];
        if (first_entity) this._selectDevice(first_entity.entity, true);
      }
    }

    get hass() {
      return this._hass;
    }

    connectedCallback() {
      if (this._hass && !this._built) this._build();
    }

    disconnectedCallback() {
      this._stopPlayback();
      if (this._resizeObserver) {
        this._resizeObserver.disconnect();
        this._resizeObserver = null;
      }
    }

    async _build() {
      this._built = true;
      this._renderShell();
      try {
        await ensureLeaflet();
        this._initMap();
      } catch (e) {
        console.error("[googlefindmy-card-tracker] Error cargando Leaflet:", e);
        const mapEl = this.shadowRoot.getElementById("gfm-map");
        if (mapEl) mapEl.innerHTML = `<div class="gfm-error">No se pudo cargar el mapa: ${escapeHTML(e.message)}</div>`;
      }
    }

    _resolveEntities() {
      const keywords = (this._config.filter_keywords || "")
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      return this._config.entities
        .map((e) => (typeof e === "string" ? { entity: e } : e))
        .filter((e) => {
          if (keywords.length === 0) return true;
          return keywords.some((k) => e.entity.toLowerCase().includes(k));
        });
    }

    _renderShell() {
      const root = this.shadowRoot;
      root.innerHTML = `
        <style>${LEAFLET_CSS_INLINE}</style>
        <style>${this._styles()}</style>
        <ha-card>
          <div class="gfm-header">
            <div class="gfm-title">${escapeHTML(this._config.title)}</div>
            <div class="gfm-header-actions">
              <button id="gfm-btn-devices" class="gfm-icon-btn" title="Dispositivos">📱</button>
              <button id="gfm-btn-filters" class="gfm-icon-btn" title="Filtros">📅</button>
              ${this._config.show_statistics ? '<button id="gfm-btn-stats" class="gfm-icon-btn" title="Estadísticas">📊</button>' : ""}
              ${this._config.enable_playback ? '<button id="gfm-btn-playback" class="gfm-icon-btn" title="Reproducir recorrido">🎞️</button>' : ""}
              <button id="gfm-btn-refresh" class="gfm-icon-btn" title="Actualizar">🔄</button>
            </div>
          </div>
          <div class="gfm-body">
            <div id="gfm-devices" class="gfm-devices ${this._config.keep_device_list_pinned ? "gfm-pinned" : ""}"></div>
            <div class="gfm-map-wrap">
              <div id="gfm-map" class="gfm-map"></div>

              <div id="gfm-filters-panel" class="gfm-panel gfm-panel-topright">
                <div class="gfm-panel-title">📅 Filtros</div>
                <div class="gfm-field">
                  <label>Rango histórico</label>
                  <div class="gfm-btn-row">
                    <button data-days="1" class="gfm-chip">1d</button>
                    <button data-days="3" class="gfm-chip">3d</button>
                    <button data-days="7" class="gfm-chip">7d</button>
                    <button data-days="14" class="gfm-chip">14d</button>
                  </div>
                </div>
                <div class="gfm-field">
                  <label>Precisión GPS máx: <span id="gfm-accuracy-val">0 m (desactivado)</span></label>
                  <input id="gfm-accuracy-slider" type="range" min="0" max="300" step="10" value="0" />
                </div>
              </div>

              <div id="gfm-stats-panel" class="gfm-panel gfm-panel-topright gfm-hidden">
                <div class="gfm-panel-title">📊 Estadísticas del recorrido</div>
                <div id="gfm-stats-body" class="gfm-stats-body">Selecciona un dispositivo.</div>
                ${
                  this._config.enable_export
                    ? `<div class="gfm-btn-row">
                        <button id="gfm-export-gpx" class="gfm-chip">📁 GPX</button>
                        <button id="gfm-export-kml" class="gfm-chip">📁 KML</button>
                      </div>`
                    : ""
                }
              </div>

              <div id="gfm-playback-bar" class="gfm-panel gfm-panel-bottom gfm-hidden">
                <div class="gfm-playback-controls">
                  <button id="gfm-play-reset" class="gfm-icon-btn" title="Reiniciar">⏮️</button>
                  <button id="gfm-play-toggle" class="gfm-icon-btn" title="Reproducir/Pausar">▶️</button>
                  <input id="gfm-play-scrub" type="range" min="0" max="100" value="0" class="gfm-scrub" />
                  <select id="gfm-play-speed" class="gfm-speed-select">
                    <option value="1">1x</option>
                    <option value="2">2x</option>
                    <option value="5">5x</option>
                    <option value="10">10x</option>
                    <option value="25">25x</option>
                  </select>
                </div>
                <div id="gfm-play-time" class="gfm-play-time">-</div>
              </div>
            </div>
          </div>
        </ha-card>
      `;
      this._wireEvents();
    }

    _styles() {
      return `
        ha-card { overflow: hidden; }
        .gfm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid var(--divider-color, #e0e0e0);
        }
        .gfm-title { font-size: 1.2em; font-weight: 500; color: var(--primary-text-color); }
        .gfm-header-actions { display: flex; gap: 4px; }
        .gfm-icon-btn {
          background: none; border: none; cursor: pointer; font-size: 1.1em;
          padding: 6px 8px; border-radius: 8px; color: var(--primary-text-color);
        }
        .gfm-icon-btn:hover { background: var(--secondary-background-color, #f0f0f0); }
        .gfm-body { display: flex; position: relative; height: 480px; }
        .gfm-devices {
          width: 0; overflow: hidden; transition: width .2s ease; flex-shrink: 0;
          background: var(--card-background-color); border-right: 1px solid var(--divider-color, #e0e0e0);
        }
        .gfm-devices.gfm-open, .gfm-devices.gfm-pinned { width: 220px; overflow-y: auto; }
        .gfm-device-card {
          padding: 10px 12px; border-bottom: 1px solid var(--divider-color, #eee);
          cursor: pointer; display: flex; flex-direction: column; gap: 2px;
        }
        .gfm-device-card:hover { background: var(--secondary-background-color, #f5f5f5); }
        .gfm-device-card.gfm-active { background: var(--primary-color); color: white; }
        .gfm-device-name { font-weight: 500; font-size: 0.95em; display:flex; align-items:center; gap:6px; }
        .gfm-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .gfm-status-home { background: #4caf50; }
        .gfm-status-away { background: #2196f3; }
        .gfm-status-unknown { background: #9e9e9e; }
        .gfm-device-sub { font-size: 0.78em; opacity: 0.8; }
        .gfm-map-wrap { position: relative; flex: 1 1 auto; min-width: 0; height: 100%; }
        .gfm-map { position: absolute; inset: 0; width: 100%; height: 100%; }
        .gfm-error { padding: 24px; text-align: center; color: var(--error-color, #c00); }
        .gfm-panel {
          position: absolute; background: var(--card-background-color, white);
          border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.25);
          padding: 10px 12px; z-index: 500; font-size: 0.85em; max-width: 240px;
        }
        .gfm-panel-topright { top: 10px; right: 10px; }
        .gfm-panel-bottom { left: 10px; right: 10px; bottom: 10px; max-width: none; }
        .gfm-hidden { display: none; }
        .gfm-panel-title { font-weight: 600; margin-bottom: 6px; }
        .gfm-field { margin-top: 8px; }
        .gfm-field label { display: block; font-size: 0.85em; margin-bottom: 4px; opacity: 0.85; }
        .gfm-btn-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
        .gfm-chip {
          border: 1px solid var(--divider-color, #ccc); background: transparent;
          border-radius: 14px; padding: 4px 10px; font-size: 0.8em; cursor: pointer;
          color: var(--primary-text-color);
        }
        .gfm-chip.gfm-active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .gfm-stats-body table { border-collapse: collapse; width: 100%; }
        .gfm-stats-body td { padding: 2px 4px; font-size: 0.85em; }
        .gfm-stats-body td:first-child { opacity: 0.75; }
        .gfm-stats-body td:last-child { text-align: right; font-weight: 600; }
        .gfm-playback-controls { display: flex; align-items: center; gap: 8px; }
        .gfm-scrub { flex: 1; }
        .gfm-speed-select { border-radius: 6px; }
        .gfm-play-time { font-size: 0.78em; margin-top: 4px; text-align: center; opacity: 0.85; }
        .gfm-marker-start, .gfm-marker-end {
          font-size: 20px; line-height: 20px; text-align: center;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,.5));
        }
        .gfm-marker-numbered {
          background: var(--primary-color, #2196f3); color: white; border-radius: 50%;
          width: 22px; height: 22px; line-height: 22px; text-align: center;
          font-size: 11px; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,.4);
        }
        .gfm-marker-playback {
          font-size: 22px; line-height: 22px; text-align: center;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,.6));
        }
        @media (max-width: 768px) {
          .gfm-devices.gfm-open, .gfm-devices.gfm-pinned { width: 170px; }
          .gfm-panel { max-width: 190px; font-size: 0.8em; }
        }
      `;
    }

    _wireEvents() {
      const $ = (id) => this.shadowRoot.getElementById(id);

      $("gfm-btn-devices").addEventListener("click", () => this._togglePanel("devices"));
      $("gfm-btn-filters").addEventListener("click", () => this._togglePanel("filters"));
      $("gfm-btn-refresh").addEventListener("click", () => {
        if (this._selectedEntityId) this._selectDevice(this._selectedEntityId, false);
      });
      const statsBtn = $("gfm-btn-stats");
      if (statsBtn) statsBtn.addEventListener("click", () => this._togglePanel("stats"));
      const playBtn = $("gfm-btn-playback");
      if (playBtn) playBtn.addEventListener("click", () => this._togglePanel("playback"));

      this.shadowRoot.querySelectorAll("[data-days]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this._runtimeFilters.days = parseInt(btn.dataset.days, 10);
          this._refreshDaysChips();
          if (this._selectedEntityId) this._selectDevice(this._selectedEntityId, false);
        });
      });
      this._refreshDaysChips();

      const accSlider = $("gfm-accuracy-slider");
      if (accSlider) {
        accSlider.value = this._runtimeFilters.accuracy;
        this._refreshAccuracyLabel();
        accSlider.addEventListener("input", () => {
          this._runtimeFilters.accuracy = parseInt(accSlider.value, 10);
          this._refreshAccuracyLabel();
          this._redraw();
        });
      }

      const exportGpx = $("gfm-export-gpx");
      if (exportGpx) exportGpx.addEventListener("click", () => this._doExport("gpx"));
      const exportKml = $("gfm-export-kml");
      if (exportKml) exportKml.addEventListener("click", () => this._doExport("kml"));

      const playToggle = $("gfm-play-toggle");
      if (playToggle) playToggle.addEventListener("click", () => this._togglePlayback());
      const playReset = $("gfm-play-reset");
      if (playReset) playReset.addEventListener("click", () => this._resetPlayback());
      const scrub = $("gfm-play-scrub");
      if (scrub) {
        scrub.addEventListener("input", () => {
          this._stopPlayback(false);
          const idx = Math.round((scrub.value / 100) * (this._points.length - 1));
          this._playback.index = Math.max(0, idx);
          this._updatePlaybackMarker();
        });
      }
      const speedSel = $("gfm-play-speed");
      if (speedSel) {
        speedSel.addEventListener("change", () => {
          this._playback.speed = parseFloat(speedSel.value);
          if (this._playback.playing) {
            this._stopPlayback(false);
            this._startPlayback();
          }
        });
      }
    }

    _refreshDaysChips() {
      this.shadowRoot.querySelectorAll("[data-days]").forEach((btn) => {
        btn.classList.toggle("gfm-active", parseInt(btn.dataset.days, 10) === this._runtimeFilters.days);
      });
    }

    _refreshAccuracyLabel() {
      const label = this.shadowRoot.getElementById("gfm-accuracy-val");
      if (!label) return;
      label.textContent =
        this._runtimeFilters.accuracy === 0 ? "0 m (desactivado)" : `${this._runtimeFilters.accuracy} m`;
    }

    _togglePanel(name) {
      const map = {
        devices: "gfm-devices",
        filters: "gfm-filters-panel",
        stats: "gfm-stats-panel",
        playback: "gfm-playback-bar",
      };
      this._panelState[name] = !this._panelState[name];
      const el = this.shadowRoot.getElementById(map[name]);
      if (!el) return;
      if (name === "devices") {
        el.classList.toggle("gfm-open", this._panelState.devices || this._config.keep_device_list_pinned);
      } else {
        el.classList.toggle("gfm-hidden", !this._panelState[name]);
      }
    }

    _initMap() {
      const L = window.L;
      const mapEl = this.shadowRoot.getElementById("gfm-map");
      this._map = L.map(mapEl, { zoomControl: true }).setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(this._map);
      this._layerGroup = L.layerGroup().addTo(this._map);

      const kickResize = () => {
        if (!this._map) return;
        this._map.invalidateSize({ animate: false, pan: false });
        if (this._points && this._points.length > 0) {
          try {
            const bounds = L.latLngBounds(this._points.map((p) => [p.lat, p.lon]));
            this._map.fitBounds(bounds.pad(0.2), { animate: false });
          } catch (e) {
            /* ignore */
          }
        }
      };
      if (window.ResizeObserver) {
        this._resizeObserver = new ResizeObserver(() => kickResize());
        this._resizeObserver.observe(mapEl);
      }
      [0, 200, 500, 1200].forEach((ms) => setTimeout(() => this._map && this._map.invalidateSize(), ms));
    }

    _updateDeviceList() {
      const container = this.shadowRoot.getElementById("gfm-devices");
      if (!container) return;
      const entities = this._resolveEntities();
      container.innerHTML = "";
      if (this._config.keep_device_list_pinned) container.classList.add("gfm-pinned");

      entities.forEach((cfgEntity) => {
        const state = this._hass.states[cfgEntity.entity];
        const card = document.createElement("div");
        card.className = "gfm-device-card" + (cfgEntity.entity === this._selectedEntityId ? " gfm-active" : "");
        const name = cfgEntity.name || (state ? state.attributes.friendly_name : cfgEntity.entity);
        const statusClass = !state
          ? "gfm-status-unknown"
          : state.state === "home"
          ? "gfm-status-home"
          : state.state === "not_home"
          ? "gfm-status-away"
          : "gfm-status-unknown";
        const lastSeen =
          this._config.show_last_seen && state ? formatTime(new Date(state.last_updated)) : "";
        const locName =
          this._config.show_location_name && state && state.attributes.address
            ? state.attributes.address
            : "";
        card.innerHTML = `
          <div class="gfm-device-name"><span class="gfm-status-dot ${statusClass}"></span>${escapeHTML(name)}</div>
          ${lastSeen ? `<div class="gfm-device-sub">🕒 ${escapeHTML(lastSeen)}</div>` : ""}
          ${locName ? `<div class="gfm-device-sub">📍 ${escapeHTML(locName)}</div>` : ""}
        `;
        card.addEventListener("click", () => this._selectDevice(cfgEntity.entity, false));
        container.appendChild(card);
      });
    }

    async _selectDevice(entityId, keepView) {
      this._selectedEntityId = entityId;
      this._stopPlayback();
      this._updateDeviceList();
      await this._loadHistoryAndDraw(entityId, keepView);
    }

    async _fetchHistory(entityId, days) {
      const end = new Date();
      const start = new Date(end.getTime() - days * 86400000);
      // IMPORTANT: do NOT use minimal_response here - it strips attributes
      // (including latitude/longitude) from most points, leaving the map
      // with almost nothing to draw. significant_changes_only=0 makes sure
      // GPS-only updates (state text unchanged, e.g. still "not_home") are
      // not filtered out either.
      const path = `history/period/${start.toISOString()}?filter_entity_id=${encodeURIComponent(
        entityId
      )}&end_time=${encodeURIComponent(end.toISOString())}&significant_changes_only=0`;
      let result;
      try {
        result = await this._hass.callApi("GET", path);
      } catch (e) {
        console.error("[googlefindmy-card-tracker] Error obteniendo historial:", e);
        result = null;
      }
      const raw = (result && result[0]) || [];
      const points = raw
        .filter((s) => s.attributes && s.attributes.latitude != null && s.attributes.longitude != null)
        .map((s) => ({
          lat: s.attributes.latitude,
          lon: s.attributes.longitude,
          accuracy: s.attributes.gps_accuracy ?? s.attributes.accuracy ?? null,
          timestamp: new Date(s.last_updated || s.last_changed),
          source: s.attributes.address || s.attributes.location_name || "",
          state: s.state,
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      const deduped = [];
      for (const p of points) {
        const prev = deduped[deduped.length - 1];
        if (!prev || prev.lat !== p.lat || prev.lon !== p.lon) deduped.push(p);
      }

      // Fallback: if the recorder has no usable history in this window
      // (fresh install, short-lived entity, purge settings, etc.) at least
      // show the device's current live position instead of a blank map.
      if (deduped.length === 0) {
        const live = this._hass.states[entityId];
        if (live && live.attributes && live.attributes.latitude != null && live.attributes.longitude != null) {
          deduped.push({
            lat: live.attributes.latitude,
            lon: live.attributes.longitude,
            accuracy: live.attributes.gps_accuracy ?? live.attributes.accuracy ?? null,
            timestamp: new Date(live.last_updated || live.last_changed),
            source: live.attributes.address || live.attributes.location_name || "",
            state: live.state,
          });
        }
      }

      return deduped;
    }

    async _loadHistoryAndDraw(entityId, keepView) {
      const days = this._runtimeFilters.days;
      const raw = await this._fetchHistory(entityId, days);
      this._allPoints = raw;
      this._redraw(keepView);
    }

    _filteredPoints() {
      const acc = this._runtimeFilters.accuracy;
      let pts = this._allPoints || [];
      if (acc > 0) {
        pts = pts.filter((p) => p.accuracy == null || p.accuracy <= acc);
      }
      return pts;
    }

    _redraw(keepView) {
      this._points = this._filteredPoints();
      if (this._map) this._map.invalidateSize({ animate: false });
      this._drawMap(keepView);
      this._updateStats();
      this._resetPlayback();
    }

    _drawMap(keepView) {
      if (!this._map || !window.L) return;
      const L = window.L;
      this._layerGroup.clearLayers();
      this._decorator = null;

      const points = this._points;
      if (points.length === 0) return;

      const latlngs = points.map((p) => [p.lat, p.lon]);

      if (this._config.show_path_lines && points.length > 1) {
        const line = L.polyline(latlngs, { color: "#2196f3", weight: 4, opacity: 0.8 });
        line.addTo(this._layerGroup);

        if (this._config.show_direction_arrows && L.polylineDecorator) {
          try {
            this._decorator = L.polylineDecorator(line, {
              patterns: [
                {
                  offset: "8%",
                  repeat: "12%",
                  symbol: L.Symbol.arrowHead({
                    pixelSize: 10,
                    polygon: false,
                    pathOptions: { stroke: true, color: "#0d47a1", weight: 2 },
                  }),
                },
              ],
            });
            this._decorator.addTo(this._layerGroup);
          } catch (e) {
            console.warn("[googlefindmy-card-tracker] No se pudieron dibujar las flechas:", e);
          }
        }
      }

      points.forEach((p, idx) => {
        if (p.accuracy) {
          L.circle([p.lat, p.lon], {
            radius: p.accuracy,
            color: "#2196f3",
            weight: 1,
            fillOpacity: 0.06,
            opacity: 0.25,
          }).addTo(this._layerGroup);
        }

        const isStart = idx === 0;
        const isEnd = idx === points.length - 1;
        let icon = null;

        if (isStart && isEnd) {
          icon = L.divIcon({
            className: "",
            html: `<div class="gfm-marker-end">🔴</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 22],
          });
        } else if (isStart && this._config.show_start_end_markers) {
          icon = L.divIcon({
            className: "",
            html: `<div class="gfm-marker-start">🏁</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 22],
          });
        } else if (isEnd && this._config.show_start_end_markers) {
          icon = L.divIcon({
            className: "",
            html: `<div class="gfm-marker-end">🔴</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 22],
          });
        } else if (this._config.show_numbered_markers) {
          icon = L.divIcon({
            className: "",
            html: `<div class="gfm-marker-numbered">${idx}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
        } else {
          icon = L.divIcon({
            className: "",
            html: `<div style="background:#64b5f6;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 2px rgba(0,0,0,.4);"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
        }

        const marker = L.marker([p.lat, p.lon], { icon }).addTo(this._layerGroup);
        const label = isStart ? "🏁 Inicio" : isEnd ? "🔴 Fin / Actual" : `Punto ${idx}`;
        marker.bindPopup(`
          <b>${escapeHTML(label)}</b><br/>
          Lat/Lon: ${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}<br/>
          Precisión: ${p.accuracy != null ? Math.round(p.accuracy) + " m" : "N/D"}<br/>
          Hora: ${escapeHTML(formatTime(p.timestamp))}
          ${p.source ? `<br/>Ubicación: ${escapeHTML(p.source)}` : ""}
        `);
      });

      if (this._map) this._map.invalidateSize({ animate: false });

      if (!keepView) {
        try {
          const bounds = L.latLngBounds(latlngs);
          this._map.fitBounds(bounds.pad(0.2), { animate: false });
        } catch (e) {
          /* ignore */
        }
      }
      setTimeout(() => {
        if (!this._map) return;
        this._map.invalidateSize({ animate: false });
        if (!keepView) {
          try {
            const bounds = L.latLngBounds(latlngs);
            this._map.fitBounds(bounds.pad(0.2), { animate: false });
          } catch (e) {
            /* ignore */
          }
        }
      }, 150);
    }

    _updateStats() {
      const body = this.shadowRoot.getElementById("gfm-stats-body");
      if (!body) return;
      const stats = computeStats(this._points);
      this._lastStats = stats;
      if (stats.count === 0) {
        body.innerHTML = "Sin datos de ubicación en el rango seleccionado.";
        return;
      }
      body.innerHTML = `
        <table>
          <tr><td>Puntos</td><td>${stats.count}</td></tr>
          <tr><td>Distancia</td><td>${formatDistance(stats.distanceKm)}</td></tr>
          <tr><td>Duración</td><td>${formatDuration(stats.durationMs)}</td></tr>
          <tr><td>Vel. media</td><td>${stats.avgSpeed.toFixed(1)} km/h</td></tr>
          <tr><td>Vel. máxima</td><td>${stats.maxSpeed.toFixed(1)} km/h</td></tr>
          <tr><td>Desde</td><td>${formatTime(stats.start)}</td></tr>
          <tr><td>Hasta</td><td>${formatTime(stats.end)}</td></tr>
        </table>
      `;
    }

    _doExport(type) {
      if (!this._points || this._points.length === 0) return;
      const entityState = this._hass.states[this._selectedEntityId];
      const name = entityState ? entityState.attributes.friendly_name : this._selectedEntityId;
      const safeName = name.replace(/[^a-z0-9_-]+/gi, "_");
      const stamp = new Date().toISOString().slice(0, 10);
      if (type === "gpx") {
        downloadFile(`${safeName}_${stamp}.gpx`, buildGPX(this._points, name), "application/gpx+xml");
      } else {
        downloadFile(`${safeName}_${stamp}.kml`, buildKML(this._points, name), "application/vnd.google-earth.kml+xml");
      }
    }

    _togglePlayback() {
      if (this._playback.playing) {
        this._stopPlayback();
      } else {
        this._startPlayback();
      }
    }

    _startPlayback() {
      if (!this._points || this._points.length < 2 || !window.L) return;
      this._playback.playing = true;
      const btn = this.shadowRoot.getElementById("gfm-play-toggle");
      if (btn) btn.textContent = "⏸️";
      const baseInterval = 900;
      const tick = () => {
        if (this._playback.index >= this._points.length - 1) {
          this._stopPlayback();
          return;
        }
        this._playback.index += 1;
        this._updatePlaybackMarker();
      };
      const interval = Math.max(60, baseInterval / this._playback.speed);
      this._playback.timer = setInterval(tick, interval);
    }

    _stopPlayback(resetIcon = true) {
      if (this._playback.timer) {
        clearInterval(this._playback.timer);
        this._playback.timer = null;
      }
      this._playback.playing = false;
      if (resetIcon) {
        const btn = this.shadowRoot.getElementById("gfm-play-toggle");
        if (btn) btn.textContent = "▶️";
      }
    }

    _resetPlayback() {
      this._stopPlayback();
      this._playback.index = 0;
      if (this._playback.marker && this._layerGroup) {
        this._layerGroup.removeLayer(this._playback.marker);
        this._playback.marker = null;
      }
      const scrub = this.shadowRoot.getElementById("gfm-play-scrub");
      if (scrub) scrub.value = 0;
      const timeLabel = this.shadowRoot.getElementById("gfm-play-time");
      if (timeLabel) timeLabel.textContent = this._points.length ? formatTime(this._points[0].timestamp) : "-";
    }

    _updatePlaybackMarker() {
      const L = window.L;
      if (!L || !this._layerGroup || this._points.length === 0) return;
      const idx = this._playback.index;
      const p = this._points[idx];
      if (!p) return;

      let angle = 0;
      if (idx > 0) {
        const prev = this._points[idx - 1];
        angle = bearingDegrees(prev.lat, prev.lon, p.lat, p.lon);
      }

      if (!this._playback.marker) {
        const icon = L.divIcon({
          className: "",
          html: `<div class="gfm-marker-playback" style="transform: rotate(${angle}deg);">➤</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        this._playback.marker = L.marker([p.lat, p.lon], { icon, zIndexOffset: 1000 }).addTo(this._layerGroup);
      } else {
        this._playback.marker.setLatLng([p.lat, p.lon]);
        const el = this._playback.marker.getElement();
        if (el) {
          const inner = el.querySelector(".gfm-marker-playback");
          if (inner) inner.style.transform = `rotate(${angle}deg)`;
        }
      }

      const scrub = this.shadowRoot.getElementById("gfm-play-scrub");
      if (scrub) scrub.value = Math.round((idx / (this._points.length - 1)) * 100);
      const timeLabel = this.shadowRoot.getElementById("gfm-play-time");
      if (timeLabel) timeLabel.textContent = formatTime(p.timestamp);

      if (this._map) this._map.panTo([p.lat, p.lon], { animate: true, duration: 0.3 });
    }
  }

  class GoogleFindMyCardTrackerEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = {};
    }

    setConfig(config) {
      this._config = { ...DEFAULT_CONFIG, ...config };
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
    }

    _entitiesToText(entities) {
      return (entities || [])
        .map((e) => {
          if (typeof e === "string") return e;
          return [e.entity, e.name || "", e.icon || ""].filter((v, i) => i === 0 || v).join("|");
        })
        .join("\n");
    }

    _textToEntities(text) {
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [entity, name, icon] = line.split("|").map((v) => (v || "").trim());
          if (!name && !icon) return entity;
          const obj = { entity };
          if (name) obj.name = name;
          if (icon) obj.icon = icon;
          return obj;
        });
    }

    _emitChange() {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true,
        })
      );
    }

    _render() {
      const c = this._config;
      const checkbox = (key, label) => `
        <label class="gfm-ed-row">
          <input type="checkbox" data-key="${key}" ${c[key] ? "checked" : ""}/>
          <span>${label}</span>
        </label>`;

      this.shadowRoot.innerHTML = `
        <style>
          .gfm-ed-wrap { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
          .gfm-ed-row { display: flex; align-items: center; gap: 8px; font-size: 0.95em; }
          .gfm-ed-field label { display:block; font-size: 0.85em; margin-bottom: 4px; opacity: .8; }
          .gfm-ed-field input[type=text], .gfm-ed-field textarea, .gfm-ed-field select {
            width: 100%; box-sizing: border-box; padding: 6px 8px; border-radius: 6px;
            border: 1px solid var(--divider-color, #ccc); font-family: inherit;
          }
          .gfm-ed-field textarea { min-height: 70px; font-family: monospace; font-size: 0.85em; }
          .gfm-ed-section { font-weight: 600; margin-top: 6px; border-top: 1px solid var(--divider-color,#eee); padding-top:8px; }
          .gfm-ed-hint { font-size: 0.75em; opacity: 0.7; margin-top: -4px; }
        </style>
        <div class="gfm-ed-wrap">
          <div class="gfm-ed-field">
            <label>Título</label>
            <input type="text" id="ed-title" value="${escapeHTML(c.title)}" />
          </div>

          <div class="gfm-ed-field">
            <label>Entidades (una por línea: entity_id|Nombre opcional|icono opcional)</label>
            <textarea id="ed-entities">${escapeHTML(this._entitiesToText(c.entities))}</textarea>
            <div class="gfm-ed-hint">Ej: device_tracker.iphone|iPhone de Juan|mdi:cellphone-iphone</div>
          </div>

          <div class="gfm-ed-field">
            <label>Filtrar por palabra clave (opcional)</label>
            <input type="text" id="ed-keywords" value="${escapeHTML(c.filter_keywords)}" />
          </div>

          <div class="gfm-ed-field">
            <label>Rango de historial por defecto</label>
            <select id="ed-days">
              ${[1, 3, 7, 14]
                .map((d) => `<option value="${d}" ${c.history_days === d ? "selected" : ""}>${d} día(s)</option>`)
                .join("")}
            </select>
          </div>

          <div class="gfm-ed-section">Visualización</div>
          ${checkbox("show_last_seen", "Mostrar última vez visto")}
          ${checkbox("show_location_name", "Mostrar nombre de ubicación")}
          ${checkbox("enable_actions", "Habilitar acciones (reproducir sonido)")}
          ${checkbox("keep_device_list_pinned", "Mantener lista de dispositivos fija")}
          ${checkbox("show_path_lines", "Mostrar línea de recorrido")}

          <div class="gfm-ed-section">🗺️ Recorrido</div>
          ${checkbox("show_start_end_markers", "🏁 Marcador de inicio / 🔴 fin")}
          ${checkbox("show_numbered_markers", "🔢 Marcadores numerados")}
          ${checkbox("show_direction_arrows", "➜ Flechas de dirección")}
          ${checkbox("enable_playback", "🎞️ Reproducción del recorrido")}
          ${checkbox("show_statistics", "📊 Estadísticas")}
          ${checkbox("enable_export", "📁 Exportación GPX/KML")}
        </div>
      `;

      this.shadowRoot.getElementById("ed-title").addEventListener("input", (e) => {
        this._config = { ...this._config, title: e.target.value };
        this._emitChange();
      });
      this.shadowRoot.getElementById("ed-entities").addEventListener("change", (e) => {
        this._config = { ...this._config, entities: this._textToEntities(e.target.value) };
        this._emitChange();
      });
      this.shadowRoot.getElementById("ed-keywords").addEventListener("input", (e) => {
        this._config = { ...this._config, filter_keywords: e.target.value };
        this._emitChange();
      });
      this.shadowRoot.getElementById("ed-days").addEventListener("change", (e) => {
        this._config = { ...this._config, history_days: parseInt(e.target.value, 10) };
        this._emitChange();
      });
      this.shadowRoot.querySelectorAll('input[type="checkbox"][data-key]').forEach((input) => {
        input.addEventListener("change", (e) => {
          this._config = { ...this._config, [e.target.dataset.key]: e.target.checked };
          this._emitChange();
        });
      });
    }
  }

  if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, GoogleFindMyCardTracker);
  if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, GoogleFindMyCardTrackerEditor);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TAG,
    name: "Google FindMy Card Tracker",
    description:
      "Mapa interactivo para Google Find My Device con inicio/fin, marcadores numerados, flechas de dirección, reproducción del recorrido, estadísticas y exportación GPX/KML.",
    preview: true,
    documentationURL: "https://github.com/davicho16/googlefindmy-card-tracker",
  });

  console.info(
    `%c GOOGLEFINDMY-CARD-TRACKER %c v${CARD_VERSION} `,
    "color: white; background: #2196f3; font-weight: 700;",
    "color: #2196f3; background: white; font-weight: 700;"
  );
})();
