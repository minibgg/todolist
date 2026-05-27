import { useState, useEffect } from 'react'

interface task {
  id: string
  taskDescription: string
  parentId: string | null
}

export default function App () {
  const [tasksInput, setTasksInput] = useState('')
  const [tasks, setTasks] = useState<task[]>([])

  // Загружаем задачи с сервера при старте приложения
  useEffect(() => {
    async function loadTasks () {
      try {
        const response = await fetch('https://api.example.com/tasks')
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error('Ошибка загрузки задач:', error)
      }
    }
    loadTasks()
  }, [])

  // Добавление главной задачи на сервер
  async function addTask () {
    if (!tasksInput.trim()) return

    const newTask = {
      taskDescription: tasksInput,
      parentId: null
    }

    try {
      // Отправляем новую задачу на бэкенд
      const response = await fetch('https://api.example.com/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })

      // Сервер возвращает нам созданную задачу уже с настоящим id из базы данных
      const createdTask: task = await response.json()

      // Обновляем стейт в React
      setTasks([...tasks, createdTask])
      setTasksInput('')
    } catch (error) {
      console.error('Не удалось добавить задачу:', error)
    }
  }

  // Добавление подзадачи на сервер
  async function handleAddSubtask (targetId: string, text: string) {
    const newSubtask = {
      taskDescription: text,
      parentId: targetId // Привязываем к родителю
    }

    try {
      const response = await fetch('https://api.example.com/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubtask)
      })

      const createdSubtask: task = await response.json()
      setTasks([...tasks, createdSubtask])
    } catch (error) {
      console.error('Не удалось добавить подзадачу:', error)
    }
  }

  // Удаление задачи и её подзадач с сервера
  async function handleDeleteTask (targetId: string) {
    // Собираем массив ID на удаление (как в прошлом примере)
    let idsToDelete = [targetId]
    for (let i = 0; i < idsToDelete.length; i++) {
      const currentId = idsToDelete[i]
      const children = tasks.filter(item => item.parentId === currentId)
      idsToDelete.push(...children.map(c => c.id))
    }

    try {
      // Отправляем запрос на удаление пачки ID на сервер
      await fetch('https://api.example.com/tasks/delete-multiple', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      })

      // Если сервер успешно удалил, убираем их из стейта React
      setTasks(tasks.filter(item => !idsToDelete.includes(item.id)))
    } catch (error) {
      console.error('Не удалось удалить задачи:', error)
    }
  }

  const rootTasks = tasks.filter(item => item.parentId === null)

  return (
    <div
      className='App'
      style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '600px' }}
    >
      <h1>Todo List (Async/Await) 🌐</h1>

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
        {rootTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            allTasks={tasks}
            onAddSubtask={handleAddSubtask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </ul>
    </div>
  )
}

// Компонент TaskItem остается точно таким же, как в прошлом примере,
// так как он просто отображает данные и вызывает функции, которые мы передали сверху.
interface TaskItemProps {
  task: task
  allTasks: task[]
  onAddSubtask: (targetId: string, text: string) => void
  onDeleteTask: (targetId: string) => void
}

function TaskItem ({
  task,
  allTasks,
  onAddSubtask,
  onDeleteTask
}: TaskItemProps) {
  const [subInput, setSubInput] = useState('')

  function handleAddClick () {
    if (!subInput.trim()) return
    onAddSubtask(task.id, subInput)
    setSubInput('')
  }

  const childTasks = allTasks.filter(item => item.parentId === task.id)

  return (
    <li
      style={{
        marginTop: '10px',
        padding: '10px',
        borderLeft: '2px solid #ce30db',
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
      {childTasks.length > 0 && (
        <ul
          style={{
            paddingLeft: '20px',
            marginTop: '5px',
            listStyleType: 'none'
          }}
        >
          {childTasks.map(sub => (
            <TaskItem
              key={sub.id}
              task={sub}
              allTasks={allTasks}
              onAddSubtask={onAddSubtask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
