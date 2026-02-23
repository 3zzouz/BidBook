# Shopping Cart App

Application de panier d'achat développée avec React et Vite, incluant une suite complète de tests unitaires avec Vitest.

## 🚀 Démarrage

### Installation

```bash
npm install
```

### Lancer l'application en mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (ou un autre port si celui-ci est occupé).

### Build de production

```bash
npm run build
```

### Prévisualiser le build

```bash
npm run preview
```

## 🧪 Tests Unitaires avec Vitest

Ce projet utilise **Vitest** comme framework de test unitaire. Vitest est un framework de test ultra-rapide alimenté par Vite, offrant une expérience de développement moderne avec Hot Module Replacement (HMR) pour les tests.

### Structure des tests

Les tests sont organisés dans le dossier `src/test/` :

```
src/test/
├── cart.test.js           # Tests des fonctions utilitaires du panier
└── components.test.jsx    # Tests des composants React
```

### Exécuter les tests

#### Mode watch (surveillance)

Lance les tests en mode surveillance, les tests se relancent automatiquement à chaque modification :

```bash
npm run test
```

Commandes disponibles en mode watch :

- **h** : Afficher l'aide
- **q** : Quitter
- **a** : Relancer tous les tests
- **f** : Relancer uniquement les tests échoués
- **u** : Mettre à jour les snapshots

#### Résultats des tests

Lors de l'exécution, vous verrez un résumé comme ceci :

```
 ✓ src/test/cart.test.js (70)
   ✓ calculateTotal() (9)
   ✓ applyDiscount() (9)
   ✓ filterByCategory() (6)
   ✓ isFreeShipping() (4)
   ✓ sortItems() (8)
   ✓ mergeDuplicates() (4)
   ✓ applyBulkDiscounts() (7)
   ✓ fetchProduct() (5)
   ✓ fetchMultipleProducts() (5)
   ✓ validateStock() (5)
   ✓ placeOrder() (8)

 ✓ src/test/components.test.jsx (25)
   ✓ ProductCard (10)
   ✓ CartSummary (10)
   ✓ CartContext (5)

 Test Files  2 passed (2)
      Tests  95 passed (95)
   Start at  17:33:41
   Duration  2.83s (transform 156ms, setup 242ms, collect 470ms, tests 1.86s)
```

### 📊 Coverage (Couverture de code)

Le projet est configuré pour générer des rapports de couverture de code avec **v8**.

#### Exécuter les tests avec coverage

```bash
npm run test:coverage
```

#### Résultats du coverage

Après l'exécution, vous verrez un tableau dans le terminal :

```
 % Coverage report from v8
------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------|---------|----------|---------|---------|-------------------
All files         |   82.06 |    94.61 |   95.83 |   82.06 |
 components       |   66.32 |    96.42 |      90 |   66.32 |
  App.jsx         |       0 |        0 |       0 |       0 | 1-100
  CartSummary.jsx |     100 |      100 |     100 |     100 |
  ProductCard.jsx |     100 |      100 |     100 |     100 |
 lib              |   99.62 |    94.11 |     100 |   99.62 |
  CartContext.jsx |      98 |    84.21 |     100 |      98 | 33
  cart.js         |     100 |    96.38 |     100 |     100 | 77,98,117
------------------|---------|----------|---------|---------|-------------------

 Test Files  2 passed (2)
      Tests  95 passed (95)
   Duration  2.83s
```

**Légende :**

- **% Stmts** : Pourcentage d'instructions exécutées
- **% Branch** : Pourcentage de branches conditionnelles testées
- **% Funcs** : Pourcentage de fonctions testées
- **% Lines** : Pourcentage de lignes exécutées
- **Uncovered Line #s** : Numéros de lignes non couvertes

#### Rapport HTML du coverage

Un rapport HTML détaillé est également généré dans le dossier `coverage/` :

```bash
# Ouvrir le rapport dans le navigateur (Windows)
start coverage/index.html

# Ou manuellement : ouvrez coverage/index.html dans votre navigateur
```

Le rapport HTML offre :

- ✅ Vue interactive de la couverture par fichier
- ✅ Code source avec highlighting des lignes couvertes/non couvertes
- ✅ Statistiques détaillées par fonction
- ✅ Navigation facile dans le projet

### 🔧 Configuration Vitest

La configuration se trouve dans `vite.config.js` :

```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // Environnement DOM pour tester React
    globals: true, // API globale (describe, it, expect)
    setupFiles: "./src/setupTests.js", // Fichier d'initialisation
    coverage: {
      provider: "v8", // Provider de coverage
      reporter: ["text", "html"], // Formats de rapport
      include: ["src/lib/**", "src/components/**"], // Fichiers à inclure
    },
  },
});
```

### 📝 Fonctionnalités testées

#### Tests des fonctions utilitaires (`cart.test.js`)

- **calculateTotal** : Calcul du total du panier avec gestion de la précision
- **applyDiscount** : Application de réductions en pourcentage
- **filterByCategory** : Filtrage par catégorie
- **isFreeShipping** : Vérification de la livraison gratuite
- **sortItems** : Tri des articles (par prix, nom)
- **mergeDuplicates** : Fusion des articles dupliqués
- **applyBulkDiscounts** : Réductions par quantité
- **fetchProduct** : Récupération de produits (avec mocks)
- **fetchMultipleProducts** : Récupération multiple avec Promise.all
- **validateStock** : Validation des stocks
- **placeOrder** : Passage de commande complet

#### Tests des composants (`components.test.jsx`)

- **ProductCard** : Affichage et ajout au panier
- **CartSummary** : Résumé du panier et calculs
- **CartContext** : Gestion de l'état global du panier

### 🛠️ Outils de test

- **Vitest** : Framework de test
- **@testing-library/react** : Utilitaires pour tester React
- **@testing-library/user-event** : Simulation d'interactions utilisateur
- **@testing-library/jest-dom** : Matchers personnalisés pour le DOM
- **jsdom** : Environnement DOM pour Node.js

## 📦 Scripts disponibles

| Commande                | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Lance le serveur de développement          |
| `npm run build`         | Créé un build de production                |
| `npm run preview`       | Prévisualise le build de production        |
| `npm run test`          | Lance les tests en mode watch              |
| `npm run test:coverage` | Lance les tests avec rapport de couverture |

## 📚 Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
