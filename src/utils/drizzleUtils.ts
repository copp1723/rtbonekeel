import { sql, and, eq, isNull } from './drizzleImports.js';
import type { PgColumn } from 'drizzle-orm/pg-core';

export function safeEq<T>(column: PgColumn, value: T): SQL<unknown> {
  return sql`${column} = ${value}`;
}

export function safeAnd(...conditions: SQL<unknown>[]): SQL<unknown> {
  return sql`(${conditions.join(' AND ')})`;
}

export function safeOr(...conditions: SQL<unknown>[]): SQL<unknown> {
  return sql`(${conditions.join(' OR ')})`;
}
