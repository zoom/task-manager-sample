'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'


import type { Tables } from '@/lib/types'
type TaskList = Tables<'TaskLists'>

interface TaskListsClientProps {
    taskLists: TaskList
}

export function TaskListsClient({ taskLists }: TaskListsClientProps) {
    const [selectedList, setSelectedList] = useState<TaskList | null>(null)

    const handleListClick = (list: TaskList) => {
        setSelectedList(list)
    }

    const handleBackClick = () => {
        setSelectedList(null)
    }

    if (selectedList) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={handleBackClick}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        {selectedList.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {selectedList.tasks.map((task) => (
                            <li key={task.id} className="flex items-center">
                                <span className="mr-2">{task.completed ? '✅' : '⬜'}</span>
                                {task.title}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Task Lists</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {taskLists.map((list) => (
                        <li key={list.id}>
                            <Button
                                variant="ghost"
                                className="w-full justify-between"
                                onClick={() => handleListClick(list)}
                            >
                                {list.name}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}