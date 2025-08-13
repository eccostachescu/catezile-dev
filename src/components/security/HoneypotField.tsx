interface HoneypotFieldProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
}

export function HoneypotField({ name = 'website', value, onChange }: HoneypotFieldProps) {
  return (
    <div 
      style={{ 
        position: 'absolute', 
        left: '-9999px', 
        opacity: 0, 
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <label htmlFor={name}>Leave this field empty</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}