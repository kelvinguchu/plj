"use client";
import { useState, useEffect } from "react";
import { updateEpisode, Episode } from "@/lib/episodeService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { Loader } from "@/components/ui/loader";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

export default function EditEpisode({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    embedCode: "",
    date: "",
  });

  // Fetch episode data
  const { data: episode, isLoading: isLoadingEpisode } = useQuery<Episode>({
    queryKey: ["episode", params.id],
    queryFn: async () => {
      const docRef = doc(db, "episodes", params.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Episode not found");
      return { id: docSnap.id, ...docSnap.data() } as Episode;
    },
    enabled: !!params.id,
  });

  useEffect(() => {
    if (episode) {
      try {
        // Safely parse the date from Firestore
        const dateObj = episode.date ? new Date(episode.date) : new Date();
        const formattedDate = isNaN(dateObj.getTime()) 
          ? new Date().toISOString().split('T')[0]
          : dateObj.toISOString().split('T')[0];

        setFormData({
          title: episode.title,
          description: episode.description,
          embedCode: episode.embedCode,
          date: formattedDate,
        });
      } catch (error) {
        console.error("Error parsing date:", error);
        setFormData({
          title: episode.title,
          description: episode.description,
          embedCode: episode.embedCode,
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [episode]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        router.push("/admin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateEpisode(params.id, {
        ...formData,
        date: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Episode updated successfully!",
        className: "bg-green-500 text-white",
      });

      router.push("/episodes");
    } catch (error) {
      console.error("Error updating episode:", error);
      toast({
        title: "Error",
        description: "Failed to update episode. Please try again.",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || isLoadingEpisode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-light mb-2">
                Edit <span className="text-sky-600">Episode</span>
              </h1>
              <p className="text-gray-500">Update episode details</p>
            </div>
            <button
              onClick={() => router.push("/episodes")}
              className="p-2 hover:bg-gray-100 rounded-xl transition duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Episode Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                YouTube Embed Code
              </label>
              <textarea
                value={formData.embedCode}
                onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 h-32 font-mono text-sm"
                placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...'
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Paste the full embed code from YouTube here
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 h-32"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </div>
                ) : (
                  "Update Episode"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 