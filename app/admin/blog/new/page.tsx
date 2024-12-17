"use client";
import React, { useState, useEffect } from "react";
import { createPost, getCategories, addCategory } from "@/lib/blogService";
import type { Category } from "@/lib/blogService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import localFont from "next/font/local";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import cloudinary from "@/lib/cloudinary";
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
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  deleteField,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import BlogManagementSheet from "@/components/BlogManagementSheet";
import { slugify } from "@/lib/utils";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const CustomSelect = ({
  categories,
  selectedCategory,
  onSelect,
  onDelete,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
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
                className='flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer'>
                <div
                  onClick={() => {
                    onSelect(category.id);
                    setIsOpen(false);
                  }}
                  className='flex-grow'>
                  {category.name}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className='p-2 text-gray-500 hover:text-red-500 transition-colors'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-4 w-4'
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
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this category? All posts
                        in this category will be moved to "Unknown".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(category.id)}
                        className='bg-red-500 hover:bg-red-600'>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function NewBlogPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsLoggingIn(false);
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
      const contentHtml = await processContent(content);
      const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

      const postData = {
        title,
        content,
        contentHtml,
        date: new Date().toISOString(),
        categoryId: selectedCategory,
        categoryName: selectedCategoryData?.name || "Uncategorized",
        ...(imageUrl && { image: imageUrl }),
      };

      await createPost(postData);

      toast({
        title: "Success",
        description: "Blog post published successfully!",
        className: `bg-green-500 text-white`,
        action: (
          <ToastAction
            altText='View post'
            className='text-white hover:text-green-100'>
            View post
          </ToastAction>
        ),
      });

      router.push(`/news/${slugify(title)}`);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        className: `bg-red-500 text-white`,
        action: (
          <ToastAction
            altText='Try again'
            className='text-white hover:text-red-100'>
            Try again
          </ToastAction>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push("/blog");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadError(null);
      setUploadingImage(true);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error(
          `Cloudinary configuration is missing: ${
            !cloudName ? "CLOUD_NAME " : ""
          }${!uploadPreset ? "UPLOAD_PRESET" : ""}`
        );
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Upload to Cloudinary
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

      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        throw new Error("No URL received from Cloudinary");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError((error as Error).message);
      setImageUrl(""); // Clear any previous image
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setIsAddingCategory(true);
    try {
      const newCategoryId = await addCategory(newCategory);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setNewCategory("");
      setShowAddCategory(false);
      setSelectedCategory(newCategoryId);

      toast({
        title: "Success",
        description: "Category created successfully!",
        className: `bg-green-500 text-white`,
        action: (
          <ToastAction
            altText='Close'
            className='text-white hover:text-green-100'>
            Close
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        className: `bg-red-500 text-white`,
        action: (
          <ToastAction
            altText='Try again'
            className='text-white hover:text-red-100'>
            Try again
          </ToastAction>
        ),
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Update posts with this category to 'Unknown'
      const postsRef = collection(db, "posts");
      const q = query(postsRef, where("categoryId", "==", categoryId));
      const querySnapshot = await getDocs(q);

      // Batch update for better performance
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          categoryId: "unknown",
          categoryName: "Unknown",
        });
      });

      // Delete the category
      batch.delete(doc(db, "categories", categoryId));
      await batch.commit();

      // Refresh categories list
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);

      // Reset selected category if it was deleted
      if (selectedCategory === categoryId) {
        setSelectedCategory("");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen mt-10 flex items-center justify-center bg-gradient-to-br from-[#87CEEB]/20 to-white p-4'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-3xl shadow-xl p-8 border border-[#87CEEB]/20'>
            <div className='text-center mb-8'>
              <h1 className='text-4xl font-light mb-2'>
                {getTimeBasedGreeting()}{" "}
                <span className='text-[#2B4C7E]'>Admin</span>
              </h1>
              <p className='text-[#2B4C7E]/70'>
                Sign in to manage your blog posts
              </p>
            </div>

            {authError && (
              <div className='mb-6 p-4 bg-red-50 rounded-2xl border border-red-100'>
                <p className='text-red-600 text-sm'>{authError}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className='space-y-5'>
              <div>
                <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
                  placeholder='Enter your email'
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <div>
                <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                  Password
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
                  placeholder='Enter your password'
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <button
                type='submit'
                disabled={isLoggingIn}
                className='w-full bg-[#2B4C7E] text-white p-4 rounded-2xl hover:bg-[#2B4C7E]/90 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-6'>
                {isLoggingIn ? (
                  <div className='flex items-center justify-center'>
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
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pt-20 bg-gradient-to-br from-[#87CEEB]/20 to-white py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-3xl shadow-xl border border-[#87CEEB]/20 p-8'>
          <div className='flex justify-between items-center mb-12'>
            <div>
              <h1 className='text-4xl font-light mb-2'>
                Create New <span className='text-[#2B4C7E]'>Blog Post</span>
              </h1>
              <p className='text-[#2B4C7E]/70'>
                Share your thoughts with the world
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <BlogManagementSheet />
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

          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
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
                  <div className='flex gap-3'>
                    <div className='relative flex-1'>
                      <CustomSelect
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                        onDelete={handleDeleteCategory}
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowAddCategory(true)}
                      className='px-6 py-4 bg-[#87CEEB]/10 rounded-2xl hover:bg-[#87CEEB]/20 transition duration-200'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 text-[#2B4C7E]'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 4v16m8-8H4'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

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
                      if (file) {
                        setImageFile(file);
                        handleImageUpload(file);
                      }
                    }}
                    className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
                  />
                  {uploadingImage && (
                    <div className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center'>
                      <svg
                        className='animate-spin h-5 w-5 text-[#2B4C7E]'
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
                    <p className='text-sm'>
                      Failed to upload image: {uploadError}
                    </p>
                    <button
                      onClick={() => setUploadError(null)}
                      className='text-sm underline mt-2'>
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>

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
                    Publishing...
                  </>
                ) : (
                  "Publish Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAddCategory && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4'>
          <div className='bg-white rounded-3xl p-8 w-full max-w-md'>
            <h3 className='text-2xl font-light mb-6'>
              Add New <span className='text-[#2B4C7E]'>Category</span>
            </h3>
            <input
              type='text'
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200 mb-6'
              placeholder='Category name'
            />
            <div className='flex justify-end gap-3'>
              <button
                type='button'
                onClick={() => setShowAddCategory(false)}
                className='px-6 py-3 text-[#2B4C7E] bg-[#87CEEB]/10 rounded-2xl hover:bg-[#87CEEB]/20 transition duration-200'
                disabled={isAddingCategory}>
                Cancel
              </button>
              <button
                type='button'
                onClick={handleAddCategory}
                disabled={isAddingCategory}
                className='px-6 py-3 bg-[#2B4C7E] text-white rounded-2xl hover:bg-[#2B4C7E]/90 transition duration-200 disabled:opacity-50 flex items-center gap-2'>
                {isAddingCategory ? (
                  <>
                    <svg
                      className='animate-spin h-5 w-5 text-white'
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
                    Adding...
                  </>
                ) : (
                  "Add Category"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
