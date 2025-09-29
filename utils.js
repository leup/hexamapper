// ===============================
// 5. Import/export et sauvegarde
// ===============================
const saveMaptoJSON = (map) => {
  const data = JSON.stringify(map);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = saveFileName || "hexamap.json";
  a.click();
  URL.revokeObjectURL(url);
};

// ===============================
// 6. Initialisation et restauration
// ===============================

const generateGrid = (width, height) => {
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
