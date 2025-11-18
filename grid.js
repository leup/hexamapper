export const Grid = (options) => {
  const canvas = document.getElementById("hex-canvas");
  const ctx = canvas.getContext("2d");

  const defaultOptions = {
    deltaHeight: 0,
    hexSize: 32,
    backgroundImage: null,
    icons: {},
    grid: [],
  };
  options = { ...defaultOptions, ...options };

  let HEX_SIZE = options.hexSize;
  let backgroundImage = options.backgroundImage;
  let defaultBackgroundImage = null;

  let grid = options.grid;
  let selectedIcon = null;

  // Ajout offset pour drag-n-drop
  let offset = { x: 0, y: 0 };
  let dragStart = null;
  let isDragging = false;

  function drawHex(hex) {
    const { icon: iconName } = hex;
    //console.log(`Dessin de l’hexagone en (${hex.x}, ${hex.y}) avec l’icône ${iconName}`);

    // Appliquer l'offset lors du dessin
    const { x, y } = hexToPixel(hex.x, hex.y);
    const ox = x + offset.x;
    const oy = y + offset.y;

    // Dessine le contour hexagonal du masque
    // Utilise un clip pour dessiner l’image à l’intérieur
    const angle = Math.PI / 3;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const dx = ox + HEX_SIZE * Math.cos(angle * i);
      const dy = oy + HEX_SIZE * Math.sin(angle * i);
      if (i === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.clip();
    // Dessine l’image centrée et adaptée à la forme hexagonale
    //console.log("Icon name:", iconName);
    //console.log("Icon image object:", iconImages[iconName]);
    const img = iconName ? options.icons[iconName] : null;
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
        ox - HEX_SIZE,
        oy - HEX_SIZE,
        HEX_SIZE * 2,
        HEX_SIZE * 2
      );
    } else if (iconName && iconName[0] === "#") {
      ctx.fillStyle = iconName;
      ctx.fill();
    }
    ctx.restore();

    // Dessine le contour
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const dx = ox + HEX_SIZE * Math.cos(angle * i);
      const dy = oy + HEX_SIZE * Math.sin(angle * i);
      if (i === 0) ctx.moveTo(dx, dy);
      else ctx.lineTo(dx, dy);
    }
    ctx.closePath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Calcul des boundaries pour le drag
  function clampOffset(newOffset) {
    // Taille de la grille en pixels
    const gridWidth = HEX_SIZE * 1.5 * (grid[0]?.length || 0) + HEX_SIZE;
    const gridHeight =
      HEX_SIZE * Math.sqrt(3) * ((grid.length || 0) + 0.5) + HEX_SIZE;

    // Limites pour que la grille reste visible dans le canvas
    // La grille ne doit pas sortir à gauche/haut (offset <= 0)
    // et pas à droite/bas (offset >= canvas.width - gridWidth / canvas.height - gridHeight)
    const minX = Math.min(0, canvas.width - gridWidth);
    const maxX = 0;
    const minY = Math.min(0, canvas.height - gridHeight);
    const maxY = 0;

    return {
      x: Math.max(minX, Math.min(newOffset.x, maxX)),
      y: Math.max(minY, Math.min(newOffset.y, maxY)),
    };
  }

  function drawGrid() {
    //console.log("Dessin de la grille...", grid);
    const bg = backgroundImage || defaultBackgroundImage;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background toujours fixe
    if (bg) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    for (let r = 0; r < grid.length; r++) {
      for (let q = 0; q < grid[r].length; q++) {
        const hex = grid[r][q];
        drawHex({ x: q, y: r, icon: hex.icon });
      }
    }
  }

  function paintHex(e) {
    if (!grid || !grid.length) return;
    // Appliquer l'offset inverse pour le calcul
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;
    const hex = pixelToHex(x, y);
    if (!hex) return;
    const { q, r } = hex;
    if (grid[r] && grid[r][q]) {
      if (selectedIcon === "empty") {
        grid[r][q].icon = null;
      } else if (selectedIcon) {
        grid[r][q].icon = selectedIcon;
      }
      drawGrid();
    }
  }

  function hexToPixel(q, r) {
    const x = HEX_SIZE * 1.5 * q + HEX_SIZE;
    const y =
      HEX_SIZE * Math.sqrt(3) * (r + 0.5 * ((q + options.deltaHeight) % 2)) +
      HEX_SIZE;
    //console.log(`Conversion hex->pixel pour (${q}, ${r}) => (${x}, ${y})`);
    return { x, y };
  }

  function pixelToHex(x, y) {
    const q = Math.round((x - HEX_SIZE) / (HEX_SIZE * 1.5));
    const y_offset = HEX_SIZE * Math.sqrt(3) * 0.5 * (q % 2);
    const r = Math.round((y - HEX_SIZE - y_offset) / (HEX_SIZE * Math.sqrt(3)));
    if (q < 0 || r < 0 || r >= grid.length || q >= grid[0].length) return null;
    return { q, r };
  }

  // Remplace l'export actuel (viewport) par un export de la carte entière
  const exportToPNG = (filename) => {
    if (!grid || !grid.length) return;
    // calculer bounding box de tous les hex
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (let r = 0; r < grid.length; r++) {
      for (let q = 0; q < (grid[r]?.length || 0); q++) {
        const p = hexToPixel(q, r);
        minX = Math.min(minX, p.x - HEX_SIZE);
        minY = Math.min(minY, p.y - HEX_SIZE);
        maxX = Math.max(maxX, p.x + HEX_SIZE);
        maxY = Math.max(maxY, p.y + HEX_SIZE);
      }
    }
    if (!isFinite(minX)) return;

    const width = Math.ceil(maxX - minX);
    const height = Math.ceil(maxY - minY);

    // canvas hors-écran
    const off = document.createElement("canvas");
    off.width = Math.max(1, width);
    off.height = Math.max(1, height);
    const octx = off.getContext("2d");

    // background (fixe) sur toute la surface exportée
    const bg = backgroundImage || defaultBackgroundImage;
    if (bg && bg.complete) {
      octx.save();
      octx.globalAlpha = 0.8;
      octx.drawImage(bg, 0, 0, off.width, off.height);
      octx.restore();
    } else {
      // fond neutre si pas d'image
      octx.fillStyle = "#fff";
      octx.fillRect(0, 0, off.width, off.height);
    }

    // fonction locale pour dessiner un hex sur octx sans offset
    function drawHexOnCtx(ctx2, hex) {
      const { icon: iconName } = hex;
      const { x, y } = hexToPixel(hex.x, hex.y);
      const cx = Math.round(x - minX);
      const cy = Math.round(y - minY);

      const angle = Math.PI / 3;
      ctx2.save();
      ctx2.beginPath();
      for (let i = 0; i < 6; i++) {
        const dx = cx + HEX_SIZE * Math.cos(angle * i);
        const dy = cy + HEX_SIZE * Math.sin(angle * i);
        if (i === 0) ctx2.moveTo(dx, dy);
        else ctx2.lineTo(dx, dy);
      }
      ctx2.closePath();
      ctx2.clip();

      const img = iconName ? options.icons[iconName] : null;
      if (img && img.complete) {
        ctx2.drawImage(
          img,
          20,
          10,
          265,
          235,
          cx - HEX_SIZE,
          cy - HEX_SIZE,
          HEX_SIZE * 2,
          HEX_SIZE * 2
        );
      } else if (iconName && iconName[0] === "#") {
        ctx2.fillStyle = iconName;
        ctx2.fill();
      }
      ctx2.restore();

      // contour
      ctx2.beginPath();
      for (let i = 0; i < 6; i++) {
        const dx = cx + HEX_SIZE * Math.cos(angle * i);
        const dy = cy + HEX_SIZE * Math.sin(angle * i);
        if (i === 0) ctx2.moveTo(dx, dy);
        else ctx2.lineTo(dx, dy);
      }
      ctx2.closePath();
      ctx2.strokeStyle = "#333";
      ctx2.lineWidth = 2;
      ctx2.stroke();
    }

    // dessiner tous les hex sur le canvas hors-écran
    for (let r = 0; r < grid.length; r++) {
      for (let q = 0; q < (grid[r]?.length || 0); q++) {
        drawHexOnCtx(octx, { x: q, y: r, icon: grid[r][q].icon });
      }
    }

    // export
    const url = off.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "hexamap_full.png";
    a.click();
  };

  let isMouseDown = false;
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      // clic droit
      dragStart = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
      isDragging = true;
      e.preventDefault();
      return;
    }
    if (e.button !== 0) return;
    isMouseDown = true;
    paintHex(e);
  });
  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 2) {
      isDragging = false;
      dragStart = null;
      return;
    }
    isMouseDown = false;
    canvas.dispatchEvent(new CustomEvent("gridMouseUp", { detail: e }));
  });
  canvas.addEventListener("mouseleave", () => {
    isMouseDown = false;
    isDragging = false;
    dragStart = null;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && dragStart) {
      const rawOffset = {
        x: dragStart.ox + (e.clientX - dragStart.x),
        y: dragStart.oy + (e.clientY - dragStart.y),
      };
      offset = clampOffset(rawOffset);
      drawGrid();
      return;
    }
    if (isMouseDown && e.buttons === 1) paintHex(e);
  });

  // Désactiver le menu contextuel sur le canvas
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  return {
    draw: drawGrid,
    setSelectedIcon: (icon) => {
      selectedIcon = icon;
    },
    setBackgroundImage: (img) => {
      backgroundImage = img;
      drawGrid();
    },
    exportToPNG: exportToPNG,
    getGrid: () => grid,
    setGrid: (newGrid) => {
      grid = newGrid;
      drawGrid();
    },
    getCanvas: () => canvas,
    getHexSize: () => HEX_SIZE,
    setHexSize: (size) => {
      HEX_SIZE = size;
      drawGrid();
    },
    setDeltaHeight: (delta) => {
      options.deltaHeight = delta;
    },
    getDeltaHeight: () => options.deltaHeight,
    setOffset: (ox, oy) => {
      offset = clampOffset({ x: ox, y: oy });
      drawGrid();
    },
    getOffset: () => ({ ...offset }),
  };
};
