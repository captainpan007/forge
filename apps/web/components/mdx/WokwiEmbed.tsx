/**
 * Wokwi 仿真器嵌入 — 在节点页里直接跑硬件代码
 *
 * Wokwi 是免费的硬件在线仿真器，支持 Arduino / ESP32 / Pi Pico / STM32 等。
 * 用 iframe 嵌入公共项目，用户能直接点 RUN 看效果，不用真硬件。
 *
 * 用法（MDX）：
 *   <Wokwi
 *     project="403745806589751297"
 *     title="Pi Pico LED Blink"
 *     description="按 RUN，看 GPIO 25 的 LED 每秒闪一次"
 *   />
 *
 * 找现成项目：https://wokwi.com/discover
 * 自己创建：https://wokwi.com/projects/new/pi-pico
 *
 * 注意：Wokwi 不直接支持 Pi 4/5 完整 GPIO（树莓派要真硬件），
 * 但 Pi Pico / Arduino 的 GPIO 概念 100% 通用 —— 学的就是同一回事。
 */

interface WokwiEmbedProps {
  /** Wokwi 项目 ID（URL 里 /projects/<id> 那段） */
  project?: string
  /** 直接给完整 src（覆盖 project） */
  src?: string
  /** 显示标题 */
  title: string
  /** 一句话说明这个仿真演示什么 */
  description?: string
  /** 高度（默认 480px — 够显示电路图 + 代码 + 串口） */
  height?: number
}

export function WokwiEmbed({
  project,
  src,
  title,
  description,
  height = 480,
}: WokwiEmbedProps) {
  const iframeSrc =
    src ?? (project ? `https://wokwi.com/projects/${project}` : null)

  if (!iframeSrc) {
    // 配置错误兜底 —— 提示作者
    return (
      <div className="my-6 forge-card p-4 border-forge-warning/40 bg-forge-warning/5">
        <p className="text-xs font-mono text-forge-warning">
          ⚠ WokwiEmbed: 必须传 <code>project</code> 或 <code>src</code>
        </p>
      </div>
    )
  }

  return (
    <div className="my-6 forge-card overflow-hidden">
      {/* 顶栏：标题 + 外链 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-forge-border-subtle bg-forge-bg-elevated">
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] font-mono text-forge-fg-subtle uppercase tracking-wider">
            ⚡ Wokwi 仿真
          </span>
          <span className="text-xs text-forge-fg-muted">{title}</span>
        </div>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.7rem] font-mono text-forge-fg-subtle hover:text-forge-accent transition-colors"
          title="在 Wokwi 新窗口打开（可改代码 / 保存）"
        >
          全屏 ↗
        </a>
      </div>

      {/* iframe — Wokwi 在嵌入时自动隐藏部分 chrome */}
      <iframe
        src={iframeSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; serial; usb"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        className="w-full bg-white"
        style={{ height: `${height}px`, border: 0 }}
        loading="lazy"
      />

      {/* 底部说明 */}
      {description && (
        <div className="px-4 py-3 border-t border-forge-border-subtle">
          <p className="text-xs text-forge-fg-muted leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  )
}
