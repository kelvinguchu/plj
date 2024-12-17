"use client";

import { Button } from "@/components/ui/button";
import { Link as ScrollLink } from "react-scroll";
import NextLink from "next/link";
import { SiSpotify, SiYoutube, SiApplepodcasts } from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SubscribeDropdown } from "@/components/SubscribeDropdown";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = ["episodes", "news", "about", "guests", "contact"];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const getTextColor = () => {
    if (isHomePage && !hasScrolled) {
      return "text-white";
    }
    return "text-[#1a3152]";
  };

  const getHoverColor = () => {
    if (isHomePage && !hasScrolled) {
      return "hover:text-white/80";
    }
    return "hover:text-[#2B4C7E]";
  };

  return (
    <nav className='fixed max-w-[100vw] top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/30 border-b border-white/20'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <NextLink href='/' className='text-[#004B87] py-2.5'>
            <Image
              src='/logo.png'
              alt='Peak Life Journey'
              width={85}
              height={85}
              className={`transition-all duration-300 ${
                hasScrolled || !isHomePage ? "" : "brightness-0 invert"
              }`}
              priority
            />
          </NextLink>

          {/* Desktop Navigation */}
          <div className='hidden md:flex space-x-8'>
            {navLinks.map((section) => (
              <ScrollLink
                key={section}
                to={section}
                smooth={true}
                duration={500}
                offset={-64}
                className={`${getTextColor()} ${getHoverColor()} cursor-pointer capitalize font-medium transition-colors duration-300`}>
                {section}
              </ScrollLink>
            ))}
          </div>

          {/* Desktop Subscribe Button */}
          <div className='hidden md:block'>
            <SubscribeDropdown 
              buttonClassName={`${
                isHomePage && !hasScrolled
                  ? "bg-white text-[#082757]"
                  : "bg-primary text-[#082757]"
              } hover:bg-primary/80 transition-all duration-300`}
            />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <button className={`p-2 hover:bg-white/10 rounded-lg transition-colors duration-300 ${getTextColor()}`}>
                <Menu className='w-7 h-7 sm:w-8 sm:h-8' />
              </button>
            </SheetTrigger>
            <SheetContent
              side='right'
              className='w-[300px] bg-white/95 backdrop-blur-md'>
              <div className='flex flex-col space-y-6 mt-6'>
                {navLinks.map((section) => (
                  <ScrollLink
                    key={section}
                    to={section}
                    smooth={true}
                    duration={500}
                    offset={-64}
                    className='text-[#1a3152] hover:text-[#2B4C7E] cursor-pointer capitalize font-medium text-lg'
                    onClick={handleLinkClick}>
                    {section}
                  </ScrollLink>
                ))}

                {/* Mobile Subscribe Section */}
                <div className='pt-4 border-t border-gray-200'>
                  <p className='text-[#1a3152] font-medium mb-4'>
                    Subscribe on:
                  </p>
                  <div className='space-y-4'>
                    {platforms.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.link}
                        className='flex items-center gap-3 text-[#1a3152] hover:text-[#2B4C7E]'
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={handleLinkClick}>
                        {platform.icon}
                        <span className='font-medium'>{platform.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
