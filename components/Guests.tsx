import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Brain, 
  Dumbbell, 
  Mountain, 
  Trophy,
  Lightbulb
} from "lucide-react";

export const Guests = () => {
  const guestTypes = [
    {
      icon: <Stethoscope className="w-8 h-8 text-[#87CEEB]" />,
      title: "Medical Experts",
      description: "Leading physicians and healthcare professionals sharing evidence-based insights on physical health and wellness."
    },
    {
      icon: <Brain className="w-8 h-8 text-[#87CEEB]" />,
      title: "Mental Health Specialists",
      description: "Psychologists and therapists discussing mental wellness, emotional intelligence, and personal growth."
    },
    {
      icon: <Dumbbell className="w-8 h-8 text-[#87CEEB]" />,
      title: "Fitness Coaches",
      description: "Expert trainers and athletes sharing strategies for optimal physical performance and healthy living."
    },
    {
      icon: <Mountain className="w-8 h-8 text-[#87CEEB]" />,
      title: "Life Adventurers",
      description: "Explorers and adventurers sharing stories of resilience, courage, and personal transformation."
    },
    {
      icon: <Trophy className="w-8 h-8 text-[#87CEEB]" />,
      title: "High Achievers",
      description: "Industry leaders and entrepreneurs discussing success principles and peak performance."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-[#87CEEB]" />,
      title: "Wellness Innovators",
      description: "Thought leaders introducing cutting-edge approaches to health, wellness, and personal development."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white to-[#87CEEB]/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(135,206,235,0.15),transparent)] z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold font-sans mb-6 text-[#2B4C7E]">
            Our Featured Guests
          </h2>
          <p className="text-[#2B4C7E]/80 text-lg font-medium">
            Learn from diverse experts dedicated to helping you reach your peak potential
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guestTypes.map((guest, index) => (
            <Card 
              key={index}
              className="backdrop-blur-md bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/70 p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#87CEEB]/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#87CEEB]/10 rounded-full -ml-16 -mb-16" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-[#87CEEB]/10 rounded-xl transform group-hover:scale-110 transition-transform duration-300">
                  {guest.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#2B4C7E] group-hover:text-[#2B4C7E]/90">
                  {guest.title}
                </h3>
                <p className="text-[#2B4C7E]/70 font-medium">
                  {guest.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};