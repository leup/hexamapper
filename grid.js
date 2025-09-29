const Grid = (options) => {
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

  function drawHex(hex) {
    const { icon: iconName } = hex;
    //console.log(`Dessin de l’hexagone en (${hex.x}, ${hex.y}) avec l’icône ${iconName}`);

    const { x, y } = hexToPixel(hex.x, hex.y);

    // Dessine le contour hexagonal du masque
    // Utilise un clip pour dessiner l’image à l’intérieur
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
      //      ctx.fillStyle = "#eee";
      //      ctx.fill();
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
    //console.log("Dessin de la grille...", grid);
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
        const hex = grid[r][q];
        drawHex({ x: q, y: r, icon: hex.icon });
      }
    }
  }

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

  const exportToPNG = (filename) => {
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "hexamap.png";
    a.click();
  };

  let isMouseDown = false;
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

  return {
    draw: drawGrid,
    paintHex: paintHex,
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
    getHexSize: () => HEX_SIZE,
    setHexSize: (size) => {
      HEX_SIZE = size;
      drawGrid();
    },
    setDeltaHeight: (delta) => {
      options.deltaHeight = delta;
    },
    getDeltaHeight: () => options.deltaHeight,
  };
};
