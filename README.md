# Express.js Backend Template - Onboarding Guide

A production-ready, enterprise-grade Express.js backend template built with best practices, comprehensive architecture, and developer-friendly patterns. This template provides a solid foundation for building scalable RESTful APIs with modern Node.js.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [Development Workflow](#development-workflow)
- [Environment Configuration](#environment-configuration)
- [Authentication System](#authentication-system)
- [Database Management](#database-management)
- [API Development Guide](#api-development-guide)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

This template follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         HTTP Request/Response           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Routes Layer                    │
│  - URL routing                          │
│  - Middleware application               │
│  - Request validation                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Controllers Layer               │
│  - Request handling                     │
│  - Response formatting                  │
│  - Error propagation                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Repository Layer                │
│  - Data access abstraction              │
│  - Business logic                       │
│  - Database operations                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Models Layer (Sequelize)        │
│  - Data models                          │
│  - Associations                         │
│  - Validation rules                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Database (MySQL/PostgreSQL)     │
└─────────────────────────────────────────┘
```

### Design Patterns Used

1. **Repository Pattern**: Abstracts data access logic from business logic
2. **Service Pattern**: Encapsulates initialization and configuration of external services
3. **Middleware Pattern**: Handles cross-cutting concerns (auth, validation, logging)
4. **Factory Pattern**: Used in configuration creation (multer, rate limiters)
5. **Error Handling Strategy**: Centralized error handling with custom error types

---

## 🛠️ Tech Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^4.20.0 | Web framework |
| **sequelize** | ^6.28.2 | ORM for database operations |
| **mysql2** / **pg** | ^3.9.8 / ^8.10.0 | Database drivers |
| **jsonwebtoken** | ^9.0.0 | JWT authentication |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **yup** | ^1.0.0 | Schema validation |
| **winston** | ^3.17.0 | Logging framework |
| **multer** | 1.4.5-lts.2 | File upload handling |
| **@aws-sdk/client-s3** | ^3.310.0 | AWS S3 integration |
| **nodemailer** | ^6.10.0 | Email sending |
| **express-rate-limit** | ^7.5.0 | Rate limiting |
| **cors** | ^2.8.5 | CORS management |
| **dotenv** | ^16.0.1 | Environment variables |
| **moment** | ^2.29.3 | Date manipulation |
| **uuid** | ^9.0.0 | Unique ID generation |

### Development Dependencies

- **nodemon**: Auto-restart during development
- **sequelize-cli**: Database migrations and seeders
- **@faker-js/faker**: Test data generation

---

## ✨ Key Features

### 1. **Robust Authentication System**
- JWT-based authentication with refresh token support
- Password reset with email verification
- Email verification for new accounts
- Secure password hashing with bcrypt
- Token-based session management

### 2. **Advanced Database Management**
- Sequelize ORM with migration support
- Repository pattern for clean data access
- Automatic model and route loading
- Support for MySQL, PostgreSQL, and SQLite
- Built-in pagination and filtering

### 3. **Comprehensive Security**
- Rate limiting (standard and strict modes)
- CORS configuration
- Input validation with Yup
- SQL injection prevention
- XSS protection
- Secure HTTP headers

### 4. **File Management**
- Local and AWS S3 storage support
- File type validation
- Size limit enforcement
- Automatic file cleanup
- Multer integration

### 5. **Developer Experience**
- Structured logging with Winston
- Automatic route registration
- Hot reload with nodemon
- Consistent error handling
- Comprehensive documentation

### 6. **Production Ready**
- Environment-based configuration
- Error tracking and logging
- Health check endpoints
- Scalable architecture
- Performance optimized

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v14.x or higher (v18.x recommended)
- **pnpm**: v7.x or higher (enforced by preinstall script)
- **Database**: MySQL 5.7+ or PostgreSQL 12+
- **Git**: For version control

### Installation Steps

1. **Clone the repository** (or use as template):
   ```bash
   git clone <your-repo-url>
   cd foxucs-back-end-node
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   > **Note**: The project enforces pnpm usage. If you prefer npm/yarn, remove the preinstall script from package.json.

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Configuration](#environment-configuration)):
   ```env
   # Server Configuration
   SERVER_PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=your_database
   
   # JWT Configuration
   SERVER_JWT_SECRET=your-super-secret-jwt-key-change-this
   SERVER_JWT_TIMEOUT=3600
   SERVER_JWT_USE_EXPIRY=true
   SERVER_JWT_REFRESH_ENABLED=true
   SERVER_JWT_REFRESH_SECRET=your-refresh-token-secret
   SERVER_JWT_REFRESH_MAX_AGE=604800
   ```

5. **Create database**:
   ```bash
   # For MySQL
   mysql -u root -p -e "CREATE DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   
   # For PostgreSQL
   psql -U postgres -c "CREATE DATABASE your_database;"
   ```

6. **Run migrations**:
   ```bash
   pnpm sequelize-cli db:migrate
   ```

7. **Start development server**:
   ```bash
   pnpm dev
   ```

8. **Verify installation**:
   ```bash
   curl http://localhost:3000/api/health
   # Expected response: {"status":"OK","message":"Server is running"}
   ```

### First Steps After Installation

1. **Test the health endpoint**: `GET /api/health`
2. **Review the example controller**: `src/controllers/example.controller.js`
3. **Explore the authentication routes**: `src/routes/auth.routes.js`
4. **Read the DEVELOPER.md**: Detailed development guide

---

## 📁 Project Structure

```
foxucs-back-end-node/
│
├── src/                              # Application source code
│   ├── config/                       # Configuration files
│   │   ├── cors.config.js           # CORS settings
│   │   ├── database.js              # Database connection config
│   │   ├── email.config.js          # Email transport config
│   │   └── multer.config.js         # File upload config
│   │
│   ├── controllers/                  # Request handlers
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── emailVerification.controller.js
│   │   ├── passwordReset.controller.js
│   │   └── example.controller.js    # Template for new controllers
│   │
│   ├── data-access/                  # Repository layer
│   │   ├── base.repository.js       # Base repository with CRUD
│   │   ├── users/                   # User repository
│   │   │   └── index.js
│   │   └── verificationCodes/       # Verification codes repository
│   │       └── index.js
│   │
│   ├── database/                     # Database files
│   │   └── migrations/              # Sequelize migrations
│   │       └── *.js                 # Migration files
│   │
│   ├── middlewares/                  # Express middlewares
│   │   ├── auth.middleware.js       # JWT authentication
│   │   ├── errorHandler.middleware.js  # Global error handler
│   │   ├── response.middleware.js   # Response formatting
│   │   ├── validation.middleware.js # Request validation
│   │   ├── roleCheck.middleware.js  # Role-based access
│   │   ├── isSelfAuthorized.middleware.js
│   │   ├── isUser.middleware.js
│   │   ├── verifiedEmailRequired.middleware.js
│   │   └── multerErrorHandler.middleware.js
│   │
│   ├── models/                       # Sequelize models
│   │   ├── User.js                  # User model
│   │   └── verificationCode.js      # Verification code model
│   │
│   ├── routes/                       # API routes
│   │   ├── index.js                 # Auto-loads all routes
│   │   └── auth.routes.js           # Authentication routes
│   │
│   ├── services/                     # Business logic & external services
│   │   ├── aws.service.js           # AWS S3 integration
│   │   ├── cors.service.js          # CORS configuration
│   │   ├── email.service.js         # Email sending
│   │   ├── express.service.js       # Express app setup
│   │   ├── jwt.service.js           # JWT operations
│   │   ├── logging.service.js       # Winston logging
│   │   ├── rateLimit.service.js     # Rate limiting
│   │   └── sequelize.service.js     # Database connection
│   │
│   ├── utils/                        # Utility functions
│   │   ├── errors/                  # Error handling
│   │   │   ├── index.js
│   │   │   ├── messages.errors.js
│   │   │   └── types/
│   │   │       ├── Api.error.js     # API error classes
│   │   │       ├── Base.error.js    # Base error class
│   │   │       └── Sequelize.error.js
│   │   ├── fileUtils.js
│   │   ├── handlebarsHelpers.js
│   │   ├── middleware.utils.js
│   │   └── responseHandler.js       # Response formatting utilities
│   │
│   └── index.js                      # Application entry point
│
├── templates/                        # Email templates
│   └── emails/
│       ├── account-verification.html
│       └── password-reset.html
│
├── scripts/                          # Database scripts
│   └── car wash.sql
│
├── .env.example                      # Environment variables template
├── .sequelizerc                      # Sequelize CLI config
├── nodemon.json                      # Nodemon configuration
├── package.json                      # Project dependencies
├── pnpm-lock.yaml                   # Lock file
├── DEVELOPER.md                      # Detailed development guide
├── LICENSE                           # MIT License
└── README.md                         # This file
```

---

## 🎯 Core Concepts

### 1. Service-Based Initialization

The application uses a service-based initialization approach (`src/index.js`):

```javascript
const services = [expressService, awsService, sequelizeService, emailService];

(async () => {
  for (const service of services) {
    await service.init();
  }
})();
```

**Services are initialized in order:**
1. **Express Service**: Sets up web server, middleware, routes
2. **AWS Service**: Initializes S3 client (if configured)
3. **Sequelize Service**: Establishes database connection, loads models
4. **Email Service**: Configures email transport

### 2. Repository Pattern

All database operations go through repositories that extend `BaseRepository`:

```javascript
// src/data-access/users/index.js
class UserRepository extends BaseRepository {
  constructor() {
    super(User);  // Pass model to base repository
  }

  // Custom query methods
  async findByEmail(email) {
    return this.findOne({ where: { email } });
  }
}

module.exports = new UserRepository();
```

**Benefits:**
- Centralized data access logic
- Testable and mockable
- Consistent error handling
- Reusable query methods

### 3. Standardized Response Format

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "status": 200,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "status": 400
}
```

**Usage in controllers:**
```javascript
// Success
return res.success('User created', user, null, 201);

// Error (thrown and caught by global handler)
throw new NotFoundError('User not found');
```

### 4. Middleware Chain

Request processing follows this middleware chain:

```
Request
  ↓
Response Formatting Middleware
  ↓
CORS Middleware
  ↓
Body Parser
  ↓
Cookie Parser
  ↓
Rate Limiter (production only)
  ↓
Morgan Logger
  ↓
Routes
  ↓
404 Handler
  ↓
Multer Error Handler
  ↓
Global Error Handler
  ↓
Response
```

### 5. Auto-Loading System

**Routes** and **Models** are automatically loaded:

**Routes** (`src/routes/index.js`):
- Scans the routes directory
- Automatically registers all `*.routes.js` files
- No manual registration needed

**Models** (`src/services/sequelize.service.js`):
- Dynamically imports all files from `src/models/`
- Initializes models with Sequelize instance
- Sets up associations automatically

---

## 🔄 Development Workflow

### Creating a New Feature (Complete Example)

Let's create a "Products" feature with CRUD operations.

#### Step 1: Create Migration

```bash
pnpm sequelize-cli migration:generate --name create-products-table
```

Edit the migration file:
```javascript
// src/database/migrations/XXXXXX-create-products-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};
```

Run migration:
```bash
pnpm sequelize-cli db:migrate
```

#### Step 2: Create Model

```javascript
// src/models/Product.js
import Sequelize, { Model } from "sequelize";

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        product_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        stock: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        }
      },
      {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    );
    
    return this;
  }

  static associate(models) {
    // Define associations if needed
  }
}

export default Product;
```

#### Step 3: Create Repository

```javascript
// src/data-access/products/index.js
const Product = require('../../models/Product');
const BaseRepository = require('../base.repository');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findByPriceRange(minPrice, maxPrice) {
    return this.findFiltered({
      price: {
        [Op.gte]: minPrice,
        [Op.lte]: maxPrice
      }
    });
  }

  async findInStock() {
    return this.findFiltered({
      stock: {
        [Op.gt]: 0
      }
    });
  }
}

module.exports = new ProductRepository();
```

#### Step 4: Create Controller

```javascript
// src/controllers/product.controller.js
const ProductRepository = require('../data-access/products');
const { createPagination } = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors/types/Api.error');
const loggingService = require('../services/logging.service');
const logger = loggingService.getLogger();

const productController = {
  getAll: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      
      const { count, rows } = await ProductRepository.findAllPaginated(page, limit);
      const pagination = createPagination(page, limit, count);
      
      return res.success('Products retrieved successfully', rows, pagination);
    } catch (error) {
      logger.error('Error retrieving products', { error });
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await ProductRepository.findById(id);
      
      if (!product) {
        throw new NotFoundError('Product not found');
      }
      
      return res.success('Product retrieved successfully', product);
    } catch (error) {
      logger.error(`Error retrieving product ${req.params.id}`, { error });
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const product = await ProductRepository.create(req.body);
      return res.success('Product created successfully', product, null, 201);
    } catch (error) {
      logger.error('Error creating product', { error });
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await ProductRepository.update(id, req.body);
      
      if (!updated) {
        throw new NotFoundError('Product not found');
      }
      
      const product = await ProductRepository.findById(id);
      return res.success('Product updated successfully', product);
    } catch (error) {
      logger.error(`Error updating product ${req.params.id}`, { error });
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await ProductRepository.delete(id);
      
      if (!deleted) {
        throw new NotFoundError('Product not found');
      }
      
      return res.success('Product deleted successfully');
    } catch (error) {
      logger.error(`Error deleting product ${req.params.id}`, { error });
      next(error);
    }
  }
};

module.exports = productController;
```

#### Step 5: Create Routes

```javascript
// src/routes/product.routes.js
const { Router } = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');

const productRoutes = Router();

// Validation schemas
const productSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  description: Yup.string().nullable(),
  price: Yup.number().positive('Price must be positive').required('Price is required'),
  stock: Yup.number().integer().min(0, 'Stock cannot be negative').default(0)
});

const idParamSchema = Yup.object().shape({
  id: Yup.number().positive().integer().required()
});

// Public routes
productRoutes.get('/products', productController.getAll);
productRoutes.get(
  '/products/:id',
  validate(idParamSchema, 'params'),
  productController.getOne
);

// Protected routes (require authentication)
productRoutes.post(
  '/products',
  authMiddleware,
  validate(productSchema),
  productController.create
);

productRoutes.put(
  '/products/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  validate(productSchema),
  productController.update
);

productRoutes.delete(
  '/products/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  productController.delete
);

module.exports = productRoutes;
```

#### Step 6: Test Your Endpoints

```bash
# Get all products
curl http://localhost:3000/api/products

# Get specific product
curl http://localhost:3000/api/products/1

# Create product (requires authentication)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Sample Product",
    "description": "A great product",
    "price": 29.99,
    "stock": 100
  }'
```

---

## 🔐 Authentication System

### Overview

The authentication system uses JWT (JSON Web Tokens) with support for:
- Access tokens (short-lived)
- Refresh tokens (long-lived, optional)
- Email verification
- Password reset functionality

### How It Works

1. **Registration**: User registers → Email sent → User verifies email → Account activated
2. **Login**: User logs in → JWT access token generated → Token returned to client
3. **Protected Routes**: Client sends token → Middleware verifies → Request processed
4. **Token Refresh**: Access token expires → Client uses refresh token → New access token issued

### Authentication Flow Diagram

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │  Server │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /api/auth/login    │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │  Query user by email     │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  Return user data        │
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │  Verify password         │
     │                          │  (bcrypt.compare)        │
     │                          │                          │
     │                          │  Generate JWT token      │
     │                          │                          │
     │  Return token & user     │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │  GET /api/protected      │                          │
     │  Authorization: Bearer   │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │  Verify JWT token        │
     │                          │                          │
     │                          │  Query user by ID        │
     │                          ├─────────────────────────>│
     │                          │                          │
     │                          │  Return user             │
     │                          │<─────────────────────────┤
     │                          │                          │
     │  Return protected data   │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
```

### Available Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### Using Authentication in Routes

```javascript
const authMiddleware = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/roleCheck.middleware');

// Public route
router.get('/public', controller.publicMethod);

// Protected route (any authenticated user)
router.get('/protected', authMiddleware, controller.protectedMethod);

// Admin-only route
router.delete('/admin', authMiddleware, roleCheck(['admin']), controller.adminMethod);
```

### JWT Configuration

Configure JWT in your `.env` file:

```env
# Basic JWT
SERVER_JWT_SECRET=your-secret-key-min-32-characters-long
SERVER_JWT_TIMEOUT=3600           # 1 hour in seconds
SERVER_JWT_USE_EXPIRY=true

# Refresh tokens (optional)
SERVER_JWT_REFRESH_ENABLED=true
SERVER_JWT_REFRESH_SECRET=your-refresh-secret-key
SERVER_JWT_REFRESH_MAX_AGE=604800  # 7 days in seconds
```

---

## 🗄️ Database Management

### Supported Databases

- **MySQL** 5.7+ (recommended)
- **PostgreSQL** 12+
- **SQLite** (development only)

### Working with Migrations

**Create a migration:**
```bash
pnpm sequelize-cli migration:generate --name your-migration-name
```

**Run migrations:**
```bash
# Run all pending migrations
pnpm sequelize-cli db:migrate

# Undo last migration
pnpm sequelize-cli db:migrate:undo

# Undo all migrations
pnpm sequelize-cli db:migrate:undo:all
```

**Migration structure:**
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Forward migration
    await queryInterface.createTable('table_name', {
      // columns
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback migration
    await queryInterface.dropTable('table_name');
  }
};
```

### Working with Seeders

**Create a seeder:**
```bash
pnpm sequelize-cli seed:generate --name demo-users
```

**Run seeders:**
```bash
# Run all seeders
pnpm sequelize-cli db:seed:all

# Run specific seeder
pnpm sequelize-cli db:seed --seed XXXXXX-demo-users.js

# Undo last seeder
pnpm sequelize-cli db:seed:undo

# Undo all seeders
pnpm sequelize-cli db:seed:undo:all
```

### Database Best Practices

1. **Always create migrations** for schema changes
2. **Use timestamps** (`created_at`, `updated_at`)
3. **Add indexes** for frequently queried columns
4. **Use transactions** for multi-step operations
5. **Implement soft deletes** when appropriate
6. **Validate data** at both application and database levels

---

## 🌐 Environment Configuration

### Required Environment Variables

```env
# ================================
# Server Configuration
# ================================
SERVER_PORT=3000
NODE_ENV=development  # development | production | test

# ================================
# Database Configuration
# ================================
DB_DIALECT=mysql      # mysql | postgres | sqlite
DB_HOST=localhost
DB_PORT=3306          # 3306 for MySQL, 5432 for PostgreSQL
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database

# ================================
# JWT Authentication
# ================================
SERVER_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SERVER_JWT_TIMEOUT=3600             # Token expiry in seconds (1 hour)
SERVER_JWT_USE_EXPIRY=true          # Enable token expiration
SERVER_JWT_REFRESH_ENABLED=false    # Enable refresh tokens
SERVER_JWT_REFRESH_SECRET=your-refresh-token-secret
SERVER_JWT_REFRESH_MAX_AGE=604800   # Refresh token expiry (7 days)

# ================================
# Email Configuration (Optional)
# ================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourapp.com

# ================================
# AWS S3 Configuration (Optional)
# ================================
AWS_KEYID=your-aws-access-key-id
AWS_SECRETKEY=your-aws-secret-access-key
AWS_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# ================================
# CORS Configuration (Optional)
# ================================
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
CORS_CREDENTIALS=true

# ================================
# Rate Limiting (Production)
# ================================
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # Max requests per window
```

### Environment-Specific Settings

**Development:**
- Detailed error messages
- Sequelize query logging
- No rate limiting
- Relaxed security

**Production:**
- Generic error messages
- Disabled query logging
- Strict rate limiting
- Enhanced security headers

---

## 📡 API Development Guide

### Request/Response Standards

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>  (for protected routes)
```

**Success Response Format:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "status": 200,
  "data": { 
    // Response data
  },
  "pagination": {  // Only for paginated responses
    "page": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "errors": [  // Optional, for validation errors
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | OK - Successful GET, PUT, PATCH |
| 201 | Created - Successful POST |
| 204 | No Content - Successful DELETE |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Validation with Yup

**Basic validation:**
```javascript
const validate = require('../middlewares/validation.middleware');
const Yup = require('yup');

router.post('/users',
  validate(Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string().email().required(),
    age: Yup.number().positive().integer().min(18)
  })),
  controller.create
);
```

**Multi-source validation:**
```javascript
router.put('/users/:id',
  validate({
    params: Yup.object().shape({
      id: Yup.number().positive().integer().required()
    }),
    body: Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email()
    }),
    query: Yup.object().shape({
      notify: Yup.boolean().default(false)
    })
  }),
  controller.update
);
```

### Pagination

```javascript
// In controller
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 10;

const { count, rows } = await Repository.findAllPaginated(page, limit);
const pagination = createPagination(page, limit, count);

return res.success('Data retrieved', rows, pagination);
```

### File Upload

```javascript
const { createUploader } = require('../config/multer.config');

// Single file
const upload = createUploader({
  fileFilter: 'images',
  fileSize: 2 * 1024 * 1024,  // 2MB
  uploadPath: 'uploads/avatars'
});

router.post('/upload', upload.single('avatar'), controller.handleUpload);

// Multiple files
router.post('/gallery', upload.array('photos', 10), controller.handleGallery);
```

---

## 🧪 Testing & Quality Assurance

### Manual Testing with cURL

**Register user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

**Access protected route:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

A Postman collection is included in `postman.json`. Import it to Postman for easy API testing.

### Logging and Debugging

**View logs:**
```javascript
const loggingService = require('./services/logging.service');
const logger = loggingService.getLogger();

logger.info('Info message', { context: 'data' });
logger.warn('Warning message');
logger.error('Error occurred', { error });
logger.debug('Debug info');
```

**Log levels:**
- `error`: Error events
- `warn`: Warning messages
- `info`: Informational messages
- `debug`: Debug information (development only)

---

## 🚢 Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] JWT secrets changed from defaults
- [ ] `NODE_ENV=production` set
- [ ] Error logging configured
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] HTTPS configured
- [ ] Database backups scheduled
- [ ] Health check endpoint tested

### Production Environment Setup

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export SERVER_PORT=3000
   export DB_HOST=your-production-db-host
   # ... other variables
   ```

2. **Run migrations:**
   ```bash
   pnpm sequelize-cli db:migrate
   ```

3. **Start the application:**
   ```bash
   pnpm start
   ```

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/index.js --name "api-server"

# Configure auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs
pm2 monit
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db
  
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: yourdb
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: "Cannot find module" errors**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Issue: Database connection fails**
```bash
# Check database is running
# For MySQL:
mysql -u root -p -e "SELECT 1"

# Verify credentials in .env
# Test connection:
pnpm sequelize-cli db:migrate:status
```

**Issue: JWT token errors**
```
# Ensure SERVER_JWT_SECRET is set and at least 32 characters
# Clear any cached tokens
# Check token expiry settings
```

**Issue: Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change SERVER_PORT in .env
```

**Issue: Sequelize migration errors**
```bash
# Check migration status
pnpm sequelize-cli db:migrate:status

# Undo problematic migration
pnpm sequelize-cli db:migrate:undo

# Fix migration file, then re-run
pnpm sequelize-cli db:migrate
```

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=*
```

---

## 📚 Best Practices

### 1. Security

✅ **DO:**
- Use environment variables for secrets
- Hash passwords with bcrypt
- Validate all inputs
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated
- Use prepared statements (Sequelize does this)

❌ **DON'T:**
- Commit `.env` files
- Log sensitive data
- Expose stack traces in production
- Use weak JWT secrets
- Trust client data without validation

### 2. Code Organization

✅ **DO:**
- Follow the repository pattern
- Keep controllers thin
- Use async/await consistently
- Handle errors properly
- Write descriptive variable names
- Comment complex logic
- Keep functions small and focused

❌ **DON'T:**
- Put business logic in controllers
- Write database queries in controllers
- Use callback hell
- Ignore errors
- Mix concerns between layers

### 3. Database

✅ **DO:**
- Use migrations for schema changes
- Add indexes for frequently queried fields
- Use transactions for multi-step operations
- Implement soft deletes when needed
- Paginate large result sets

❌ **DON'T:**
- Modify migrations after they're run
- Use `SELECT *` unnecessarily
- Skip validation
- Hardcode database values
- Forget to handle N+1 queries

### 4. API Design

✅ **DO:**
- Use RESTful conventions
- Return consistent response formats
- Use appropriate HTTP methods
- Return meaningful status codes
- Document your endpoints
- Version your API

❌ **DON'T:**
- Use verbs in URLs (use nouns)
- Return different response formats
- Ignore HTTP standards
- Skip validation
- Break backward compatibility

---

## 📖 Additional Resources

### Documentation
- **Detailed Developer Guide**: See `DEVELOPER.md` for in-depth information
- **Sequelize Docs**: https://sequelize.org/docs/v6/
- **Express Docs**: https://expressjs.com/
- **Yup Validation**: https://github.com/jquense/yup

### Project Features
- JWT Authentication with refresh tokens
- Email verification system
- Password reset functionality
- File upload (local and S3)
- Rate limiting
- CORS configuration
- Structured logging
- Error handling
- Auto-loading routes and models

### Getting Help
- Review the `DEVELOPER.md` for detailed examples
- Check the example controller and routes
- Examine existing models and repositories
- Review middleware implementations

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📞 Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Happy Coding! 🚀**

---

*This template was built with ❤️ by senior developers for developers. It includes everything you need to build production-ready APIs quickly and efficiently.*
