/**
 * Parser Module
 *
 * Exports all parser-related classes and functions.
 * Initializes the ParserFactory with all available parsers.
 */

// Export interfaces and types
export { FileType, ParserOptions, ParserResult } from './base/types.js.js';
export { IParser } from './base/IParser.js.js';

// Export error classes
export {
  ParserError,
  ValidationError,
  FileNotFoundError,
  UnsupportedFileTypeError,
  ParseError,
  DuplicateFileError,
} from './errors/ParserError.js.js';

// Export base parser
export { BaseParser } from './base/BaseParser.js.js';

// Export specific parsers
export { CSVParser, CSVParserOptions } from './implementations/CSVParser.js.js';
export { XLSXParser, XLSXParserOptions } from './implementations/XLSXParser.js.js';
export { PDFParser, PDFParserOptions, PDFExtractionMode } from './implementations/PDFParser.js.js';

// Export factory
export { ParserFactory } from './factory/ParserFactory.js.js';

// Export utilities
export * from './utils/fileUtils.js.js';

// Import parsers for registration
import { ParserFactory } from './factory/ParserFactory.js.js';
import type { FileType } from './base/types.js.js';
import { CSVParser } from './implementations/CSVParser.js.js';
import { XLSXParser } from './implementations/XLSXParser.js.js';
import { PDFParser } from './implementations/PDFParser.js.js';

// Register all parsers with the factory
ParserFactory.registerParser(FileType.CSV, CSVParser);
ParserFactory.registerParser(FileType.XLSX, XLSXParser);
ParserFactory.registerParser(FileType.XLS, XLSXParser);
ParserFactory.registerParser(FileType.PDF, PDFParser);

/**
 * Parse a file using the appropriate parser
 *
 * @param filePath - Path to the file to parse
 * @param options - Optional parsing options
 * @returns Promise resolving to the parsing result
 */
export async function parseFile(filePath: string, options: ParserOptions = {}) {
  const parser = ParserFactory.createParserForFile(filePath);
  return parser.parseFile(filePath, options);
}

/**
 * Parse a file using the appropriate parser, with deduplication check
 *
 * @param filePath - Path to the file to parse
 * @param options - Optional parsing options
 * @returns Promise resolving to the parsing result
 */
export async function parseFileWithDeduplication(
  filePath: string,
  options: ParserOptions & {
    checkDuplicates?: boolean,
    metadata?: Record<string, any>
  } = {}
) {
  const parser = await ParserFactory.createParserForFileWithDeduplication(
    filePath,
    {
      checkDuplicates: options.checkDuplicates,
      metadata: options.metadata
    }
  );
  return parser.parseFile(filePath, options);
}

/**
 * Get a parser for a specific file type
 *
 * @param fileType - File type to get a parser for
 * @returns Parser instance
 */
export function getParser(fileType: FileType) {
  return ParserFactory.createParser(fileType);
}

/**
 * Get a parser for a specific file
 *
 * @param filePath - Path to the file
 * @returns Parser instance
 */
export function getParserForFile(filePath: string) {
  return ParserFactory.createParserForFile(filePath);
}
