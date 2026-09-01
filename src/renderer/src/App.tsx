import { useState, useEffect } from 'react'
import type { Task, StoreData } from '../../shared/types'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [streak, setStreak] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:getData').then((data: StoreData) => {
        setTasks(data.tasks)
        setStreak(data.streak)
      })

      window.electron.ipcRenderer.on('timer:tick', (data: { isRunning: boolean, timeRemaining: number }) => {
        setIsRunning(data.isRunning)
        setTimeRemaining(data.timeRemaining)
      })
    }
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleStartTimer = () => {
    if (window.electron) window.electron.ipcRenderer.invoke('timer:start', 25)
  }

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      if (window.electron) {
        window.electron.ipcRenderer.invoke('store:addTask', { title: newTaskTitle, completed: false }).then((newTask) => {
          setTasks([...tasks, newTask])
          setNewTaskTitle('')
        })
      }
    }
  }

  const handleToggleTask = (id: string) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:toggleTask', id).then((updatedTask) => {
        if (updatedTask) {
          setTasks(tasks.map(t => t.id === id ? updatedTask : t))
        }
      })
    }
  }

  return (
    <div className="w-full h-full flex justify-center pt-2 select-none relative group">
      {/* Tiny invisible drag handle that appears on hover */}
      <div 
        className="absolute top-0 w-32 h-2 cursor-grab opacity-0 group-hover:opacity-100 flex justify-center items-center"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mt-1"></div>
      </div>

      <div 
        className={`bg-black/80 backdrop-blur-md rounded-[32px] shadow-lg border border-white/10 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col mt-2 ${
          isHovered ? 'w-[400px] h-[300px]' : 'w-64 h-12'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header / Collapsed State */}
        <div className="flex items-center justify-between px-4 h-12 shrink-0">
          <div className="flex items-center space-x-2 text-white">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm font-medium">{isRunning ? 'Focusing...' : 'Ready'}</span>
          </div>
          <div className="flex items-center space-x-3">
            {!isRunning && isHovered && (
               <button onClick={handleStartTimer} className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white cursor-pointer transition-colors">Start 25m</button>
            )}
            <div className="text-white/60 text-xs font-mono">{formatTime(timeRemaining)}</div>
          </div>
        </div>

        {/* Expanded Dashboard */}
        <div 
          className={`flex-1 px-4 pb-4 text-white transition-opacity duration-300 delay-100 flex flex-col ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="border-t border-white/10 pt-4 flex-1 flex gap-4">
            <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col">
              <h3 className="text-xs text-white/50 uppercase font-semibold mb-2">To Do</h3>
              <div className="flex-1 overflow-y-auto mb-2">
                {tasks.length === 0 ? (
                  <div className="text-sm text-white/30 italic">No tasks.</div>
                ) : (
                  <ul className="space-y-2">
                    {tasks.map(t => (
                      <li key={t.id} className="text-sm flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-1 rounded" onClick={() => handleToggleTask(t.id)}>
                        <input type="checkbox" checked={t.completed} readOnly className="rounded border-white/20 bg-white/10 cursor-pointer" />
                        <span className={t.completed ? 'line-through text-white/50' : ''}>{t.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input 
                type="text" 
                placeholder="Add task and press Enter..." 
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white placeholder-white/30 outline-none focus:border-white/40"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={handleAddTask}
              />
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <h3 className="text-xs text-white/50 uppercase font-semibold mb-2">Activity</h3>
              <div className="text-xs text-green-400">🔥 {streak} Day Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
