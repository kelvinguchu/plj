"use client";
import React from "react";
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

export default function PendingPostsReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingPosts = [], isLoading } = useQuery({
    queryKey: ["pendingPosts"],
    queryFn: getPendingPosts,
  });

  const handleApprove = async (postId: string) => {
    try {
      await approvePendingPost(postId);
      queryClient.invalidateQueries(["pendingPosts"]);
      toast({
        title: "Success",
        description: "Post approved successfully!",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve post",
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleReject = async (postId: string) => {
    try {
      await rejectPendingPost(postId);
      queryClient.invalidateQueries(["pendingPosts"]);
      toast({
        title: "Success",
        description: "Post rejected",
        className: "bg-yellow-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject post",
        className: "bg-red-500 text-white",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Pending Posts</h2>
      {pendingPosts.length === 0 ? (
        <p>No pending posts to review</p>
      ) : (
        pendingPosts.map((post) => (
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
              <Button variant='outline' onClick={() => handleReject(post.id)}>
                Reject
              </Button>
              <Button onClick={() => handleApprove(post.id)}>Approve</Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}
