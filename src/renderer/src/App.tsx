import React, { useState, useEffect } from 'react'
import type { Task, StoreData, ActivityDay } from '../../shared/types'
import { Play, Square, Calendar as CalendarIcon, Clock, Trash2, Maximize2, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, ChevronUp, ChevronDown, ListTodo } from 'lucide-react'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const Heatmap = ({ activity }: { activity: ActivityDay[] }) => {
  const days = []
  for (let i = 59; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(formatDate(d))
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-[#1a1a1a]'
    if (count === 1) return 'bg-blue-900'
    if (count === 2) return 'bg-blue-700'
    if (count === 3) return 'bg-blue-500'
    return 'bg-blue-400'
  }

  return (
    <div className="flex flex-col items-start w-full">
      <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1">
        🔥 Journey Streak <span className="text-white/40 font-normal ml-1">5d</span>
      </div>
      <div className="grid grid-cols-12 gap-1.5 w-full" style={{ direction: 'ltr' }}>
        {days.map(d => {
          const act = activity.find(a => a.date === d)
          const count = act ? act.completedCount : 0
          return <div key={d} className={`w-full aspect-square rounded-[3px] ${getIntensity(count)}`} title={`${d}: ${count} tasks`} />
        })}
      </div>
    </div>
  )
}

function App() {
  const [viewState, setViewState] = useState<'collapsed' | 'hovered' | 'expanded'>('collapsed')
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSubtext, setNewTaskSubtext] = useState('')
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeDurationPopover, setActiveDurationPopover] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())

  const loadData = (date: string) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:getData', date).then((data: StoreData) => {
        setTasks(data.tasks)
        setActivity(data.activity)
      }).catch(err => console.error("Error loading data:", err))
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

  const handleAddTask = () => {
    if (newTaskTitle.trim() && window.electron) {
      window.electron.ipcRenderer.invoke('store:addTask', { 
        title: newTaskTitle, 
        completed: false,
        estimatedMinutes: 25,
        date: selectedDate
      }).then((newTask) => {
        setTasks([...tasks, newTask])
        setNewTaskTitle('')
        setNewTaskSubtext('')
        setIsAddingTask(false)
      }).catch(err => {
        console.error("Failed to add task:", err)
        alert("Failed to add task: " + err.message)
      })
    }
  }

  const handleUpdateTaskDuration = (id: string, delta: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const newMinutes = Math.max(1, task.estimatedMinutes + delta)
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:updateTask', id, { estimatedMinutes: newMinutes }).then((updatedTask) => {
        if (updatedTask) {
          setTasks(tasks.map(t => t.id === id ? updatedTask : t))
        }
      })
    }
  }

  const handleToggleTask = (id: string) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:toggleTask', id).then((updatedTask) => {
        if (updatedTask) {
          setTasks(tasks.map(t => t.id === id ? updatedTask : t))
          loadData(selectedDate)
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
      <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl p-4">
        <div className="flex justify-between items-center mb-6 px-2">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 bg-[#1a1a1a] hover:bg-white/10 rounded-full text-white/70"><ChevronLeft size={14} /></button>
          <span className="font-semibold text-sm text-white">{monthName}</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 bg-[#1a1a1a] hover:bg-white/10 rounded-full text-white/70"><ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center text-[10px] uppercase tracking-wider mb-2 text-white/40 font-medium">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center text-sm font-medium">
          {days.map((d, i) => {
            if (!d) return <div key={i}></div>
            const dateStr = formatDate(d)
            const isSelected = dateStr === selectedDate
            
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(dateStr)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors mx-auto ${
                  isSelected ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-white/80'
                }`}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
        
        <div className="mt-auto">
          <button onClick={() => setSelectedDate(formatDate(new Date()))} className="w-full py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-xs font-medium text-white transition-colors">
            Today
          </button>
        </div>
      </div>
    )
  }

  const activeTask = tasks.find(t => t.id === activeTaskId)

  let containerClass = "w-64 h-12"
  if (viewState === 'hovered') containerClass = "w-[540px] h-[260px]"
  if (viewState === 'expanded') containerClass = "w-[760px] h-[520px]"

  return (
    <div className="w-full h-full flex justify-center pt-2 select-none relative group text-white">
      {/* Drag handle */}
      <div 
        className="absolute top-0 w-32 h-2 cursor-grab opacity-0 group-hover:opacity-100 flex justify-center items-center z-50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mt-1"></div>
      </div>

      <div 
        className={`bg-[#050505] backdrop-blur-3xl rounded-[32px] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col mt-2 border ${
          isRunning && viewState === 'collapsed' ? 'border-blue-500 shadow-blue-900/20' : 'border-white/10'
        } ${containerClass}`}
        onMouseEnter={() => { if (viewState === 'collapsed') setViewState('hovered') }}
        onMouseLeave={() => { if (viewState === 'hovered') setViewState('collapsed') }}
      >
        {/* COLLAPSED STATE (PILL) */}
        {viewState === 'collapsed' && (
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-3 text-white overflow-hidden">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRunning ? 'bg-blue-500' : 'bg-green-400'}`}></div>
              <span className="text-sm font-medium truncate">
                {isRunning && activeTask ? activeTask.title : 'Ready to Focus'}
              </span>
            </div>
            {isRunning && (
              <div className="text-sm font-mono font-bold text-white">
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        )}

        {/* HOVERED STATE (MINI DASHBOARD) */}
        {viewState === 'hovered' && (
          <div className="flex-1 flex p-5 gap-6 animate-in fade-in duration-300">
            {/* Left: To Do */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f] rounded-2xl p-4 border border-white/5 relative">
              <div className="flex justify-between items-center mb-4 text-white">
                <div className="flex items-center gap-2">
                  <ListTodo size={16} className="text-white/70" />
                  <span className="font-semibold text-sm">To do</span>
                </div>
                <button onClick={() => setViewState('expanded')} className="text-white/40 hover:text-white transition-colors">
                  <Maximize2 size={14} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {tasks.slice(0, 3).map(t => (
                  <div key={t.id} className="bg-[#1a1a1a] p-3 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button onClick={() => handleToggleTask(t.id)} className="text-white/30 hover:text-white shrink-0">
                        {t.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
                      </button>
                      <div className="flex flex-col truncate">
                        <span className={`text-sm font-medium truncate ${t.completed ? 'line-through text-white/40' : 'text-white/90'}`}>{t.title}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => isRunning && activeTaskId === t.id ? handleStopTimer() : handleStartTimer(t.id, t.estimatedMinutes)}
                      className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full transition-colors ${
                        isRunning && activeTaskId === t.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {isRunning && activeTaskId === t.id ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => { setViewState('expanded'); setIsAddingTask(true) }} className="mt-3 text-xs text-white/40 hover:text-white/70 text-left transition-colors">
                Add a task
              </button>
            </div>

            {/* Right: Heatmap */}
            <div className="w-[180px] shrink-0 pt-1">
              <Heatmap activity={activity} />
            </div>
          </div>
        )}

        {/* EXPANDED STATE (FULL DASHBOARD) */}
        {viewState === 'expanded' && (
          <div className="flex-1 flex flex-col p-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4 px-2 text-white">
              <span className="font-semibold text-sm flex items-center gap-2">
                <ListTodo size={16} className="text-white/70" /> Tasks
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">{tasks.filter(t => !t.completed).length} open</span>
                <button onClick={() => setViewState('hovered')} className="p-1 bg-[#1a1a1a] hover:bg-white/10 rounded-full text-white/70 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-[260px_1fr] gap-4 min-h-0">
              {renderCalendar()}

              <div className="flex flex-col min-h-0 bg-[#0a0a0a] rounded-2xl relative">
                <div className="flex justify-between items-center mb-4 text-white">
                  <span className="font-semibold">Today</span>
                  <div className="flex bg-[#1a1a1a] rounded-full p-0.5">
                    <button className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">Day</button>
                    <button className="px-3 py-1 text-xs font-medium text-white/50 hover:text-white">Unscheduled 0</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 pb-32">
                  {tasks.map(t => (
                    <div key={t.id} className="relative">
                      <div className="bg-[#111111] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between group transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <button onClick={() => handleToggleTask(t.id)} className="text-white/30 hover:text-white shrink-0">
                            {t.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
                          </button>
                          <span className={`text-sm font-medium truncate ${t.completed ? 'line-through text-white/40' : 'text-white/90'}`}>{t.title}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2 text-xs text-white/40 bg-[#1a1a1a] px-2 py-1 rounded-lg">
                            <CalendarIcon size={12} /> Today
                          </div>
                          <button 
                            onClick={() => setActiveDurationPopover(activeDurationPopover === t.id ? null : t.id)}
                            className="flex items-center gap-2 text-xs text-white/40 bg-[#1a1a1a] hover:bg-[#222] transition-colors px-2 py-1 rounded-lg"
                          >
                            <Clock size={12} /> {t.estimatedMinutes}m
                          </button>
                          <button 
                            onClick={() => isRunning && activeTaskId === t.id ? handleStopTimer() : handleStartTimer(t.id, t.estimatedMinutes)}
                            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                              isRunning && activeTaskId === t.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                          >
                            {isRunning && activeTaskId === t.id ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                          </button>
                          <button onClick={() => handleDeleteTask(t.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>

                      {/* Focus duration popover */}
                      {activeDurationPopover === t.id && (
                        <div className="absolute right-10 top-full mt-2 bg-[#111111] border border-white/10 rounded-3xl p-5 shadow-2xl z-50 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                          <div className="text-sm font-semibold text-white">Focus duration</div>
                          <div className="flex items-center gap-4 text-white">
                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase">Min</span>
                              <button onClick={() => handleUpdateTaskDuration(t.id, 5)} className="text-white/40 hover:text-white transition-colors p-1"><ChevronUp size={16} /></button>
                              <div className="w-16 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-xl font-medium">
                                {t.estimatedMinutes.toString().padStart(2, '0')}
                              </div>
                              <button onClick={() => handleUpdateTaskDuration(t.id, -5)} className="text-white/40 hover:text-white transition-colors p-1"><ChevronDown size={16} /></button>
                            </div>
                            <div className="text-xl font-bold text-white/30 mb-8">:</div>
                            {/* Seconds (Visual only for now since estimation is in minutes) */}
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase">Sec</span>
                              <button className="text-white/40 hover:text-white transition-colors p-1"><ChevronUp size={16} /></button>
                              <div className="w-16 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-xl font-medium">
                                00
                              </div>
                              <button className="text-white/40 hover:text-white transition-colors p-1"><ChevronDown size={16} /></button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isAddingTask ? (
                  <div className="bg-[#111111] p-3 rounded-2xl border border-white/10 flex flex-col gap-3 mt-auto shrink-0 relative z-10">
                    <div className="flex gap-2">
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Task name" 
                        className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-medium transition-colors">
                        Add
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Notes (optional)" 
                        className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none"
                        value={newTaskSubtext}
                        onChange={(e) => setNewTaskSubtext(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <button onClick={() => setIsAddingTask(false)} className="bg-[#1a1a1a] hover:bg-[#222] text-white/70 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingTask(true)} className="w-full bg-[#111111] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 text-left text-sm text-white/40 transition-colors mt-auto shrink-0 relative z-10">
                    Add a task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
