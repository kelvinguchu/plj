"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";

// This would typically come from an API or database
const allNewsStories = [
  {
    title: "The Science of Deep Sleep",
    date: "October 15, 2023",
    category: "Wellness",
    excerpt:
      "Discover the latest research on how deep sleep affects cognitive performance and emotional well-being.",
    imageUrl:
      "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80",
    readTime: "5 min read",
  },
  {
    title: "Marathon Success Stories",
    date: "October 12, 2023",
    category: "Performance",
    excerpt:
      "Meet the everyday heroes who transformed their lives through long-distance running.",
    imageUrl:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80",
    readTime: "8 min read",
  },
  {
    title: "Mindfulness in the Digital Age",
    date: "October 10, 2023",
    category: "Mental Health",
    excerpt:
      "How to maintain mental clarity and focus in an increasingly connected world.",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
    readTime: "6 min read",
  },
  {
    title: "Nutrition Myths Debunked",
    date: "October 8, 2023",
    category: "Health",
    excerpt:
      "Leading nutritionists separate fact from fiction in popular diet trends.",
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80",
    readTime: "7 min read",
  },
  {
    title: "The Power of Cold Therapy",
    date: "October 5, 2023",
    category: "Wellness",
    excerpt:
      "Exploring the benefits of cold exposure for physical and mental resilience.",
    imageUrl:
      "https://images.unsplash.com/photo-1562832135-14a35d25edef?auto=format&fit=crop&q=80",
    readTime: "4 min read",
  },
  {
    title: "Plant-Based Performance",
    date: "October 3, 2023",
    category: "Nutrition",
    excerpt:
      "How elite athletes are thriving on plant-based diets and breaking records.",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80",
    readTime: "6 min read",
  },
  {
    title: "Sleep Optimization Tips",
    date: "October 1, 2023",
    category: "Health",
    excerpt:
      "Expert-backed strategies for getting the most restorative sleep possible.",
    imageUrl:
      "https://images.unsplash.com/photo-1511295742362-92c96b5adb36?auto=format&fit=crop&q=80",
    readTime: "5 min read",
  },
  {
    title: "Meditation for Beginners",
    date: "September 28, 2023",
    category: "Mental Health",
    excerpt: "A comprehensive guide to starting your meditation practice.",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80",
    readTime: "9 min read",
  },
];

const categories = [
  "All",
  "Wellness",
  "Performance",
  "Mental Health",
  "Nutrition",
  "Health",
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 6;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredStories =
    selectedCategory === "All"
      ? allNewsStories
      : allNewsStories.filter((story) => story.category === selectedCategory);

  const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = filteredStories.slice(
    indexOfFirstStory,
    indexOfLastStory
  );

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

          {/* Filter Section */}
          <div className='flex flex-wrap gap-3 mb-12 justify-center'>
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`
                  rounded-full px-6 
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

          {/* News Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
            {currentStories.map((story, index) => (
              <Card
                key={index}
                className='group hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-md bg-white/30 border-white/20'>
                <div className='aspect-video w-full overflow-hidden bg-amber-100 relative'>
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-3'>
                    <span className='text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                      {story.category}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {story.readTime}
                    </span>
                  </div>
                  <h3 className='font-semibold text-xl text-[#1a3152] mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors'>
                    {story.title}
                  </h3>
                  <p className='text-gray-600 mb-4 line-clamp-3'>
                    {story.excerpt}
                  </p>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>{story.date}</span>
                    <Button
                      variant='ghost'
                      className='text-amber-600 hover:text-amber-700 p-0'>
                      Read More
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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

        {/* Floating Home Button */}
        <Link href='/' className='fixed bottom-8 right-8 z-50'>
          <Button
            size='lg'
            className='rounded-full w-8 h-8 bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300'>
            <Home className='h-6 w-6' />
          </Button>
        </Link>
      </div>
    </div>
  );
}
