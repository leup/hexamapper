fetch("items.json")
  .then((response) => response.json())
  .then((data) => {
    //console.log("Données chargées :", data);
    // Filtrer les items de type "nrt"

    if (!data.items) {
      throw new Error("Le fichier JSON ne contient pas de tableau 'items'.");
    }

    const nrtItems = data.items.filter((item) => item.type === "nrt");

    console.log("Items de type 'nrt' :", nrtItems);

    // Initialiser Tabulator
    new Tabulator("#table-nrt", {
      data: nrtItems,
      height: "auto",
      layout: "fitColumns",
      rowHeight: undefined, // Permet une hauteur de ligne automatique
      columns: [
        {
          title: "Avatar",
          field: "miniAvatar",
          formatter: function (cell) {
            const val = cell.getValue();
            if (!val) return "";
            const url = "https://reborngame.net" + val;
            return `<img src="${url}" style="width:40px" alt="avatar">`;
          },
          width: 60,
          formatterParams: { height: "40px", width: "40px" },
          headerSort: false,
        },
        { title: "Nom", field: "name" },
        { title: "Description", field: "description" },
        { title: "Bonus", field: "caracs.bonus" },
        {
          title: "Type de tuile",
          field: "tileType",
          headerFilter: "list",
          headerFilterParams: {
            values: [
              "Mer",
              "Foret",
              "Marecage",
              "Cote",
              "Riviere",
              "Wasteland",
              "Desert",
              "Colline",
              "Montagne",
              "Plaine",
              "Neige",
              "Glace",
              "Dryland",
            ],
          },
        },
        {
          title: "Saisons",
          field: "saisons",
          formatter: function (cell) {
            return cell.getValue() && cell.getValue().length
              ? cell.getValue().join(", ")
              : "";
          },
          headerFilter: "list",
          headerFilterParams: {
            values: ["Printemps", "Ete", "Automne", "Hiver"],
          },
        },
        { title: "Type de nourriture", field: "foodType" },
      ],
    });
  })
  .catch((err) => {
    document.getElementById("table-nrt").innerHTML =
      "<p>Erreur de chargement des données.</p>";
    console.error(err);
  });
