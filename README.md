# 📚 BidBooks

**BidBooks** – _Book a book, give it a second look!_  
An AI-powered and auction-based second-hand book marketplace that redefines how people buy and sell used books. Our platform offers transparent pricing, intelligent suggestions, and real-time features for a seamless user experience.

---

## 🧩 Problem Statement

1. ❌ Lack of transparency in second-hand book pricing
2. ❌ Difficulty in finding specific books
3. ❌ Existing platforms are slow and unintuitive

---

## ✅ Our Solution

### 📊 1. Smart Price Estimation

Users enter details about their book, and an AI model analyzes the data to estimate an optimal selling price.

### 🛒 2. Listing & Auction System

Once the seller accepts the price, the book is listed. When a buyer places a bid, a **24-hour auction** is triggered. The highest bidder at the end of this period wins the book.

### 💬 3. Fluid & Personalized Experience

- Real-time notifications
- Built-in community space
- Rating, comments, and user feedback features

---

## 💻 Technologies Used

| Layer         | Technology               |
| ------------- | ------------------------ |
| Front-end     | Angular                  |
| Back-end      | NestJS                   |
| API Styles    | REST, GraphQL            |
| Notifications | SSE (Server-Sent Events) |
| Messaging     | WebSockets               |
| Testing       | Vitest                   |

---

## 🧪 Testing & Quality Assurance

### Test Results

Our backend is thoroughly tested with **56 unit tests** covering critical services and utilities:

```
✓ Test Files:  5 passed (5)
✓ Tests:       56 passed (56)
⏱ Duration:    ~7s
```

### Test Coverage Breakdown

| Test Suite                   | Tests    | Coverage                                                            |
| ---------------------------- | -------- | ------------------------------------------------------------------- |
| **functions.utils.test.ts**  | 38 tests | ✅ Utility functions (transformers, sorting, validation, async)     |
| **bids.service.test.ts**     | 9 tests  | ✅ Bid creation, validation, notifications with mocked dependencies |
| **books.service.test.ts**    | 7 tests  | ✅ Book operations, error handling, database mocking                |
| **books.controller.test.ts** | 11 tests | ✅ HTTP endpoints, request validation                               |
| **app.service.test.ts**      | 2 tests  | ✅ Basic service functionality                                      |

### Testing Approach

#### 1️⃣ **Unit Tests with Mocks**

We use **Vitest** with comprehensive mocking to isolate business logic:

- **Repository Mocking**: Simulate database operations without real DB connections
- **Service Mocking**: Test interactions between services (BooksService, NotificationsService)
- **Dependency Injection**: All dependencies are mocked for true unit testing

```typescript
// Example: Mocking multiple dependencies
const mockBidRepository = { findOne: vi.fn(), save: vi.fn() };
const mockBooksService = { findOne: vi.fn() };
const mockNotificationsService = { notify: vi.fn() };

const bidsService = new BidsService(
  mockBidRepository,
  mockBooksService,
  mockNotificationsService,
);
```

#### 2️⃣ **Test Categories**

- **Basic Tests**: Simple functionality (transformer, add)
- **Boundary Testing**: Edge cases and limits (isPriceInRange)
- **Async Testing**: API calls and promises (fetchRandomUser)
- **Error Handling**: Exception scenarios (NotFoundException, BadRequestException)
- **Business Logic**: Auction rules, bid validation, timing constraints

#### 3️⃣ **Key Test Scenarios**

- ✅ User cannot bid on their own book
- ✅ Bid amount must exceed current highest bid
- ✅ 24-hour auction timer validation
- ✅ Database error recovery
- ✅ Notification triggers on bid placement
- ✅ Book status updates (isSold, isBiddingOpen)

### Code Coverage Report

Our test suite provides excellent code coverage:

```
 % Coverage Report
─────────────────────────────────────────────────────────────
 File              │ Stmts    │ Branch   │ Funcs    │ Lines
─────────────────────────────────────────────────────────────
 All files         │ 97.43%   │ 87.5%    │ 100%     │ 97.14%
 src               │ 100%     │ 100%     │ 100%     │ 100%
 src/Enums         │ 100%     │ 100%     │ 100%     │ 100%
 src/utils         │ 90%      │ 75%      │ 100%     │ 88.88%
─────────────────────────────────────────────────────────────
```

**Coverage Metrics:**

- ✅ **Statements**: 97.43% (38/39) - Excellent coverage of code statements
- ✅ **Branches**: 87.5% (7/8) - High coverage of conditional logic paths
- ✅ **Functions**: 100% (9/9) - All functions are tested
- ✅ **Lines**: 97.14% (34/35) - Near-complete line coverage

**Per Module:**

- **app.service**: 100% coverage across all metrics
- **Enums**: 100% coverage - All enum definitions validated
- **utils/functions**: 90% statements, 75% branches, 100% functions

### Running Tests

```bash
# Run all tests
npm run test:vitest

# Run tests with coverage report
npm run test:vitest:coverage

# Watch mode for development
npm run test:vitest -- --watch
```

### Test Results Screenshot

All tests passing successfully:

```
 ✓ src/tests/functions.utils.test.ts (38 tests) 750ms
   ✓ Test de la fonction add (3)
   ✓ Test de la fonction transformer (5)
   ✓ Test de la fonction trier (8)
   ✓ Test de la fonction isPriceInRange - Boundary Testing (9)
   ✓ Test de la fonction fetchRandomUser - Async (2)

 ✓ src/tests/app.service.test.ts (2 tests) 13ms
 ✓ src/tests/bids.service.test.ts (9 tests) 38ms
 ✓ src/tests/books.service.test.ts (7 tests) 41ms
 ✓ src/tests/books.controller.test.ts (11 tests) 38ms

 Test Files  5 passed (5)
      Tests  56 passed (56)
   Start at  00:33:19
   Duration  7.22s
```

---

## 🧠 Tech Highlights

### 🧾 GraphQL

Used for fetching complex, related data like books, users, ratings, and bids—ideal for nested queries.

### 🔔 SSE (Server-Sent Events)

Used for unidirectional real-time notifications (book updates, payment alerts). Lightweight and HTTP-friendly.

### 💬 WebSocket

Enables real-time two-way messaging between users. Maintains persistent connections for low-latency communication.

### 🌐 REST API

Used for classic CRUD operations like book and blog creation/modification, ensuring a clean, synchronous request-response model.

---

## 👨‍💻 Project Contributors

**Mohamed Aziz Dhouibi**  
**Oussema Guerami**  
**Hiba Chabbouh**  
**Leith Engazzou**  
**Maher Wali**

---

## 🌍 Impact & Vision

- **Revolutionize** second-hand book sales through intelligent automation and transparent auctions
- **Empower** users with intuitive UX and real-time interactions
- **Promote sustainability** by giving books a second life

> We are changing how books circulate by giving each one a new story to tell.

---

## 🧾 License

This project is licensed under the **MIT License**.

---

## 🚀 Future Roadmap (Optional Section)

- Mobile App version (iOS & Android)
- Enhanced AI price prediction using historical bid patterns
- Admin panel for managing user disputes and content

---

> “**BidBooks** is more than a platform — it's a movement to make books more accessible, transparent, and meaningful.”
