"use client";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface PendingPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  date: string;
  status: "pending";
  categoryId: string;
  image?: string;
}

export default function ReviewSheet() {
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPendingPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "posts"),
        where("status", "==", "pending")
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as PendingPost)
      );
      setPendingPosts(posts);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approvePost = async (postId: string) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Post approved successfully",
        className: "bg-green-500 text-white",
      });

      // Refresh the pending posts list
      fetchPendingPosts();
    } catch (error) {
      console.error("Error approving post:", error);
      toast({
        title: "Error",
        description: "Failed to approve post",
        variant: "destructive",
      });
    }
  };

  const rejectPost = async (postId: string) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Post rejected",
        className: "bg-yellow-500 text-white",
      });

      // Refresh the pending posts list
      fetchPendingPosts();
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          onClick={fetchPendingPosts}
          className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
          Review Posts
        </Button>
      </SheetTrigger>
      <SheetContent className='min-w-[40vw] sm:w-[540px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle className='text-[#2B4C7E]'>Pending Posts</SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {loading ? (
            <div className='text-center py-4'>Loading...</div>
          ) : pendingPosts.length === 0 ? (
            <div className='text-center py-4 text-[#2B4C7E]/60'>
              No pending posts to review
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                className='p-4 bg-[#87CEEB]/5 rounded-2xl space-y-3'>
                <h3 className='font-medium text-[#2B4C7E]'>{post.title}</h3>
                <div className='flex gap-2'>
                  <Button
                    onClick={() => approvePost(post.id)}
                    className='bg-green-500 hover:bg-green-600 text-white'
                    size='sm'>
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectPost(post.id)}
                    variant='destructive'
                    size='sm'>
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
