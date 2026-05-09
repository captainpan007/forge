interface ConceptDiagramProps {
  src: string
  alt: string
  caption?: string
}

/**
 * 概念图（SVG / 静态图片）
 *
 * v0: 直接渲染 img；图片不存在时浏览器显示 broken-image —— 这是合理的提示
 *     "这里需要一张 SVG，作者还没画"。
 * v1+: 加更精致的 fallback（loading skeleton / 自动占位）
 *
 * 纯 server component（没用 client-side hooks / events）。
 */
export function ConceptDiagram({ src, alt, caption }: ConceptDiagramProps) {
  return (
    <figure className="my-6">
      <div className="forge-card p-6 flex items-center justify-center min-h-[120px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-w-full h-auto" />
      </div>
      {caption && (
        <figcaption className="text-xs text-forge-fg-subtle text-center mt-2 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
