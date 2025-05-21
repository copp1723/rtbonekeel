import { db } from '../index.js';
import type { PgTable } from './drizzleImports.js';
import type { QueryResultRow } from 'pg';
import { sql } from '../index.js';

// Export QueryCondition type for use in other files
export type QueryCondition = {
  key: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'NOT IN';
  value: unknown;
};

interface QueryResult<R> {
  rows: R[];
}

export class DrizzleWrapper<T extends PgTable, R extends QueryResultRow> {
  constructor(private table: T) {}

  private async executeQuery(queryText: string, values: unknown[]): Promise<R[]> {
    // For now, we'll use a simplified approach that doesn't use the values directly
    // This is a temporary solution until we can properly integrate with Drizzle ORM
    const sqlQuery = sql.raw(queryText);

    // Log the query for debugging
    console.log('Executing query:', queryText, 'with values:', values);

    // Execute the query
    const result = await db.execute(sqlQuery);
    
    // We need to cast the result to the expected type
    // This is a type assertion that should be replaced with proper type checking
    // when we fully integrate with Drizzle ORM
    if (!Array.isArray(result)) {
      return [];
    }
    
    return result as R[];
  }

  async findOne(conditions: QueryCondition[]): Promise<R | null> {
    const whereClause = conditions.map(c =>
      `${c.key} ${c.operator} $${conditions.indexOf(c) + 1}`
    ).join(' AND ');

    const sql = `SELECT * FROM ${String(this.table._.name)} WHERE ${whereClause} LIMIT 1`;
    const values = conditions.map(c => c.value);

    const results = await this.executeQuery(sql, values);
    return results[0] || null;
  }

  async find(conditions: QueryCondition[], limit?: number): Promise<R[]> {
    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.map(c =>
          `${c.key} ${c.operator} $${conditions.indexOf(c) + 1}`
        ).join(' AND ')}`
      : '';

    const limitClause = limit ? `LIMIT ${limit}` : '';
    const sql = `SELECT * FROM ${String(this.table._.name)} ${whereClause} ${limitClause}`;
    const values = conditions.map(c => c.value);

    return this.executeQuery(sql, values);
  }

  async findMany(conditions: QueryCondition[] = [], limit = 100): Promise<R[]> {
    const whereClause = conditions.length
      ? `WHERE ${conditions.map(c =>
          `${c.key} ${c.operator} $${conditions.indexOf(c) + 1}`
        ).join(' AND ')}`
      : '';

    const values = conditions.map(c => c.value);

    return await this.executeQuery(
      `SELECT * FROM ${String(this.table._.name)} ${whereClause} LIMIT ${limit}`,
      values
    );
  }

  async getById(id: string): Promise<R | null> {
    const sql = `SELECT * FROM ${String(this.table._.name)} WHERE id = $1 LIMIT 1`;
    const values = [id];

    const results = await this.executeQuery(sql, values);
    return results[0] || null;
  }

  async getByKey<K extends keyof R>(key: K, value: R[K]): Promise<R | null> {
    const sql = `SELECT * FROM ${String(this.table._.name)} WHERE ${String(key)} = $1 LIMIT 1`;
    const values = [value];

    const results = await this.executeQuery(sql, values);
    return results[0] || null;
  }

  async getManyByKey<K extends keyof R>(key: K, value: R[K]): Promise<R[]> {
    const sql = `SELECT * FROM ${String(this.table._.name)} WHERE ${String(key)} = $1`;
    const values = [value];

    return this.executeQuery(sql, values);
  }

  async update(conditions: QueryCondition[], updates: Partial<R>): Promise<void> {
    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const whereClause = conditions
      .map((c, i) => `${c.key} ${c.operator} $${Object.keys(updates).length + i + 1}`)
      .join(' AND ');

    const values = [...Object.values(updates), ...conditions.map(c => c.value)];

    await this.executeQuery(
      `UPDATE ${String(this.table._.name)} SET ${setClause} WHERE ${whereClause}`,
      values
    );
  }

  async insert(data: Omit<R, 'id' | 'createdAt' | 'updatedAt'>): Promise<R> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map((_, i) => `$${i + 1}`)
      .join(', ');

    const [result] = await this.executeQuery(
      `INSERT INTO ${String(this.table._.name)} (${columns}) VALUES (${placeholders}) RETURNING *`,
      Object.values(data)
    );

    return result;
  }

  async delete(conditions: QueryCondition[]): Promise<void> {
    const whereClause = conditions
      .map((c, i) => `${c.key} ${c.operator} $${i + 1}`)
      .join(' AND ');

    await this.executeQuery(
      `DELETE FROM ${String(this.table._.name)} WHERE ${whereClause}`,
      conditions.map(c => c.value)
    );
  }
}
