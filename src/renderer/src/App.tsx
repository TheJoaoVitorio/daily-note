import { useState } from 'react'

function App() {
  return (
    <div className="w-full h-full flex justify-center pt-2 select-none">
      <div 
        className="w-64 h-12 bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10 flex items-center justify-between px-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center space-x-2 text-white">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-sm font-medium">Ready</span>
        </div>
        <div className="text-white/60 text-xs">00:00</div>
      </div>
    </div>
  )
}

export default App
