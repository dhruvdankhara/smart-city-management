import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/db";
import { ComplaintCategory } from "@/models";
import { apiResponse, apiError, authorize } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const auth = authorize(req, "citizen");
    if (!auth) return apiError("Unauthorized", 401);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return apiError("AI service not configured", 500);

    const { title, description } = await req.json();

    if (!title && !description) {
      return apiError("Title or description is required", 400);
    }

    await connectDB();

    // Fetch all categories with department names
    const categories = await ComplaintCategory.find()
      .populate("departmentId", "name")
      .lean();

    const categoryList = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      department: (cat as any).departmentId?.name || "Unknown",
    }));

    const prompt = `You are a smart city complaint classifier. Based on the complaint title and description, suggest the most appropriate category and priority level.

Available categories:
${categoryList.map((c) => `- ID: "${c.id}" | Name: "${c.name}" | Department: "${c.department}"`).join("\n")}

Priority levels: "low", "medium", "high", "critical"
- low: Minor inconvenience, no safety risk
- medium: Moderate issue affecting daily life
- high: Serious issue affecting safety or many people
- critical: Emergency, immediate danger to life or property

Complaint Title: "${title || ""}"
Complaint Description: "${description || ""}"

Respond ONLY with valid JSON in this exact format, no markdown or extra text:
{"categoryId": "<category_id>", "priority": "<priority_level>"}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON from response (handle potential markdown wrapping)
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate the response
    const validCategoryIds = categoryList.map((c) => c.id);
    const validPriorities = ["low", "medium", "high", "critical"];

    if (!validCategoryIds.includes(parsed.categoryId)) {
      parsed.categoryId = "";
    }
    if (!validPriorities.includes(parsed.priority)) {
      parsed.priority = "medium";
    }

    return apiResponse(
      { categoryId: parsed.categoryId, priority: parsed.priority },
      "AI classification successful",
    );
  } catch (error) {
    console.error("AI classify error:", error);
    return apiError("AI classification failed. Please select manually.", 500);
  }
}
