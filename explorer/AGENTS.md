# Documentation de l'Explorateur d'Items NRT

## Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Structure des fichiers](#structure-des-fichiers)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Structure des données](#structure-des-données)
- [Guide d'utilisation](#guide-dutilisation)
- [Personnalisation](#personnalisation)
- [Limitations connues](#limitations-connues)

## Vue d'ensemble
L'explorateur est une application web interactive qui affiche et permet d'explorer une base de données d'objets du jeu Reborn (https://reborngame.net/). L'interface est basée sur Tabulator, une bibliothèque JavaScript pour afficher des données tabulaires interactives.

## Structure des fichiers
- **index.html** : Structure de base de la page web
- **main.js** : Logique principale de l'application
- **items.json** : Base de données des objets du jeu
- **AGENTS.md** : Cette documentation

## Fonctionnalités principales

### 1. Affichage des données
- **Tableau interactif** : Affichage des objets avec tri, filtrage et pagination
- **Colonnes personnalisées** : Affichage d'images, de données imbriquées et de mises en forme conditionnelle
- **Filtrage avancé** : Filtres par type, caractéristiques et autres propriétés

### 2. Types d'objets supportés
- **NRT** : Ressources naturelles et objets divers
- **Boissons** : Consommables de type boisson
- **Armures** : Équipements de protection
- **Sacs** : Conteneurs et équipements de stockage
- **Perks** : Avantages ou compétences spéciales

### 3. Caractéristiques des objets
Chaque objet possède des caractéristiques (caracs) qui incluent :
- `poids` : Poids de l'objet
- `usure` / `usureMax` : Durabilité actuelle et maximale
- `bonus` : Bonus ou valeur de l'objet
- `genre` : Type d'objet (arme, armure, etc.)
- `degats` : Dégâts infligés (pour les armes)
- `munType` : Type de munitions (pour les armes à distance)

### 4. Filtrage et recherche
- Filtrage par type de tuile (Foret, Montagne, Plaine, etc.)
- Filtrage par saison (Printemps, Été, Automne, Hiver)
- Recherche textuelle sur les noms et descriptions
- Filtres déroulants pour les propriétés communes

## Structure des données

### Format d'un objet
```typescript
interface Item {
  _id: string;
  type: string;
  name: string;
  description?: string;
  caracs: {
    poids: number;
    usure: number;
    usureMax: number;
    bonus: number;
    genre?: string;
    degats?: number[];
    munType?: number;
    // Autres propriétés spécifiques
  };
  avatar?: string;
  miniAvatar?: string;
  tileType?: string[];
  craft?: {
    bricolage: number;
    craftList: Array<{ id: string; quantity: number }>;
    // Autres propriétés de craft
  };
  effects?: Array<{
    name: string;
    carac: string;
    bonus: number;
    // Autres propriétés d'effet
  }>;
}
```

## Guide d'utilisation

### Installation
1. Assurez-vous d'avoir un serveur web local (comme Live Server, http-server, etc.)
2. Clonez le dépôt ou copiez les fichiers dans un répertoire de votre serveur web
3. Ouvrez `index.html` dans votre navigateur via le serveur web

### Utilisation de base
1. **Navigation** : Utilisez la barre de défilement pour parcourir la liste des objets
2. **Tri** : Cliquez sur les en-têtes de colonne pour trier les données
3. **Filtrage** : Utilisez les filtres en haut des colonnes pour affiner les résultats
4. **Recherche** : Utilisez la barre de recherche pour trouver des objets spécifiques

## Personnalisation

### Modification des colonnes
Pour modifier les colonnes affichées, éditez le fichier `main.js` et modifiez le tableau `columns` dans l'initialisation de Tabulator.

### Ajout de filtres
De nouveaux filtres peuvent être ajoutés en modifiant la configuration de Tabulator dans `main.js`.

### Style personnalisé
Le style peut être personnalisé en modifiant les règles CSS dans la balise `<style>` du fichier `index.html`.

## Limitations connues
- Les données sont chargées en une seule fois, ce qui peut être lent avec de grands ensembles de données
- L'application est en lecture seule (pas de modification des données)
- Nécessite une connexion internet pour charger les dépendances

## Exemples d'utilisation

### Pour les joueurs
- Trouver des objets par type et caractéristiques
- Vérifier les propriétés d'un objet spécifique
- Découvrir de nouveaux objets et leurs utilisations

### Pour les maîtres de jeu
- Explorer la base de données des objets pour préparer des sessions
- Vérifier l'équilibre des objets
- Trouver des objets spécifiques pour des quêtes ou des récompenses

### Pour les développeurs
- Vérifier la cohérence des données
- Comprendre la structure des objets du jeu
- Développer de nouvelles fonctionnalités basées sur les données existantes
