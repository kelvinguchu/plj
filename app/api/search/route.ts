import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SearchResult {
  type: "blog" | "service" | "page";
  title: string;
  url: string;
  description?: string;
  excerpt?: string;
  date?: string;
  slug?: string;
}

interface StaticPage {
  title: string;
  url: string;
  description: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("q");

  if (!searchQuery) {
    return NextResponse.json({
      results: [] as SearchResult[],
    });
  }

  try {
    // Search in blog posts
    const postsRef = collection(db, "posts");
    const postsSnapshot = await getDocs(postsRef);

    // Search in services
    const servicesRef = collection(db, "services");
    const servicesSnapshot = await getDocs(servicesRef);

    const results: SearchResult[] = [];

    // Add matching blog posts
    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.content?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        results.push({
          type: "blog",
          title: data.title,
          url: `/news/${data.slug || doc.id}`,
          excerpt: data.excerpt || data.content?.substring(0, 160) + "...",
          date: data.date,
        });
      }
    });

    // Add matching services
    servicesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        results.push({
          type: "service",
          title: data.title,
          url: `/services/${data.slug || doc.id}`,
          description: data.description,
        });
      }
    });

    // Add static pages if they match
    const staticPages: StaticPage[] = [
      {
        title: "Home",
        url: "/",
        description:
          "Digital Specialists helping ambitious brands in Africa and globally push boundaries",
      },
      {
        title: "About Us",
        url: "/about",
        description: "Learn more about Kulmi Digital Agency",
      },
      {
        title: "Contact",
        url: "/contact",
        description: "Get in touch with our team",
      },
      {
        title: "Website Packages",
        url: "/website-packages",
        description: "Explore our website development packages",
      },
    ];

    staticPages.forEach((page) => {
      if (
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        results.push({
          type: "page",
          ...page,
        });
      }
    });

    return NextResponse.json({
      query: searchQuery,
      results,
      totalResults: results.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
