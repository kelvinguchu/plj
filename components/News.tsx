import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// This would typically come from an API or database
const latestNews = [
  {
    title: "The Science of Deep Sleep",
    date: "October 15, 2023",
    category: "Wellness",
    excerpt: "Discover the latest research on how deep sleep affects cognitive performance and emotional well-being.",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80"
  },
  {
    title: "Marathon Success Stories",
    date: "October 12, 2023",
    category: "Performance",
    excerpt: "Meet the everyday heroes who transformed their lives through long-distance running.",
    imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80"
  },
  {
    title: "Mindfulness in the Digital Age",
    date: "October 10, 2023",
    category: "Mental Health",
    excerpt: "How to maintain mental clarity and focus in an increasingly connected world.",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"
  },
  {
    title: "Nutrition Myths Debunked",
    date: "October 8, 2023",
    category: "Health",
    excerpt: "Leading nutritionists separate fact from fiction in popular diet trends.",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80"
  }
];

export const News = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold font-sans mb-6 bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
            News & Stories
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Stay updated with the latest insights, research, and success stories in health and wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {latestNews.map((story, index) => (
            <Card 
              key={index}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden backdrop-blur-md bg-white/30 border-white/20"
            >
              <div className="aspect-video w-full overflow-hidden bg-amber-100">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    {story.category}
                  </span>
                  <span className="text-xs text-gray-500">{story.date}</span>
                </div>
                <h3 className="font-semibold text-lg text-[#1a3152] mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {story.excerpt}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/news">
            <Button 
              variant="ghost" 
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-lg font-medium"
            >
              View All News
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}; 