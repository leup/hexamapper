// ===============================
// 1. Utilitaires

import {
  convertGridToMapFormat,
  generateGrid,
  saveMaptoJSON,
} from "./utils.js";
import { Grid } from "./grid.js";

// ===============================
const LOCAL_STORAGE_KEY = "hexamapper_autosave";
let saveFileName = "hexamap.json";
let HEX_SIZE = 32;
let defaultGridSize = 10;
let selectedIcon = null;
let backgroundImage = null;

let map = {
  name: "My HexaMap",
  width: 0,
  height: 0,
  start: 0,
  grid: [],
};

let grid = Grid({
  hexSize: HEX_SIZE,
});

const canvas = document.getElementById("hex-canvas");

function resizeCanvas() {
  const parent = document.getElementById("main-area");
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvas.width = w;
  canvas.height = h;
  grid.draw();
}

// ===============================
// 3. Gestion des icônes et du fond
// ===============================
const iconImages = {};
const iconList = {
  terrains: [
    "empty", // type spécial pour effacer
    "Colline.webp",
    "Cote.webp",
    "Desert.webp",
    "Dryland.webp",
    "Foret.webp",
    "Glace.webp",
    "Marecage.webp",
    "Mer.webp",
    "Montagne.webp",
    "Neige.webp",
    "Plaine.webp",
    "Riviere.webp",
    "Wasteland.webp",
  ],
  sousterrains: [
    "Galerie.webp",
    "Granite.webp",
    "Grotte.webp",
    "Roche.webp",
    "Terre.webp",
  ],
  colors: [
    "#ffffff",
    "#c0c0c0",
    "#808080",
    "#000000",
    "#ff0000",
    "#800000",
    "#ffff00",
    "#808000",
    "#00ff00",
    "#008000",
    "#00ffff",
    "#008080",
    "#0000ff",
    "#000080",
    "#ff00ff",
    "#800080",
  ],
};

const iconGridTerrains = document.getElementById("icon-grid-terrains");
const iconGridSousterrains = document.getElementById("icon-grid-sousterrains");
const iconGridColors = document.getElementById("icon-grid-colors");

function renderIconGrid() {
  iconGridTerrains.innerHTML = "";
  iconGridSousterrains.innerHTML = "";
  iconGridColors.innerHTML = "";
  iconList.terrains.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "icon-btn" + (selectedIcon === name ? " selected" : "");
    if (name === "empty") {
      btn.title = "Gomme (effacer)";
      btn.textContent = "";
    } else {
      btn.title = name.replace(".png", "");
      const img = document.createElement("img");
      img.src = `assets/hexas/${name}`;
      img.alt = name;
      btn.appendChild(img);
    }
    btn.addEventListener("click", () => {
      selectedIcon = name;
      grid.setSelectedIcon(name);
      renderIconGrid();
    });
    iconGridTerrains.appendChild(btn);
  });
  iconList.sousterrains.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "icon-btn" + (selectedIcon === name ? " selected" : "");
    if (name === "empty") {
      btn.title = "Gomme (effacer)";
      btn.textContent = "";
    } else {
      btn.title = name.replace(".png", "");
      const img = document.createElement("img");
      img.src = `assets/hexas/${name}`;
      img.alt = name;
      btn.appendChild(img);
    }
    btn.addEventListener("click", () => {
      selectedIcon = name;
      grid.setSelectedIcon(name);
      renderIconGrid();
    });
    iconGridSousterrains.appendChild(btn);
  });
  iconList.colors.forEach((color) => {
    const btn = document.createElement("button");
    btn.className = "icon-btn" + (selectedIcon === color ? " selected" : "");
    btn.title = color.replace(".png", "");
    let hexa = document.createElement("div");
    hexa.className = "hexagon";
    hexa.style.backgroundColor = color;
    btn.appendChild(hexa);
    btn.addEventListener("click", () => {
      selectedIcon = color;
      grid.setSelectedIcon(color);
      renderIconGrid();
    });
    iconGridColors.appendChild(btn);
  });
}

// ===============================
// 4. Interactions utilisateur (canvas, sélection, zoom)
// ===============================
function updateZoomDisplay() {
  zoomLevelSpan.textContent = HEX_SIZE;
}

const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const zoomLevelSpan = document.getElementById("zoom-level");
const zoomResetBtn = document.getElementById("zoom-reset");

zoomInBtn.addEventListener("click", () => {
  HEX_SIZE = Math.min(HEX_SIZE + 4, 128);
  grid.setHexSize(HEX_SIZE);
  updateZoomDisplay();
});
zoomOutBtn.addEventListener("click", () => {
  HEX_SIZE = Math.max(HEX_SIZE - 4, 8);
  grid.setHexSize(HEX_SIZE);
  updateZoomDisplay();
});
if (zoomResetBtn) {
  zoomResetBtn.addEventListener("click", () => {
    HEX_SIZE = 32;
    grid.setHexSize(HEX_SIZE);
    updateZoomDisplay();
  });
}
updateZoomDisplay();

// ===============================
// 5. Import/export et sauvegarde
// ===============================
const saveMapBtn = document.getElementById("save-map");
const importMapBtn = document.getElementById("import-map");
const exportImageBtn = document.getElementById("export-image");
const importFileInput = document.getElementById("import-file");

saveMapBtn.addEventListener("click", () => {
  map.grid = grid.getGrid();
  saveMaptoJSON(map, saveFileName);
});

importMapBtn.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  saveFileName = file.name || "hexamap.json";
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      let json = JSON.parse(evt.target.result);
      console.log("Map importée :", json);

      if (Array.isArray(json)) {
        map = convertGridToMapFormat(json);
      } else {
        // todo: add a version tag in the future
        map = json;
      }

      // Met à jour les inputs de taille
      gridHeightInput.value = map.height;
      gridWidthInput.value = map.width;
      grid.setGrid(map.grid);
    } catch (err) {
      alert("Erreur lors de l’import.");
      console.error("Erreur lors de l’import :", err);
    }
  };
  reader.readAsText(file);
});

exportImageBtn.addEventListener("click", () => grid.exportToPNG());

// ===============================
// 6. Initialisation et restauration
// ===============================
const gridWidthInput = document.getElementById("grid-width");
const gridHeightInput = document.getElementById("grid-height");
const generateGridBtn = document.getElementById("generate-grid");
const resizeAnchorSelect = document.getElementById("resize-anchor");
const resetGridBtn = document.getElementById("reset-grid");
// Bouton pour réinitialiser totalement la grille
if (resetGridBtn) {
  resetGridBtn.addEventListener("click", () => {
    gridWidthInput.value = defaultGridSize;
    gridHeightInput.value = defaultGridSize;
    generateMap();
  });
}

function generateMap() {
  console.log("Génération de la map...");
  const width = parseInt(gridWidthInput.value);
  const height = parseInt(gridHeightInput.value);
  map.width = width;
  map.height = height;
  map.grid = [];
  map.start = 0;
  map.grid = generateGrid(width, height);
  grid.setDeltaHeight(0);
  grid.setGrid(map.grid);
  storeMap();
}

function storeMap() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
}

generateGridBtn.addEventListener("click", () => {
  map.grid = grid.getGrid();
  if (!map.grid.length) {
    // generate a new empty grid if none exists
    return generateMap();
  }

  const newWidth = parseInt(gridWidthInput.value);
  const newHeight = parseInt(gridHeightInput.value);

  if (isNaN(newWidth) || isNaN(newHeight) || newWidth < 1 || newHeight < 1) {
    alert("Largeur et hauteur doivent être des nombres entiers positifs.");
    return;
  }

  if (map.width === newWidth && map.height === newHeight) {
    // No change in size
    return;
  }

  const anchor = resizeAnchorSelect.value;

  // Resize the existing grid
  const oldHeight = map.height;
  const oldWidth = map.width;

  let dy = 0;
  let dx = 0;

  let deltaHeight = 0;

  switch (anchor) {
    case "center":
      deltaHeight =
        newWidth - oldWidth > 1
          ? Math.floor(((newWidth - oldWidth) / 2) % 2)
          : map.start;
      dy = Math.floor((newWidth - oldWidth) / 2);
      dx = Math.ceil((newHeight - oldHeight) / 2);
      break;
    case "top-left":
      dy = 0;
      dx = 0;
      break;
    case "top":
      deltaHeight =
        newWidth - oldWidth > 1
          ? Math.floor(((newWidth - oldWidth) / 2) % 2)
          : map.start;
      dy = Math.floor((newWidth - oldWidth) / 2);
      dx = 0;
      break;
    case "top-right":
      deltaHeight = (newWidth - oldWidth) % 2 ? !map.start : map.start;
      dy = newWidth - oldWidth;
      dx = 0;
      break;
    case "left":
      dy = 0;
      dx = Math.round((newHeight - oldHeight) / 2);
      break;
    case "right":
      deltaHeight = (newWidth - oldWidth) % 2 ? !map.start : map.start;
      dy = newWidth - oldWidth;
      dx = Math.round((newHeight - oldHeight) / 2);
      break;
    case "bottom-left":
      dy = 0;
      dx = newHeight - oldHeight;
      break;
    case "bottom":
      deltaHeight =
        newWidth - oldWidth > 1
          ? Math.floor(((newWidth - oldWidth) / 2) % 2)
          : map.start;
      dy = Math.floor((newWidth - oldWidth) / 2);
      dx = newHeight - oldHeight;
      break;
    case "bottom-right":
      deltaHeight = (newWidth - oldWidth) % 2 ? !map.start : map.start;
      dy = newWidth - oldWidth;
      dx = newHeight - oldHeight;
      break;
  }

  const newGrid = [];
  for (let r = 0; r < newHeight; r++) {
    const row = [];
    for (let q = 0; q < newWidth; q++) {
      row.push({ icon: null });
    }
    newGrid.push(row);
  }
  for (let r = 0; r < oldHeight; r++) {
    for (let q = 0; q < oldWidth; q++) {
      const nx = r + dx;
      const ny = q + dy;
      if (nx >= 0 && nx < newHeight && ny >= 0 && ny < newWidth) {
        newGrid[nx][ny] = map.grid[r][q];
      }
    }
  }
  map.width = newWidth;
  map.height = newHeight;
  map.start = deltaHeight;
  map.grid = newGrid;
  grid.setDeltaHeight(deltaHeight);
  grid.setGrid(newGrid);
  storeMap();
});

window.addEventListener("DOMContentLoaded", () => {
  iconList.terrains.forEach((name) => {
    const img = new Image();
    img.src = `assets/hexas/${name}`;
    iconImages[name] = img;
  });
  iconList.sousterrains.forEach((name) => {
    const img = new Image();
    img.src = `assets/hexas/${name}`;
    iconImages[name] = img;
  });

  grid = Grid({
    hexSize: HEX_SIZE,
    icons: iconImages,
  });

  let defaultBackgroundImage = new Image();
  defaultBackgroundImage.src = "assets/hexas/background.jpg";
  defaultBackgroundImage.onload = function () {
    if (!backgroundImage) backgroundImage = defaultBackgroundImage;
    grid.setBackgroundImage(backgroundImage);
  };
  renderIconGrid();
  resizeCanvas();
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  console.log("Données sauvegardées trouvées :", saved);
  if (saved) {
    try {
      let json = JSON.parse(saved);
      if (Array.isArray(json)) {
        map = convertGridToMapFormat(json);
      } else {
        // todo: add a version tag in the future
        map = json;
      }
      console.log("Map restaurée :", map);
      gridHeightInput.value = map.height;
      gridWidthInput.value = map.width;
      grid.setDeltaHeight(map.start || 0);
      grid.setGrid(map.grid);
    } catch (e) {
      console.error("Erreur lors de la restauration :", e);
    }
  } else {
    generateMap();
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("DOMContentLoaded", resizeCanvas);
