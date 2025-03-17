# Dealership Verification System Diagrams

This directory contains three Mermaid diagrams that visualize different aspects of the dealership verification system:

1. **Project Architecture Diagram** (`project_diagram.md`)
2. **Database Schema Diagram** (`database_schema.md`)
3. **Extraction Process Flow Diagram** (`extraction_flow.md`)

## Viewing the Diagrams

These diagrams are created using [Mermaid](https://mermaid-js.github.io/mermaid/), a JavaScript-based diagramming and charting tool that renders Markdown-inspired text definitions to create diagrams.

### Option 1: View in GitHub

If you push these files to GitHub, the Mermaid diagrams will be automatically rendered in the GitHub interface when viewing the markdown files.

### Option 2: View in VS Code

To view these diagrams in VS Code:

1. Install the "Markdown Preview Mermaid Support" extension
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "Markdown Preview Mermaid Support"
   - Install the extension

2. Open any of the diagram markdown files
3. Click the "Open Preview" button in the top-right corner of the editor (or press Ctrl+Shift+V or Cmd+Shift+V)
4. The diagram will be rendered in the preview pane

### Option 3: Use the Mermaid Live Editor

You can copy the Mermaid code from any of the diagram files and paste it into the [Mermaid Live Editor](https://mermaid.live/) to view and edit the diagrams.

## Diagram Descriptions

### 1. Project Architecture Diagram

This diagram illustrates the overall architecture of the dealership verification system, showing:

- Main application components
- Database components
- Verification components
- Extractor components
- Utility components
- Relationships between components

It provides a high-level overview of how the different parts of the system interact with each other.

### 2. Database Schema Diagram

This diagram shows the database schema for the dealership verification system, including:

- Tables and their attributes
- Primary and foreign keys
- Relationships between tables

It uses the Entity-Relationship Diagram (ERD) notation to visualize the database structure.

### 3. Extraction Process Flow Diagram

This diagram illustrates the extraction process flow for gathering dealership information, showing:

- The verification workflow
- How different extractors are selected and used
- The decision points in the hybrid extraction approach
- The contact and staff extraction processes
- Data storage and job completion

It provides a detailed view of how the system extracts and processes dealership information.

## Updating the Diagrams

If you need to update these diagrams:

1. Edit the Mermaid code in the respective markdown files
2. Use one of the viewing options above to preview your changes
3. Save the updated files

For more information on Mermaid syntax, refer to the [Mermaid documentation](https://mermaid-js.github.io/mermaid/).
