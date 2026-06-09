import { useScratchpadStore } from '../store/scratchpadStore'

export const Topbar = () => {
  const { boards, activeBoardId, setActiveBoard } = useScratchpadStore()

  return (
    <div className="fixed top-4 left-6 z-[200] flex items-center gap-3">
      <select 
        value={activeBoardId}
        onChange={(e) => setActiveBoard(e.target.value)}
        className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      >
        {boards.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
    </div>
  )
}