// ===============================
// 1. Utilitaires
// ===============================
const LOCAL_STORAGE_KEY = "hexamapper_autosave";
let saveFileName = "hexamap.json";
let HEX_SIZE = 32;
let grid = [];
let isMouseDown = false;
let selectedIcon = null;
let backgroundImage = null;
let defaultBackgroundImage = null;

function hexToPixel(q, r) {
  const x = HEX_SIZE * 1.5 * q + HEX_SIZE;
  const y = HEX_SIZE * Math.sqrt(3) * (r + 0.5 * (q % 2)) + HEX_SIZE;
  return { x, y };
}

function pixelToHex(x, y) {
  const q = Math.round((x - HEX_SIZE) / (HEX_SIZE * 1.5));
  const y_offset = HEX_SIZE * Math.sqrt(3) * 0.5 * (q % 2);
  const r = Math.round((y - HEX_SIZE - y_offset) / (HEX_SIZE * Math.sqrt(3)));
  if (q < 0 || r < 0 || r >= grid.length || q >= grid[0].length) return null;
  return { q, r };
}

function updateZoomDisplay() {
  zoomLevelSpan.textContent = HEX_SIZE;
}

// ===============================
// 2. Dessin de la grille et des hexagones
// ===============================
const canvas = document.getElementById("hex-canvas");
const ctx = canvas.getContext("2d");

function drawHex(x, y, iconName) {
  //console.log(`Dessin de l’hexagone en (${x}, ${y}) avec l’icône ${iconName}`);
  // Dessine le contour hexagonal
  const angle = Math.PI / 3;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const dx = x + HEX_SIZE * Math.cos(angle * i);
    const dy = y + HEX_SIZE * Math.sin(angle * i);
    if (i === 0) ctx.moveTo(dx, dy);
    else ctx.lineTo(dx, dy);
  }
  ctx.closePath();
  ctx.clip();
  // Dessine l’image centrée et adaptée à la forme hexagonale
  //console.log("Icon name:", iconName);
  //console.log("Icon image object:", iconImages[iconName]);
  const img = iconName ? iconImages[iconName] : null;
  if (img && img.complete) {
    // Ratio cible pour que l’hexagone coloré soit bien centré
    // Image source : 304x260px, hexagone ~265x235px
    // Décalage pour centrer l’hexagone coloré
    const srcW = 304;
    const srcH = 260;
    // Décalage pour centrer la zone colorée (supposée centrée dans l’image)
    // On prend tout l’image, mais on l’adapte à la taille de l’hexagone
    ctx.drawImage(
      img,
      20,
      10,
      265,
      235,
      x - HEX_SIZE,
      y - HEX_SIZE,
      HEX_SIZE * 2,
      HEX_SIZE * 2
    );
  } else {
    //    ctx.fillStyle = "#eee";
    //    ctx.fill();
  }
  ctx.restore();
  // Dessine le contour
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const dx = x + HEX_SIZE * Math.cos(angle * i);
    const dy = y + HEX_SIZE * Math.sin(angle * i);
    if (i === 0) ctx.moveTo(dx, dy);
    else ctx.lineTo(dx, dy);
  }
  ctx.closePath();
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawGrid() {
  console.log("Dessin de la grille...", grid);
  const bg = backgroundImage || defaultBackgroundImage;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bg) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  for (let r = 0; r < grid.length; r++) {
    for (let q = 0; q < grid[r].length; q++) {
      const { icon } = grid[r][q];
      const { x, y } = hexToPixel(q, r);
      drawHex(x, y, icon);
    }
  }
}

function resizeCanvas() {
  const parent = document.getElementById("main-area");
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvas.width = w;
  canvas.height = h;
  //ctx = canvas.getContext("2d");
  drawGrid();
}

// ===============================
// 3. Gestion des icônes et du fond
// ===============================
const iconImages = {};
const iconList = [
  "empty", // type spécial pour effacer
  "Colline.webp",
  "Cote.webp",
  "Desert.webp",
  "Dryland.webp",
  "Foret.webp",
  "Galerie.webp",
  "Glace.webp",
  "Granite.webp",
  "Grotte.webp",
  "Marecage.webp",
  "Mer.webp",
  "Montagne.webp",
  "Neige.webp",
  "Plaine.webp",
  "Riviere.webp",
  "Roche.webp",
  "Terre.webp",
  "Wasteland.webp",
];

const iconGrid = document.getElementById("icon-grid");

function renderIconGrid() {
  iconGrid.innerHTML = "";
  iconList.forEach((name) => {
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
      renderIconGrid();
    });
    iconGrid.appendChild(btn);
  });
}

// ===============================
// 4. Interactions utilisateur (canvas, sélection, zoom)
// ===============================
canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;
  isMouseDown = true;
  paintHex(e);
});
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});
canvas.addEventListener("mouseleave", () => {
  isMouseDown = false;
});
canvas.addEventListener("mousemove", (e) => {
  if (isMouseDown && e.buttons === 1) paintHex(e);
});

function paintHex(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hex = pixelToHex(x, y);
  if (!hex) return;
  const { q, r } = hex;
  if (grid[r] && grid[r][q]) {
    if (selectedIcon === "empty") {
      grid[r][q].icon = null;
    } else {
      grid[r][q].icon = selectedIcon;
    }
    drawGrid();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(grid));
  }
}

const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const zoomLevelSpan = document.getElementById("zoom-level");
const zoomResetBtn = document.getElementById("zoom-reset");

zoomInBtn.addEventListener("click", () => {
  HEX_SIZE = Math.min(HEX_SIZE + 4, 128);
  updateZoomDisplay();
  drawGrid();
});
zoomOutBtn.addEventListener("click", () => {
  HEX_SIZE = Math.max(HEX_SIZE - 4, 8);
  updateZoomDisplay();
  drawGrid();
});
if (zoomResetBtn) {
  zoomResetBtn.addEventListener("click", () => {
    HEX_SIZE = 32;
    updateZoomDisplay();
    drawGrid();
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
  const data = JSON.stringify(grid);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = saveFileName || "hexamap.json";
  a.click();
  URL.revokeObjectURL(url);
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
      grid = JSON.parse(evt.target.result);
      drawGrid();
    } catch (err) {
      alert("Erreur lors de l’import.");
    }
  };
  reader.readAsText(file);
});

exportImageBtn.addEventListener("click", () => {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "hexamap.png";
  a.click();
});

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
    gridWidthInput.value = 10;
    gridHeightInput.value = 10;
    generateGrid();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  });
}

function generateGrid() {
  console.log("Génération de la grille...");
  const width = parseInt(gridWidthInput.value);
  const height = parseInt(gridHeightInput.value);
  grid = [];
  for (let r = 0; r < height; r++) {
    const row = [];
    for (let q = 0; q < width; q++) {
      row.push({ icon: null });
    }
    grid.push(row);
  }
  drawGrid();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(grid));
}

generateGridBtn.addEventListener("click", () => {
  const newWidth = parseInt(gridWidthInput.value);
  const newHeight = parseInt(gridHeightInput.value);
  const anchor = resizeAnchorSelect.value;
  if (!grid.length) {
    grid = [];
    for (let r = 0; r < newHeight; r++) {
      const row = [];
      for (let q = 0; q < newWidth; q++) {
        row.push({ icon: null });
      }
      grid.push(row);
    }
    drawGrid();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(grid));
    return;
  }
  const oldHeight = grid.length;
  const oldWidth = grid[0].length;
  let dq = 0,
    dr = 0;
  switch (anchor) {
    case "center":
      dq = Math.floor((newWidth - oldWidth) / 2);
      dr = Math.floor((newHeight - oldHeight) / 2);
      break;
    case "top-left":
      dq = 0;
      dr = 0;
      break;
    case "top":
      dq = Math.floor((newWidth - oldWidth) / 2);
      dr = 0;
      break;
    case "top-right":
      dq = newWidth - oldWidth;
      dr = 0;
      break;
    case "left":
      dq = 0;
      dr = Math.floor((newHeight - oldHeight) / 2);
      break;
    case "right":
      dq = newWidth - oldWidth;
      dr = Math.floor((newHeight - oldHeight) / 2);
      break;
    case "bottom-left":
      dq = 0;
      dr = newHeight - oldHeight;
      break;
    case "bottom":
      dq = Math.floor((newWidth - oldWidth) / 2);
      dr = newHeight - oldHeight;
      break;
    case "bottom-right":
      dq = newWidth - oldWidth;
      dr = newHeight - oldHeight;
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
      const nr = r + dr;
      const nq = q + dq;
      if (nr >= 0 && nr < newHeight && nq >= 0 && nq < newWidth) {
        newGrid[nr][nq] = grid[r][q];
      }
    }
  }
  grid = newGrid;
  drawGrid();
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(grid));
});

window.addEventListener("DOMContentLoaded", () => {
  iconList.forEach((name) => {
    const img = new Image();
    img.src = `assets/hexas/${name}`;
    iconImages[name] = img;
  });
  defaultBackgroundImage = new Image();
  defaultBackgroundImage.src = "assets/hexas/background.jpg";
  defaultBackgroundImage.onload = function () {
    if (!backgroundImage) backgroundImage = defaultBackgroundImage;
  };
  renderIconGrid();
  resizeCanvas();
});

window.addEventListener("load", () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      grid = JSON.parse(saved);
      gridHeightInput.value = grid.length;
      gridWidthInput.value = grid[0] ? grid[0].length : 0;
      drawGrid();
    } catch (e) {}
  } else {
    generateGrid();
  }
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("DOMContentLoaded", resizeCanvas);
