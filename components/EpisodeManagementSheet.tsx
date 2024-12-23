import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
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
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const EPISODES_PER_PAGE = 10;

interface Episode {
  id: string;
  title: string;
  description: string;
  date: any;
  image?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  applePodcastUrl?: string;
  guestName?: string;
}

export default function EpisodeManagementSheet() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: episodes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["manageEpisodes", currentPage],
    queryFn: async () => {
      const episodesRef = collection(db, "episodes");
      const q = query(episodesRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date:
          doc.data().date?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
      })) as Episode[];
    },
  });

  const filteredEpisodes = episodes.filter(
    (episode) =>
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.guestName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "episodes", id));
      await queryClient.invalidateQueries({ queryKey: ["manageEpisodes"] });
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });

      toast({
        title: "Success",
        description: "Episode deleted successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete episode",
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleEdit = (episode: Episode) => {
    router.push(`/admin/episodes/edit/${episode.id}`);
  };

  const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * EPISODES_PER_PAGE,
    currentPage * EPISODES_PER_PAGE
  );

  return (
    <Sheet>
      <SheetTrigger className='p-2 hover:bg-[#87CEEB]/10 rounded-xl transition duration-200'>
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
            d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
          />
        </svg>
      </SheetTrigger>
      <SheetContent className='min-w-[40vw] sm:w-[90vw] overflow-y-auto bg-white border-l border-[#87CEEB]/20'>
        <SheetHeader>
          <SheetTitle className='text-[#2B4C7E]'>Manage Episodes</SheetTitle>
          <SheetDescription className='text-[#2B4C7E]/70'>
            View, edit, or delete your podcast episodes
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6'>
          <Input
            type='search'
            placeholder='Search episodes by title or guest name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full rounded-2xl bg-[#87CEEB]/5 border-[#87CEEB]/20 placeholder:text-[#2B4C7E]/40 focus:border-[#2B4C7E] focus:ring-[#2B4C7E]'
          />
        </div>

        <div className='mt-8 space-y-4'>
          {isLoading ? (
            <div className='py-8'>
              <Loader />
            </div>
          ) : paginatedEpisodes.length === 0 ? (
            <div className='text-center py-8 text-[#2B4C7E]/70'>
              {searchQuery ? "No matching episodes found" : "No episodes found"}
            </div>
          ) : (
            <>
              {paginatedEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  className='flex items-start space-x-4 p-4 rounded-2xl border border-[#87CEEB]/20 hover:bg-[#87CEEB]/5 transition-colors duration-200'>
                  {episode.image && (
                    <div className='relative w-20 h-20 flex-shrink-0'>
                      <Image
                        src={episode.image}
                        alt={episode.title}
                        fill
                        className='rounded-xl object-cover'
                        sizes='80px'
                        unoptimized
                      />
                    </div>
                  )}
                  <div className='flex-1 min-w-0'>
                    <h4 className='text-sm font-medium text-[#2B4C7E] truncate'>
                      {episode.title}
                    </h4>
                    <p className='text-sm text-[#2B4C7E]/70'>
                      {episode.guestName && `with ${episode.guestName} • `}
                      {new Date(episode.date).toLocaleDateString()}
                    </p>
                    <div className='flex gap-2 mt-2'>
                      {episode.spotifyUrl && (
                        <a
                          href={episode.spotifyUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-green-500 hover:text-green-600'>
                          <svg className='w-5 h-5' viewBox='0 0 24 24'>
                            <path
                              fill='currentColor'
                              d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z'
                            />
                          </svg>
                        </a>
                      )}
                      {episode.youtubeUrl && (
                        <a
                          href={episode.youtubeUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-red-500 hover:text-red-600'>
                          <svg className='w-5 h-5' viewBox='0 0 24 24'>
                            <path
                              fill='currentColor'
                              d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
                            />
                          </svg>
                        </a>
                      )}
                      {episode.applePodcastUrl && (
                        <a
                          href={episode.applePodcastUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-purple-500 hover:text-purple-600'>
                          <svg className='w-5 h-5' viewBox='0 0 24 24'>
                            <path
                              fill='currentColor'
                              d='M7.707 24h8.586A7.707 7.707 0 0024 16.293V7.707A7.707 7.707 0 0016.293 0H7.707A7.707 7.707 0 000 7.707v8.586A7.707 7.707 0 007.707 24zM12 4.656a1.344 1.344 0 110 2.688 1.344 1.344 0 010-2.688zM6 12c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6zm10.5 0c0-2.484-2.016-4.5-4.5-4.5s-4.5 2.016-4.5 4.5 2.016 4.5 4.5 4.5 4.5-2.016 4.5-4.5z'
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => handleEdit(episode)}
                      className='p-2 text-[#2B4C7E] hover:bg-[#87CEEB]/10 rounded-xl transition-colors duration-200'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    </button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className='p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
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
                      <AlertDialogContent className='bg-white border border-[#87CEEB]/20 rounded-3xl'>
                        <AlertDialogHeader>
                          <AlertDialogTitle className='text-[#2B4C7E]'>
                            Delete Episode
                          </AlertDialogTitle>
                          <AlertDialogDescription className='text-[#2B4C7E]/70'>
                            Are you sure you want to delete this episode? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className='text-[#2B4C7E] bg-[#87CEEB]/10 hover:bg-[#87CEEB]/20 rounded-xl border-0'>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(episode.id)}
                            className='bg-red-500 hover:bg-red-600 text-white rounded-xl border-0'>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <Pagination className='mt-6'>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                          }}
                        />
                      </PaginationItem>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
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
                      )
                    )}
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            );
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
      </SheetContent>
    </Sheet>
  );
}
