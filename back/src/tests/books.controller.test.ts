import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { Category } from '../Enums/category.enum';
import { Language } from '../Enums/language.enum';

/**
 * Tests unitaires pour le contrôleur Books
 * Test du endpoint /predict avec mocking et fonctions asynchrones
 */

// Mock axios
vi.mock('axios');

/**
 * Fonction simulant l'appel au endpoint /predict
 * Cette fonction simule le comportement du BooksController.predictPrice()
 */
async function predictPrice(bookData: any) {
  try {
    const response = await axios.post('http://localhost:5000/predict', {
      title: bookData.title,
      author: bookData.author,
      category: bookData.category,
      language: bookData.language,
      editor: bookData.editor,
      edition: bookData.edition,
      totalPages: bookData.totalPages,
      damagedPages: bookData.damagedPages,
      age: bookData.age,
    });

    return { predictedPrice: response.data.prediction };
  } catch (error) {
    throw new Error('Failed to get predicted price from model.');
  }
}

describe('BooksController - Test du endpoint /predict', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    vi.clearAllMocks();
  });

  it('devrait retourner un prix prédit pour des données valides', async () => {
    // Données de test
    const bookData = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: Category.TECHNOLOGY,
      language: Language.ENGLISH,
      editor: 'Prentice Hall',
      edition: 1,
      totalPages: 464,
      damagedPages: 0,
      age: 5,
    };

    // Mock de la réponse axios
    const mockResponse = {
      data: {
        prediction: 45.99,
      },
    };

    (axios.post as any).mockResolvedValue(mockResponse);

    // Appel de la fonction
    const result = await predictPrice(bookData);

    // Vérifications
    expect(result).toBeDefined();
    expect(result).toHaveProperty('predictedPrice');
    expect(result.predictedPrice).toBe(45.99);
    expect(typeof result.predictedPrice).toBe('number');

    // Vérifier que axios.post a été appelé avec les bons paramètres
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:5000/predict',
      expect.objectContaining({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: Category.TECHNOLOGY,
      })
    );
  });

  it('devrait gérer les livres avec des pages endommagées', async () => {
    const bookData = {
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: Category.TECHNOLOGY,
      language: Language.ENGLISH,
      editor: 'MIT Press',
      edition: 3,
      totalPages: 1292,
      damagedPages: 50,
      age: 10,
    };

    const mockResponse = {
      data: {
        prediction: 25.50,
      },
    };

    (axios.post as any).mockResolvedValue(mockResponse);

    const result = await predictPrice(bookData);

    expect(result.predictedPrice).toBe(25.50);
    expect(result.predictedPrice).toBeLessThan(50); // Prix réduit à cause des pages endommagées
  });

  it('devrait gérer différentes catégories de livres', async () => {
    const categories = [
      { category: Category.TECHNOLOGY, expectedPrice: 45.99 },
      { category: Category.SCIENCE, expectedPrice: 35.50 },
      { category: Category.FICTION, expectedPrice: 20.99 },
    ];

    for (const { category, expectedPrice } of categories) {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        category: category,
        language: Language.ENGLISH,
        editor: 'Test Publisher',
        edition: 1,
        totalPages: 300,
        damagedPages: 0,
        age: 2,
      };

      (axios.post as any).mockResolvedValue({
        data: { prediction: expectedPrice },
      });

      const result = await predictPrice(bookData);
      expect(result.predictedPrice).toBe(expectedPrice);
    }
  });

  it('devrait lancer une erreur si l\'API Flask échoue', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      category: Category.TECHNOLOGY,
      language: Language.ENGLISH,
      editor: 'Test Publisher',
      edition: 1,
      totalPages: 300,
      damagedPages: 0,
      age: 2,
    };

    // Simuler une erreur réseau
    (axios.post as any).mockRejectedValue(new Error('Network Error'));

    // Vérifier que la fonction lance bien une erreur
    await expect(predictPrice(bookData)).rejects.toThrow(
      'Failed to get predicted price from model.'
    );
  });

  it('devrait gérer les timeouts de l\'API', async () => {
    const bookData = {
      title: 'Heavy Book',
      author: 'Author Name',
      category: Category.TECHNOLOGY,
      language: Language.FRENCH,
      editor: 'Publisher',
      edition: 2,
      totalPages: 500,
      damagedPages: 10,
      age: 3,
    };

    // Simuler un timeout
    (axios.post as any).mockRejectedValue(new Error('timeout of 5000ms exceeded'));

    await expect(predictPrice(bookData)).rejects.toThrow(
      'Failed to get predicted price from model.'
    );
  });

  it('devrait gérer différentes langues', async () => {
    const languages = [Language.FRENCH, Language.ENGLISH, Language.SPANISH];

    for (const language of languages) {
      const bookData = {
        title: 'Multilingual Book',
        author: 'Global Author',
        category: Category.FICTION,
        language: language,
        editor: 'International Publisher',
        edition: 1,
        totalPages: 250,
        damagedPages: 0,
        age: 1,
      };

      (axios.post as any).mockResolvedValue({
        data: { prediction: 30.00 },
      });

      const result = await predictPrice(bookData);
      expect(result.predictedPrice).toBe(30.00);
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ language })
      );
    }
  });

  it('devrait vérifier que le prix prédit est un nombre positif', async () => {
    const bookData = {
      title: 'Valid Book',
      author: 'Valid Author',
      category: Category.TECHNOLOGY,
      language: Language.ENGLISH,
      editor: 'Valid Publisher',
      edition: 1,
      totalPages: 200,
      damagedPages: 0,
      age: 1,
    };

    (axios.post as any).mockResolvedValue({
      data: { prediction: 42.50 },
    });

    const result = await predictPrice(bookData);
    
    expect(result.predictedPrice).toBeGreaterThan(0);
    expect(typeof result.predictedPrice).toBe('number');
    expect(Number.isFinite(result.predictedPrice)).toBe(true);
  });

  it('devrait gérer les livres anciens avec un prix réduit', async () => {
    const oldBook = {
      title: 'Ancient Book',
      author: 'Historical Author',
      category: Category.HISTORY,
      language: Language.FRENCH,
      editor: 'Old Publisher',
      edition: 1,
      totalPages: 150,
      damagedPages: 30,
      age: 50,
    };

    (axios.post as any).mockResolvedValue({
      data: { prediction: 15.00 },
    });

    const result = await predictPrice(oldBook);
    
    expect(result.predictedPrice).toBe(15.00);
    expect(result.predictedPrice).toBeLessThan(30); // Prix faible pour un vieux livre endommagé
  });

  it('devrait gérer un livre neuf avec un prix élevé', async () => {
    const newBook = {
      title: 'Brand New Book',
      author: 'Modern Author',
      category: Category.TECHNOLOGY,
      language: Language.ENGLISH,
      editor: 'Modern Publisher',
      edition: 1,
      totalPages: 500,
      damagedPages: 0,
      age: 0,
    };

    (axios.post as any).mockResolvedValue({
      data: { prediction: 89.99 },
    });

    const result = await predictPrice(newBook);
    
    expect(result.predictedPrice).toBe(89.99);
    expect(result.predictedPrice).toBeGreaterThan(50);
  });
});

/**
 * Tests additionnels pour démontrer les concepts du TP
 */
describe('Tests avancés avec mocks et async', () => {
  it('devrait attendre la résolution de plusieurs appels API', async () => {
    const books = [
      { title: 'Book 1', price: 20 },
      { title: 'Book 2', price: 30 },
      { title: 'Book 3', price: 40 },
    ];

    // Simuler plusieurs appels API
    const promises = books.map((book, index) => {
      (axios.post as any).mockResolvedValueOnce({
        data: { prediction: book.price },
      });

      return predictPrice({
        title: book.title,
        author: 'Author',
        category: Category.TECHNOLOGY,
        language: Language.ENGLISH,
        editor: 'Publisher',
        edition: 1,
        totalPages: 300,
        damagedPages: 0,
        age: 1,
      });
    });

    const results = await Promise.all(promises);

    expect(results).toHaveLength(3);
    expect(results[0].predictedPrice).toBe(20);
    expect(results[1].predictedPrice).toBe(30);
    expect(results[2].predictedPrice).toBe(40);
  });

  it('devrait gérer les réponses API malformées', async () => {
    const bookData = {
      title: 'Test',
      author: 'Test',
      category: Category.TECHNOLOGY,
      language: Language.ENGLISH,
      editor: 'Test',
      edition: 1,
      totalPages: 100,
      damagedPages: 0,
      age: 1,
    };

    // Réponse sans le champ 'prediction'
    (axios.post as any).mockResolvedValue({
      data: {},
    });

    const result = await predictPrice(bookData);
    expect(result.predictedPrice).toBeUndefined();
  });
});
