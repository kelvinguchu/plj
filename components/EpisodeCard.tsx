import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

interface EpisodeCardProps {
  title: string;
  guest: string;
  duration: string;
  category: string;
  description: string;
}

export const EpisodeCard = ({ title, guest, duration, category, description }: EpisodeCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 animate-fade-up h-full">
      <CardHeader className="p-6">
        <div className="text-sm text-primary-dark font-medium mb-2">{category}</div>
        <h3 className="text-xl font-bold font-sans line-clamp-2 mb-2">{title}</h3>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{guest}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{duration}</span>
          </div>
        </div>
        <p className="text-gray-600 text-base line-clamp-3">{description}</p>
      </CardContent>
    </Card>
  );
};