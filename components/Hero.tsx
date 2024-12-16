import { Button } from "@/components/ui/button";
import { 
  SiSpotify, 
  SiYoutube, 
  SiApplepodcasts
} from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const Hero = () => {
  const platforms = [
    {
      name: "Spotify",
      icon: <SiSpotify className="h-8 w-8" />,
      link: "#"
    },
    {
      name: "YouTube",
      icon: <SiYoutube className="h-8 w-8" />,
      link: "#"
    },
    {
      name: "Apple Podcasts",
      icon: <SiApplepodcasts className="h-8 w-8" />,
      link: "#"
    }
  ];

  return (
    <div className="h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-600 to-sky-900 z-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
        <div className="mb-2">
          <span className="text-white tracking-wider text-sm font-medium bg-sky-700/30 px-3 py-1 rounded-full">
            PEAK LIFE JOURNEY
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-md">
              Discover Insights That<br className="hidden md:block" /> Transform Lives
            </h1>
            
            <p className="text-white text-base lg:text-lg max-w-xl drop-shadow-sm">
              Browse through our collection of episodes featuring industry experts and thought leaders.
            </p>

            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    className="bg-white text-sky-900 hover:bg-sky-50 font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Subscribe
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] bg-white shadow-xl border border-sky-100">
                  {platforms.map((platform) => (
                    <DropdownMenuItem key={platform.name} className="cursor-pointer hover:bg-sky-50">
                      <a 
                        href={platform.link} 
                        className="flex items-center gap-3 w-full py-1 text-sky-900"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {platform.icon}
                        <span>{platform.name}</span>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                className="border-white bg-sky-900/20 text-white hover:bg-sky-800/40 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm"
              >
                About Us
              </Button>
            </div>

            <div className="pt-6">
              <p className="text-white text-sm mb-3 drop-shadow-sm">Available on:</p>
              <div className="flex items-center gap-8">
                {platforms.map((platform) => (
                  <a 
                    key={platform.name}
                    href={platform.link} 
                    className="text-white hover:text-sky-200 transition-colors drop-shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {platform.icon}
                    <span className="sr-only">Listen on {platform.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-tr from-white/20 to-sky-900/30 rounded-3xl blur-2xl" />
            <div className="relative backdrop-blur-md bg-white/10 p-4 rounded-2xl border border-white/20 shadow-xl">
              <div className="aspect-video rounded-xl overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80" 
                  alt="Featured Episode"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">Latest Episode</span>
                  <span className="text-sky-200 text-sm">Available Now</span>
                </div>
                <h3 className="text-white font-semibold drop-shadow-sm">Mastering Personal Growth</h3>
                <p className="text-sky-100 text-sm line-clamp-2">
                  Join us as we explore strategies for personal development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};