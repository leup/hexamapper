// ===============================
// 5. Import/export et sauvegarde
// ===============================
export const saveMaptoJSON = (map, saveFileName) => {
  const data = JSON.stringify(map);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = saveFileName || "hexamap.json";
  a.click();
  URL.revokeObjectURL(url);
};

export const convertGridToMapFormat = (grid) => {
  const map = {
    name: "My HexaMap",
    width: grid[0]?.length || 0,
    height: grid.length || 0,
    start: 0,
    grid: grid,
  };
  console.log("Ancien format détecté, conversion en objet map :", map);

  return map;
};

// ===============================
// 6. Initialisation et restauration
// ===============================

export const generateGrid = (width, height) => {
  console.log("Génération de la grille...");
  grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push({ icon: "Foret.webp", x: x, y: y });
    }
    grid.push(row);
  }

  return grid;
};
