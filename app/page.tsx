'use client'

import { Hero } from "@/components/Hero";
import { LatestEpisodes } from "@/components/LatestEpisodes";
import { About } from "@/components/About";
import { Guests } from "@/components/Guests";
import { Contact } from "@/components/Contact";
import { News } from "@/components/News";

export default function Home() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-primary-dark to-primary/20'>
      <Hero />
      <section id='episodes'>
        <LatestEpisodes />
      </section>
      <section id='about'>
        <About />
      </section>
      <section id='guests'>
        <Guests />
      </section>
      <section id='news'>
        <News />
      </section>
      <section id='contact'>
        <Contact />
      </section>
    </main>
  );
} 