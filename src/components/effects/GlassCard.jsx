/**
 * Reusable frosted-glass panel. Used by the Recruiter Card, project cards,
 * dashboard tiles, chatbot, and contact section.
 */
export default function GlassCard({ as: Tag = 'div', className = '', hover = false, children, ...rest }) {
  return (
    <Tag className={`glass ${hover ? 'glass-hover' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
