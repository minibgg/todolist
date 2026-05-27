import { useState } from 'react'
import type { Task } from './types' // <-- Импортируем тип из нашего нового файла

export default function App () {
  const [tasksInput, setTasksInput] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])

  // создаем субтаскдерево который будет создаватьь под задачу для основной задачи
  const addSubtaskToTree = (
    tasklist: Task[],
    targetId: string,
    subtaskText: string
  ): Task[] => {
    //переберает главные задачи
    return tasklist.map(item => {
      //если не нашли нужный id идём дальше
      if (item.id === targetId) {
        //создаем новую задачу в корне задачи выше
        return {
          ...item,
          subTask: [
            ...item.subTask,
            {
              id: Date.now().toString(),
              taskDescription: subtaskText,
              subTask: []
            }
          ]
        }
      }
      //проверка есть ли у задачи подзадача
      if (item.subTask.length > 0) {
        return {
          ...item,
          subTask: addSubtaskToTree(item.subTask, targetId, subtaskText)
        }
      }
      return item
    })
  }

  //удалить под задачу с уровня выше
  const deleteTaskFromTree = (taskList: Task[], targetId: string): Task[] => {
    //что не равно тому что мы хотим удалить сохраняем в filtered
    const filtered = taskList.filter(item => item.id !== targetId)
    //заглядываем в то что осталось если совпадает с выбраным то удаляем
    return filtered.map(item => ({
      ...item,
      subTask: deleteTaskFromTree(item.subTask, targetId)
    }))
  }

  //активируем функцию для удобства например для тестов mocha m + читаемость
  function handleAddSubtask (targetId: string, text: string) {
    setTasks(prevTasks => addSubtaskToTree(prevTasks, targetId, text))
  }

  //тоже самое
  function handleDeleteTask (targetId: string) {
    setTasks(prevTasks => deleteTaskFromTree(prevTasks, targetId))
  }

  function addTask () {
    if (!tasksInput.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      taskDescription: tasksInput,
      subTask: []
    }

    setTasks([...tasks, newTask])
    setTasksInput('')
  }

  return (
    <div className='App'>
      <h1>Todo List</h1>

      <div>
        <input
          type='text'
          placeholder='Enter a main task'
          value={tasksInput}
          onChange={e => setTasksInput(e.target.value)}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <ul>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onAddSubtask={handleAddSubtask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </ul>
    </div>
  )
}

interface TaskItemProps {
  task: Task
  onAddSubtask: (targetId: string, text: string) => void
  onDeleteTask: (targetId: string) => void
}

function TaskItem ({ task, onAddSubtask, onDeleteTask }: TaskItemProps) {
  const [subInput, setSubInput] = useState('')

  function handleAddClick () {
    if (!subInput.trim()) return
    onAddSubtask(task.id, subInput)
    setSubInput('')
  }

  return (
    <li>
      <div>
        <span>{task.taskDescription}</span>

        <button onClick={() => onDeleteTask(task.id)}>Delete</button>

        <div>
          <input
            type='text'
            value={subInput}
            onChange={e => setSubInput(e.target.value)}
            placeholder='Subtask...'
          />
          <button onClick={handleAddClick}>+ Subtask</button>
        </div>
      </div>

      {task.subTask.length > 0 && (
        <ul>
          {task.subTask.map(sub => (
            <TaskItem
              key={sub.id}
              task={sub}
              onAddSubtask={onAddSubtask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
