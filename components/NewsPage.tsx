"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getSortedPostsData, getCategories } from "@/lib/blogService";
import { Loader } from "@/components/ui/loader";
import { slugify } from "@/lib/utils";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 6;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch posts and categories with caching
  const { data: posts = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: getSortedPostsData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Add "All" to categories
  const allCategories = useMemo(() => {
    return ["All", ...categories.map((cat) => cat.name)];
  }, [categories]);

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    return selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.categoryName === selectedCategory);
  }, [selectedCategory, posts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / storiesPerPage);
  const currentStories = useMemo(() => {
    const indexOfLastStory = currentPage * storiesPerPage;
    const indexOfFirstStory = indexOfLastStory - storiesPerPage;
    return filteredPosts.slice(indexOfFirstStory, indexOfLastStory);
  }, [currentPage, filteredPosts, storiesPerPage]);

  if (posts.length === 0 || categories.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col'>
      <div className='flex-grow relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28'>
          {/* Header */}
          <div className='mb-16 text-center'>
            <div className='max-w-3xl mx-auto'>
              <h1 className='text-5xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent'>
                News & Stories
              </h1>
              <p className='text-gray-600 text-xl'>
                Explore our collection of insightful articles, research
                findings, and inspiring stories about health, wellness, and
                personal growth.
              </p>
            </div>
          </div>

          {/* Filter Section - Updated for horizontal scroll */}
          <div className='mb-12 -mx-4 sm:mx-0'>
            <div className='px-4 sm:px-0 overflow-x-auto'>
              <div className='flex gap-3 pb-4 sm:pb-0 sm:flex-wrap sm:justify-center min-w-min'>
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    variant={category === selectedCategory ? "default" : "outline"}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`
                      rounded-full px-6 whitespace-nowrap flex-shrink-0
                      ${
                        category === selectedCategory
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "text-[#1a3152] hover:text-amber-600 border-amber-200"
                      }
                    `}>
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* News Grid */}
          {currentStories.length === 0 ? (
            <div className='text-center py-12 text-gray-500'>
              No posts found in this category.
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
              {currentStories.map((post) => (
                <Link href={`/news/${slugify(post.title)}`} key={post.id}>
                  <Card className='group hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-md bg-white/30 border-white/20'>
                    {post.image && (
                      <div className='aspect-video w-full overflow-hidden bg-amber-100 relative'>
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className='object-cover group-hover:scale-105 transition-transform duration-300'
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className='p-6'>
                      <div className='flex items-center justify-between mb-3'>
                        <span className='text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                          {post.categoryName || "Uncategorized"}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className='font-semibold text-xl text-[#1a3152] mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors'>
                        {post.title}
                      </h3>
                      <p className='text-gray-600 mb-4 line-clamp-3'>
                        {post.content.substring(0, 150)}...
                      </p>
                      <div className='flex justify-end'>
                        <Button
                          variant='ghost'
                          className='text-amber-600 hover:text-amber-700 p-0'>
                          Read More
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center gap-2'>
              <Button
                variant='outline'
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='text-[#1a3152] hover:text-amber-600 border-amber-200'>
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant='outline'
                    onClick={() => setCurrentPage(page)}
                    className={`
                    ${
                      currentPage === page
                        ? "bg-amber-50 text-amber-600 border-amber-200"
                        : "text-[#1a3152] hover:text-amber-600 border-amber-200"
                    }
                  `}>
                    {page}
                  </Button>
                )
              )}
              <Button
                variant='outline'
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className='text-[#1a3152] hover:text-amber-600 border-amber-200'>
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
