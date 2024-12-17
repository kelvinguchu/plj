import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar } from "lucide-react";
import { Episode } from "@/lib/episodeService";
import { useQuery } from "@tanstack/react-query";
import { getEpisodes } from "@/lib/episodeService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState, useMemo, useCallback, useRef, memo } from "react";

// Memoize the episode card component
const EpisodeCard = memo(({ 
  episode, 
  onPlay,
  createEmbedCode,
  getYouTubeId 
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
      <div className='relative aspect-video overflow-hidden'>
        <div
          dangerouslySetInnerHTML={{
            __html: createEmbedCode(videoId, false)
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

      <div className='p-6 relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#87CEEB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        <div className='relative z-10'>
          <h3 className='text-xl font-semibold text-[#2B4C7E] mb-2 group-hover:text-[#2B4C7E]/90'>
            {episode.title}
          </h3>
          <p className='text-[#2B4C7E]/80 mb-4 line-clamp-2 font-medium'>
            {episode.description}
          </p>
          <div className='flex items-center justify-end text-sm text-[#2B4C7E]/70 font-medium'>
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
});

EpisodeCard.displayName = 'EpisodeCard';

export const LatestEpisodes = () => {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const { data: episodes = [] } = useQuery<Episode[]>({
    queryKey: ["episodes"],
    queryFn: getEpisodes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes

  });

  const sortedEpisodes = useMemo(() => {
    if (!episodes) return [];
    
    return episodes
      .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
      .slice(0, 3);
  }, [episodes]);

  // Memoize utility functions
  const getYouTubeId = useCallback((embedCode: string) => {
    try {
      const match = embedCode.match(/embed\/([\w-]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting YouTube ID:', error);
      return null;
    }
  }, []);

  const createEmbedCode = useCallback((videoId: string, isDialog: boolean) => {
    try {
      const baseParams = new URLSearchParams({
        enablejsapi: '1',
        rel: '0',
        modestbranding: '1',
        ...(isDialog && { autoplay: '1' })
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
      console.error('Error creating embed code:', error);
      return '';
    }
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      try {
        const iframe = dialogContentRef.current?.querySelector('iframe');
        if (iframe) {
          // Stop video playback
          iframe.src = iframe.src;
        }
      } catch (error) {
        console.error('Error cleaning up iframe:', error);
      }
    }
    setSelectedEpisode(null);
  }, []);

  const handlePlay = useCallback((episode: Episode) => {
    setSelectedEpisode(episode);
  }, []);

  return (
    <section className='py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
      <div className='absolute inset-0 bg-[linear-gradient(to_bottom,#0C4A6E_0%,white_100%)] z-0' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(135,206,235,0.15),transparent)] z-0' />
      <div className='relative z-10 px-4 sm:px-6 lg:px-8 py-20'>
        <div className='max-w-7xl mx-auto relative z-10'>
          <div className='text-center max-w-3xl mx-auto mb-16'>
            <h2 className='text-4xl font-bold font-sans mb-6 text-white'>
              Latest Episodes
            </h2>
            <p className='text-white/80 text-lg font-medium'>
              Explore our most recent conversations with industry experts
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {sortedEpisodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onPlay={handlePlay}
                createEmbedCode={createEmbedCode}
                getYouTubeId={getYouTubeId}
              />
            ))}
          </div>

          <div className='text-center mt-12'>
            <Button
              className='backdrop-blur-md bg-[#2B4C7E] hover:bg-[#2B4C7E]/90 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 font-medium'
              onClick={() => (window.location.href = "/episodes")}>
              View All Episodes
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEpisode} onOpenChange={handleOpenChange}>
        <DialogContent 
          ref={dialogContentRef}
          className="max-w-[90vw] w-full md:max-w-[800px] max-h-[90vh] p-0 overflow-hidden bg-white/95 backdrop-blur-sm border border-sky-100"
        >
          <DialogHeader className="p-4 md:p-6 bg-gradient-to-r from-sky-50 to-white border-b border-sky-100">
            <DialogTitle className="text-lg md:text-xl line-clamp-1 text-[#2B4C7E] font-semibold">
              {selectedEpisode?.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Watch {selectedEpisode?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black">
            {selectedEpisode && getYouTubeId(selectedEpisode.embedCode) && (
              <div
                dangerouslySetInnerHTML={{ 
                  __html: createEmbedCode(getYouTubeId(selectedEpisode.embedCode) || '', true)
                }}
                className="absolute inset-0 w-full h-full"
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
    </section>
  );
};
