"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { createPendingPost, getCategories } from "@/lib/blogService";
import type { Category } from "@/lib/blogService";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { slugify } from "@/lib/utils";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

const CustomSelect = ({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}) => (
  <select
    value={selectedCategory}
    onChange={(e) => onSelect(e.target.value)}
    className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'>
    <option value=''>Select Category</option>
    {categories.map((category) => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ))}
  </select>
);

export default function NewGuestPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  const processContent = async (content: string) => {
    const processedContent = await remark()
      .use(html)
      .use(remarkGfm)
      .process(content);
    return processedContent.toString();
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a category",
        className: "bg-red-500 text-white",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedCategoryData = categories.find(
        (cat) => cat.id === selectedCategory
      );

      await createPendingPost({
        title,
        content,
        contentHtml: await processContent(content),
        date: new Date().toISOString(),
        authorId: userId,
        categoryId: selectedCategory,
        categoryName: selectedCategoryData?.name || "Uncategorized",
        ...(imageUrl && { image: imageUrl }),
      });

      toast({
        title: "Success",
        description: "Post submitted for review!",
        className: "bg-green-500 text-white",
        action: (
          <ToastAction
            altText='View dashboard'
            className='text-white hover:text-green-100'>
            View dashboard
          </ToastAction>
        ),
      });

      router.push("/guest-dashboard");
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to submit post",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container max-w-5xl mx-auto p-6 pt-20'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-[#2B4C7E]'>Create New Post</h1>
        <p className='text-[#2B4C7E]/60 mt-2'>Submit your post for review</p>
      </div>

      {!userId ? (
        <div className='text-center py-12'>
          <p className='text-[#2B4C7E]'>Please log in to create a post.</p>
        </div>
      ) : (
        <div className='bg-white rounded-3xl shadow-sm p-6 md:p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                  Title
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full p-4 bg-[#87CEEB]/5 border border-[#87CEEB]/20 rounded-2xl focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent transition duration-200'
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

            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Featured Image
              </label>
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
                <p className='text-[#2B4C7E] mt-2'>Uploading image...</p>
              )}
              {uploadError && (
                <p className='text-red-500 mt-2'>{uploadError}</p>
              )}
              {imageUrl && (
                <p className='text-green-500 mt-2'>
                  Image uploaded successfully!
                </p>
              )}
            </div>

            <div>
              <label className='block text-[#2B4C7E] text-sm font-medium mb-3'>
                Content
              </label>
              <div data-color-mode='light'>
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || "")}
                  preview='live'
                  className='min-h-[500px]'
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={loading || uploadingImage}
                className='px-8 py-4 bg-[#2B4C7E] text-white rounded-2xl hover:bg-[#2B4C7E]/90 disabled:opacity-50 transition duration-200'>
                {loading ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
