"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
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
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  rejectedAt?: string;
  approvedAt?: string;
  image?: string;
  content?: string;
}

interface GuestProfile {
  name: string;
  profilePicture?: string;
}

export default function GuestDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const router = useRouter();

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const paginatePosts = (posts: Post[]) => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return posts.slice(startIndex, endIndex);
  };

  const totalPages = (posts: Post[]) => Math.ceil(posts.length / postsPerPage);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch guest profile
      try {
        const guestsRef = collection(db, "podcastGuests");
        const q = query(guestsRef, where("uid", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const guestData = snapshot.docs[0].data();
          setGuestProfile({
            name: guestData.name,
            profilePicture: guestData.profilePicture,
          });
        }
      } catch (error) {
        console.error("Error fetching guest profile:", error);
      }

      // Fetch all posts (both pending and published)
      try {
        // Fetch pending posts
        const pendingPostsRef = collection(db, "pendingPosts");
        const pendingQuery = query(
          pendingPostsRef,
          where("authorId", "==", user.uid)
        );
        console.log("Fetching pending posts for user:", user.uid);
        const pendingSnapshot = await getDocs(pendingQuery);
        console.log(
          "Pending posts raw data:",
          pendingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        const pendingPosts = pendingSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            status: data.status || "pending",
            submittedAt:
              data.submittedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            rejectedAt: data.rejectedAt?.toDate?.()?.toISOString(),
            approvedAt: data.approvedAt?.toDate?.()?.toISOString(),
            image: data.image,
            content: data.content,
          };
        });

        // Fetch published posts
        const publishedPostsRef = collection(db, "posts");
        const publishedQuery = query(
          publishedPostsRef,
          where("authorId", "==", user.uid)
        );
        console.log("Fetching published posts for user:", user.uid);
        const publishedSnapshot = await getDocs(publishedQuery);
        console.log(
          "Published posts raw data:",
          publishedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        const publishedPosts = publishedSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            status: "approved",
            submittedAt:
              data.date?.toDate?.()?.toISOString() || new Date().toISOString(),
            approvedAt: data.date?.toDate?.()?.toISOString(),
            image: data.image,
            content: data.content,
          };
        });

        // Combine and sort all posts
        const allPosts = [...pendingPosts, ...publishedPosts].sort((a, b) => {
          const dateA = new Date(a.submittedAt);
          const dateB = new Date(b.submittedAt);
          return dateB.getTime() - dateA.getTime();
        });

        console.log("Fetched posts:", {
          pending: pendingPosts.length,
          published: publishedPosts.length,
          total: allPosts.length,
          userUid: user.uid,
          pendingPosts,
          publishedPosts,
        });

        setPosts(allPosts as Post[]);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const pendingPosts = posts.filter((post) => post.status === "pending");
  const approvedPosts = posts.filter((post) => post.status === "approved");
  const rejectedPosts = posts.filter((post) => post.status === "rejected");

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C7E]'></div>
      </div>
    );
  }

  return (
    <div className='container max-w-5xl mx-auto p-6 pt-20'>
      {/* Guest Profile Header */}
      <div className='flex items-center justify-between gap-6 mb-8'>
        <div className='flex items-center gap-6 flex-1'>
          {guestProfile?.profilePicture ? (
            <div className='relative w-20 h-20 rounded-full overflow-hidden'>
              <Image
                src={guestProfile.profilePicture}
                alt={guestProfile.name}
                fill
                className='object-cover'
                sizes='80px'
                unoptimized
              />
            </div>
          ) : (
            <div className='w-20 h-20 rounded-full bg-[#2B4C7E]/10 flex items-center justify-center'>
              <span className='text-2xl text-[#2B4C7E]'>
                {guestProfile?.name?.charAt(0) || "G"}
              </span>
            </div>
          )}
          <div>
            <h1 className='text-3xl font-light mb-1'>
              {getTimeBasedGreeting()},{" "}
              <span className='text-[#2B4C7E]'>{guestProfile?.name}</span>
            </h1>
            <p className='text-[#2B4C7E]/70'>
              Welcome to your personal dashboard
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/guest-dashboard/new-post")}
          className='bg-[#2B4C7E] text-white rounded-2xl hover:bg-[#2B4C7E]/90 px-6 py-3'>
          Create New Post
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-light'>
              <span className='text-yellow-500'>{pendingPosts.length}</span>{" "}
              Pending
            </CardTitle>
            <CardDescription>Posts awaiting review</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-light'>
              <span className='text-green-500'>{approvedPosts.length}</span>{" "}
              Approved
            </CardTitle>
            <CardDescription>Published posts</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-2xl font-light'>
              <span className='text-red-500'>{rejectedPosts.length}</span>{" "}
              Rejected
            </CardTitle>
            <CardDescription>Posts that need revision</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Posts Tabs */}
      <Tabs defaultValue='all' className='space-y-6'>
        <TabsList className='bg-[#87CEEB]/5 p-1 rounded-2xl'>
          <TabsTrigger value='all' className='rounded-xl'>
            All Posts
          </TabsTrigger>
          <TabsTrigger value='pending' className='rounded-xl'>
            Pending
          </TabsTrigger>
          <TabsTrigger value='approved' className='rounded-xl'>
            Approved
          </TabsTrigger>
          <TabsTrigger value='rejected' className='rounded-xl'>
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          {posts.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <p className='text-center text-[#2B4C7E]/60'>No posts yet</p>
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
                          Submitted on {formatDate(post.submittedAt)}
                        </p>
                        {post.approvedAt && (
                          <p className='text-sm text-[#2B4C7E]/60'>
                            Approved on {formatDate(post.approvedAt)}
                          </p>
                        )}
                        {post.rejectedAt && (
                          <p className='text-sm text-[#2B4C7E]/60'>
                            Rejected on {formatDate(post.rejectedAt)}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`${
                          post.status === "pending"
                            ? "bg-yellow-500"
                            : post.status === "approved"
                            ? "bg-green-500"
                            : "bg-red-500"
                        } text-white`}>
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </Badge>
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
        </TabsContent>

        <TabsContent value='pending' className='space-y-4'>
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
                          Submitted on {formatDate(post.submittedAt)}
                        </p>
                      </div>
                      <Badge className='bg-yellow-500 text-white'>
                        Pending
                      </Badge>
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
        </TabsContent>

        <TabsContent value='approved' className='space-y-4'>
          {approvedPosts.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <p className='text-center text-[#2B4C7E]/60'>
                  No approved posts
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatePosts(approvedPosts).map((post) => (
                <Card key={post.id}>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='text-lg font-medium text-[#2B4C7E] mb-2'>
                          {post.title}
                        </h3>
                        <p className='text-sm text-[#2B4C7E]/60'>
                          Approved on {formatDate(post.approvedAt || "")}
                        </p>
                      </div>
                      <Badge className='bg-green-500 text-white'>
                        Approved
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {approvedPosts.length > postsPerPage && (
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
                      { length: totalPages(approvedPosts) },
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
                    {currentPage < totalPages(approvedPosts) && (
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
        </TabsContent>

        <TabsContent value='rejected' className='space-y-4'>
          {rejectedPosts.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <p className='text-center text-[#2B4C7E]/60'>
                  No rejected posts
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatePosts(rejectedPosts).map((post) => (
                <Card key={post.id}>
                  <CardContent className='pt-6'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='text-lg font-medium text-[#2B4C7E] mb-2'>
                          {post.title}
                        </h3>
                        <p className='text-sm text-[#2B4C7E]/60'>
                          Rejected on {formatDate(post.rejectedAt || "")}
                        </p>
                      </div>
                      <Badge className='bg-red-500 text-white'>Rejected</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {rejectedPosts.length > postsPerPage && (
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
                      { length: totalPages(rejectedPosts) },
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
                    {currentPage < totalPages(rejectedPosts) && (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
