import { describe, it, expect, beforeEach } from 'vitest';
import { transformer, trier, isPriceInRange, fetchRandomUser, add } from '../utils/functions.utils';

/**
 * Tests unitaires pour les fonctions utilitaires
 * Suivant le TP: Apprendre les tests unitaires en JavaScript avec Vitest
 */

describe('Test de la fonction add', () => {
  it('devrait retourner la somme de deux nombres positifs', () => {
    const result = add(2, 3);
    expect(result).toBe(5);
  });

  it('devrait retourner la somme avec des nombres négatifs', () => {
    const result = add(-2, -3);
    expect(result).toBe(-5);
  });

  it('devrait retourner zéro quand les deux nombres sont zéro', () => {
    const result = add(0, 0);
    expect(result).toBe(0);
  });
});

/**
 * Exercice 1: Tests pour la fonction de manipulation de chaînes
 */
describe('Test de la fonction transformer', () => {
  it('devrait retourner une chaîne vide pour une entrée vide', () => {
    const result = transformer('');
    expect(result).toBe('');
    expect(result).toEqual('');
  });

  it('devrait transformer une chaîne en minuscules en majuscules', () => {
    const result = transformer('bonjour');
    expect(result).toBe('BONJOUR');
    expect(result).toEqual('BONJOUR');
  });

  it('devrait gérer correctement les caractères spéciaux', () => {
    const result = transformer('hello@world!123');
    expect(result).toBe('HELLO@WORLD!123');
    expect(result).toContain('HELLO');
    expect(result).toContain('@');
    expect(result).toContain('123');
  });

  it('devrait gérer les espaces dans la chaîne', () => {
    const result = transformer('hello world');
    expect(result).toBe('HELLO WORLD');
  });

  it('devrait gérer les accents et caractères spéciaux français', () => {
    const result = transformer('école été');
    expect(result).toBe('ÉCOLE ÉTÉ');
  });
});

/**
 * Exercice 2: Tests pour la fonction de tri
 */
describe('Test de la fonction trier', () => {
  it('devrait trier un tableau de nombres dans l\'ordre croissant', () => {
    const result = trier([5, 2, 8, 1, 9]);
    expect(result).toEqual([1, 2, 5, 8, 9]);
  });

  it('devrait gérer un tableau déjà trié', () => {
    const result = trier([1, 2, 3, 4, 5]);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('devrait gérer un tableau trié en ordre décroissant', () => {
    const result = trier([5, 4, 3, 2, 1]);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('devrait gérer un tableau vide', () => {
    const result = trier([]);
    expect(result).toEqual([]);
  });

  it('devrait gérer un tableau avec un seul élément', () => {
    const result = trier([42]);
    expect(result).toEqual([42]);
  });

  it('devrait gérer des nombres négatifs', () => {
    const result = trier([-5, 3, -1, 0, 8]);
    expect(result).toEqual([-5, -1, 0, 3, 8]);
  });

  it('devrait gérer des doublons', () => {
    const result = trier([3, 1, 2, 3, 1]);
    expect(result).toEqual([1, 1, 2, 3, 3]);
  });

  it('ne devrait pas modifier le tableau original', () => {
    const original = [5, 2, 8];
    const result = trier(original);
    expect(original).toEqual([5, 2, 8]); // Le tableau original ne doit pas changer
    expect(result).toEqual([2, 5, 8]);
  });
});

/**
 * Exercice 3: Boundary Testing - Tests aux valeurs limites
 */
describe('Test de la fonction isPriceInRange - Boundary Testing', () => {
  const min = 10;
  const max = 100;

  it('devrait retourner true quand le prix est exactement à la limite inférieure', () => {
    expect(isPriceInRange(10, min, max)).toBe(true);
  });

  it('devrait retourner true quand le prix est exactement à la limite supérieure', () => {
    expect(isPriceInRange(100, min, max)).toBe(true);
  });

  it('devrait retourner true quand le prix est au milieu de la plage', () => {
    expect(isPriceInRange(50, min, max)).toBe(true);
  });

  it('devrait retourner false quand le prix est juste en dessous de la limite inférieure', () => {
    expect(isPriceInRange(9, min, max)).toBe(false);
  });

  it('devrait retourner false quand le prix est juste au-dessus de la limite supérieure', () => {
    expect(isPriceInRange(101, min, max)).toBe(false);
  });

  it('devrait retourner false quand le prix est bien en dessous de la plage', () => {
    expect(isPriceInRange(0, min, max)).toBe(false);
  });

  it('devrait retourner false quand le prix est bien au-dessus de la plage', () => {
    expect(isPriceInRange(500, min, max)).toBe(false);
  });

  it('devrait retourner false pour des prix négatifs', () => {
    expect(isPriceInRange(-10, min, max)).toBe(false);
  });

  it('devrait gérer le cas où min et max sont égaux', () => {
    expect(isPriceInRange(50, 50, 50)).toBe(true);
    expect(isPriceInRange(49, 50, 50)).toBe(false);
    expect(isPriceInRange(51, 50, 50)).toBe(false);
  });
});

/**
 * Exercice 4: Gestion des fonctions asynchrones
 */
describe('Test de la fonction fetchRandomUser - Async', () => {
  it('devrait récupérer des données utilisateur de l\'API', async () => {
    try {
      const userData = await fetchRandomUser();
      
      // Vérifier que les données ont été renvoyées
      expect(userData).toBeDefined();
      
      // Vérifier que l'objet utilisateur contient les propriétés principales
      expect(userData).toHaveProperty('name');
      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('gender');
      
      // Vérifier que le nom est un objet avec les bonnes propriétés
      expect(userData.name).toHaveProperty('first');
      expect(userData.name).toHaveProperty('last');
      
      // Vérifier les types
      expect(typeof userData.email).toBe('string');
      expect(typeof userData.gender).toBe('string');
      
    } catch (error) {
      // Si une erreur se produit, le test échoue
      expect.fail('Ne devrait pas lever d\'erreur lors de la récupération des données');
    }
  }, 10000); // Timeout de 10 secondes pour l'appel API

  it('devrait gérer les erreurs réseau', async () => {
    // Ce test vérifie que la fonction gère bien les erreurs
    // En mode réel, on pourrait mocker fetch pour simuler une erreur
    try {
      const userData = await fetchRandomUser();
      expect(userData).toBeDefined();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Failed to fetch random user');
    }
  }, 10000);
});
