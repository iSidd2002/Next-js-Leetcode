"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface Project {
  title: string;
  url: string;
  description: string;
}

const projects: Project[] = [
  {
    title: "Become a true gymcel",
    url: "https://inceliftness-sid-app-qxcp.vercel.app/",
    description: "Access my approved exercise no bs exercises"
  },
  {
    title: "CodeJeets Budget App",
    url: "https://budegt-app-7ihe.vercel.app/",
    description: "Budget is the main constraint for low-salaried individuals, so you can maintain your finances using this app"
  }
];

export default function MoreProjects() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          More Projects from Me
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Check out some of my other projects that I've built to solve real-world problems and explore different technologies.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {projects.map((project, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-200 border hover:border-orange-200 dark:hover:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-2 group-hover:underline"
                >
                  {project.title}
                  <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-6">
        <p className="text-sm text-muted-foreground">
          More projects coming soon! Stay tuned for updates.
        </p>
      </div>
    </div>
  );
}
