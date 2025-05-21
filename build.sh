#!/bin/bash
set -e

echo "Running TypeScript type checking..."
npx tsc --noEmit

echo "Cleaning dist directory..."
rm -rf dist

echo "Compiling TypeScript..."
npx tsc --skipLibCheck

echo "Build completed!"