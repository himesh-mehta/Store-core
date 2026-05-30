import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const sampleProducts = [
      {
        name: "Technical Backpack",
        description:
          "A minimalist technical backpack designed for the modern professional. Water-resistant and modular.",
        price: 129.99,
        category: "Accessories",
        image_url:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
        stock: 50,
        rating: 4.8,
      },
      {
        name: "Ergonomic Desk Chair",
        description:
          "Experience maximum comfort with our flagship ergonomic chair. Engineered for clarity and posture.",
        price: 499.0,
        category: "Home",
        image_url:
          "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=800",
        stock: 20,
        rating: 4.9,
      },
      {
        name: "Ghost Structure Lamp",
        description:
          "Thin gray borders and ultra-bright LED. The perfect desk companion for structural clarity.",
        price: 75.5,
        category: "Home",
        image_url:
          "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800",
        stock: 100,
        rating: 4.7,
      },
      {
        name: "Technical Headphones",
        description:
          "High-resolution audio with active noise cancellation. Technical polish for your ears.",
        price: 249.0,
        category: "Electronics",
        image_url:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
        stock: 35,
        rating: 4.6,
      },
      {
        name: "Minimalist Watch",
        description:
          "Inter-inspired typography on a pure white canvas face. Expensive feel, lightweight design.",
        price: 180.0,
        category: "Accessories",
        image_url:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
        stock: 15,
        rating: 4.5,
      },
    ];

    for (const p of sampleProducts) {
      await sql`
        INSERT INTO products (name, description, price, category, image_url, stock, rating)
        VALUES (${p.name}, ${p.description}, ${p.price}, ${p.category}, ${p.image_url}, ${p.stock}, ${p.rating})
      `;
    }

    return Response.json({ message: "Seed successful" });
  } catch (err) {
    console.error("Seed error:", err);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
