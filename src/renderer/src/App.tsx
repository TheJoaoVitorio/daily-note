import { useState, useEffect } from 'react'
import type { Task, StoreData } from '../../shared/types'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Load initial data
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:getData').then((data: StoreData) => {
        setTasks(data.tasks)
        setStreak(data.streak)
      })
    }
  }, [])

  return (
    <div className="w-full h-full flex justify-center pt-2 select-none">
      <div 
        className={`bg-black/80 backdrop-blur-md rounded-[32px] shadow-lg border border-white/10 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col ${
          isHovered ? 'w-[400px] h-[300px]' : 'w-64 h-12'
        }`}
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header / Collapsed State */}
        <div className="flex items-center justify-between px-4 h-12 shrink-0">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-sm font-medium">Ready</span>
          </div>
          <div className="text-white/60 text-xs">00:00</div>
        </div>

        {/* Expanded Dashboard */}
        <div 
          className={`flex-1 px-4 pb-4 text-white transition-opacity duration-300 delay-100 flex flex-col ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="border-t border-white/10 pt-4 flex-1 flex gap-4">
            <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col">
              <h3 className="text-xs text-white/50 uppercase font-semibold mb-2">To Do</h3>
              <div className="flex-1 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-sm">No tasks for today.</div>
                ) : (
                  <ul className="space-y-2">
                    {tasks.map(t => (
                      <li key={t.id} className="text-sm flex items-center space-x-2">
                        <input type="checkbox" checked={t.completed} readOnly className="rounded border-white/20 bg-white/10" />
                        <span className={t.completed ? 'line-through text-white/50' : ''}>{t.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
