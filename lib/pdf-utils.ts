import { jsPDF } from "jspdf";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import type { Application } from "./types";

export interface CoverSheetData {
  buildingName: string;
  buildingAddress: string;
  applicantName: string;
  applicationId: string;
  documentCategory: string;
  date: string;
}

/**
 * Generate a PDF cover sheet for a document category
 */
export function generateCoverSheet(data: CoverSheetData): jsPDF {
  // Create new PDF document (letter size: 8.5" x 11")
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: "letter",
  });

  // Set font
  doc.setFont("helvetica");

  // Add title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Document Cover Sheet", 4.25, 1, { align: "center" });

  // Add horizontal line
  doc.setLineWidth(0.02);
  doc.line(1, 1.3, 7.5, 1.3);

  // Building Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Building Information", 1, 1.8);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.buildingName}`, 1.3, 2.2);
  doc.text(`Address: ${data.buildingAddress}`, 1.3, 2.5);

  // Applicant Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Applicant Information", 1, 3.2);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${data.applicantName}`, 1.3, 3.6);
  doc.text(`Application ID: ${data.applicationId}`, 1.3, 3.9);

  // Document Category
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Document Category", 1, 4.6);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.documentCategory, 1.3, 5.1);

  // Date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${data.date}`, 1.3, 5.5);

  // Instructions box
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Instructions", 1, 6.5);

  // Draw instruction box
  doc.setLineWidth(0.01);
  doc.rect(1, 6.7, 6.5, 1.5);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const instructions = doc.splitTextToSize(
    `Please attach this cover sheet to ${data.documentCategory} and submit as part of your application package for ${data.buildingName}.`,
    6.3
  );
  doc.text(instructions, 1.1, 7.0);

  // Footer note
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This cover sheet helps ensure your documents are properly categorized and associated with your application.",
    4.25,
    10,
    { align: "center" }
  );

  return doc;
}

/**
 * Download a PDF cover sheet for a document category
 */
export function downloadCoverSheet(data: CoverSheetData): void {
  const doc = generateCoverSheet(data);
  const filename = `cover-sheet-${data.documentCategory
    .toLowerCase()
    .replace(/\s+/g, "-")}-${data.applicationId}.pdf`;
  doc.save(filename);
}

/**
 * Helper function to create cover sheet data from application
 */
export function createCoverSheetData(
  application: Application,
  documentCategory: string
): CoverSheetData {
  const applicantName = application.people[0]?.fullName || "Unknown Applicant";
  const buildingName = application.building?.name || "Unknown Building";
  const buildingAddress = application.building?.address
    ? `${application.building.address.street}, ${application.building.address.city}, ${application.building.address.state} ${application.building.address.zip}`
    : "Unknown Address";

  return {
    buildingName,
    buildingAddress,
    applicantName,
    applicationId: application.id,
    documentCategory,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export interface WatermarkData {
  buildingName: string;
  applicationId: string;
  downloadDate: string;
  boardMemberName?: string;
}

/**
 * Add watermark to a PDF file for board review
 * @param pdfBytes - The original PDF file as Uint8Array
 * @param watermarkData - Data to include in the watermark
 * @returns The watermarked PDF as Uint8Array
 */
export async function addBoardWatermark(
  pdfBytes: Uint8Array,
  watermarkData: WatermarkData
): Promise<Uint8Array> {
  // Load the PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  // Build watermark text
  const watermarkLines = [
    "CONFIDENTIAL - BOARD REVIEW ONLY",
    watermarkData.buildingName,
    `Application ID: ${watermarkData.applicationId}`,
    `Downloaded: ${watermarkData.downloadDate}`,
  ];

  if (watermarkData.boardMemberName) {
    watermarkLines.push(`Board Member: ${watermarkData.boardMemberName}`);
  }

  const watermarkText = watermarkLines.join(" | ");

  // Add watermark to each page
  for (const page of pages) {
    const { width, height } = page.getSize();

    // Calculate position for diagonal watermark
    const fontSize = 14;
    const textWidth = watermarkText.length * fontSize * 0.5; // Approximate text width

    // Position watermark diagonally across the page
    const x = width / 2 - textWidth / 2;
    const y = height / 2;

    // Add the watermark with transparency and rotation
    page.drawText(watermarkText, {
      x,
      y,
      size: fontSize,
      color: rgb(0.5, 0.5, 0.5), // Gray color
      opacity: 0.3, // 30% opacity for subtle appearance
      rotate: degrees(-45), // Diagonal orientation
    });
  }

  // Save the modified PDF
  const modifiedPdfBytes = await pdfDoc.save();
  return modifiedPdfBytes;
}

/**
 * Create watermark data from application for board download
 */
export function createBoardWatermarkData(
  application: Application,
  boardMemberName?: string
): WatermarkData {
  const buildingName = application.building?.name || "Unknown Building";

  return {
    buildingName,
    applicationId: application.id,
    downloadDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    boardMemberName,
  };
}

/**
 * Apply watermark to PDF blob and return as downloadable blob
 * @param pdfBlob - The original PDF as a Blob
 * @param watermarkData - Watermark data
 * @returns Promise of watermarked PDF Blob
 */
export async function watermarkPDFBlob(
  pdfBlob: Blob,
  watermarkData: WatermarkData
): Promise<Blob> {
  // Convert Blob to ArrayBuffer
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);

  // Add watermark
  const watermarkedBytes = await addBoardWatermark(pdfBytes, watermarkData);

  // Return as Blob - convert to regular Uint8Array first
  const regularArray = new Uint8Array(watermarkedBytes);
  return new Blob([regularArray], { type: "application/pdf" });
}
