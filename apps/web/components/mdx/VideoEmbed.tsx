interface VideoEmbedProps {
  src: string
  title: string
  duration?: string
  language?: 'zh' | 'en'
  notes?: string
}

export function VideoEmbed({ src, title, duration, language, notes }: VideoEmbedProps) {
  return (
    <div className="my-6 forge-card overflow-hidden">
      <div className="aspect-video bg-black">
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="px-4 py-3 border-t border-forge-border-subtle">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium">{title}</h4>
          <div className="flex items-center gap-2 text-[0.7rem] font-mono text-forge-fg-subtle">
            {duration && <span>{duration}</span>}
            {language && (
              <span className="px-1.5 py-0.5 rounded bg-forge-bg-elevated">
                {language === 'zh' ? '中文' : 'EN'}
              </span>
            )}
          </div>
        </div>
        {notes && <p className="text-xs text-forge-fg-muted">{notes}</p>}
      </div>
    </div>
  )
}
