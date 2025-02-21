'use client';

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

    // Navigate to the selected project's tasks page
    const handleListClick = (project: Project) => {
        router.push(`/dashboard/projects/${project.id}/tasks`);
    };

    return (
        <div className="w-full max-w-full px-4 md:px-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Project Lists</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {projects.map((project) => (
                            <li key={project.id}>
                                <Button
                                    variant="ghost"
                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                    onClick={() => handleListClick(project)}
                                >
                                    <span className="truncate">{project.name}</span>
                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
