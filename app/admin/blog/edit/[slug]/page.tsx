"use client";
import React, { useState, useEffect } from "react";
import { updatePost, getCategories } from "@/lib/blogService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import localFont from "next/font/local";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/ui/loader";
import { collection, query, getDocs } from "firebase/firestore";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/blogService";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface PostData {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  date: any;
  image?: string;
  categoryId?: string;
  categoryName?: string;
}

const CustomSelect = ({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#F56E0F] focus:border-transparent transition duration-200 text-left flex justify-between items-center'>
        <span>
          {selectedCategory
            ? categories.find((c) => c.id === selectedCategory)?.name ||
              "Select category"
            : "Select category"}
        </span>
        <svg
          className='fill-current h-4 w-4'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'>
          <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-lg'>
          <div className='py-2'>
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  onSelect(category.id);
                  setIsOpen(false);
                }}
                className='px-4 py-2 hover:bg-gray-50 cursor-pointer'>
                {category.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function EditBlogPost({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch post data
  const { data: post, isLoading: isLoadingPost } = useQuery<PostData>({
    queryKey: ["post", params.slug],
    queryFn: async () => {
      const postsRef = collection(db, "posts");
      const querySnapshot = await getDocs(postsRef);

      const matchingPost = querySnapshot.docs.find((doc) => {
        const postData = doc.data();
        const postSlug = slugify(postData.title);
        return postSlug === params.slug;
      });

      if (!matchingPost) {
        throw new Error("Post not found");
      }

      return {
        id: matchingPost.id,
        ...matchingPost.data(),
      } as PostData;
    },
    enabled: !!params.slug,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.image || "");
      setSelectedCategory(post.categoryId || "");
    }
  }, [post]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        router.push("/admin/news/new");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push("/blog");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const processContent = async (content: string) => {
    const processedContent = await remark()
      .use(html)
      .use(remarkGfm)
      .process(content);
    return processedContent.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!post?.id) throw new Error("Post ID not found");

      const contentHtml = await processContent(content);
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

      const postData = {
        title,
        content,
        contentHtml,
        categoryId: selectedCategory,
        categoryName: selectedCategoryData?.name || "Uncategorized",
        ...(imageUrl && { image: imageUrl }),
      };

      await updatePost(post.id, postData);

      toast({
        title: "Success",
        description: "Blog post updated successfully!",
        className: `bg-green-500 text-white`,
      });

      router.push(`/news/${slugify(title)}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        className: `bg-red-500 text-white`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadError(null);
      setUploadingImage(true);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration is missing");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError((error as Error).message);
      setImageUrl("");
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isAuthenticated || isLoadingPost) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#87CEEB]/20 to-white'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-20 bg-gradient-to-br from-[#87CEEB]/20 to-white py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-3xl shadow-xl border border-[#87CEEB]/20 p-8'>
          {/* Header */}
          <div className='flex justify-between items-center mb-12'>
            <div>
              <h1 className='text-4xl font-light mb-2'>
                Edit <span className='text-[#2B4C7E]'>Blog Post</span>
              </h1>
              <p className='text-[#2B4C7E]/70'>Update your blog post</p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={handleLogout}
                className='p-2 hover:bg-[#87CEEB]/10 rounded-xl transition duration-200'
                title='Logout'>
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
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
              </button>
              <button
                onClick={() => router.push("/blog")}
                className='p-2 hover:bg-[#87CEEB]/10 rounded-xl transition duration-200'
                title='Back to Blog'>
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
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              {/* Left Column */}
              <div className='space-y-5'>
                <div>
                  <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                    Post Title
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
                    placeholder='Enter post title'
                    required
                  />
                </div>

                <div>
                  <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                    Category
                  </label>
                  <CustomSelect
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                  Featured Image
                </label>
                <div className='relative'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
                  />
                  {uploadingImage && (
                    <div className='absolute right-4 top-1/2 -translate-y-1/2'>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#2B4C7E]'></div>
                    </div>
                  )}
                </div>
                {imageUrl && (
                  <div className='mt-4 relative w-full h-48 rounded-2xl overflow-hidden'>
                    <Image
                      src={imageUrl}
                      alt='Preview'
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      unoptimized
                    />
                  </div>
                )}
                {uploadError && (
                  <div className='mt-4 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100'>
                    <p className='text-sm'>Failed to upload image: {uploadError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Content
              </label>
              <div
                data-color-mode='light'
                className='rounded-2xl overflow-hidden border border-[#87CEEB]/20'>
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  height={500}
                  preview='live'
                  hideToolbar={false}
                  enableScroll={true}
                  highlightEnable={true}
                  textareaProps={{
                    placeholder: "Write your blog post here...",
                  }}
                  className='!border-0'
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end pt-6'>
              <button
                type='submit'
                disabled={loading}
                className='inline-flex items-center px-8 py-4 bg-[#2B4C7E] text-white rounded-2xl hover:bg-[#2B4C7E]/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium'>
                {loading ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
