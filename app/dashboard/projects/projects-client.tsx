'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import type { Tables } from '@/lib/types';

type Project = Tables<'projects'>;

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const router = useRouter();

  // Local pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Number of projects per page
  const totalPages = Math.ceil(projects.length / pageSize);

  // Slice projects for the current page
  const paginatedProjects = projects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Navigate to a project's tasks page
  const handleCardClick = (projectId: number) => {
    router.push(`/dashboard/projects/${projectId}/tasks`);
  };

  // Navigate to an "Add Project" page or open a modal
  const handleAddProject = () => {
    router.push('/dashboard/projects/new');
  };

  return (
    <div className="w-full max-w-full px-4 md:px-6">
      {/* Top bar with total project count and Add Project button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">
          Projects ({projects.length})
        </h1>
        <Button onClick={handleAddProject}>Add Project</Button>
      </div>

      {/* Grid of project cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedProjects.map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleCardClick(project.id)}
          >
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <p className="ml-4 text-sm text-muted-foreground mb-2">
                This project focuses on {project.name.toLowerCase()}...
            </p>
            <CardContent>
              {/* Add any project details, stats, or description here */}
              <Button variant="outline" size="sm" className="flex items-center space-x-1 mt-2">
                <span>View Tasks</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4 space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
