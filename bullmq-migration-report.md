# BullMQ Migration Report

## Summary
- Total files with BullMQ usage: 7
- Total migration suggestions: 19

## Migration Suggestions


### src/services/queueManager.ts:7:1
**Description**: Standardize BullMQ imports

**Old Code**:
```typescript
import { JobsOptions } from 'bullmq';
```

**New Code**:
```typescript
import { JobsOptions } from 'bullmq';
```


### src/services/jobQueue.ts:10:1
**Description**: Replace direct BullMQ type imports with standardized type imports

**Old Code**:
```typescript
import type {
  Queue as BullQueue,
  QueueScheduler as BullQueueScheduler,
  Worker as BullWorker,
  Job as BullMQJob,
  ConnectionOptions as BullConnectionOptions,
  JobOptions as BullJobOptions
} from 'bullmq';
```

**New Code**:
```typescript
import type { BullQueue, BullQueueScheduler, BullWorker, BullMQJob, BullConnectionOptions, BullJobOptions } from '../types/bullmq/index.standardized.js';
```


### src/services/jobQueue.ts:125:21
**Description**: Use standardized service to create QueueScheduler

**Old Code**:
```typescript
new QueueScheduler('task-queue', {
          connection: redisClient,
        })
```

**New Code**:
```typescript
bullmqService.createScheduler('task-queue', {
          connection: redisClient,
        })
```


### src/services/jobQueue.ts:139:16
**Description**: Use standardized service to create Queue

**Old Code**:
```typescript
new Queue('taskProcessor', {
      connection: redisClient
    })
```

**New Code**:
```typescript
bullmqService.createQueue('taskProcessor', {
      connection: redisClient
    })
```


### src/services/jobQueue.ts:336:18
**Description**: Use standardized service to create Queue

**Old Code**:
```typescript
new Queue('task-queue', {
        connection: redisClient,
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      })
```

**New Code**:
```typescript
bullmqService.createQueue('task-queue', {
        connection: redisClient,
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      })
```


### src/services/jobQueue.standardized.ts:17:1
**Description**: Standardize BullMQ imports

**Old Code**:
```typescript
import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
```

**New Code**:
```typescript
import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
```


### src/services/jobQueue.standardized.ts:18:1
**Description**: Replace direct BullMQ type imports with standardized type imports

**Old Code**:
```typescript
import type { JobOptions } from 'bullmq';
```

**New Code**:
```typescript
import type { JobOptions } from '../types/bullmq/index.standardized.js';
```


### src/services/bullmqService.ts:8:1
**Description**: Standardize BullMQ imports

**Old Code**:
```typescript
import { Queue, Worker, QueueScheduler } from 'bullmq';
```

**New Code**:
```typescript
import { Queue, Worker, QueueScheduler } from 'bullmq';
```


### src/services/bullmqService.ts:9:1
**Description**: Replace direct BullMQ type imports with standardized type imports

**Old Code**:
```typescript
import type { ConnectionOptions, JobsOptions } from 'bullmq';
```

**New Code**:
```typescript
import type { ConnectionOptions, JobsOptions } from '../types/bullmq/index.standardized.js';
```


### src/services/bullmqService.ts:146:17
**Description**: Use standardized service to create Queue

**Old Code**:
```typescript
new Queue(queueName, {
    connection: redisClient,
    ...options,
  })
```

**New Code**:
```typescript
bullmqService.createQueue(queueName, {
    connection: redisClient,
    ...options,
  })
```


### src/services/bullmqService.ts:181:21
**Description**: Use standardized service to create QueueScheduler

**Old Code**:
```typescript
new QueueScheduler(queueName, {
    connection: redisClient,
    ...options,
  })
```

**New Code**:
```typescript
bullmqService.createScheduler(queueName, {
    connection: redisClient,
    ...options,
  })
```


### src/services/bullmqService.standardized.ts:8:1
**Description**: Standardize BullMQ imports

**Old Code**:
```typescript
import { Queue, Worker, QueueScheduler, QueueEvents } from 'bullmq';
```

**New Code**:
```typescript
import { Queue, Worker, QueueScheduler, QueueEvents } from 'bullmq';
```


### src/services/bullmqService.standardized.ts:9:1
**Description**: Replace direct BullMQ type imports with standardized type imports

**Old Code**:
```typescript
import type { ConnectionOptions, JobsOptions } from 'bullmq';
```

**New Code**:
```typescript
import type { ConnectionOptions, JobsOptions } from '../types/bullmq/index.standardized.js';
```


### src/services/bullmqService.standardized.ts:110:17
**Description**: Use standardized service to create Queue

**Old Code**:
```typescript
new Queue(queueName as string, getQueueConfig(options))
```

**New Code**:
```typescript
bullmqService.createQueue(queueName as string, getQueueConfig(options))
```


### src/services/bullmqService.standardized.ts:144:18
**Description**: Use standardized service to create Worker

**Old Code**:
```typescript
new Worker(queueName as string, processor, getWorkerConfig(options))
```

**New Code**:
```typescript
bullmqService.createWorker(queueName as string, processor, processor)
```


### src/services/bullmqService.standardized.ts:176:21
**Description**: Use standardized service to create QueueScheduler

**Old Code**:
```typescript
new QueueScheduler(queueName, getSchedulerConfig(options))
```

**New Code**:
```typescript
bullmqService.createScheduler(queueName, getSchedulerConfig(options))
```


### src/services/bullmqService.standardized.ts:208:18
**Description**: Use standardized service to create QueueEvents

**Old Code**:
```typescript
new QueueEvents(queueName, {
    connection: getRedisClient(),
    ...options,
  })
```

**New Code**:
```typescript
bullmqService.createQueueEvents(queueName, {
    connection: getRedisClient(),
    ...options,
  })
```


### src/config/bullmq.config.ts:9:1
**Description**: Replace direct BullMQ type imports with standardized type imports

**Old Code**:
```typescript
import type { ConnectionOptions, JobsOptions } from 'bullmq';
```

**New Code**:
```typescript
import type { ConnectionOptions, JobsOptions } from '../types/bullmq/index.standardized.js';
```


### src/types/bullmq/index.standardized.ts:15:1
**Description**: Replace direct BullMQ type imports with standardized type imports

**Old Code**:
```typescript
import type {
  Queue,
  Worker,
  QueueScheduler,
  QueueEvents,
  Job,
  ConnectionOptions,
  JobsOptions,
  JobOptions,
  Processor,
  WorkerOptions,
  QueueSchedulerOptions,
  QueueEventsOptions,
  QueueOptions
} from 'bullmq';
```

**New Code**:
```typescript
import type { Queue, Worker, QueueScheduler, QueueEvents, Job, ConnectionOptions, JobsOptions, JobOptions, Processor, WorkerOptions, QueueSchedulerOptions, QueueEventsOptions, QueueOptions } from '../types/bullmq/index.standardized.js';
```


## Migration Steps

1. Add the standardized BullMQ service import to files that need it:
```typescript
import * as bullmqService from '../services/bullmqService.standardized.js';
```

2. Replace direct BullMQ imports with standardized imports
3. Replace direct BullMQ class instantiations with standardized service calls
4. Update type imports to use the standardized types
5. Test thoroughly after each change

## Files to Review

- src/services/queueManager.ts
- src/services/jobQueue.ts
- src/services/jobQueue.standardized.ts
- src/services/bullmqService.ts
- src/services/bullmqService.standardized.ts
- src/config/bullmq.config.ts
- src/types/bullmq/index.standardized.ts
