"use client"

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GreetingProps {
  name?: string;
  className?: string;
}

export default function Greeting({ name = "Creator", className }: GreetingProps) {
  const [greeting, setGreeting] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour < 5) {
        setGreeting("Good late night");
        setMessage("Burning the midnight oil?");
      } else if (hour < 12) {
        setGreeting("Good morning");
        setMessage("Ready to conquer some algorithms?");
      } else if (hour < 17) {
        setGreeting("Good afternoon");
        setMessage("Keep that momentum going.");
      } else if (hour < 22) {
        setGreeting("Good evening");
        setMessage("Time to wrap up the day's wins.");
      } else {
        setGreeting("Good night");
        setMessage("Rest is just as important as coding.");
      }
    };

    updateGreeting();
    // Update every minute to keep it accurate
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-fade-in">
        {greeting}, {name}.
      </h2>
      <p className="text-muted-foreground animate-fade-in animation-delay-200">
        {message}
      </p>
    </div>
  );
}

