# Sample PDF Directory

This directory is for storing sample PDF files used for testing the PDF viewer component.

## Adding Sample PDFs

To test the PDF viewer, add PDF files to this directory. You can use:

1. **Sample application package PDFs** - For testing the board review functionality
2. **Sample document uploads** - For testing document preview features
3. **Multi-page PDFs** - For testing page navigation and thumbnails
4. **Various PDF sizes** - For testing zoom and fit modes

## Suggested Test Files

- `sample-application.pdf` - A mock board package/application
- `sample-bank-statement.pdf` - A sample financial document
- `sample-tax-return.pdf` - A sample tax document
- `sample-id.pdf` - A sample government ID

## File Naming Convention

Use descriptive names that indicate the document type:
- `{document-type}-{description}.pdf`

## Maximum File Size

Keep test files under 10MB for optimal performance.

## Usage in Code

```tsx
import { PdfViewer } from "@/components/shared/pdf-viewer";

<PdfViewer url="/samples/sample-application.pdf" />
```

## Notes

- PDF files in this directory are for development/testing only
- Do not commit sensitive or real documents
- You can download free sample PDFs from various sources online for testing
