"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  const [message, setMessage] = useState("Properties page loaded successfully!");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Properties Test Page</h1>
      <p className="mb-4">{message}</p>
      <Button
        onClick={() => setMessage("Button clicked!")}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Test Button
      </Button>
    </div>
  );
}