"use client";
import React, { memo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPendingPosts,
  approvePendingPost,
  rejectPendingPost,
} from "@/lib/blogService";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

// Memoized post card component
const PostCard = memo(
  ({
    post,
    onApprove,
    onReject,
  }: {
    post: any;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string) => Promise<void>;
  }) => {
    return (
      <Card key={post.id}>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            Submitted on {new Date(post.submittedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='prose max-w-none'>
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </div>
        </CardContent>
        <CardFooter className='flex justify-end gap-4'>
          <Button variant='outline' onClick={() => onReject(post.id)}>
            Reject
          </Button>
          <Button onClick={() => onApprove(post.id)}>Approve</Button>
        </CardFooter>
      </Card>
    );
  }
);

PostCard.displayName = "PostCard";

export default function PendingPostsReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Optimized query with better caching
  const { data: pendingPosts = [], isLoading } = useQuery({
    queryKey: ["pendingPosts"],
    queryFn: getPendingPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleApprove = useCallback(
    async (postId: string) => {
      try {
        await approvePendingPost(postId);
        // Optimistic update
        queryClient.setQueryData(["pendingPosts"], (old: any[]) =>
          old.filter((post) => post.id !== postId)
        );
        toast({
          title: "Success",
          description: "Post approved successfully!",
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        // Refetch on error to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ["pendingPosts"] });
        toast({
          title: "Error",
          description: "Failed to approve post",
          className: "bg-red-500 text-white",
        });
      }
    },
    [queryClient, toast]
  );

  const handleReject = useCallback(
    async (postId: string) => {
      try {
        await rejectPendingPost(postId);
        // Optimistic update
        queryClient.setQueryData(["pendingPosts"], (old: any[]) =>
          old.filter((post) => post.id !== postId)
        );
        toast({
          title: "Success",
          description: "Post rejected",
          className: "bg-yellow-500 text-white",
        });
      } catch (error) {
        // Refetch on error to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ["pendingPosts"] });
        toast({
          title: "Error",
          description: "Failed to reject post",
          className: "bg-red-500 text-white",
        });
      }
    },
    [queryClient, toast]
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[200px]'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Pending Posts</h2>
      {pendingPosts.length === 0 ? (
        <p>No pending posts to review</p>
      ) : (
        pendingPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </div>
  );
}
