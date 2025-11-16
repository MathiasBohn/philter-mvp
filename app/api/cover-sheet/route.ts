import { NextRequest, NextResponse } from "next/server";
import { mockApplications } from "@/lib/mock-data/applications";
import { createCoverSheetData } from "@/lib/pdf-utils";

/**
 * API endpoint for generating cover sheet data
 * GET /api/cover-sheet?applicationId={id}&category={category}
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get("applicationId");
    const category = searchParams.get("category");

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 }
      );
    }

    // Find the application
    const application = mockApplications.find((app) => app.id === applicationId);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Create cover sheet data
    const coverSheetData = createCoverSheetData(application, category);

    return NextResponse.json({
      success: true,
      data: coverSheetData,
    });
  } catch (error) {
    console.error("Error generating cover sheet data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
