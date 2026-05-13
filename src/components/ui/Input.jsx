export default function Input({ label, id, type = 'text', value, onChange, placeholder, prefix, suffix, required, min, step }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-field">
          {label}{required && <span className="text-acid ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-white/30 font-mono text-sm pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`input-field ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-white/30 font-mono text-xs pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
