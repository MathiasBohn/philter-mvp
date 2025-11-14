import { PdfViewer } from "@/components/shared/pdf-viewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPdfPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">PDF Viewer Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test the PDF viewer component with sample documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            To test the PDF viewer, add sample PDF files to the <code className="text-sm bg-muted px-1 py-0.5 rounded">public/samples/</code> directory.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Features Implemented:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Page navigation (Previous, Next, Jump to page)</li>
              <li>Zoom controls (Zoom in, Zoom out, Fit to width, Fit to page)</li>
              <li>Page rotation (90° clockwise)</li>
              <li>Thumbnail navigation sidebar (desktop only)</li>
              <li>Open in new tab</li>
              <li>Loading and error states</li>
              <li>Responsive full-height layout</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Usage Example:</h3>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { PdfViewer } from "@/components/shared/pdf-viewer";

<PdfViewer
  url="/samples/your-document.pdf"
  showThumbnails={true}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Demo</CardTitle>
          <CardDescription>
            PDF viewer displaying <code className="text-sm bg-muted px-1 py-0.5 rounded">public/samples/sample.pdf</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] border rounded-lg overflow-hidden">
            <PdfViewer url="/samples/sample.pdf" showThumbnails={true} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Download Sample PDFs</CardTitle>
          <CardDescription>
            You can download free sample PDFs from these sources:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                W3C Sample PDF (1 page)
              </a>
            </li>
            <li>
              <a
                href="https://www.africau.edu/images/default/sample.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sample Multi-page PDF
              </a>
            </li>
            <li className="text-muted-foreground">
              Download any of these and save to <code className="bg-muted px-1 py-0.5 rounded">public/samples/sample.pdf</code>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
