interface ConceptDiagramProps {
  src: string
  alt: string
  caption?: string
}

export function ConceptDiagram({ src, alt, caption }: ConceptDiagramProps) {
  return (
    <figure className="my-6">
      <div className="forge-card p-6 flex items-center justify-center">
        {/* 真实部署后 src 路径会指向 /diagrams/* */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto"
          onError={(e) => {
            // 占位
            const target = e.currentTarget
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent && !parent.querySelector('.diagram-placeholder')) {
              const placeholder = document.createElement('div')
              placeholder.className =
                'diagram-placeholder text-sm text-forge-fg-subtle italic text-center py-12'
              placeholder.textContent = `[Diagram: ${alt}]`
              parent.appendChild(placeholder)
            }
          }}
        />
      </div>
      {caption && (
        <figcaption className="text-xs text-forge-fg-subtle text-center mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
