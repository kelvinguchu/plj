"use client";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPaginatedPosts, deletePost } from "@/lib/blogService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const POSTS_PER_PAGE = 10;

interface Post {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  date: any;
  image?: string;
  categoryId?: string;
  categoryName?: string;
  authorName?: string;
}

export default function BlogManagementSheet() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["managePosts", currentPage],
    queryFn: async () => {
      const result = await getPaginatedPosts(null, POSTS_PER_PAGE);
      return result;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60, // 1 minute
  });

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      await refetch(); // Refetch after deletion
      await queryClient.invalidateQueries({ queryKey: ["posts"] });

      toast({
        title: "Success",
        description: "Post deleted successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleEdit = (post: Post) => {
    const slug = slugify(post.title);
    router.push(`/admin/blog/edit/${slug}`);
  };

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <Sheet onOpenChange={() => refetch()}>
      <SheetTrigger className='p-2 hover:bg-[#87CEEB]/10 rounded-xl transition duration-200'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 text-[#2B4C7E]'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </SheetTrigger>
      <SheetContent className='min-w-[40vw] sm:w-[90vw] overflow-y-auto bg-white border-l border-[#87CEEB]/20'>
        <SheetHeader>
          <SheetTitle className='text-[#2B4C7E]'>Manage Blog Posts</SheetTitle>
          <SheetDescription className='text-[#2B4C7E]/70'>
            View, edit, or delete your blog posts
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6'>
          <Input
            type='search'
            placeholder='Search posts by title, category, or author...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-2xl bg-[#87CEEB]/5 border-[#87CEEB]/20 placeholder:text-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]'
          />
        </div>

        <div className='mt-8 space-y-4'>
          {isLoading ? (
            <div className='py-8'>
              <Loader />
            </div>
          ) : paginatedPosts.length === 0 ? (
            <div className='text-center py-8 text-[#2B4C7E]/70'>
              {searchQuery ? "No matching posts found" : "No posts found"}
            </div>
          ) : (
            <>
              {paginatedPosts.map((post) => (
                <div
                  key={post.id}
                  className='flex items-start space-x-4 p-4 rounded-2xl border border-[#87CEEB]/20 hover:bg-[#87CEEB]/5 transition-colors duration-200'>
                  {post.image && (
                    <div className='relative w-20 h-20 flex-shrink-0'>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className='rounded-xl object-cover'
                        sizes='80px'
                        unoptimized
                      />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-medium text-[#2B4C7E] truncate'>
                      {post.title}
                    </h4>
                    <p className='text-sm text-[#2B4C7E]/70'>
                      By {post.authorName || "Peak Life Journey"} •{" "}
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                    {post.categoryName && (
                      <span className='inline-block mt-1 text-xs bg-[#87CEEB]/10 text-[#2B4C7E] px-2 py-1 rounded-full'>
                        {post.categoryName}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handleEdit(post)}
                      className='p-2 text-[#2B4C7E] hover:bg-[#87CEEB]/10 rounded-xl transition-colors duration-200'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className='p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                            />
                          </svg>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className='bg-white border border-[#87CEEB]/20 rounded-3xl'>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-[#2B4C7E]'>
                            Delete Post
                          </AlertDialogTitle>
                          <AlertDialogDescription className='text-[#2B4C7E]/70'>
                            Are you sure you want to delete this post? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className='text-[#2B4C7E] bg-[#87CEEB]/10 hover:bg-[#87CEEB]/20 rounded-xl border-0'>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            className='bg-red-500 hover:bg-red-600 text-white rounded-xl border-0'>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <Pagination className='mt-6'>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                          }}
                        />
                      </PaginationItem>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === currentPage}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            );
                          }}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
