import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");
    const category = searchParams.get("category"); // Legacy support

    if (!categorySlug && !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category slug or category name is required",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("vom_sauterhof");
    const wurfCollection = db.collection("wurf");
    const categoriesCollection = db.collection("wurf_categories");

    let wurf;
    let categoryData;

    if (categorySlug) {
      // New way: use category slug
      wurf = await wurfCollection.findOne({
        categorySlug,
        status: "published",
      });
      categoryData = await categoriesCollection.findOne({ slug: categorySlug });
    } else {
      // Legacy way: use category name
      wurf = await wurfCollection.findOne({
        category,
        status: "published",
      });
    }

    if (!wurf) {
      return NextResponse.json(
        { success: false, message: "Wurf not found" },
        { status: 404 }
      );
    }

    const transformedWurf = {
      id: wurf._id.toString(),
      name: wurf.name,
      information: wurf.information,
      image: wurf.image || "",
      category: wurf.category || "",
      categorySlug: wurf.categorySlug || "",
      documents: wurf.documents || {},
      slug: wurf.slug,
      status: wurf.status,
    };

    return NextResponse.json({
      success: true,
      wurf: transformedWurf,
      categoryData: categoryData
        ? {
            id: categoryData._id.toString(),
            name: categoryData.name,
            description: categoryData.description,
            slug: categoryData.slug,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching wurf by category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wurf" },
      { status: 500 }
    );
  }
}
