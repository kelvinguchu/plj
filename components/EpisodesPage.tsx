"use client";

import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import { Episode, getEpisodes } from "@/lib/episodeService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Loader } from "@/components/ui/loader";
import EpisodeManagementSheet from "@/components/EpisodeManagementSheet";
import { Card } from "@/components/ui/card";
import { Calendar, Settings, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Memoized episode card component
const EpisodeCard = memo(
  ({
    episode,
    onPlay,
    createEmbedCode,
    getYouTubeId,
  }: {
    episode: Episode;
    onPlay: (episode: Episode) => void;
    createEmbedCode: (videoId: string, isDialog: boolean) => string;
    getYouTubeId: (embedCode: string) => string | null;
  }) => {
    const videoId = getYouTubeId(episode.embedCode);
    if (!videoId) return null;

    return (
      <Card className='backdrop-blur-md bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/70 overflow-hidden group'>
        <div className='relative aspect-video overflow-hidden bg-sky-50'>
          <div
            dangerouslySetInnerHTML={{
              __html: createEmbedCode(videoId, false),
            }}
            className='absolute inset-0'
          />
          <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
            <Button
              variant='ghost'
              size='icon'
              className='text-white hover:text-white hover:bg-sky-500/20 rounded-full p-8'
              onClick={() => onPlay(episode)}>
              <Play className='h-8 w-8' />
            </Button>
          </div>
        </div>

        <div className='p-6'>
          <div className='relative z-10'>
            <h3 className='text-xl font-semibold text-gray-900 mb-2 group-hover:text-sky-700 transition-colors'>
              {episode.title}
            </h3>
            <p className='text-gray-600 mb-4 line-clamp-2'>
              {episode.description}
            </p>
            <div className='flex items-center justify-end text-sm text-gray-500'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  {new Date(episode.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

EpisodeCard.displayName = "EpisodeCard";

export default function EpisodesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const episodesPerPage = 6;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Optimized query with better caching
  const { data: episodes = [], isLoading } = useQuery<Episode[]>({
    queryKey: ["episodes"],
    queryFn: getEpisodes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount
  });

  // Prefetch next page of data
  useEffect(() => {
    if (episodes.length > episodesPerPage * currentPage) {
      queryClient.prefetchQuery({
        queryKey: ["episodes"],
        queryFn: getEpisodes,
      });
    }
  }, [currentPage, episodes.length, queryClient]);

  // Memoize sorted episodes
  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort(
      (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
    );
  }, [episodes]);

  // Memoize pagination calculations
  const { currentEpisodes, totalPages } = useMemo(() => {
    const indexOfLastEpisode = currentPage * episodesPerPage;
    const indexOfFirstEpisode = indexOfLastEpisode - episodesPerPage;
    const current = sortedEpisodes.slice(
      indexOfFirstEpisode,
      indexOfLastEpisode
    );
    const total = Math.ceil(sortedEpisodes.length / episodesPerPage);

    return {
      currentEpisodes: current,
      totalPages: total,
    };
  }, [currentPage, sortedEpisodes, episodesPerPage]);

  // Utility functions for video handling
  const getYouTubeId = useCallback((embedCode: string) => {
    try {
      const match = embedCode.match(/embed\/([\w-]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error extracting YouTube ID:", error);
      return null;
    }
  }, []);

  const createEmbedCode = useCallback((videoId: string, isDialog: boolean) => {
    try {
      const baseParams = new URLSearchParams({
        enablejsapi: "1",
        rel: "0",
        modestbranding: "1",
        ...(isDialog && { autoplay: "1" }),
      }).toString();

      return `
        <iframe 
          width="100%" 
          height="100%" 
          src="https://www.youtube.com/embed/${videoId}?${baseParams}"
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      `.trim();
    } catch (error) {
      console.error("Error creating embed code:", error);
      return "";
    }
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      try {
        const iframe = dialogContentRef.current?.querySelector("iframe");
        if (iframe) {
          iframe.src = iframe.src;
        }
      } catch (error) {
        console.error("Error cleaning up iframe:", error);
      }
    }
    setSelectedEpisode(null);
  }, []);

  const handlePlay = useCallback((episode: Episode) => {
    setSelectedEpisode(episode);
  }, []);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col'>
      <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20'>
        <div className='flex justify-between items-center mb-16'>
          <div>
            <h1 className='text-4xl font-bold font-sans mb-6 bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent'>
              All Episodes
            </h1>
            <p className='text-gray-600 text-lg font-medium'>
              Explore our complete collection of episodes
            </p>
          </div>

          {isAuthChecked && isAuthenticated && (
            <div className='flex items-center gap-4'>
              <Button
                onClick={() => router.push("/admin/episodes/new")}
                className='bg-sky-600 hover:bg-sky-700 text-white'>
                Add New Episode
              </Button>
              <Button
                variant='outline'
                className='border-sky-200 text-sky-700 hover:bg-sky-50'
                onClick={() => setIsManagementOpen(true)}>
                <Settings className='h-4 w-4 mr-2' />
                Manage Episodes
              </Button>
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
          {currentEpisodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              onPlay={handlePlay}
              createEmbedCode={createEmbedCode}
              getYouTubeId={getYouTubeId}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='text-sky-700 hover:text-sky-800 border-sky-200'>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant='outline'
                onClick={() => setCurrentPage(page)}
                className={`
                  ${
                    currentPage === page
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "text-sky-700 hover:text-sky-800 border-sky-200"
                  }
                `}>
                {page}
              </Button>
            ))}
            <Button
              variant='outline'
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className='text-sky-700 hover:text-sky-800 border-sky-200'>
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Video Preview Dialog */}
      <Dialog open={!!selectedEpisode} onOpenChange={handleOpenChange}>
        <DialogContent
          ref={dialogContentRef}
          className='max-w-[90vw] w-full md:max-w-[800px] max-h-[90vh] p-0 overflow-hidden bg-white/95 backdrop-blur-sm border border-sky-100'>
          <DialogHeader className='p-4 md:p-6 bg-gradient-to-r from-sky-50 to-white border-b border-sky-100'>
            <DialogTitle className='text-lg md:text-xl line-clamp-1 text-[#2B4C7E] font-semibold'>
              {selectedEpisode?.title}
            </DialogTitle>
            <DialogDescription className='sr-only'>
              Watch {selectedEpisode?.title}
            </DialogDescription>
          </DialogHeader>
          <div className='relative w-full aspect-video bg-black'>
            {selectedEpisode && getYouTubeId(selectedEpisode.embedCode) && (
              <div
                dangerouslySetInnerHTML={{
                  __html: createEmbedCode(
                    getYouTubeId(selectedEpisode.embedCode) || "",
                    true
                  ),
                }}
                className='absolute inset-0 w-full h-full'
              />
            )}
          </div>
          <div className='p-4 md:p-6 overflow-y-auto max-h-[30vh] bg-gradient-to-b from-white to-sky-50'>
            <p className='text-[#2B4C7E]/80 text-sm md:text-base'>
              {selectedEpisode?.description}
            </p>
            <div className='flex items-center justify-end mt-4 text-xs md:text-sm text-[#2B4C7E]/60'>
              <Calendar className='h-4 w-4 mr-2' />
              {selectedEpisode &&
                new Date(selectedEpisode.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EpisodeManagementSheet
        episodes={episodes}
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />
    </div>
  );
}
