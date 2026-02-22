import { describe, it, expect, beforeEach } from 'vitest';
import { AppService } from '../app.service';

/**
 * Tests unitaires pour AppService
 * Exemple le plus simple: service sans dépendances
 */
describe('AppService', () => {
  let appService: AppService;

  // Avant chaque test, créer une nouvelle instance du service
  beforeEach(() => {
    appService = new AppService();
  });

  describe('getHello', () => {
    it('devrait retourner "Hello World!"', () => {
      // Arrange (préparer)
      // Rien à préparer ici, le service est déjà créé

      // Act (agir)
      const result = appService.getHello();

      // Assert (vérifier)
      expect(result).toBe('Hello World!');
    });

    it('devrait retourner une chaîne de caractères', () => {
      const result = appService.getHello();
      expect(typeof result).toBe('string');
    });
  });
});
