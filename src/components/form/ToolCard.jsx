import { Trash2, Copy, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { AI_TOOLS } from '../../constants'
import { formatCurrency } from '../../utils'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function ToolCard({ tool, onUpdate, onRemove, onDuplicate, index, canRemove }) {
  const [collapsed, setCollapsed] = useState(false)

  const selectedToolMeta = AI_TOOLS.find(t => t.id === tool.toolName)
  const planOptions = selectedToolMeta?.plans || []
  const monthlyCost = parseFloat(tool.monthlySpend) || 0
  const seats = parseInt(tool.seats) || 0
  const costPerSeat = seats > 0 ? monthlyCost / seats : 0

  return (
    <div
      className={`card-glass border rounded-2xl overflow-hidden transition-all duration-300 ${
        selectedToolMeta
          ? 'border-white/[0.12]'
          : 'border-white/[0.06]'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        {/* Drag handle (visual only for now) */}
        <GripVertical size={16} className="text-white/20 cursor-grab flex-shrink-0" />

        {/* Tool icon + name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {selectedToolMeta ? (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
              style={{
                background: `${selectedToolMeta.color}20`,
                color: selectedToolMeta.color,
                border: `1px solid ${selectedToolMeta.color}30`,
              }}
            >
              {selectedToolMeta.icon}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 text-xs font-mono flex-shrink-0">
              {String(index + 1).padStart(2, '0')}
            </div>
          )}

          <div className="min-w-0">
            <div className="font-display font-semibold text-sm text-white truncate">
              {selectedToolMeta?.name || `Tool ${index + 1}`}
            </div>
            {monthlyCost > 0 && (
              <div className="font-mono text-xs text-white/40">
                {formatCurrency(monthlyCost)}/mo
                {costPerSeat > 0 && (
                  <span className="ml-2 text-acid/70">
                    · {formatCurrency(costPerSeat)}/seat
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="btn-ghost p-2 text-white/30 hover:text-white"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button
            onClick={() => onDuplicate(tool.id)}
            className="btn-ghost p-2 text-white/30 hover:text-acid"
            title="Duplicate"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => onRemove(tool.id)}
            disabled={!canRemove}
            className="btn-ghost p-2 text-white/30 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed"
            title="Remove"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Card Body */}
      {!collapsed && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tool name */}
          <div className="sm:col-span-2">
            <Select
              label="AI Tool"
              id={`tool-name-${tool.id}`}
              value={tool.toolName}
              onChange={val => {
                onUpdate(tool.id, 'toolName', val)
                // Reset plan when tool changes
                onUpdate(tool.id, 'plan', '')
              }}
              options={AI_TOOLS.map(t => ({ value: t.id, label: t.name }))}
              placeholder="Select a tool…"
              required
            />
          </div>

          {/* Plan */}
          <div className="sm:col-span-2 md:col-span-1">
            <Select
              label="Plan / Tier"
              id={`tool-plan-${tool.id}`}
              value={tool.plan}
              onChange={val => onUpdate(tool.id, 'plan', val)}
              options={planOptions}
              placeholder={selectedToolMeta ? 'Select a plan…' : 'Select a tool first…'}
            />
          </div>

          {/* Monthly spend */}
          <Input
            label="Monthly Spend"
            id={`tool-spend-${tool.id}`}
            type="number"
            value={tool.monthlySpend}
            onChange={val => onUpdate(tool.id, 'monthlySpend', val)}
            placeholder="0.00"
            prefix="$"
            suffix="/mo"
            min="0"
            step="0.01"
            required
          />

          {/* Seats */}
          <Input
            label="Number of Seats"
            id={`tool-seats-${tool.id}`}
            type="number"
            value={tool.seats}
            onChange={val => onUpdate(tool.id, 'seats', val)}
            placeholder="1"
            min="1"
            step="1"
          />

          {/* Cost per seat preview */}
          {costPerSeat > 0 && (
            <div className="sm:col-span-2 flex items-center gap-2 bg-acid/5 border border-acid/15 rounded-xl px-4 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-acid" />
              <span className="font-mono text-xs text-acid/70">
                Cost per seat: <span className="text-acid font-medium">{formatCurrency(costPerSeat)}/mo</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
