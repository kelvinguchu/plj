import { Button } from "@/components/ui/button";
import { SiSpotify, SiYoutube, SiApplepodcasts } from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SubscribeDropdownProps {
  variant?: 'default' | 'floating';
  buttonClassName?: string;
}

export const SubscribeDropdown = ({ variant = 'default', buttonClassName }: SubscribeDropdownProps) => {
  const platforms = [
    {
      name: "Spotify",
      icon: <SiSpotify className='h-5 w-5' />,
      link: "https://open.spotify.com/show/7ap7YD9kvk4vT418WDur2e",
    },
    {
      name: "YouTube",
      icon: <SiYoutube className='h-5 w-5' />,
      link: "https://www.youtube.com/@PeakLifeJourneyPodcast",
    },
    {
      name: "Apple Podcasts",
      icon: <SiApplepodcasts className='h-5 w-5' />,
      link: "#",
    },
  ];

  const defaultButtonStyle = variant === 'floating' 
    ? 'bg-[#2B4C7E] hover:bg-[#2B4C7E]/90 text-white rounded-full px-6 py-6 shadow-lg hover:shadow-xl transition-all duration-300'
    : 'bg-sky-900 text-white hover:bg-sky-800 font-medium shadow-md hover:shadow-lg transition-all';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={buttonClassName || defaultButtonStyle}>
          Subscribe
          {variant === 'floating' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={variant === 'floating' ? 'end' : 'start'}
        className="w-[200px] bg-white/60 backdrop-blur-sm border border-[#87CEEB]/20 rounded-xl mt-2"
      >
        {platforms.map((platform) => (
          <DropdownMenuItem
            key={platform.name}
            className="cursor-pointer focus:bg-[#87CEEB]/10"
          >
            <a
              href={platform.link}
              className="flex items-center gap-3 w-full py-1 text-[#2B4C7E] font-medium"
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
  );
}; 