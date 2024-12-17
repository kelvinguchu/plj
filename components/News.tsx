import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSortedPostsData } from "@/lib/blogService";
import { Loader } from "@/components/ui/loader";
import { slugify } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

export const News = () => {
  const [processedPosts, setProcessedPosts] = useState<any[]>([]);
  
  // Fetch latest posts with caching
  const { data: posts = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: getSortedPostsData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Convert markdown to HTML for preview
  const getContentPreview = async (content: string) => {
    const processedContent = await remark()
      .use(html)
      .use(remarkGfm)
      .process(content);
    const contentHtml = processedContent.toString();
    
    // Strip HTML tags and get first 150 characters
    const strippedContent = contentHtml.replace(/<[^>]*>/g, '');
    return strippedContent.substring(0, 150);
  };

  // Process posts when they change
  useEffect(() => {
    const processPosts = async () => {
      const latestPosts = posts.slice(0, 4);
      const processed = await Promise.all(
        latestPosts.map(async (post) => ({
          ...post,
          contentPreview: await getContentPreview(post.content)
        }))
      );
      setProcessedPosts(processed);
    };

    processPosts();
  }, [posts]);

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <h2 className='text-4xl font-bold font-sans mb-6 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent'>
            News & Stories
          </h2>
          <p className='text-gray-600 text-lg leading-relaxed'>
            Stay updated with the latest insights, research, and success stories
            in health and wellness.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            No posts available yet.
          </div>
        ) : !processedPosts.length ? (
          <div className='text-center py-12'>
            <Loader />
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
            {processedPosts.map((post) => (
              <Link href={`/news/${slugify(post.title)}`} key={post.id} className="h-full">
                <Card className='group hover:shadow-lg transition-all duration-300 overflow-hidden backdrop-blur-md bg-white/30 border-white/20 h-full flex flex-col'>
                  {post.image && (
                    <div className='aspect-video w-full overflow-hidden bg-amber-100 relative flex-shrink-0'>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className='object-cover group-hover:scale-105 transition-transform duration-300'
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className='p-6 flex flex-col flex-grow'>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                        {post.categoryName || "Uncategorized"}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className='font-semibold text-lg text-[#1a3152] mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors'>
                      {post.title}
                    </h3>
                    <p className='text-gray-600 mb-4 line-clamp-3 flex-grow'>
                      {post.contentPreview}...
                    </p>
                    <div className='flex justify-end mt-auto'>
                      <Button
                        variant='ghost'
                        className='text-amber-600 hover:text-amber-700 p-0'>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className='flex justify-center'>
          <Link href='/news'>
            <Button
              variant='ghost'
              className='text-amber-600 hover:text-amber-700 text-lg font-medium'>
              View All News
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
