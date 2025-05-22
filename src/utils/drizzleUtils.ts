import { sql } from './drizzleImports.js';
import type { SQL } from 'drizzle-orm';

export function safeEq<T>(column: SQL | PgColumn, value: T): SQL {
  return sql`${column} = ${value}`;
}

export function safeAnd(...conditions: SQL[]): SQL {
  return sql.join(conditions, ' AND ');
}

export function safeOr(...conditions: SQL[]): SQL {
  return sql.join(conditions, ' OR ');
}
