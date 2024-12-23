"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { checkIsAdmin } from "@/lib/blogService";
import ReviewSheet from "@/components/ReviewSheet";
import BlogManagementSheet from "@/components/BlogManagementSheet";
import EpisodeManagementSheet from "@/components/EpisodeManagementSheet";
import AdminManagement from "@/components/AdminManagement";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Post {
  id: string;
  title: string;
  authorName: string;
  date: string;
  categoryName?: string;
  status?: string;
  image?: string;
}

interface PodcastGuest {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profilePicture?: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [guests, setGuests] = useState<PodcastGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        router.push("/login");
        return;
      }
      fetchData();
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      // Fetch published posts
      const postsRef = collection(db, "posts");
      const postsQuery = query(postsRef, orderBy("date", "desc"));
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          authorName: data.authorName || "Peak Life Journey",
          date:
            data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
          categoryName: data.categoryName,
          image: data.image,
          status: "published",
        } as Post;
      });
      setPosts(postsData);

      // Fetch pending posts
      const pendingRef = collection(db, "pendingPosts");
      const pendingQuery = query(pendingRef, orderBy("submittedAt", "desc"));
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = pendingSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          authorName: data.authorName,
          date:
            data.submittedAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          categoryName: data.categoryName,
          image: data.image,
          status: "pending",
        } as Post;
      });
      setPendingPosts(pendingData);

      // Fetch podcast guests
      const guestsRef = collection(db, "podcastGuests");
      const guestsQuery = query(guestsRef, orderBy("createdAt", "desc"));
      const guestsSnapshot = await getDocs(guestsQuery);
      const guestsData = guestsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          profilePicture: data.profilePicture,
        } as PodcastGuest;
      });
      setGuests(guestsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const paginatePosts = (items: any[]) => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const totalPages = (items: any[]) => Math.ceil(items.length / postsPerPage);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C7E]'></div>
      </div>
    );
  }

  return (
    <div className='container max-w-7xl mx-auto p-6 pt-20'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-light'>
          Admin <span className='text-[#2B4C7E]'>Dashboard</span>
        </h1>
        <div className='flex gap-4'>
          <Button
            onClick={() => router.push("/admin/blog/new")}
            className='bg-[#2B4C7E] text-white hover:bg-[#2B4C7E]/90'>
            Create Post
          </Button>
          <Button
            onClick={() => router.push("/admin/episodes/new")}
            className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
            Add Episode
          </Button>
          <Button
            onClick={() => router.push("/admin/podcast-guests")}
            className='bg-[#87CEEB]/10 text-[#2B4C7E] hover:bg-[#87CEEB]/20'>
            Manage Guests
          </Button>
          <ReviewSheet />
          <BlogManagementSheet />
          <EpisodeManagementSheet />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle className='text-[#2B4C7E]'>Published Posts</CardTitle>
            <CardDescription>Total published blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-4xl font-light text-[#2B4C7E]'>{posts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-[#2B4C7E]'>Pending Posts</CardTitle>
            <CardDescription>Posts awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-4xl font-light text-[#2B4C7E]'>
              {pendingPosts.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-[#2B4C7E]'>Podcast Guests</CardTitle>
            <CardDescription>Registered podcast guests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-4xl font-light text-[#2B4C7E]'>
              {guests.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-[#2B4C7E]'>Total Content</CardTitle>
            <CardDescription>All posts and episodes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-4xl font-light text-[#2B4C7E]'>
              {posts.length + pendingPosts.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='published' className='w-full'>
        <TabsList className='mb-8'>
          <TabsTrigger value='published'>Published Posts</TabsTrigger>
          <TabsTrigger value='pending'>Pending Posts</TabsTrigger>
          <TabsTrigger value='guests'>Podcast Guests</TabsTrigger>
          <TabsTrigger value='admin'>Admin Management</TabsTrigger>
        </TabsList>

        <TabsContent value='published'>
          <div className='space-y-4'>
            {posts.length === 0 ? (
              <Card>
                <CardContent className='pt-6'>
                  <p className='text-center text-[#2B4C7E]/60'>
                    No published posts
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatePosts(posts).map((post) => (
                  <Card key={post.id}>
                    <CardContent className='pt-6'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='text-lg font-medium text-[#2B4C7E] mb-2'>
                            {post.title}
                          </h3>
                          <p className='text-sm text-[#2B4C7E]/60'>
                            By {post.authorName} • {formatDate(post.date)}
                          </p>
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
                    </CardContent>
                  </Card>
                ))}
                {posts.length > postsPerPage && (
                  <Pagination className='mt-6'>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      {Array.from(
                        { length: totalPages(posts) },
                        (_, i) => i + 1
                      ).map((page) => (
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
                      ))}
                      {currentPage < totalPages(posts) && (
                        <PaginationItem>
                          <PaginationNext
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage + 1);
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
        </TabsContent>

        <TabsContent value='pending'>
          <div className='space-y-4'>
            {pendingPosts.length === 0 ? (
              <Card>
                <CardContent className='pt-6'>
                  <p className='text-center text-[#2B4C7E]/60'>
                    No pending posts
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatePosts(pendingPosts).map((post) => (
                  <Card key={post.id}>
                    <CardContent className='pt-6'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h3 className='text-lg font-medium text-[#2B4C7E] mb-2'>
                            {post.title}
                          </h3>
                          <p className='text-sm text-[#2B4C7E]/60'>
                            By {post.authorName} • {formatDate(post.date)}
                          </p>
                        </div>
                        <div className='flex items-center gap-4'>
                          <Button
                            onClick={() =>
                              router.push(`/admin/review/${post.id}`)
                            }
                            className='bg-[#2B4C7E] text-white hover:bg-[#2B4C7E]/90'>
                            Review
                          </Button>
                          <Badge className='bg-yellow-500 text-white'>
                            Pending
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingPosts.length > postsPerPage && (
                  <Pagination className='mt-6'>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      {Array.from(
                        { length: totalPages(pendingPosts) },
                        (_, i) => i + 1
                      ).map((page) => (
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
                      ))}
                      {currentPage < totalPages(pendingPosts) && (
                        <PaginationItem>
                          <PaginationNext
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage + 1);
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
        </TabsContent>

        <TabsContent value='guests'>
          <div className='space-y-4'>
            {guests.length === 0 ? (
              <Card>
                <CardContent className='pt-6'>
                  <p className='text-center text-[#2B4C7E]/60'>
                    No podcast guests
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatePosts(guests).map((guest) => (
                  <Card key={guest.id}>
                    <CardContent className='pt-6'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          {guest.profilePicture ? (
                            <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                              <Image
                                src={guest.profilePicture}
                                alt={guest.name}
                                fill
                                className='object-cover'
                                sizes='48px'
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className='w-12 h-12 rounded-full bg-[#87CEEB]/10 flex items-center justify-center text-[#2B4C7E]'>
                              {guest.name[0]}
                            </div>
                          )}
                          <div>
                            <h3 className='font-medium text-[#2B4C7E]'>
                              {guest.name}
                            </h3>
                            <p className='text-sm text-[#2B4C7E]/60'>
                              {guest.email}
                            </p>
                          </div>
                        </div>
                        <p className='text-sm text-[#2B4C7E]/60'>
                          Joined {formatDate(guest.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {guests.length > postsPerPage && (
                  <Pagination className='mt-6'>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                      )}
                      {Array.from(
                        { length: totalPages(guests) },
                        (_, i) => i + 1
                      ).map((page) => (
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
                      ))}
                      {currentPage < totalPages(guests) && (
                        <PaginationItem>
                          <PaginationNext
                            href='#'
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(currentPage + 1);
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
        </TabsContent>

        <TabsContent value='admin'>
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
