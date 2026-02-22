import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BidsService } from '../bids/bids.service';
import { BooksService } from '../books/books.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Repository } from 'typeorm';
import { Bid } from '../bids/entities/bid.entity';
import { Book } from '../graphql';
import { BadRequestException } from '@nestjs/common';
import { BidStatus } from '../Enums/bidstatus.enum';
import type { MockedFunction } from 'vitest';

/**
 * Tests unitaires pour BidsService
 * Exemple avec PLUSIEURS mocks (Repository, BooksService, NotificationsService)
 * 
 * Principe: On simule toutes les dépendances pour tester uniquement
 * la logique du service BidsService
 */
describe('BidsService', () => {
  let bidsService: BidsService;
  let mockBidRepository: Partial<Repository<Bid>>;
  let mockBookRepository: Partial<Repository<Book>>;
  let mockBooksService: Partial<BooksService>;
  let mockNotificationsService: Partial<NotificationsService>;

  // Avant chaque test, créer tous les mocks
  beforeEach(() => {
    // Mock du repository des enchères
    mockBidRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    // Mock du repository des livres
    mockBookRepository = {
      save: vi.fn(),
    };

    // Mock du service des livres
    mockBooksService = {
      findOne: vi.fn(),
    };

    // Mock du service de notifications
    mockNotificationsService = {
      notify: vi.fn(),
    };

    // Créer le service avec tous les mocks
    bidsService = new BidsService(
      mockBidRepository as Repository<Bid>,
      mockBooksService as BooksService,
      mockNotificationsService as NotificationsService,
      mockBookRepository as Repository<Book>,
    );
  });

  describe('getBidDate', () => {
    it('devrait retourner la date de création d\'une enchère', () => {
      // Arrange: Créer une fausse enchère
      const testDate = new Date('2026-02-23T10:00:00');
      const mockBid = {
        id: 1,
        amount: 25.50,
        createdAt: testDate,
      } as Bid;

      // Act: Appeler la méthode
      const result = bidsService.getBidDate(mockBid);

      // Assert: Vérifier le résultat
      expect(result).toBe(testDate);
      expect(result.getTime()).toBe(testDate.getTime());
    });
  });

  describe('findByBookId', () => {
    it('devrait retourner toutes les enchères d\'un livre', async () => {
      // Arrange: Créer des enchères de test
      const mockBids = [
        { id: 1, amount: 20, bidder: { id: 1, name: 'Alice' } },
        { id: 2, amount: 25, bidder: { id: 2, name: 'Bob' } },
      ] as unknown as Bid[];

      (mockBidRepository.find as MockedFunction<any>).mockResolvedValue(mockBids);

      // Act
      const result = await bidsService.findByBookId(1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(20);
      expect(result[1].amount).toBe(25);
      expect(mockBidRepository.find).toHaveBeenCalledWith({
        where: { book: { id: 1 } },
        relations: ['bidder'],
      });
    });

    it('devrait retourner un tableau vide si aucune enchère', async () => {
      // Arrange
      (mockBidRepository.find as MockedFunction<any>).mockResolvedValue([]);

      // Act
      const result = await bidsService.findByBookId(999);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findHighestBidForBook', () => {
    it('devrait retourner l\'enchère la plus élevée', async () => {
      // Arrange
      const highestBid = {
        id: 5,
        amount: 100,
        bidder: { id: 3 },
        book: { id: 1 },
      } as unknown as Bid;

      (mockBidRepository.findOne as MockedFunction<any>).mockResolvedValue(highestBid);

      // Act
      const result = await bidsService.findHighestBidForBook(1);

      // Assert
      expect(result).toEqual(highestBid);
      expect(result?.amount).toBe(100);
      expect(mockBidRepository.findOne).toHaveBeenCalledWith({
        where: { book: { id: 1 } },
        order: { amount: 'DESC' },
        relations: ['book'],
      });
    });

    it('devrait retourner null si aucune enchère existe', async () => {
      // Arrange
      (mockBidRepository.findOne as MockedFunction<any>).mockResolvedValue(null);

      // Act
      const result = await bidsService.findHighestBidForBook(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findBidsByUser', () => {
    it('devrait retourner les enchères d\'un utilisateur', async () => {
      // Arrange
      const userBids = [
        { id: 1, amount: 30, bidder: { id: 1 } },
        { id: 2, amount: 40, bidder: { id: 1 } },
      ] as unknown as Bid[];

      (mockBidRepository.find as MockedFunction<any>).mockResolvedValue(userBids);

      // Act
      const result = await bidsService.findBidsByUser(1, { limit: 10, offset: 0 });

      // Assert
      expect(result).toHaveLength(2);
      expect(mockBidRepository.find).toHaveBeenCalledWith({
        where: { bidder: { id: 1 } },
        relations: ['book', 'bidder'],
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createBid', () => {
    it('devrait créer une enchère valide et envoyer une notification', async () => {
      // Arrange: Préparer un livre et les données
      const mockBook = {
        id: 1,
        title: 'Harry Potter',
        price: 20,
        owner: { id: 2, name: 'Owner' },
        isBiddingOpen: true,
      } as unknown as Book;

      const newBid = {
        id: 1,
        amount: 25,
        bidStatus: BidStatus.PENDING,
        bidder: { id: 1 },
        book: { id: 1 },
        createdAt: new Date(),
      } as unknown as Bid;

      // Configurer les mocks
      (mockBooksService.findOne as MockedFunction<any>).mockResolvedValue(mockBook);
      (mockBidRepository.findOne as MockedFunction<any>).mockResolvedValue(null); // Pas d'enchère précédente
      (mockBidRepository.create as MockedFunction<any>).mockReturnValue(newBid);
      (mockBidRepository.save as MockedFunction<any>).mockResolvedValue(newBid);
      (mockNotificationsService.notify as MockedFunction<any>).mockResolvedValue(undefined);

      // Act: Créer l'enchère
      const result = await bidsService.createBid(1, 1, 25);

      // Assert: Vérifier les résultats
      expect(result).toEqual(newBid);
      expect(result.amount).toBe(25);
      
      // Vérifier que les méthodes ont été appelées correctement
      expect(mockBooksService.findOne).toHaveBeenCalledWith(1);
      expect(mockBidRepository.save).toHaveBeenCalled();
      expect(mockNotificationsService.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 2, // ID du propriétaire
          data: expect.objectContaining({
            bookId: 1,
            bidAmount: 25,
            bidderId: 1,
          }),
        })
      );
    });

    it('devrait lever une exception si l\'utilisateur enchérit sur son propre livre', async () => {
      // Arrange: Le propriétaire essaie d'enchérir sur son livre
      const mockBook = {
        id: 1,
        title: 'Mon Livre',
        price: 20,
        owner: { id: 1, name: 'Moi' }, // Même ID que l'enchérisseur
      } as unknown as Book;

      (mockBooksService.findOne as MockedFunction<any>).mockResolvedValue(mockBook);

      // Act & Assert: Vérifier qu'une exception est levée
      await expect(bidsService.createBid(1, 1, 25)).rejects.toThrow(BadRequestException);
      await expect(bidsService.createBid(1, 1, 25)).rejects.toThrow('You cannot bid on your own book.');
      
      // Vérifier qu'aucune enchère n'a été créée
      expect(mockBidRepository.save).not.toHaveBeenCalled();
      expect(mockNotificationsService.notify).not.toHaveBeenCalled();
    });

    it('devrait lever une exception si le montant est trop bas', async () => {
      // Arrange
      const mockBook = {
        id: 1,
        title: 'Test Book',
        price: 50,
        owner: { id: 2 },
      } as unknown as Book;

      (mockBooksService.findOne as MockedFunction<any>).mockResolvedValue(mockBook);
      (mockBidRepository.findOne as MockedFunction<any>).mockResolvedValue(null); // Première enchère

      // Act & Assert: L'enchère doit être supérieure au prix de départ
      await expect(bidsService.createBid(1, 1, 30)).rejects.toThrow(BadRequestException);
      await expect(bidsService.createBid(1, 1, 30)).rejects.toThrow(
        'Your first bid (30) must be greater than book\'s starting price (50).'
      );
    });
  });
});
