import { Button } from "@/components/ui/button";
import { SiSpotify, SiYoutube, SiApplepodcasts } from "react-icons/si";
import { SubscribeDropdown } from "@/components/SubscribeDropdown";
import { useQuery } from "@tanstack/react-query";
import { getEpisodes } from "@/lib/episodeService";
import { Episode } from "@/lib/episodeService";

export const Hero = () => {
  const platforms = [
    {
      name: "Spotify",
      icon: <SiSpotify className='h-8 w-8' />,
      link: "https://open.spotify.com/show/7ap7YD9kvk4vT418WDur2e",
    },
    {
      name: "YouTube",
      icon: <SiYoutube className='h-8 w-8' />,
      link: "https://www.youtube.com/@PeakLifeJourneyPodcast",
    },
    {
      name: "Apple Podcasts",
      icon: <SiApplepodcasts className='h-8 w-8' />,
      link: "#",
    },
  ];

  const { data: latestEpisode } = useQuery<Episode>({
    queryKey: ["episodes", "latest"],
    queryFn: async () => {
      console.log('[Hero] Fetching episodes for latest episode');
      const episodes = await getEpisodes();
      console.log('[Hero] Received episodes for latest:', episodes);
      const latest = episodes.sort((a, b) => 
        new Date(b.date).valueOf() - new Date(a.date).valueOf()
      )[0];
      console.log('[Hero] Selected latest episode:', latest);
      return latest;
    },
  });

  const renderLatestEpisode = () => {
    if (!latestEpisode) return null;
    console.log('[Hero] Rendering latest episode embed code');
    
    return (
      <>
        <div className='aspect-video rounded-xl overflow-hidden mb-3'>
          <div 
            dangerouslySetInnerHTML={{ __html: latestEpisode.embedCode }}
            className="w-full h-full"
          />
        </div>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sky-900 font-medium text-sm'>
              Latest Episode
            </span>
            <span className='text-sky-900/60 text-sm'>
              {new Date(latestEpisode.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h3 className='text-sky-900 font-semibold'>
            {latestEpisode.title}
          </h3>
          <p className='text-sky-900/70 text-sm line-clamp-2'>
            {latestEpisode.description}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className='h-screen relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-sky-400/40 to-[#0C4A6E] z-0' />
      <div className='absolute inset-0 bg-[linear-gradient(to_bottom,transparent_80%,#0C4A6E_100%)] z-0' />

      <div className='relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center'>
        <div className='mb-2'>
          <span className='text-sky-900 tracking-wider text-sm font-medium bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm'>
            PEAK LIFE JOURNEY
          </span>
        </div>

        <div className='grid lg:grid-cols-2 gap-8 items-center'>
          <div className='space-y-6'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight'>
              Discover Insights That Transform Lives
            </h1>

            <p className='text-sky-100 text-lg lg:text-xl max-w-xl'>
              Browse through our collection of episodes featuring industry
              experts and thought leaders.
            </p>

            <div className='flex gap-4'>
              <SubscribeDropdown />
              <Button
                variant='outline'
                className='border-sky-900 text-sky-900 hover:bg-sky-900/5 shadow-md hover:shadow-lg transition-all'>
                About Us
              </Button>
            </div>

            <div className='pt-6'>
              <p className='text-white/70 text-sm mb-3'>Available on:</p>
              <div className='flex items-center gap-8'>
                {platforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.link}
                    className='text-sky-100 hover:text-white transition-colors'
                    target='_blank'
                    rel='noopener noreferrer'>
                    {platform.icon}
                    <span className='sr-only'>Listen on {platform.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className='relative hidden lg:block'>
            <div className='absolute -inset-4 bg-gradient-to-tr from-white/40 to-sky-400/20 rounded-3xl blur-2xl' />
            <div className='relative bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-lg'>
              {renderLatestEpisode()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
