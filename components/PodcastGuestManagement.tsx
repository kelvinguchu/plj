"use client";
import React, { useState } from "react";
import { createPodcastGuest } from "@/lib/blogService";
import { useToast } from "@/hooks/use-toast";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PodcastGuestManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    role: "",
    profilePicture: "",
  });

  const handleImageUpload = async (file: File) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration is missing");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Firebase auth account
      const auth = getAuth(app);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        // Generate a temporary password (you might want to send this via email)
        Math.random().toString(36).slice(-8)
      );

      // Create podcast guest with auth UID
      await createPodcastGuest({
        ...formData,
        uid: user.uid,
      });

      toast({
        title: "Success",
        description: "Podcast guest account created successfully!",
        className: "bg-green-500 text-white",
      });

      setIsOpen(false);
      setFormData({
        name: "",
        email: "",
        bio: "",
        role: "",
        profilePicture: "",
      });
    } catch (error) {
      console.error("Error creating guest account:", error);
      toast({
        title: "Error",
        description: "Failed to create guest account",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Add Podcast Guest</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Podcast Guest</DialogTitle>
          <DialogDescription>
            Create an account for a podcast guest to enable them to post blogs
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Email</label>
            <Input
              type='email'
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Role</label>
            <Input
              required
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              placeholder='e.g. Medical Expert, Life Coach'
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Bio</label>
            <Textarea
              required
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>

          <div>
            <label className='text-sm font-medium'>Profile Picture</label>
            <Input
              type='file'
              accept='image/*'
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const imageUrl = await handleImageUpload(file);
                    setFormData({ ...formData, profilePicture: imageUrl });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to upload image",
                      className: "bg-red-500 text-white",
                    });
                  }
                }
              }}
            />
          </div>

          <Button type='submit' disabled={loading}>
            {loading ? "Creating..." : "Create Guest Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
