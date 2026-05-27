import { useState } from 'react'
// типизируем таски
interface task {
  id: string
  taskDescription: string
  subTask: task[]
}

export default function App () {
  const [tasksInput, setTasksInput] = useState('')
  const [tasks, setTasks] = useState<task[]>([])
  // создаем субтаскдерево который будет создаватьь под задачу для основной задачи
  const addSubtaskToTree = (
    tasklist: task[],
    targetId: string,
    subtaskText: string
  ): task[] => {
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
  const deleteTaskFromTree = (taskList: task[], targetId: string): task[] => {
    //фильтруем задачи есть ли у них
    const filtered = taskList.filter(item => item.id !== targetId)
    return filtered.map(item => ({
      ...item,
      subTask: deleteTaskFromTree(item.subTask, targetId)
    }))
  }

  function handleAddSubtask (targetId: string, text: string) {
    setTasks(prevTasks => addSubtaskToTree(prevTasks, targetId, text))
  }

  function handleDeleteTask (targetId: string) {
    setTasks(prevTasks => deleteTaskFromTree(prevTasks, targetId))
  }

  function addTask () {
    if (!tasksInput.trim()) return

    const newTask: task = {
      id: Date.now().toString(),
      taskDescription: tasksInput,
      subTask: []
    }

    setTasks([...tasks, newTask])
    setTasksInput('')
  }

  return (
    <div
      className='App'
      style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px' }}
    >
      <h1>Todo List </h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type='text'
          placeholder='Enter a main task'
          value={tasksInput}
          onChange={e => setTasksInput(e.target.value)}
          style={{ padding: '8px', marginRight: '10px', width: '250px' }}
        />
        <button
          onClick={addTask}
          style={{ padding: '8px 15px', cursor: 'pointer' }}
        >
          Add Task
        </button>
      </div>

      <ul style={{ paddingLeft: 0, listStyleType: 'none' }}>
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
  task: task
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
    <li
      style={{
        marginTop: '10px',
        padding: '10px',
        borderLeft: '2px solid #007bff',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        listStyleType: 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 'bold' }}>{task.taskDescription}</span>

        <button
          onClick={() => onDeleteTask(task.id)}
          style={{
            padding: '2px 8px',
            color: 'red',
            border: '1px solid red',
            backgroundColor: '#fff',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Delete
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
          <input
            type='text'
            value={subInput}
            onChange={e => setSubInput(e.target.value)}
            placeholder='Subtask...'
            style={{ padding: '4px', fontSize: '13px' }}
          />
          <button
            onClick={handleAddClick}
            style={{ padding: '4px 8px', cursor: 'pointer' }}
          >
            + Subtask
          </button>
        </div>
      </div>

      {task.subTask.length > 0 && (
        <ul
          style={{
            paddingLeft: '20px',
            marginTop: '5px',
            listStyleType: 'none'
          }}
        >
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
