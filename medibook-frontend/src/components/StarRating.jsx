import React, { useState } from 'react'

export function StarRatingInput({ value = 0, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="d-flex gap-1 align-items-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: 'pointer',
            fontSize: '1.6rem',
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
            lineHeight: 1
          }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      <span className="ms-2 text-muted small fw-500">
        {value > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value] : 'Select rating'}
      </span>
    </div>
  )
}

export function StarRatingDisplay({ value = 0, showCount = false, count = 0, size = 'sm' }) {
  const filled = Math.round(Number(value) || 0)
  const fontSize = size === 'lg' ? '1.1rem' : size === 'md' ? '0.95rem' : '0.8rem'

  return (
    <span className="d-inline-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <i
          key={i}
          className={i <= filled ? 'bi bi-star-fill' : 'bi bi-star'}
          style={{ color: '#f59e0b', fontSize }}
        />
      ))}
      {showCount && (
        <span className="text-muted ms-1" style={{ fontSize: '0.8rem' }}>
          {Number(value).toFixed(1)} ({count})
        </span>
      )}
    </span>
  )
}

export default StarRatingDisplay