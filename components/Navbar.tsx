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
import { useState } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const platforms = [
    {
      name: "Spotify",
      icon: <SiSpotify className='h-5 w-5' />,
      link: "#",
    },
    {
      name: "YouTube",
      icon: <SiYoutube className='h-5 w-5' />,
      link: "#",
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

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/30 border-b border-white/20'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <NextLink href='/' className='text-[#1a3152] font-bold text-xl'>
            PLJ
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
                className='text-[#1a3152] hover:text-[#2B4C7E] cursor-pointer capitalize font-medium'>
                {section}
              </ScrollLink>
            ))}
          </div>

          {/* Desktop Subscribe Button */}
          <div className='hidden md:block'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='bg-primary hover:bg-primary/80 text-[#082757]'>
                  Subscribe
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-[200px] bg-white/60 backdrop-blur-sm border border-white/20'>
                {platforms.map((platform) => (
                  <DropdownMenuItem
                    key={platform.name}
                    className='cursor-pointer'>
                    <a
                      href={platform.link}
                      className='flex items-center gap-3 w-full py-1 text-[#1a3152] font-medium'
                      target='_blank'
                      rel='noopener noreferrer'>
                      {platform.icon}
                      <span>{platform.name}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className='md:hidden'>
              <Button
                variant='ghost'
                size='icon'
                className='text-[#1a3152] h-10 w-10'>
                <Menu className='h-12 w-12' />
              </Button>
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
