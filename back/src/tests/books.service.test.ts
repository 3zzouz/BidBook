import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BooksService } from '../books/books.service';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { NotFoundException } from '@nestjs/common';
import type { MockedFunction } from 'vitest';

/**
 * Tests unitaires pour BooksService
 * Exemple avec mock de Repository (base de données)
 * 
 * Principe: On "simule" (mock) la base de données pour tester la logique
 * du service sans avoir besoin d'une vraie base de données
 */
describe('BooksService', () => {
  let booksService: BooksService;
  let mockBookRepository: Partial<Repository<Book>>;

  // Avant chaque test, créer les mocks et le service
  beforeEach(() => {
    // Créer un faux repository avec les méthodes dont on a besoin
    mockBookRepository = {
      findOne: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
    };

    // Créer le service avec le mock repository
    booksService = new BooksService(
      mockBookRepository as Repository<Book>,
    );
  });

  describe('findOne', () => {
    it('devrait retourner un livre quand il existe', async () => {
      // Arrange: Préparer les données de test
      const mockBook = {
        id: 1,
        title: 'Le Petit Prince',
        author: 'Antoine de Saint-Exupéry',
        price: 15.99,
        isSold: false,
        bids: [], // Pas d'enchères
        owner: { id: 1, name: 'John' },
      } as unknown as Book;

      // Configurer le mock: quand findOne est appelé, retourner mockBook
      (mockBookRepository.findOne as MockedFunction<any>).mockResolvedValue(mockBook);

      // Act: Appeler la méthode à tester
      const result = await booksService.findOne(1);

      // Assert: Vérifier les résultats
      expect(result).toEqual(mockBook);
      expect(result.title).toBe('Le Petit Prince');
      expect(result.isBiddingOpen).toBe(true); // Car bids.length === 0
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['owner', 'comments', 'bids', 'favorites', 'ratings', 'ratings.user', 'favorites.user'],
      });
    });

    it('devrait lever une exception quand le livre n\'existe pas', async () => {
      // Arrange: Configurer le mock pour retourner null
      (mockBookRepository.findOne as MockedFunction<any>).mockResolvedValue(null);

      // Act & Assert: Vérifier qu'une exception est levée
      await expect(booksService.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(booksService.findOne(999)).rejects.toThrow('Book with ID 999 not found');
    });

    it('devrait définir isBiddingOpen à true quand il n\'y a pas d\'enchères', async () => {
      const mockBook = {
        id: 2,
        title: '1984',
        bids: [],
      } as unknown as Book;

      (mockBookRepository.findOne as MockedFunction<any>).mockResolvedValue(mockBook);

      const result = await booksService.findOne(2);

      expect(result.isBiddingOpen).toBe(true);
    });
  });

  describe('findAll', () => {
    it('devrait retourner une liste de livres disponibles', async () => {
      // Arrange: Créer des livres de test
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockBooks = [
        { id: 1, title: 'Livre 1', isSold: false },
        { id: 2, title: 'Livre 2', isSold: false },
      ] as unknown as Book[];

      (mockBookRepository.find as MockedFunction<any>).mockResolvedValue(mockBooks);

      // Act
      const result = await booksService.findAll(10, 0);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Livre 1');
      expect(mockBookRepository.find).toHaveBeenCalledWith({
        where: { isSold: false },
        take: 10,
        skip: 0,
        relations: ['owner', 'comments', 'bids', 'favorites', 'ratings'],
        select: expect.any(Array),
      });
      
      // Cleanup
      consoleLogSpy.mockRestore();
    });

    it('devrait retourner un tableau vide en cas d\'erreur', async () => {
      // Arrange: Simuler une erreur de base de données et supprimer les logs d'erreur
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (mockBookRepository.find as MockedFunction<any>).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await booksService.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled(); // Vérifier que l'erreur a été loggée
      
      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('successfulPayment', () => {
    it('devrait marquer un livre comme vendu', async () => {
      // Arrange
      const mockBook = {
        id: 1,
        title: 'Test Book',
        isSold: false,
      } as Book;

      const savedBook = { ...mockBook, isSold: true };

      (mockBookRepository.findOne as MockedFunction<any>).mockResolvedValue(mockBook);
      (mockBookRepository.save as MockedFunction<any>).mockResolvedValue(savedBook as unknown as Book);

      // Act
      const result = await booksService.successfulPayment(1);

      // Assert
      expect(result.isSold).toBe(true);
      expect(mockBookRepository.save).toHaveBeenCalled();
    });

    it('devrait lever une exception si le livre n\'existe pas', async () => {
      // Arrange
      (mockBookRepository.findOne as MockedFunction<any>).mockResolvedValue(null);

      // Act & Assert
      await expect(booksService.successfulPayment(999)).rejects.toThrow(NotFoundException);
    });
  });
});
