import React, { useState, useEffect } from 'react'
import type { Task, StoreData, ActivityDay } from '../../shared/types'
import { Play, Square, Calendar as CalendarIcon, Clock, Trash2, Edit2, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react'

// Helper: YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0]

// Heatmap Component
const Heatmap = ({ activity }: { activity: ActivityDay[] }) => {
  // Generate last 60 days
  const days = []
  for (let i = 59; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(formatDate(d))
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-white/10'
    if (count === 1) return 'bg-blue-900'
    if (count === 2) return 'bg-blue-700'
    if (count === 3) return 'bg-blue-500'
    return 'bg-blue-400'
  }

  return (
    <div className="flex flex-col items-end">
      <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
        🔥 Journey Streak
      </div>
      <div className="grid grid-cols-12 gap-1" style={{ direction: 'ltr' }}>
        {days.map(d => {
          const act = activity.find(a => a.date === d)
          const count = act ? act.completedCount : 0
          return <div key={d} className={`w-3 h-3 rounded-[3px] ${getIntensity(count)}`} title={`${d}: ${count} tasks`} />
        })}
      </div>
    </div>
  )
}

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [streak, setStreak] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDuration, setNewTaskDuration] = useState('25')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())

  const loadData = (date: string) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:getData', date).then((data: StoreData) => {
        setTasks(data.tasks)
        setActivity(data.activity)
        setStreak(data.streak)
      })
    }
  }

  useEffect(() => {
    loadData(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    if (window.electron) {
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

  const handleStartTimer = (taskId: string, minutes: number) => {
    setActiveTaskId(taskId)
    if (window.electron) window.electron.ipcRenderer.invoke('timer:start', minutes)
  }

  const handleStopTimer = () => {
    setActiveTaskId(null)
    if (window.electron) window.electron.ipcRenderer.invoke('timer:stop')
  }

  const handleAddTask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      if (window.electron) {
        window.electron.ipcRenderer.invoke('store:addTask', { 
          title: newTaskTitle, 
          completed: false,
          estimatedMinutes: parseInt(newTaskDuration) || 25,
          date: selectedDate
        }).then((newTask) => {
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
          loadData(selectedDate) // refresh activity heatmap
        }
      })
    }
  }

  const handleDeleteTask = (id: string) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:deleteTask', id).then(() => {
        setTasks(tasks.filter(t => t.id !== id))
        loadData(selectedDate)
      })
    }
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

    return (
      <div className="flex flex-col h-full bg-[#111111] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-white/10 rounded-full"><ChevronLeft size={16} /></button>
          <span className="font-semibold text-sm">{monthName}</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-white/10 rounded-full"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-xs mb-2 text-white/50">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center text-sm">
          {days.map((d, i) => {
            if (!d) return <div key={i}></div>
            const dateStr = formatDate(d)
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === formatDate(new Date())
            
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(dateStr)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : 
                  isToday ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/80'
                }`}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const activeTask = tasks.find(t => t.id === activeTaskId)

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
        className={`bg-[#0a0a0a] backdrop-blur-3xl rounded-[32px] shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col mt-2 border ${
          isRunning ? 'border-blue-500/50 shadow-blue-900/20' : 'border-white/10'
        } ${
          isHovered ? 'w-[760px] h-[480px]' : 'w-[320px] h-12'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Collapsed Header */}
        <div className="flex items-center justify-between px-4 h-12 shrink-0">
          <div className="flex items-center space-x-3 text-white overflow-hidden">
            <div className={`w-3 h-3 rounded-full shrink-0 ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm font-medium truncate">
              {isRunning && activeTask ? activeTask.title : 'Ready to Focus'}
            </span>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {isRunning && (
               <button onClick={handleStopTimer} className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2 py-1 rounded cursor-pointer transition-colors flex items-center gap-1">
                 <Square size={12} fill="currentColor" /> Stop
               </button>
            )}
            <div className={`text-xs font-mono font-bold ${isRunning ? 'text-blue-400' : 'text-white/60'}`}>
              {isRunning ? formatTime(timeRemaining) : '00:00'}
            </div>
          </div>
        </div>

        {/* Expanded UI */}
        <div 
          className={`flex-1 p-4 text-white transition-opacity duration-300 flex flex-col gap-4 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Top Section: Heatmap */}
          <div className="flex justify-end px-2">
             <Heatmap activity={activity} />
          </div>

          {/* Main Grid: Calendar + Tasks */}
          <div className="flex-1 grid grid-cols-[300px_1fr] gap-4 min-h-0">
            {/* Calendar */}
            {renderCalendar()}

            {/* Tasks Panel */}
            <div className="bg-[#111111] rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg">
                  {selectedDate === formatDate(new Date()) ? 'Today' : selectedDate}
                </span>
                <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                  {tasks.filter(t => !t.completed).length} open
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                  <div className="text-sm text-white/30 italic mt-4 text-center">No tasks scheduled.</div>
                ) : (
                  tasks.map(t => (
                    <div key={t.id} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl flex items-center justify-between group transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <button onClick={() => handleToggleTask(t.id)} className="text-white/40 hover:text-white transition-colors shrink-0">
                          {t.completed ? <CheckCircle2 size={20} className="text-blue-500" /> : <Circle size={20} />}
                        </button>
                        <div className="flex flex-col overflow-hidden">
                           <span className={`text-sm font-medium truncate ${t.completed ? 'line-through text-white/40' : 'text-white'}`}>{t.title}</span>
                           <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                              <span className="flex items-center gap-1"><CalendarIcon size={10} /> {t.date}</span>
                              <span className="flex items-center gap-1"><Clock size={10} /> {t.estimatedMinutes}m</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => isRunning && activeTaskId === t.id ? handleStopTimer() : handleStartTimer(t.id, t.estimatedMinutes)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                            isRunning && activeTaskId === t.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                          }`}
                        >
                          {isRunning && activeTaskId === t.id ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <button onClick={() => handleDeleteTask(t.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-colors">
                           <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a task..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleAddTask}
                />
                <input 
                  type="number" 
                  placeholder="Min" 
                  title="Estimated Minutes"
                  className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors text-center"
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  onKeyDown={handleAddTask}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
