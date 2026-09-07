import React, { useState, useEffect, useRef } from 'react'
import type { Task, StoreData, ActivityDay, Category, CategoryStat } from '../../shared/types'
import { Play, Square, Calendar as CalendarIcon, Clock, Trash2, Maximize2, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, ChevronUp, ChevronDown, ListTodo, Flame, Settings, Tag, Plus, Check } from 'lucide-react'
import { useTranslation } from './i18n'

const formatDate = (date: Date) => date.toISOString().split('T')[0]

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#EC4899', // Pink
]

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
        <Flame size={14} className="text-orange-500 mr-0.5" /> Journey Streak <span className="text-white/40 font-normal ml-1">5d</span>
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

const CategoryChart = ({ 
  categoryStats, 
  t 
}: { 
  categoryStats: CategoryStat[]
  t: (key: string) => string 
}) => {
  const totalCompleted = categoryStats.reduce((sum, s) => sum + s.completedCount, 0)
  const activeStats = categoryStats.filter(s => s.completedCount > 0)

  return (
    <div className="flex flex-col w-full mt-2 pt-2 border-t border-white/5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-white/80 flex items-center gap-1">
          <Tag size={11} className="text-white/50" /> {t('Completed by Category')}
        </span>
        <span className="text-[9px] text-white/40 font-medium">
          {totalCompleted} {t('completed')}
        </span>
      </div>

      {totalCompleted === 0 ? (
        <div className="text-[10px] text-white/30 italic py-1.5 text-center">
          {t('No completed tasks yet')}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden flex">
            {activeStats.map(s => {
              const pct = (s.completedCount / totalCompleted) * 100
              return (
                <div 
                  key={s.categoryId} 
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                  className="h-full transition-all duration-300"
                  title={`${s.name}: ${s.completedCount} (${Math.round(pct)}%)`}
                />
              )
            })}
          </div>

          <div className="flex flex-col gap-1 max-h-[70px] overflow-y-auto custom-scrollbar pr-0.5">
            {categoryStats.map(s => (
              <div key={s.categoryId} className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 truncate max-w-[125px]">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="truncate text-white/80">{t(s.name as any) || s.name}</span>
                </div>
                <span className="text-[10px] font-semibold text-white/60 ml-1 shrink-0">
                  {s.completedCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MarqueeText = ({ 
  text, 
  className = "text-sm font-medium text-white" 
}: { 
  text: string
  className?: string 
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [duration, setDuration] = useState(10)

  useEffect(() => {
    const updateMarquee = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const textWidth = textRef.current.scrollWidth
        if (textWidth > containerWidth && containerWidth > 0) {
          setShouldAnimate(true)
          const calculatedDuration = Math.max(6, Math.round(textWidth / 30))
          setDuration(calculatedDuration)
        } else {
          setShouldAnimate(false)
        }
      }
    }

    updateMarquee()

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const ro = new ResizeObserver(() => updateMarquee())
      ro.observe(containerRef.current)
      return () => ro.disconnect()
    }
  }, [text])

  if (!shouldAnimate) {
    return (
      <div ref={containerRef} className="overflow-hidden min-w-0 flex-1">
        <span ref={textRef} className={`truncate block ${className}`}>
          {text}
        </span>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="overflow-hidden min-w-0 flex-1 relative marquee-mask pl-0.5"
    >
      <div 
        className="flex w-max will-change-transform animate-marquee"
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        <span ref={textRef} className={`shrink-0 pr-8 whitespace-nowrap ${className}`}>
          {text}
        </span>
        <span className={`shrink-0 pr-8 whitespace-nowrap ${className}`} aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  )
}

function App() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [viewMode, setViewMode] = useState<'day' | 'unscheduled'>('day')
  const [tasks, setTasks] = useState<Task[]>([])
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [unscheduledCount, setUnscheduledCount] = useState(0)
  const [language, setLanguage] = useState('en')
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])
  const [showSettings, setShowSettings] = useState(false)
  const { t } = useTranslation(language)

  const [isRunning, setIsRunning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeTaskData, setActiveTaskData] = useState<Task | null>(null)
  
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskSubtext, setNewTaskSubtext] = useState('')
  const [newTaskMinutes] = useState(25)

  const [viewState, setViewState] = useState<'collapsed' | 'hovered' | 'expanded'>('collapsed')
  const [activeDurationPopover, setActiveDurationPopover] = useState<string | null>(null)
  const [activeCategoryPopover, setActiveCategoryPopover] = useState<string | null>(null)

  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [totalTime, setTotalTime] = useState(0)

  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const isTransitioningRef = useRef(false); const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (isTransitioningRef.current) return
    if (viewState === 'collapsed') {
      // If a stopwatch task is running (totalTime === 0), add a 5s delay to allow clicking the radio button
      const delay = (isRunning && activeTaskData && totalTime === 0) ? 5000 : 0
      const timeout = setTimeout(() => {
        handleSetViewState('hovered')
      }, delay)
      setHoverTimeout(timeout)
    }
  }

  const handleMouseLeave = () => {
    if (isTransitioningRef.current) return
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    if (viewState === 'hovered') {
      handleSetViewState('collapsed')
    }
  }

  const loadData = (date: string) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:getData', date).then((data: StoreData) => {
        setTasks(data.tasks)
        setActivity(data.activity)
        setUnscheduledCount(data.unscheduledCount)
        if (data.language) setLanguage(data.language)
        if (data.categories) setCategories(data.categories)
        if (data.categoryStats) setCategoryStats(data.categoryStats)
      }).catch(err => console.error("Error loading data:", err))
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !window.electron) return
    window.electron.ipcRenderer.invoke('store:addCategory', {
      name: newCategoryName.trim(),
      color: newCategoryColor
    }).then(() => {
      setNewCategoryName('')
      loadData(viewMode === 'day' ? selectedDate : 'unscheduled')
    })
  }

  const handleDeleteCategory = (id: string) => {
    if (!window.electron) return
    window.electron.ipcRenderer.invoke('store:deleteCategory', id).then(() => {
      if (selectedCategoryId === id) setSelectedCategoryId(null)
      loadData(viewMode === 'day' ? selectedDate : 'unscheduled')
    })
  }

  const handleUpdateTaskCategory = (id: string, categoryId: string | null) => {
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:updateTask', id, { categoryId }).then((updatedTask) => {
        if (updatedTask) {
          setTasks(tasks.map(task => task.id === id ? updatedTask : task))
          loadData(viewMode === 'day' ? selectedDate : 'unscheduled')
        }
      })
    }
  }

  useEffect(() => {
    if (viewMode === 'day') {
      loadData(selectedDate)
    } else {
      loadData('unscheduled')
    }
  }, [selectedDate, viewMode])

  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.on('timer:tick', (data: { isRunning: boolean, timeRemaining: number, totalTime: number, taskId: string | null, task: Task | null }) => {
        setIsRunning(data.isRunning)
        setTimeRemaining(data.timeRemaining)
        setTotalTime(data.totalTime)
        setActiveTaskData(data.task || null)
        if (data.isRunning && data.taskId) setActiveTaskId(data.taskId)
      })
      window.electron.ipcRenderer.on('timer:finished', () => {
        loadData(viewMode === 'day' ? selectedDate : 'unscheduled')
      })
    }
  }, [selectedDate, viewMode])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleStartTimer = (id: string, minutes: number) => {
    if (window.electron) window.electron.ipcRenderer.invoke('timer:start', id, minutes)
  }

  const handleStopTimer = () => {
    setActiveTaskId(null)
    if (window.electron) window.electron.ipcRenderer.invoke('timer:stop')
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    if (window.electron) {
      const task = {
        title: newTaskTitle,
        completed: false,
        estimatedMinutes: newTaskMinutes,
        date: viewMode === 'unscheduled' ? 'unscheduled' : selectedDate,
        categoryId: selectedCategoryId
      }
      window.electron.ipcRenderer.invoke('store:addTask', task).then(() => {
        loadData(viewMode === 'day' ? selectedDate : 'unscheduled')
        setNewTaskTitle('')
        setNewTaskSubtext('')
        setSelectedCategoryId(null)
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

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: Make it slightly transparent while dragging
    setTimeout(() => {
      const el = e.target as HTMLElement
      if (el) el.style.opacity = '0.5'
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null)
    const el = e.target as HTMLElement
    if (el) el.style.opacity = '1'
    if (window.electron) {
      window.electron.ipcRenderer.invoke('store:updateTaskOrder', tasks.map(t => t.id))
    }
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!draggedTaskId || draggedTaskId === id) return

    const tasksCopy = [...tasks]
    const draggedIndex = tasksCopy.findIndex(t => t.id === draggedTaskId)
    const targetIndex = tasksCopy.findIndex(t => t.id === id)

    const [draggedItem] = tasksCopy.splice(draggedIndex, 1)
    tasksCopy.splice(targetIndex, 0, draggedItem)

    setTasks(tasksCopy)
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i))

    const monthName = currentMonth.toLocaleString(language, { month: 'long', year: 'numeric' })
    const weekDays = language === 'pt-br' 
      ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] 
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl p-4 min-w-0">
        <div className="flex justify-between items-center mb-5 px-1">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 bg-[#1a1a1a] hover:bg-white/10 rounded-full text-white/70 transition-colors shrink-0"><ChevronLeft size={14} /></button>
          <span className="font-semibold text-sm text-white capitalize truncate px-1">{monthName}</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 bg-[#1a1a1a] hover:bg-white/10 rounded-full text-white/70 transition-colors shrink-0"><ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-[10px] uppercase tracking-wider mb-2 text-white/40 font-medium">
          {weekDays.map((wd, idx) => (
            <div key={idx}>{wd}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs font-medium">
          {days.map((d, i) => {
            if (!d) return <div key={i}></div>
            const dateStr = formatDate(d)
            const isSelected = dateStr === selectedDate
            
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(dateStr)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors mx-auto ${
                  isSelected ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
                }`}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
        
        <div className="mt-auto pt-2">
          <button onClick={() => setSelectedDate(formatDate(new Date()))} className="w-full py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-xl text-xs font-medium text-white transition-colors">
            {t('Today')}
          </button>
        </div>
      </div>
    )
  }

  const handleSetViewState = (newState: 'collapsed' | 'hovered' | 'expanded') => {
    isTransitioningRef.current = true
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current); transitionTimeoutRef.current = setTimeout(() => { isTransitioningRef.current = false }, 500) // increased to match animation duration

    if (newState === 'expanded') {
      if (window.electron) window.electron.ipcRenderer.send('window:resize', 'expanded')
      setViewState('expanded')
    } else if (newState === 'hovered') {
      if (viewState === 'collapsed') {
        if (window.electron) window.electron.ipcRenderer.send('window:resize', 'hovered')
        setViewState('hovered')
      } else if (viewState === 'expanded') {
        setViewState('hovered')
        setTimeout(() => {
          setViewState(curr => {
            if (curr === 'hovered') {
              if (window.electron) window.electron.ipcRenderer.send('window:resize', 'hovered')
            }
            return curr
          })
        }, 300)
      }
    } else if (newState === 'collapsed') {
      setViewState('collapsed')
      setTimeout(() => {
        setViewState(curr => {
          if (curr === 'collapsed') {
            if (window.electron) window.electron.ipcRenderer.send('window:resize', 'collapsed')
          }
          return curr
        })
      }, 300)
    }
  }

  let containerClass = "w-64 h-12"
  if (viewState === 'hovered') containerClass = "w-[580px] h-[320px]"
  if (viewState === 'expanded') containerClass = "w-[840px] h-[580px]"

  return (
    <div className="w-full h-full flex justify-center pt-1 select-none relative group text-white">
      {/* Drag handle */}
      <div 
        className="absolute top-0 w-32 h-2 cursor-grab opacity-0 group-hover:opacity-100 flex justify-center items-center z-50"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full mt-1"></div>
      </div>

      <div 
        className={`bg-[#050505] backdrop-blur-3xl rounded-[32px] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col mt-1 border border-white/10 ${
          isRunning && viewState === 'collapsed' ? 'shadow-blue-900/20' : ''
        } ${containerClass} relative`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* PROGRESS BAR */}
        {isRunning && totalTime > 0 && viewState === 'collapsed' && (
          <div 
            className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(1 - timeRemaining / totalTime) * 100}%` }}
          />
        )}

        {/* COLLAPSED STATE (PILL) */}
        {viewState === 'collapsed' && (
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex items-center space-x-3 text-white overflow-hidden flex-1 min-w-0 mr-2">
              {isRunning && activeTaskData && totalTime === 0 ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTask(activeTaskData.id);
                    handleStopTimer();
                  }} 
                  className="text-white/30 hover:text-white shrink-0 group-hover/radio:text-white"
                >
                  <Circle size={18} />
                </button>
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isRunning ? 'bg-blue-500' : 'bg-green-400'}`}></div>
              )}
              <MarqueeText 
                text={isRunning && activeTaskData ? activeTaskData.title : t('Ready to Focus')} 
              />
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-1">
              {isRunning && totalTime > 0 && (
                <div className="text-sm font-bold text-white tracking-widest">
                  {formatTime(timeRemaining)}
                </div>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  if (hoverTimeout) clearTimeout(hoverTimeout)
                  handleSetViewState('hovered')
                }}
                className="text-white/20 hover:text-white/60 transition-colors p-1"
                title="Expand"
              >
                <ChevronDown size={14} />
              </button>
            </div>
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
                  <span className="font-semibold text-sm">{viewMode === 'day' ? t('To do') : t('Unscheduled')}</span>
                </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleSetViewState('expanded')
                    }} 
                    className="text-white/40 hover:text-white transition-colors"
                    type="button"
                  >
                    <Maximize2 size={14} />
                  </button>
              </div>
              
              <div className="overflow-y-auto space-y-2 custom-scrollbar pr-1 max-h-[150px]">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    className={`bg-[#1a1a1a] p-3 rounded-xl flex items-center justify-between group cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'opacity-50 border border-blue-500/30' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                      <button onClick={() => handleToggleTask(task.id)} className="text-white/30 hover:text-white shrink-0">
                        {task.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
                      </button>
                      <div className="flex flex-col truncate min-w-0">
                        <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-white/40' : 'text-white/90'}`}>{task.title}</span>
                        {task.categoryId && (() => {
                          const cat = categories.find(c => c.id === task.categoryId)
                          if (!cat) return null
                          return (
                            <span className="flex items-center gap-1 text-[10px] mt-0.5 truncate" style={{ color: cat.color }}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                              <span className="truncate">{t(cat.name as any) || cat.name}</span>
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                    <button 
                      onClick={() => isRunning && activeTaskId === task.id ? handleStopTimer() : handleStartTimer(task.id, task.date === 'unscheduled' ? 0 : task.estimatedMinutes)}
                      className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-full transition-colors ${
                        isRunning && activeTaskId === task.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {isRunning && activeTaskId === task.id ? <Square size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" className="ml-0.5" />}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-3 flex items-center gap-2">
                <button 
                  onClick={() => { handleSetViewState('expanded'); setIsAddingTask(true) }} 
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl font-medium"
                >
                  <Plus size={13} className="text-white/70" />
                  <span>{t('Task')}</span>
                </button>
                <button 
                  onClick={() => { handleSetViewState('expanded'); setShowSettings(true) }} 
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl font-medium"
                >
                  <Plus size={13} className="text-white/70" />
                  <span>{t('Category')}</span>
                </button>
              </div>
            </div>

            {/* Right: Heatmap & Categories Chart */}
            <div className="w-[190px] shrink-0 pt-1 flex flex-col justify-between">
              <Heatmap activity={activity} />
              <CategoryChart categoryStats={categoryStats} t={t} />
            </div>
          </div>
        )}

        {/* EXPANDED STATE (FULL DASHBOARD) */}
        {viewState === 'expanded' && (
          <div className="flex-1 flex flex-col p-5 min-h-0 min-w-0 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-3 px-1 text-white shrink-0">
              <span className="font-semibold text-sm flex items-center gap-2">
                <ListTodo size={16} className="text-white/70" /> {t('Tasks')}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">{tasks.filter(t => !t.completed).length} {t('open')}</span>
                <button onClick={() => setShowSettings(true)} className="p-1 hover:bg-white/10 rounded-full text-white/70 transition-colors" title={t('Settings')}>
                  <Settings size={14} />
                </button>
                <button onClick={() => handleSetViewState('hovered')} className="p-1 bg-[#1a1a1a] hover:bg-white/10 rounded-full text-white/70 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-[270px_1fr] gap-4 min-h-0 min-w-0 overflow-hidden">
              {renderCalendar()}

              <div className="flex flex-col min-h-0 min-w-0 bg-[#0a0a0a] rounded-2xl p-4 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3 text-white shrink-0">
                  <span className="font-semibold">{viewMode === 'day' ? t('Today') : t('Unscheduled')}</span>
                  <div className="flex bg-[#1a1a1a] rounded-full p-0.5">
                    <button 
                      onClick={() => setViewMode('day')}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                    >{t('Day')}</button>
                    <button 
                      onClick={() => setViewMode('unscheduled')}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${viewMode === 'unscheduled' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                    >{t('Unscheduled')} {unscheduledCount > 0 ? unscheduledCount : ''}</button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 custom-scrollbar pr-1 pb-1">
                  {tasks.length === 0 && viewMode === 'unscheduled' && !isAddingTask && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-50 mt-10">
                      <ListTodo size={32} />
                      <p className="text-sm font-medium">{t('Capture ideas and tasks without a specific date here.')}</p>
                    </div>
                  )}
                  {tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="relative"
                      draggable 
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, task.id)}
                    >
                      <div className={`bg-[#111111] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 group transition-colors cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'opacity-50 border border-blue-500/30' : ''}`}>
                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                          <button onClick={() => handleToggleTask(task.id)} className="text-white/30 hover:text-white shrink-0">
                            {task.completed ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
                          </button>
                          <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-white/40' : 'text-white/90'}`}>{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Category badge & quick selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveCategoryPopover(activeCategoryPopover === task.id ? null : task.id)}
                              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-colors hover:brightness-125"
                              style={{
                                backgroundColor: task.categoryId && categories.find(c => c.id === task.categoryId) ? `${categories.find(c => c.id === task.categoryId)!.color}15` : '#1a1a1a',
                                color: task.categoryId && categories.find(c => c.id === task.categoryId) ? categories.find(c => c.id === task.categoryId)!.color : 'rgba(255,255,255,0.4)',
                                borderColor: task.categoryId && categories.find(c => c.id === task.categoryId) ? `${categories.find(c => c.id === task.categoryId)!.color}30` : 'rgba(255,255,255,0.08)'
                              }}
                              title={t('Category')}
                            >
                              {task.categoryId && categories.find(c => c.id === task.categoryId) ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categories.find(c => c.id === task.categoryId)!.color }} />
                                  {t(categories.find(c => c.id === task.categoryId)!.name as any) || categories.find(c => c.id === task.categoryId)!.name}
                                </>
                              ) : (
                                <>
                                  <Tag size={11} />
                                  <span className="text-[10px]">{t('Category')}</span>
                                </>
                              )}
                            </button>

                            {/* Category change popover */}
                            {activeCategoryPopover === task.id && (
                              <div className="absolute right-0 top-full mt-1 bg-[#161616] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateTaskCategory(task.id, null)
                                    setActiveCategoryPopover(null)
                                  }}
                                  className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors text-left ${
                                    !task.categoryId ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full border border-white/30" />
                                  {t('No category')}
                                </button>
                                {categories.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateTaskCategory(task.id, c.id)
                                      setActiveCategoryPopover(null)
                                    }}
                                    className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors text-left ${
                                      task.categoryId === c.id ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                    {t(c.name as any) || c.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-white/40 bg-[#1a1a1a] px-2 py-1 rounded-lg">
                            {viewMode === 'unscheduled' ? <><ListTodo size={12} /> {t('Unscheduled')}</> : <><CalendarIcon size={12} /> {t('Today')}</>}
                          </div>
                          
                          {viewMode === 'day' ? (
                            <>
                              <button 
                                onClick={() => setActiveDurationPopover(activeDurationPopover === task.id ? null : task.id)}
                                className="flex items-center gap-2 text-xs text-white/40 bg-[#1a1a1a] hover:bg-[#222] transition-colors px-2 py-1 rounded-lg"
                              >
                                <Clock size={12} /> {task.estimatedMinutes}m
                              </button>
                              <button 
                                onClick={() => isRunning && activeTaskId === task.id ? handleStopTimer() : handleStartTimer(task.id, task.estimatedMinutes)}
                                className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                                  isRunning && activeTaskId === task.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                                }`}
                              >
                                {isRunning && activeTaskId === task.id ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => isRunning && activeTaskId === task.id ? handleStopTimer() : handleStartTimer(task.id, 0)}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                                isRunning && activeTaskId === task.id ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-600 text-white hover:bg-blue-500'
                              }`}
                            >
                              {isRunning && activeTaskId === task.id ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                            </button>
                          )}
                          
                          <button onClick={() => handleDeleteTask(task.id)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>

                      {/* Focus duration popover */}
                      {activeDurationPopover === task.id && (
                        <div className="absolute right-10 top-full mt-2 bg-[#111111] border border-white/10 rounded-3xl p-5 shadow-2xl z-50 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                          <div className="text-sm font-semibold text-white">Focus duration</div>
                          <div className="flex items-center gap-4 text-white">
                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase">Min</span>
                              <button onClick={() => handleUpdateTaskDuration(task.id, 5)} className="text-white/40 hover:text-white transition-colors p-1"><ChevronUp size={16} /></button>
                              <div className="w-16 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-xl font-medium">
                                {task.estimatedMinutes.toString().padStart(2, '0')}
                              </div>
                              <button onClick={() => handleUpdateTaskDuration(task.id, -5)} className="text-white/40 hover:text-white transition-colors p-1"><ChevronDown size={16} /></button>
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
                  <div className="bg-[#111111] p-3 rounded-2xl border border-white/10 flex flex-col gap-2.5 mt-auto shrink-0 relative z-10">
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
                    {/* Category Selector Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1 pr-1 max-w-full">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mr-1 shrink-0">{t('Category')}:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryId(null)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors shrink-0 ${
                          selectedCategoryId === null ? 'bg-white/20 text-white' : 'bg-[#1a1a1a] text-white/40 hover:text-white'
                        }`}
                      >
                        {t('No category')}
                      </button>
                      {categories.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(c.id)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all shrink-0 ${
                            selectedCategoryId === c.id 
                              ? 'text-white border' 
                              : 'bg-[#1a1a1a] text-white/60 hover:text-white'
                          }`}
                          style={{
                            backgroundColor: selectedCategoryId === c.id ? `${c.color}25` : undefined,
                            borderColor: selectedCategoryId === c.id ? c.color : 'transparent',
                            color: selectedCategoryId === c.id ? c.color : undefined
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {t(c.name as any) || c.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowSettings(true)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 text-white/40 hover:text-white bg-[#1a1a1a] hover:bg-[#222] transition-colors shrink-0"
                        title={t('Add Category')}
                      >
                        <Plus size={11} />
                        <span>{t('Category')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-auto shrink-0 relative z-10">
                    <button 
                      onClick={() => setIsAddingTask(true)} 
                      className="flex-1 bg-[#111111] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl p-3.5 text-left text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Plus size={15} className="text-white/40" />
                      <span>{t('Add a task')}</span>
                    </button>
                    <button 
                      onClick={() => setShowSettings(true)} 
                      className="bg-[#111111] hover:bg-[#1a1a1a] border border-white/5 rounded-2xl p-3.5 text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2 font-medium shrink-0"
                      title={t('Add Category')}
                    >
                      <Plus size={15} className="text-white/40" />
                      <span>{t('Category')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* SETTINGS OVERLAY */}
        {showSettings && (
          <div className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-md z-[60] p-6 flex flex-col animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <span className="font-semibold text-lg text-white flex items-center gap-2">
                <Settings className="text-white/70" size={18} /> {t('Settings')}
              </span>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
              <div className="flex justify-between items-center bg-[#111] border border-white/5 p-4 rounded-2xl">
                <span className="text-white/90 font-medium">{t('Language')}</span>
                <div className="flex bg-[#1a1a1a] rounded-xl p-1">
                  <button 
                    onClick={() => {
                      if (window.electron) window.electron.ipcRenderer.invoke('store:updateSetting', 'language', 'en')
                      setLanguage('en')
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                  >English</button>
                  <button 
                    onClick={() => {
                      if (window.electron) window.electron.ipcRenderer.invoke('store:updateSetting', 'language', 'pt-br')
                      setLanguage('pt-br')
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${language === 'pt-br' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                  >Português</button>
                </div>
              </div>

              {/* Categories Management */}
              <div className="flex flex-col gap-3 bg-[#111] border border-white/5 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-white/90 font-medium flex items-center gap-2">
                    <Tag size={16} className="text-white/60" /> {t('Categories')}
                  </span>
                  <span className="text-xs text-white/40">{categories.length}</span>
                </div>

                {/* Existing Categories List */}
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between bg-[#1a1a1a] px-3 py-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm text-white/90 font-medium">{t(cat.name as any) || cat.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-white/30 hover:text-red-400 p-1 rounded-lg transition-colors"
                        title={t('Delete category') || 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Category Form */}
                <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                  <span className="text-xs font-medium text-white/60">{t('New category')}</span>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder={t('Category name')}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      className="flex-1 bg-[#1a1a1a] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none border border-white/5 focus:border-white/20 transition-colors"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> {t('Add Category')}
                    </button>
                  </div>
                  {/* Color picker */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Color:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {CATEGORY_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className="w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                          style={{ backgroundColor: color }}
                        >
                          {newCategoryColor === color && (
                            <Check size={12} className="text-white drop-shadow-md stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
