"use client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminManagement() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetAdmin = async () => {
    try {
      setLoading(true);

      // First get the user's UID from their email
      const response = await fetch("/api/admin/getUserByEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { uid } = await response.json();

      if (!uid) {
        throw new Error("User not found");
      }

      // Set admin claim
      const claimResponse = await fetch("/api/admin/setAdminClaim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, isAdmin: true }),
      });

      if (!claimResponse.ok) {
        throw new Error("Failed to set admin claim");
      }

      toast({
        title: "Success",
        description: "Admin privileges granted successfully",
        className: "bg-green-500 text-white",
      });

      setEmail("");
    } catch (error) {
      console.error("Error setting admin:", error);
      toast({
        title: "Error",
        description: "Failed to grant admin privileges",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>Manage Administrators</h2>
      <div className='flex gap-4'>
        <Input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter user email'
          className='flex-1'
        />
        <Button onClick={handleSetAdmin} disabled={loading}>
          {loading ? "Setting..." : "Make Admin"}
        </Button>
      </div>
    </div>
  );
}
