import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Episode, deleteEpisode } from "@/lib/episodeService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Pencil, Trash2 } from "lucide-react";

interface EpisodeManagementSheetProps {
  episodes: Episode[];
  isOpen: boolean;
  onClose: () => void;
}

export default function EpisodeManagementSheet({
  episodes,
  isOpen,
  onClose,
}: EpisodeManagementSheetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);

  const handleEdit = (episode: Episode) => {
    router.push(`/admin/episodes/edit/${episode.id}`);
    onClose();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEpisode(id);
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
      setEpisodeToDelete(null);
      toast({
        title: "Success",
        description: "Episode deleted successfully!",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error("Error deleting episode:", error);
      toast({
        title: "Error",
        description: "Failed to delete episode. Please try again.",
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-2xl font-light">
              Manage <span className="text-sky-700">Episodes</span>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-8 space-y-4">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className="flex flex-col p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">
                      {episode.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {episode.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(episode.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(episode)}
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors duration-200"
                      title="Edit episode"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEpisodeToDelete(episode.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete episode"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!episodeToDelete} onOpenChange={() => setEpisodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the episode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => episodeToDelete && handleDelete(episodeToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 