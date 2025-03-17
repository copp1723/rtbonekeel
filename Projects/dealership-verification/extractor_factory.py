"""
Extractor Factory

This module provides a factory for creating the appropriate contact extractor
based on configuration settings. It simplifies integration with the existing codebase.
"""

from config import Config
import importlib
import logging

logger = logging.getLogger(__name__)

class ExtractorFactory:
    """Factory for creating contact extractors based on config settings"""
    
    @staticmethod
    def create_extractor(extractor_type=None, api_key=None, hybrid_mode=None):
        """
        Create an extractor of the specified type
        
        Args:
            extractor_type (str): Type of extractor to create. Options:
                - "selenium": Original Selenium extractor
                - "undetected": Undetected ChromeDriver extractor
                - "firecrawl": Firecrawl API extractor
                - "hybrid": Super hybrid extractor (default)
            api_key (str): Firecrawl API key (required for firecrawl and hybrid types)
            hybrid_mode (str): Mode for hybrid extractor. Options:
                - "auto": Use firecrawl only when needed (default)
                - "fallback": Use firecrawl only on selenium failures
                - "combine": Always use both methods for best results
                
        Returns:
            obj: The extractor instance
        """
        # Use config defaults if not specified
        if extractor_type is None:
            extractor_type = Config.EXTRACTOR_TYPE
            
        if api_key is None:
            api_key = Config.FIRECRAWL_API_KEY
            
        if hybrid_mode is None:
            hybrid_mode = Config.HYBRID_MODE
        
        logger.info(f"Creating extractor of type: {extractor_type}")
        
        if extractor_type == "selenium":
            # Import here to avoid circular imports
            try:
                from contact_extractor import ContactExtractor
                return ContactExtractor(headless=True)
            except (ImportError, SyntaxError) as e:
                logger.error(f"Failed to import ContactExtractor: {str(e)}")
                raise ImportError(f"Failed to import ContactExtractor: {str(e)}")
                
        elif extractor_type == "undetected":
            try:
                from undetected_extractor import UndetectedExtractor
                return UndetectedExtractor(headless=True)
            except ImportError as e:
                logger.error(f"Failed to import UndetectedExtractor: {str(e)}")
                raise ImportError(f"Failed to import UndetectedExtractor. Make sure undetected-chromedriver is installed: {str(e)}")
                
        elif extractor_type == "firecrawl":
            try:
                # Try both possible module names
                try:
                    from firecrawl_extractor_simple import FirecrawlExtractor
                except ImportError:
                    from firecrawl_extractor import FirecrawlExtractor
                    
                if not api_key:
                    raise ValueError("Firecrawl API key is required for firecrawl extractor")
                    
                return FirecrawlExtractor(api_key=api_key)
            except ImportError as e:
                logger.error(f"Failed to import FirecrawlExtractor: {str(e)}")
                raise ImportError(f"Failed to import FirecrawlExtractor. Make sure firecrawl is installed: {str(e)}")
                
        elif extractor_type == "hybrid":
            try:
                from super_hybrid_extractor import SuperHybridExtractor
                
                if not api_key:
                    raise ValueError("Firecrawl API key is required for hybrid extractor")
                    
                return SuperHybridExtractor(
                    api_key=api_key,
                    mode=hybrid_mode,
                    headless=True
                )
            except ImportError as e:
                logger.error(f"Failed to import SuperHybridExtractor: {str(e)}")
                raise ImportError(f"Failed to import SuperHybridExtractor: {str(e)}")
        
        else:
            raise ValueError(f"Unknown extractor type: {extractor_type}")