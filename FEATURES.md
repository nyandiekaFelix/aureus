# Platform Features

## Authentication & User Management

### Firebase Authentication
- Secure JWT-based authentication using Firebase
- User registration and login
- Protected API endpoints with authentication guards
- User context injection for authenticated requests

### User Profiles
- Complete user profile management
- Personal information storage (name, date of birth, address)
- Kenyan National ID number and KRA PIN storage for KYC compliance
- Bank details management
- Profile update endpoints
- Redis caching for fast profile lookups (5min TTL)

## KYC (Know Your Customer)

### Document Submission
- KYC document upload and submission
- Support for multiple document types
- Verification data storage
- Document metadata management

### Status Tracking
- Real-time KYC status updates (PENDING, VERIFIED, REJECTED)
- Status change notifications via RabbitMQ events
- Redis caching for status lookups (10min TTL)
- Rejection reason tracking
- Timestamp tracking (submitted, verified, rejected)

## Gold Trading

### Gold Price Management
- Real-time gold price fetching from provider API
- Redis caching for price data (1min TTL)
- Price history tracking

### Gold Holdings
- User gold holdings tracking
- Average price calculation
- Current value calculation based on live prices
- Holdings history

### Buy/Sell Operations
- Buy gold with cash
- Sell gold holdings
- Transaction initiation with gold provider
- Transaction status tracking
- Provider reference management
- Automatic holdings update on transaction completion

## Transactions

### Transaction Management
- Complete transaction history
- Transaction status tracking (PENDING, COMPLETED, FAILED)
- Transaction metadata storage
- Provider reference linking
- Redis caching for transaction history (2min TTL)

### Transaction Types
- Gold purchase transactions
- Gold sale transactions
- Automatic ledger posting for all transactions
- Reward points calculation on transaction completion

## Goals & SIP (Systematic Investment Plan)

### Goal Management
- Create financial goals with target amounts
- Multiple goal types support
- Goal progress tracking
- Current amount vs target amount monitoring
- Goal status management (ACTIVE, COMPLETED)
- Target date setting
- Goal update capabilities

### SIP Management
- Create SIPs linked to goals
- Multiple frequency options (DAILY, WEEKLY, MONTHLY)
- Automated SIP execution via cron scheduler
- Next execution date tracking
- SIP status management
- SIP history tracking
- Last execution timestamp

### Automated Execution
- Daily cron job at 6 AM for SIP execution
- Automatic gold purchase for active SIPs
- Goal progress update on SIP execution
- Next execution date calculation
- Error handling and logging for failed executions

## Withdrawals

### Withdrawal Processing
- Withdrawal request creation
- Multiple payment methods support
- Bank account details management
- Payment gateway integration interface
- Withdrawal status tracking (PENDING, COMPLETED, FAILED)
- Transaction ID linking
- Processed timestamp tracking

### Ledger Integration
- Automatic ledger posting on withdrawal request
- Balance validation before withdrawal
- Reversal on failed withdrawals
- Event publishing for withdrawal status changes

## Rewards System

### Points Management
- Reward points calculation based on transaction types
- Points accumulation
- Points redemption
- Reward history tracking
- Reward expiration management
- Active rewards filtering

### Reward Types
- Transaction-based rewards
- Referral rewards
- Signup rewards
- Custom reward types

### Points Calculation
- Configurable reward rates per transaction type
- Automatic points calculation on transaction completion
- Total points aggregation
- Reward status management (ACTIVE, REDEEMED)

## Double-Entry Ledger System

### Account Management
- Multiple ledger account types (ASSET, LIABILITY, EQUITY, INCOME, EXPENSE)
- Account creation and management
- Account balance tracking
- Account naming and organization

### Transaction Posting
- Debit/Credit transaction posting
- Automatic balance updates
- Transaction description and metadata
- Transaction ID linking
- Timestamp tracking

### Account Types
- User Gold Holdings (Asset)
- User Cash Balance (Asset)
- Gold Provider Payable (Liability)
- Revenue (Income)
- Transaction Fees (Expense)
- Withdrawal Processing (Liability)

### Reconciliation
- Account reconciliation functionality
- Balance verification
- Calculated vs current balance comparison
- Reconciliation reports

### Audit Trail
- Complete transaction history
- Ledger entry querying
- Account balance history
- Transaction audit trail

## SMS Processing Microservice

### SMS Ingestion
- Single SMS submission endpoint
- Batch SMS submission endpoint
- SMS validation and deduplication
- Message ID and timestamp-based uniqueness
- Source tracking
- Metadata storage

### SMS Parsing
- Pattern matching engine for SMS categorization
- Regex-based parsing for common SMS formats
- Category classification:
  - Banking messages
  - Transaction notifications
  - OTP messages
  - Promotional messages
- Confidence scoring for categorization
- Data extraction:
  - Amount extraction
  - Date extraction
  - Account number extraction
  - Merchant name extraction

### Sync & Deduplication
- Message ID-based deduplication
- Incremental sync tracking
- Last sync timestamp per user
- Batch processing for large SMS volumes
- Conflict resolution
- Zero duplicate SMS entries guarantee

### Event Publishing
- Processed SMS events published to RabbitMQ
- Event schema with userId, messageId, category, parsedData
- Main backend notification on SMS processing
- Error handling and retry logic

## Infrastructure & Performance

### Caching Strategy
- Redis caching for hot data paths
- User profile cache (5min TTL)
- Gold price cache (1min TTL)
- KYC status cache (10min TTL)
- Transaction history cache (2min TTL)
- Cache invalidation on updates

### Message Queue
- RabbitMQ for event-driven communication
- Event publishing for:
  - SMS processing completion
  - Transaction status updates
  - KYC status changes
  - Withdrawal processing
- Event consumers in main backend
- Retry logic and dead letter queues

### Database
- PostgreSQL for all data storage
- Prisma ORM for type-safe database access
- Optimized indexes for performance
- Support for 1-2M ledger entries
- JSONB support for flexible data storage

### Logging & Monitoring
- Structured logging with Winston
- Request/response logging
- Error tracking and alerting
- Health check endpoints
- Performance monitoring

### API Documentation
- Swagger/OpenAPI documentation
- Complete API endpoint documentation
- Request/response schemas
- Authentication documentation
- Example requests and responses

## Performance Targets

- P95 API response time < 300ms
- Handle 1k requests/min on main backend
- Process 10k SMS/min on SMS microservice
- Support 1-2M ledger entries
- Zero duplicate SMS entries
- Fast incremental sync (< 1s for 100 new SMS)

## Security Features

- Firebase JWT authentication
- Input validation on all endpoints
- SQL injection prevention (Prisma parameterized queries)
- Rate limiting support
- CORS configuration
- Security headers
- API key management for external providers

## Deployment

- Docker containerization
- Docker Compose for local development
- Production-ready Dockerfiles
- Environment variable management
- Health check endpoints
- Graceful shutdown
- Database migration strategy

