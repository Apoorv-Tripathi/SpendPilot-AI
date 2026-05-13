import { ChevronDown } from 'lucide-react'

export default function Select({ label, id, value, onChange, options, placeholder = 'Select…', required }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-field">
          {label}{required && <span className="text-acid ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-field appearance-none pr-10 cursor-pointer"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            typeof opt === 'string'
              ? <option key={opt} value={opt}>{opt}</option>
              : <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
      </div>
    </div>
  )
}
