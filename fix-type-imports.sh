#!/bin/bash

echo "Fixing type-only imports for verbatimModuleSyntax..."

# Common type imports that should be converted to type-only imports
find src -type f -name "*.ts" -exec sed -i 's/import { \(.*\)Request\(.*\) } from/import type { \1Request\2 } from/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { \(.*\)Response\(.*\) } from/import type { \1Response\2 } from/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { \(.*\)NextFunction\(.*\) } from/import type { \1NextFunction\2 } from/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { InferInsertModel/import type { InferInsertModel/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { InferSelectModel/import type { InferSelectModel/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { \(.*\)Sql\(.*\) } from/import type { \1Sql\2 } from/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { \(.*\)Type\(.*\) } from/import type { \1Type\2 } from/g' {} \; 2>/dev/null || true
find src -type f -name "*.ts" -exec sed -i 's/import { \(.*\)Interface\(.*\) } from/import type { \1Interface\2 } from/g' {} \; 2>/dev/null || true

echo "Type-only imports fixed!"
