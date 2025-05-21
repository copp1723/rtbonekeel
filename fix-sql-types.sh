#!/bin/bash
set -e

echo "Fixing SQL type definitions..."

# Create a SQL type definition file
mkdir -p src/types/sql
cat > src/types/sql/index.d.ts << 'EOL'
declare module 'postgres' {
  export interface Sql {
    <T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]>;
    identifier(name: string): string;
    raw(query: string, params?: any[]): { query: string; params: any[] };
  }
  
  export interface PgColumn {
    name: string;
    table: string;
    type: string;
  }
  
  export interface PgTable {
    name: string;
    schema: string;
    columns: PgColumn[];
  }
  
  export type SQL<T = unknown> = { type: 'sql', sql: string, values: any[] };
}

// Add SQL type to global namespace
declare global {
  type SQL<T = unknown> = import('postgres').SQL<T>;
}
EOL

# Fix SQL type references in drizzleUtils.ts
find src -type f -name "drizzleUtils.ts" | xargs sed -i 's/SQL<unknown>/import("postgres").SQL<unknown>/g'

echo "SQL type definitions fixed!"