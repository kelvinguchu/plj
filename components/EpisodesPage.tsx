"use client";

import { useEffect, useState, useMemo } from "react";
import { Episode, getEpisodes } from "@/lib/episodeService";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Loader } from "@/components/ui/loader";
import EpisodeManagementSheet from "@/components/EpisodeManagementSheet";
import { Card } from "@/components/ui/card";
import { Calendar, Settings } from "lucide-react";

export default function EpisodesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const episodesPerPage = 6;
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Fetch episodes with caching
  const { data: episodes = [] } = useQuery<Episode[]>({
    queryKey: ["episodes"],
    queryFn: getEpisodes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

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

  if (episodes.length === 0) {
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
            <Card
              key={episode.id}
              className='backdrop-blur-md bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/70 overflow-hidden'>
              <div className='relative aspect-video overflow-hidden bg-sky-50'>
                <div
                  dangerouslySetInnerHTML={{ __html: episode.embedCode }}
                  className='absolute inset-0'
                />
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

      <EpisodeManagementSheet
        episodes={episodes}
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />
    </div>
  );
}
