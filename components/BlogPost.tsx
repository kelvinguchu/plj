"use client";
import React from "react";
import Image from "next/image";
import "../styles/blog.css";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp } from "lucide-react";
import { SiSpotify, SiYoutube, SiApplepodcasts } from "react-icons/si";
import { SubscribeDropdown } from "@/components/SubscribeDropdown";

interface Post {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  date: string;
  image: string;
  categoryName: string;
  categoryId: string;
}

export default function BlogPost({ post }: { post: Post }) {
  if (!post) {
    return <div>No post data available</div>;
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className='relative pt-10 min-h-screen bg-gradient-to-b from-[#87CEEB]/20 to-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Date */}
        <div className='text-center mb-6'>
          <time className='text-[#2B4C7E]/70 text-sm uppercase tracking-widest'>
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-light text-[#2B4C7E] text-center mb-8 max-w-5xl mx-auto leading-tight'>
          {post.title}
        </h1>

        {/* Category */}
        <div className='flex justify-center gap-4 mb-12'>
          <span className='bg-[#87CEEB]/10 text-[#2B4C7E] px-4 py-1 rounded-full text-sm font-medium'>
            {post.categoryName}
          </span>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className='relative aspect-[16/9] w-full max-w-5xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-lg'>
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className='object-cover'
              sizes='(max-width: 1280px) 100vw, 1280px'
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className='bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 max-w-4xl mx-auto shadow-lg border border-[#87CEEB]/20'>
          <div
            className='prose prose-lg max-w-none prose-headings:text-[#2B4C7E] prose-headings:font-medium prose-p:text-[#2B4C7E]/70 prose-a:text-[#87CEEB] prose-strong:text-[#2B4C7E] prose-blockquote:border-[#87CEEB] prose-blockquote:text-[#2B4C7E]/70'
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </div>

      {/* Floating Subscribe Button */}
      <div className='fixed bottom-8 right-8 z-50'>
        <SubscribeDropdown variant='floating' />
      </div>
    </article>
  );
}
