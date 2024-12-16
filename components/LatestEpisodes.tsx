import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar } from "lucide-react";

export const LatestEpisodes = () => {
  const episodes = [
    {
      title: "The Science of Peak Performance",
      description: "Discover the latest research on achieving optimal mental and physical performance.",
      duration: "45 mins",
      date: "Mar 15, 2024",
      image: "https://images.unsplash.com/photo-1589279003513-467d320f47eb?auto=format&fit=crop&q=80"
    },
    {
      title: "Mindfulness in Modern Life",
      description: "Practical techniques for maintaining balance in today's fast-paced world.",
      duration: "38 mins",
      date: "Mar 12, 2024",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
    },
    {
      title: "Nutrition for Optimal Health",
      description: "Expert insights on fueling your body for peak performance and longevity.",
      duration: "42 mins",
      date: "Mar 8, 2024",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#87CEEB]/20 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(135,206,235,0.15),transparent)] z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold font-sans mb-6 text-white">
            Latest Episodes
          </h2>
          <p className="text-white/80 text-lg font-medium">
            Explore our most recent conversations with industry experts
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {episodes.map((episode, index) => (
            <Card 
              key={index}
              className="backdrop-blur-md bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/70 overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#87CEEB]/20 to-transparent z-10" />
                <img 
                  src={episode.image} 
                  alt={episode.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <Button 
                  size="icon"
                  className="absolute bottom-4 right-4 z-20 bg-[#87CEEB]/80 hover:bg-[#87CEEB] backdrop-blur-sm border-white/20"
                >
                  <Play className="h-4 w-4 text-white" />
                </Button>
              </div>

              <div className="p-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#87CEEB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-[#2B4C7E] mb-2 group-hover:text-[#2B4C7E]/90">
                    {episode.title}
                  </h3>
                  <p className="text-[#2B4C7E]/80 mb-4 line-clamp-2 font-medium">
                    {episode.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-[#2B4C7E]/70 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{episode.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{episode.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            className="backdrop-blur-md bg-[#2B4C7E] hover:bg-[#2B4C7E]/90 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
          >
            View All Episodes
          </Button>
        </div>
      </div>
    </section>
  );
};