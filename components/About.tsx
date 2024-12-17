'use client'

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Heart, Mountain, Stars } from "lucide-react";
import { useEffect, useRef } from "react";

export const About = () => {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-amber-500" />,
      title: "Evidence-Based Insights",
      description: "Cutting-edge research and scientific findings translated into actionable advice."
    },
    {
      icon: <Heart className="w-6 h-6 text-amber-500" />,
      title: "Holistic Wellness",
      description: "Comprehensive approach to health covering physical, mental, and emotional well-being."
    },
    {
      icon: <Mountain className="w-6 h-6 text-amber-500" />,
      title: "Peak Performance",
      description: "Strategies and techniques to achieve optimal performance in all life aspects."
    },
    {
      icon: <Stars className="w-6 h-6 text-amber-500" />,
      title: "Transformative Stories",
      description: "Inspiring journeys of individuals who've reached their peak potential."
    }
  ];

  const animateTitle = (element: HTMLElement) => {
    const text = element.textContent || "";
    element.textContent = "";
    
    const createSpans = () => {
      element.innerHTML = "";
      return text.split("").map((char, i) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.setProperty("--index", `${i}`);
        span.className = "inline-block animate-shimmer";
        element.appendChild(span);
        return span;
      });
    };

    createSpans();
    setInterval(createSpans, 4000); 
  };

  useEffect(() => {
    const titles = document.querySelectorAll(".feature-title");
    titles.forEach(title => {
      if (title instanceof HTMLElement) {
        animateTitle(title);
      }
    });
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-amber-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,183,77,0.1),transparent)] z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold font-sans mb-6 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            About Peak Life Journey
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Where we all thrive, one step at a time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="backdrop-blur-md bg-white/30 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/40 p-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="p-3 bg-amber-500/10 rounded-full">
                  {feature.icon}
                </div>
                <div className="w-full overflow-hidden">
                  <h3 className="text-xl font-semibold text-amber-900 whitespace-nowrap animate-marquee">
                    {feature.title} • {feature.title} • {feature.title} •
                  </h3>
                </div>
                <p className="text-gray-700">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-lg md:max-w-none mx-auto">
          <Card className="backdrop-blur-md bg-white/30 border-white/20 p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col h-full relative z-10 text-center md:text-left">
              <div className="p-3 bg-amber-500/10 rounded-full w-fit mb-4 mx-auto md:mx-0">
                <Stars className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                Peak Life Journey is dedicated to providing evidence-based insights, transformative stories, and practical advice from leading experts in health, fitness, wellness, and personal growth. Through engaging conversations with medical consultants, wellness coaches, high achievers, and adventurers, the podcast strives to educate, motivate, and guide listeners on their journey to achieving their best selves—mind, body, and soul.
              </p>
            </div>
          </Card>
          <Card className="backdrop-blur-md bg-white/30 border-white/20 p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex flex-col h-full relative z-10 text-center md:text-left">
              <div className="p-3 bg-amber-500/10 rounded-full w-fit mb-4 mx-auto md:mx-0">
                <Mountain className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4">Our Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To inspire a global community to embrace a holistic approach to health, wellness, and happiness, empowering individuals to achieve balance, fulfillment, and peak performance in all aspects of life.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};