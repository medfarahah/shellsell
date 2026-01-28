import { NextResponse } from "next/server";
import { chatWithAssistant } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { name, category } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    const prompt = [
      "You are an expert e-commerce copywriter.",
      "Write a concise, high-converting product description for an online store.",
      "Use 2–4 short paragraphs, friendly tone, highlight key benefits and main features.",
      "Do not include headings or bullet points, just plain text.",
      "",
      `Product name: ${name}`,
      category ? `Category: ${category}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const message = await chatWithAssistant(prompt);
    const description =
      typeof message?.content === "string"
        ? message.content
        : Array.isArray(message?.content)
        ? message.content.map((c) => c.text || c).join("\n")
        : "";

    if (!description.trim()) {
      return NextResponse.json(
        { error: "AI did not return a description" },
        { status: 500 },
      );
    }

    return NextResponse.json({ description: description.trim() });
  } catch (error) {
    console.error("AI description error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 },
    );
  }
}

