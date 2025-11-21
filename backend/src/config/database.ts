import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { config } from './env';

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.maxConnections,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection health check utility
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Transaction helper function with enhanced error handling and logging
export async function executeInTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
  operationName?: string
): Promise<T> {
  const client = await pool.connect();
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  try {
    await client.query('BEGIN');
    
    if (operationName) {
      console.log(`[${transactionId}] Transaction started: ${operationName}`);
    }
    
    const result = await operation(client);
    await client.query('COMMIT');
    
    const duration = Date.now() - startTime;
    if (operationName) {
      console.log(`[${transactionId}] Transaction committed: ${operationName} (${duration}ms)`);
    }
    
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    
    const duration = Date.now() - startTime;
    const errorLog = {
      transactionId,
      operationName: operationName || 'unknown',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('Transaction rollback:', JSON.stringify(errorLog, null, 2));
    
    throw error;
  } finally {
    client.release();
  }
}

// Transaction wrapper with retry logic for deadlock scenarios
export async function executeInTransactionWithRetry<T>(
  operation: (client: PoolClient) => Promise<T>,
  operationName?: string,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeInTransaction(operation, operationName);
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a deadlock or serialization failure (PostgreSQL error codes)
      const isRetryable = error.code === '40P01' || error.code === '40001';
      
      if (isRetryable && attempt < maxRetries) {
        const backoffMs = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        console.warn(
          `Transaction retry ${attempt}/${maxRetries} for ${operationName || 'unknown'} ` +
          `after ${backoffMs}ms (error: ${error.code})`
        );
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      
      // Not retryable or max retries reached
      break;
    }
  }
  
  throw lastError;
}

// Query helper function
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

// Get a client from the pool for manual transaction management
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export default pool;
