import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const iconSize = 22; // Set a consistent size for all icons

  return (
    <footer className='bg-primary-dark text-white'>
      <div className='max-w-7xl mx-auto px-4 py-12'>
        <div className='grid md:grid-cols-3 gap-8 mb-8'>
          <div>
            <h3 className='text-xl font-bold mb-4'>Peak Life Journey</h3>
            <p className='text-white/80'>
              Empowering you to reach your peak potential through inspiring
              conversations and evidence-based insights.
            </p>
          </div>
          <div>
            <h4 className='text-lg font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2'>
              <li>
                <Link href='#episodes' className='text-white/80 hover:text-white'>
                  Episodes
                </Link>
              </li>
              <li>
                <Link href='/news' className='text-white/80 hover:text-white'>
                  News
                </Link>
              </li>
              <li>
                <Link href='#about' className='text-white/80 hover:text-white'>
                  About
                </Link>
              </li>
              <li>
                <Link href='#guests' className='text-white/80 hover:text-white'>
                  Guests
                </Link>
              </li>
              <li>
                <Link href='#contact' className='text-white/80 hover:text-white'>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className='text-lg font-semibold mb-4'>Follow Us</h4>
            <div className='flex space-x-4'>
              <a
                href='https://www.facebook.com/profile.php?id=61570519355657'
                className='text-white/80 hover:text-white'
                target="_blank"
                rel="noopener noreferrer">
                <Facebook size={iconSize} />
              </a>
              <a
                href='https://x.com/PeaklifeJourney'
                className='text-white/80 hover:text-white'
                target="_blank"
                rel="noopener noreferrer">
                <Image
                  src='/icons/x.svg'
                  alt='X (Twitter)'
                  width={iconSize}
                  height={iconSize}
                  className='invert'
                />
              </a>
              <a
                href='https://www.instagram.com/peaklifejourneypodcast/'
                className='text-white/80 hover:text-white'
                target="_blank"
                rel="noopener noreferrer">
                <Instagram size={iconSize} />
              </a>
              <a
                href='https://www.youtube.com/@PeakLifeJourneyPodcast'
                className='text-white/80 hover:text-white'
                target="_blank"
                rel="noopener noreferrer">
                <Youtube size={iconSize} />
              </a>
              <a
                href='https://www.tiktok.com/@peaklifejourneypodcast?lang=en'
                className='text-white/80 hover:text-white'
                target="_blank"
                rel="noopener noreferrer">
                <Image
                  src='/icons/tiktok.svg'
                  alt='TikTok'
                  width={iconSize}
                  height={iconSize}
                  className='invert'
                />
              </a>
            </div>
          </div>
        </div>
        <div className='border-t border-white/10 pt-8 text-center text-white/60'>
          <p>
            &copy; {new Date().getFullYear()} Peak Life Journey. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};