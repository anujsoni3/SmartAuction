# SmartAuction Backend - Node.js + Express + TypeScript

A high-performance, real-time auction platform backend built with Node.js, Express, MongoDB, and WebSocket support.

## 🚀 Features

- ✅ **User & Admin Authentication** - Secure JWT-based authentication with bcrypt password hashing
- ✅ **Auction Management** - Create, list, and manage auctions with time-based expiry
- ✅ **Product Management** - Manage auction products with status tracking
- ✅ **Real-Time Bidding** - WebSocket-powered live bidding with atomic transactions
- ✅ **Wallet System** - User wallet with top-up and balance tracking
- ✅ **Transaction Logging** - Complete audit trail of all wallet and bidding transactions
- ✅ **Rate Limiting** - Per-IP and per-user rate limiting to prevent abuse
- ✅ **CORS Support** - Configured for frontend communication
- ✅ **Structured Logging** - Request logging and activity tracking
- ✅ **Input Validation** - Joi-based request validation
- ✅ **Error Handling** - Comprehensive error handling with custom error classes
- ✅ **Type Safety** - Full TypeScript support with strict typing

## 📋 Prerequisites

- **Node.js** >= 16.x
- **MongoDB** >= 4.4
- **npm** or **yarn**
- **git**

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd SmartAuction-main/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the `.env.example` file and configure your environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/smartauction
DB_NAME=smartauction

# JWT Configuration
SECRET_KEY=your_super_secret_key_change_in_production_12345
JWT_EXPIRY=10h

# Server Configuration
PORT=5000
NODE_ENV=development

# API Configuration
API_KEY=your_omnidimension_api_key

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,https://smart-auction-1213.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 4. Start MongoDB

Ensure MongoDB is running:

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux (using systemctl)
sudo systemctl start mongod

# Windows (using Services or MongoDB Compass)
# Start MongoDB from Services or Command Prompt as Administrator
```

## 🏃 Running the Server

### Development Mode (with hot-reload)

```bash
npm run dev
```

This starts the server using `ts-node`, allowing TypeScript to run directly.

### Production Build & Run

```bash
# Build TypeScript to JavaScript
npm run build

# Run compiled JavaScript
npm start
```

The server will be available at:
- **API**: `http://localhost:5000`
- **WebSocket**: `ws://localhost:5000`
- **Health Check**: `http://localhost:5000/health`
- **Documentation**: `http://localhost:5000/`

## 📚 API Endpoints

### Authentication

#### User Registration
```
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "password": "securepassword123",
  "mobile_number": "9876543210",
  "email": "john@example.com"
}
```

#### User Login
```
POST /api/login
{
  "username": "johndoe",
  "password": "securepassword123"
}

Response: { token: "jwt_token", user: {...} }
```

#### Change Password
```
POST /api/change-password
Authorization: Bearer <token>

{
  "username": "johndoe",
  "password": "oldpassword",
  "new_password": "newpassword"
}
```

### Auctions

#### List Active Auctions
```
GET /api/auctions
```

#### Register for Auction
```
POST /api/auctions/register
Authorization: Bearer <token>

{
  "auction_id": "auction-001"
}
```

#### Admin: Create Auction
```
POST /api/admin/auction
Authorization: Bearer <admin_token>

{
  "id": "auction-001",
  "name": "iPhone Auction 2024",
  "product_ids": ["product-001", "product-002"],
  "valid_until": "2024-04-20T18:00:00Z"
}
```

### Bidding

#### Place Bid (REST)
```
POST /api/bid
Authorization: Bearer <token>

{
  "product_name": "product-001",
  "bid_amount": 50000,
  "user_id": "user-id"
}

Response: { bid_id: "bid-xxx", message: "Bid placed successfully!" }
```

#### Get Highest Bid
```
GET /api/product/{productId}/highest-bid
```

#### Get All Bids for Product
```
GET /api/product/{productId}/bids
```

### Wallet

#### Get Wallet Balance
```
GET /api/wallet
Authorization: Bearer <token>
```

#### Top-up Wallet
```
POST /api/wallet/topup
Authorization: Bearer <token>

{
  "amount": 5000
}

Response: { message: "₹5000 added to wallet", new_balance: 10000 }
```

#### Get Transaction History
```
GET /api/wallet/transactions?limit=100
Authorization: Bearer <token>
```

### Products

#### Admin: Create Product
```
POST /api/admin/product
Authorization: Bearer <admin_token>

{
  "id": "product-001",
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone model",
  "auction_id": "auction-001"
}
```

#### Admin: Update Product
```
PUT /api/admin/product/{productId}
{
  "name": "Updated Product Name",
  "description": "Updated description"
}
```

## 🔌 WebSocket Events

### Client → Server Events

#### Join Auction
```javascript
socket.emit('join-auction', {
  auctionId: 'auction-001'
});
```

#### Place Bid (Real-Time)
```javascript
socket.emit('place-bid', {
  product_name: 'product-001',
  bid_amount: 50000,
  auctionId: 'auction-001'
});
```

#### Leave Auction
```javascript
socket.emit('leave-auction', {
  auctionId: 'auction-001'
});
```

### Server → Client Events

#### Bid Placed
```javascript
socket.on('bid-placed', (data) => {
  console.log(`Bid placed: ₹${data.bid_amount} by ${data.bid_by}`);
});
```

#### Highest Bid Updated
```javascript
socket.on('highest-bid-updated', (data) => {
  console.log(`Highest bid: ₹${data.highest_bid} by ${data.bid_by}`);
});
```

#### Auction Status
```javascript
socket.on('auction-status', (data) => {
  console.log('Auction update:', data);
});
```

#### Notification
```javascript
socket.on('notification', (data) => {
  console.log(`${data.title}: ${data.message}`);
});
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration (env, database, constants)
│   ├── types/               # TypeScript interfaces
│   ├── middleware/          # Middleware (auth, error, CORS, rate-limit)
│   ├── models/              # Database models (User, Auction, Bid, etc.)
│   ├── services/            # Business logic
│   │   ├── auth/
│   │   ├── user/
│   │   ├── auction/
│   │   ├── bidding/         # Critical: BidTransactionManager
│   │   ├── wallet/
│   │   └── admin/
│   ├── routes/              # API route handlers
│   ├── websocket/           # WebSocket handlers
│   │   ├── handlers/        # Event handlers
│   │   └── middleware/      # Socket.io middleware
│   ├── utils/               # Utility functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # HTTP + WebSocket server
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔐 Key Implementation Details

### Atomic Bidding Transactions

The `BidTransactionManager` class ensures atomic operations for bid placement:

1. **Wallet Balance Verification** - Check user has sufficient balance
2. **Highest Bid Validation** - Ensure bid exceeds current highest
3. **Wallet Deduction** - Atomically deduct amount from wallet
4. **Bid Creation** - Record bid in database
5. **Transaction Logging** - Log all operations for audit trail
6. **Rollback on Failure** - Automatic rollback if any step fails

This prevents race conditions and ensures data consistency across multiple collections.

### Authentication

- **JWT Tokens** with 10-hour expiry
- **Bcrypt Password Hashing** with 12 salt rounds
- **HttpOnly Cookies** for secure token storage
- **Token validation** on all protected routes

### Rate Limiting

- **General Limiter**: 100 requests per 15 minutes per IP
- **Auth Limiter**: 5 attempts per 15 minutes per IP (stricter)
- **Bid Limiter**: 20 bids per minute per user (key-based)

### Error Handling

Custom error classes for different scenarios:
- `AppError` - Base error class
- `ValidationError` - Input validation failures
- `AuthenticationError` - Auth failures
- `NotFoundError` - Resource not found
- `ConflictError` - Duplicate resources
- `BidError` - Bidding-specific errors
- `WalletError` - Wallet operation errors

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test          # Run all tests
npm run test:watch # Run tests in watch mode
```

Note: Setup Jest configuration in `jest.config.js` for integration tests as needed.

### Manual Testing with cURL

```bash
# Register user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "password": "password123",
    "mobile_number": "9876543210"
  }'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'

# Get wallet (with token)
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### WebSocket Testing with wscat

```bash
# Install wscat globally
npm install -g wscat

# Connect to WebSocket server
wscat -c "ws://localhost:5000?token=YOUR_JWT_TOKEN"

# Join auction (in wscat prompt)
> {"event": "join-auction", "auctionId": "auction-001"}

# Place bid (in wscat prompt)
> {"event": "place-bid", "product_name": "product-001", "bid_amount": 50000, "auctionId": "auction-001"}
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `SECRET_KEY` (generate with `openssl rand -base64 32`)
- [ ] Configure real MongoDB production cluster
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up logging and monitoring
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```bash
# Build Docker image
docker build -t smartauction-backend .

# Run container
docker run -e MONGO_URI=mongodb://mongo:27017/smartauction -p 5000:5000 smartauction-backend
```

## 📊 Monitoring

### Health Check
```
GET /api/health
```

Returns: `{ success: true, message: "API is running", timestamp: "..." }`

### Logs

Logs include:
- Request method, path, status, response time
- Error messages with stack traces
- Business logic operations (user registration, bid placement, etc.)
- WebSocket events

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

## 📝 License

MIT License - see LICENSE file for details

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues and documentation in the repository
- Review API examples in README.md and test with cURL/wscat

---

**Built with ❤️ using Node.js, Express, MongoDB, and WebSocket**
