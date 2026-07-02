# NestJS Queue Management System

A NestJS-based queue management system with priority ordering, RabbitMQ async processing, and real-time WebSocket updates — migrated from a Go implementation.

## Architecture

```mermaid
graph TB
    subgraph Clients
        HTTP[HTTP Clients]
        WS[WebSocket Clients]
    end

    subgraph API_Layer[NestJS API Layer]
        OC[OrdersController]
        BC[BotsController]
        AC[AppController<br/>GET /state]
        GW[EventsGateway<br/>WebSocket]
    end

    subgraph Service_Layer[Service Layer]
        CS[ControllerService<br/>Orchestration]
        OS[OrderService<br/>CRUD + Status]
        QS[QueueService<br/>Priority Queue]
        BS[BotService<br/>Bot Lifecycle]
    end

    subgraph Async_Layer[Async Processing]
        PS[ProducerService<br/>Job Emission]
        RMQ[(RabbitMQ<br/>orders.process)]
        CNS[ConsumerService<br/>Job Processing]
    end

    subgraph Storage[Persistence]
        PG[(PostgreSQL)]
    end

    HTTP --> OC
    HTTP --> BC
    HTTP --> AC
    WS --> GW

    OC --> CS
    BC --> CS
    AC --> CS

    CS --> OS
    CS --> QS
    CS --> BS
    CS --> PS

    OS --> PG
    BS --> PG

    PS --> RMQ
    RMQ --> CNS
    CNS --> OS

    CS -.->|EventEmitter| GW
```

## Process Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant Ctrl as Controller
    participant OS as OrderService
    participant QS as QueueService
    participant BS as BotService
    participant PS as ProducerService
    participant RMQ as RabbitMQ
    participant CNS as Consumer
    participant GW as WebSocket

    Note over C,GW: Order Creation & Processing

    C->>Ctrl: POST /orders
    Ctrl->>OS: create(order)
    OS-->>Ctrl: Order (PENDING)
    Ctrl->>QS: enqueue(order)
    Ctrl-->>C: 201 Order
    
    par Process Queue
        Ctrl->>BS: getActiveBots()
        BS-->>Ctrl: [Bot]
        Ctrl->>QS: dequeue()
        QS->>OS: updateStatus(ASSIGNED)
        QS-->>Ctrl: Order
        Ctrl->>PS: emitOrderJob(order)
        PS->>RMQ: sendToQueue(orders.process)
        Ctrl-->>GW: emit order:assigned
        GW-->>C: order:assigned
    end

    Note over CNS,RMQ: Async Processing (~10s)

    RMQ-->>CNS: consume message
    CNS->>OS: updateStatus(COMPLETE)
    CNS-->>GW: emit order:completed
    GW-->>C: order:completed

    Note over C,GW: Bot Lifecycle

    C->>Ctrl: POST /bots
    Ctrl->>BS: createBot(name)
    BS-->>Ctrl: Bot
    Ctrl->>QS: processQueuedOrders()
    Ctrl-->>C: 201 Bot
    GW-->>C: bot:added
```

## Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| **Framework** | NestJS 11 + TypeScript | Application framework |
| **Database** | PostgreSQL + TypeORM | Persistent storage (Order, Bot entities) |
| **Message Queue** | RabbitMQ (amqp-connection-manager) | Async bot job processing |
| **Real-Time** | Socket.IO (NestJS WebSocket Gateway) | Live state push to clients |
| **Rate Limiting** | @nestjs/throttler | 100 req/min per IP on POST /orders |
| **Testing** | Jest + Supertest | Unit, integration, and load tests |

## Project Structure

```
src/
├── app.module.ts              # Root module
├── app.controller.ts          # GET /, GET /state
├── entities/                  # TypeORM entities
│   ├── order.entity.ts        # Order (id, type, status, payload, priority)
│   └── bot.entity.ts          # Bot (id, name, active)
├── modules/
│   ├── order/
│   │   ├── order.module.ts
│   │   ├── order.service.ts   # CRUD + status transitions
│   │   ├── order.controller.ts# POST /orders, GET /orders, GET /orders/:id
│   │   └── dto/
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts   # In-memory priority queue (VIP + Normal FIFO)
│   │   ├── producer.service.ts# RabbitMQ job emission
│   │   ├── consumer.service.ts# Job processing (10s simulated work)
│   │   └── rabbitmq.service.ts# Connection lifecycle
│   ├── bot/
│   │   ├── bot.module.ts
│   │   ├── bot.service.ts     # Bot CRUD + active tracking
│   │   └── bot.controller.ts  # POST /bots, GET /bots, DELETE /bots/:id
│   ├── controller/
│   │   ├── controller.module.ts
│   │   └── controller.service.ts# Orchestration layer
│   └── gateway/
│       ├── gateway.module.ts
│       └── events.gateway.ts  # WebSocket event broadcasting
└── common/
    └── filters/
        └── global-exception.filter.ts
test/
├── phase5.e2e-spec.ts         # Integration tests
└── load/
    └── priority.load-spec.ts  # Load tests (500 concurrent orders)
```

## Priority Queue Logic

Orders are queued by priority tier — VIP orders are always dequeued before Normal orders. Within each tier, FIFO order is preserved.

| Operation | VIP Placement | Normal Placement |
|---|---|---|
| `enqueue()` | After last existing VIP | Append to tail |
| `enqueueFront()` | Before first Normal (after existing VIPs) | Absolute head |

## API Endpoints

| Method | Path | Description | Rate Limited |
|---|---|---|---|
| `GET` | `/` | Health check | No |
| `GET` | `/state` | Full system state (orders, queue, bots) | No |
| `POST` | `/orders` | Create order `{ orderType: "VIP"\|"NORMAL", payload?: string }` | Yes (100/min/IP) |
| `GET` | `/orders` | List all orders | No |
| `GET` | `/orders/:id` | Get order by ID | No |
| `POST` | `/bots` | Add bot `{ name: string }` | No |
| `GET` | `/bots` | List all bots | No |
| `DELETE` | `/bots/:id` | Remove bot (soft-delete) | No |

## WebSocket Events

Connect to `ws://localhost:3000`:

| Event | Direction | Payload |
|---|---|---|
| `order:created` | → client | `{ id, orderType, status, ... }` |
| `order:assigned` | → client | `{ id, botId, ... }` |
| `order:completed` | → client | `{ id, status: "COMPLETE", ... }` |
| `bot:added` | → client | `{ id, name, active: true }` |
| `bot:removed` | → client | `{ id }` |
| `state:updated` | → client | `{ orders: [], queue: [], bots: [] }` |

## Setup

### Prerequisites

- Node.js 22+
- PostgreSQL
- RabbitMQ

### Environment

```bash
cp .env.example .env
# Edit .env with your DB and RabbitMQ credentials
```

Key defaults:

| Variable | Default |
|---|---|
| `DB_HOST` | `localhost` |
| `DB_PORT` | `5432` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `DB_NAME` | `nest_rabbitmq` |
| `RABBITMQ_URL` | `amqp://localhost` |

### Install & Run

```bash
npm install
npm run start:dev        # Development (watch mode)
```

### Database

```bash
# Run migrations
npm run typeorm:migrate

# Revert last migration
npm run typeorm:revert
```

The app does **not** use `synchronize: true` — always run migrations explicitly in production.

## Testing

```bash
# Unit tests (39 tests across 11 suites)
npm test

# E2E + Load tests (10 tests across 3 suites)
npm run test:e2e

# All tests (49 total)
npm test && npm run test:e2e
```

### What's tested

| Suite | Tests | Scope |
|---|---|---|
| **Unit** | 39 | Order, Bot, Queue, Producer, Consumer, RabbitMQ services + Controllers + WebSocket Gateway |
| **Integration** (e2e) | 4 | HTTP pipeline through full AppModule (order → state → bot lifecycle → 404) |
| **Load** | 5 | 500 concurrent orders, VIP priority enforcement, FIFO within tiers, enqueueFront behavior |
| **Manual** | — | `TEST_CHECKLIST.md` with 10-section interactive checklist |
