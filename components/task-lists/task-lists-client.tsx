'use client'

import {useState} from 'react'
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {ChevronRight, ChevronLeft} from 'lucide-react'


import type {Tables} from '@/lib/types'
import {createClient} from "@/utils/supabase/client";

type TaskList = Tables<'task_lists'>
type Task = Tables<'tasks'>

interface TaskListsClientProps {
    taskLists: TaskList[]
}

export function TaskListsClient({taskLists}: TaskListsClientProps) {
    const [selectedList, setSelectedList] = useState<TaskList | null>(null)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)


    const handleListClick = (list: TaskList) => {
        setSelectedList(list)
    }

    const handleBackClick = () => {
        setSelectedList(null)
    }


    const handleTaskClick = async (taskId: string, completed: boolean) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('tasks')
            .update({ completed: !completed })
            .eq('id', taskId)

        if (error) {
            console.error('Error updating task:', error)
            return
        }

        // Update the local state
        setSelectedList(prevList => {
            if (!prevList) return null
            return {
                ...prevList,
                tasks: prevList.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !completed } : task
                )
            }
        })
    }


    if (selectedList) {
        return (
            <Card className="w-full">
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mr-2 flex-shrink-0"
                                    onClick={() => handleTaskClick(task.id, task.completed)}
                                    aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                                >
                                    {task.completed ? '✅' : '⬜'}
                                </Button>
                                <span className={`truncate ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full max-w-full px-4 md:px-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Task Lists</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {taskLists.map((list) => (
                            <li key={list.id}>
                                <Button
                                    variant="ghost"
                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                                    onClick={() => handleListClick(list)}
                                >
                                    <span className="truncate">{list.name}</span>
                                    <ChevronRight className="h-4 w-4 flex-shrink-0"/>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
            )
            }