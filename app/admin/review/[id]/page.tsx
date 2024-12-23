"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkIsAdmin } from "@/lib/blogService";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface Post {
  id: string;
  title: string;
  content: string;
  contentHtml: string;
  authorId: string;
  authorName: string;
  date: string;
  image?: string;
  categoryId?: string;
  categoryName?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export default function ReviewPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [authorImage, setAuthorImage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        router.push("/login");
        return;
      }
      fetchPost();
    };
    checkAuth();
  }, [router, params.id]);

  const fetchPost = async () => {
    try {
      const postRef = doc(db, "pendingPosts", params.id);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();

        // Get author information by uid
        const guestsRef = collection(db, "podcastGuests");
        const guestQuery = query(
          guestsRef,
          where("uid", "==", postData.authorId)
        );
        const guestSnap = await getDocs(guestQuery);
        const authorData = !guestSnap.empty ? guestSnap.docs[0].data() : null;

        // Format the post data
        const formattedPost = {
          id: postSnap.id,
          ...postData,
          authorName: authorData?.name || "Unknown Author",
          submittedAt:
            postData.submittedAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
        } as Post;

        setPost(formattedPost);
        setEditedContent(formattedPost.content);
        setAuthorImage(authorData?.profilePicture || null);
      } else {
        toast({
          title: "Error",
          description: "Post not found",
          variant: "destructive",
        });
        router.push("/admin");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast({
        title: "Error",
        description: "Failed to fetch post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!post) return;
    setSaving(true);

    try {
      // Process the edited content to HTML
      const processedContent = await remark()
        .use(html)
        .use(remarkGfm)
        .process(editedContent);
      const contentHtml = processedContent.toString();

      // Create in posts collection
      await addDoc(collection(db, "posts"), {
        title: post.title,
        content: editedContent,
        contentHtml,
        authorId: post.authorId,
        authorName: post.authorName,
        date: new Date().toISOString(),
        image: post.image,
        categoryId: post.categoryId,
        categoryName: post.categoryName,
      });

      // Delete from pendingPosts
      await deleteDoc(doc(db, "pendingPosts", post.id));

      toast({
        title: "Success",
        description: "Post approved and published",
        className: "bg-green-500 text-white",
      });

      router.push("/admin");
    } catch (error) {
      console.error("Error approving post:", error);
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!post) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "pendingPosts", post.id), {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Post rejected",
        className: "bg-red-500 text-white",
      });

      router.push("/admin");
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C7E]'></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-[#2B4C7E]'>Post not found</p>
      </div>
    );
  }

  return (
    <div className='container max-w-5xl mx-auto p-6 pt-20'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-light'>
          Review <span className='text-[#2B4C7E]'>Post</span>
        </h1>
        <div className='flex gap-4'>
          <Button
            onClick={() => router.push("/admin")}
            className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
            Back to Dashboard
          </Button>
          <Button
            onClick={handleApprove}
            disabled={saving}
            className='bg-green-500 text-white hover:bg-green-600'>
            {saving ? "Saving..." : "Approve & Publish"}
          </Button>
          <Button
            onClick={handleReject}
            disabled={saving}
            className='bg-red-500 text-white hover:bg-red-600'>
            {saving ? "Saving..." : "Reject"}
          </Button>
        </div>
      </div>

      <Card className='mb-8'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-2xl text-[#2B4C7E]'>
                {post.title}
              </CardTitle>
              <div className='flex items-center gap-4 mt-4'>
                {authorImage && (
                  <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                    <Image
                      src={authorImage}
                      alt={post.authorName}
                      fill
                      className='object-cover'
                      sizes='48px'
                      unoptimized
                    />
                  </div>
                )}
                <div>
                  <p className='font-medium text-[#2B4C7E]'>
                    {post.authorName}
                  </p>
                  <p className='text-sm text-[#2B4C7E]/70'>
                    {new Date(post.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            {post.image && (
              <div className='relative w-32 h-32 rounded-xl overflow-hidden'>
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className='object-cover'
                  sizes='128px'
                  unoptimized
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            {post.categoryName && (
              <Badge className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
                {post.categoryName}
              </Badge>
            )}
          </div>
          <div data-color-mode='light'>
            <MDEditor
              value={editedContent}
              preview='preview'
              height={400}
              hideToolbar
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
