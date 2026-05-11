'use client'

/**
 * WaterFlowInteractive — 动态水管 / 欧姆定律演示（N04 专用）
 *
 * 教学原理：Brilliant / Setosa / 3Blue1Brown 共同的招数 ——
 * 把抽象关系（I = V / R）映射到可视、可拖、连续变化的视觉。
 * 大脑通过操纵建立因果模型，比记公式快 5x。
 *
 * 交互：
 *   - 拖"水压"滑块 → 水位变化 + 水流加速
 *   - 拖"电阻/阀门"滑块 → 阀门变窄 + 水流变慢
 *   - 实时显示当前 I = V / R 数值
 */

import { useState } from 'react'

export function WaterFlowInteractive() {
  // 这两个值表示「相对值」，不强调单位
  const [V, setV] = useState(70) // 电压 / 水压 0-100
  const [R, setR] = useState(40) // 电阻 / 阀门 0-100 (100 = 全关)

  // 欧姆定律简化：I ∝ V / R（避免除零）
  const I = R < 5 ? V * 20 : Math.round((V / R) * 10)
  const isDangerous = I > 100
  // 流速 → 动画时长（越大流速越快）
  const animDuration = I > 0 ? Math.max(0.4, 60 / I) : 0
  const isFlowing = I > 0

  // 水位高度（视觉跟 V 联动）
  const waterLevel = Math.max(20, V * 1.8)

  // 阀门宽度（开口越小，R 越大）
  const valveOpening = Math.max(2, ((100 - R) / 100) * 22)

  return (
    <div className="my-6 forge-card overflow-hidden">
      <div className="bg-forge-bg-elevated px-4 py-2 border-b border-forge-border-subtle">
        <span className="text-[0.7rem] font-mono uppercase tracking-wider text-forge-fg-subtle">
          🌊 水管 = 电路 · 拖滑块感受 I = V / R
        </span>
      </div>

      {/* SVG 主体 */}
      <div className="bg-forge-bg-elevated p-4">
        <svg viewBox="0 0 600 280" className="w-full h-auto" style={{ maxHeight: '320px' }}>
          {/* 顶部水池 / 电源 */}
          <g>
            {/* 池壁 */}
            <path
              d={`M 40 30 L 40 210 L 110 210 L 110 30`}
              fill="none"
              stroke="#C8623A"
              strokeWidth="2"
            />
            {/* 水位（蓝色填充） */}
            <rect
              x="42"
              y={210 - waterLevel}
              width="66"
              height={waterLevel}
              fill="#4A8FB8"
              opacity="0.45"
            >
              <animate
                attributeName="height"
                from={waterLevel - 2}
                to={waterLevel}
                dur="0.3s"
                fill="freeze"
              />
            </rect>
            <text x="75" y="22" textAnchor="middle" fill="#EDEDED" fontSize="11">
              水池
            </text>
            <text x="75" y="225" textAnchor="middle" fill="#888" fontSize="9" fontStyle="italic">
              ≈ 电源 / 电池
            </text>
          </g>

          {/* 横向管道 */}
          <line x1="110" y1="200" x2="540" y2="200" stroke="#666" strokeWidth="14" />
          <line x1="110" y1="200" x2="540" y2="200" stroke="#1A1A1C" strokeWidth="10" />

          {/* 阀门 / 电阻 */}
          <g transform="translate(290, 200)">
            <rect x="-25" y="-30" width="50" height="60" fill="#0A0A0B" stroke="#888" strokeWidth="1.5" />
            <text x="0" y="-38" textAnchor="middle" fill="#888" fontSize="9">阀门</text>
            <text x="0" y="44" textAnchor="middle" fill="#888" fontSize="9" fontStyle="italic">≈ 电阻 R</text>
            {/* 阀门开口（黄色） */}
            <rect
              x={-valveOpening / 2}
              y="-5"
              width={valveOpening}
              height="10"
              fill="#fcd34d"
              opacity="0.85"
            />
          </g>

          {/* 水流粒子 — 只有阀门没全关、有水压时才动 */}
          {isFlowing &&
            [0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} r="3.5" fill="#4A8FB8" opacity="0.9">
                <animateMotion
                  dur={`${animDuration}s`}
                  begin={`${(i * animDuration) / 6}s`}
                  repeatCount="indefinite"
                  path="M 110 200 L 540 200"
                />
              </circle>
            ))}

          {/* 排水池 / 地 */}
          <g transform="translate(540, 200)">
            <line x1="0" y1="0" x2="0" y2="35" stroke="#888" strokeWidth="2" />
            <line x1="-18" y1="35" x2="18" y2="35" stroke="#888" strokeWidth="2" />
            <line x1="-13" y1="42" x2="13" y2="42" stroke="#888" strokeWidth="1.5" />
            <line x1="-8" y1="49" x2="8" y2="49" stroke="#888" strokeWidth="1" />
            <text x="0" y="65" textAnchor="middle" fill="#888" fontSize="10" fontStyle="italic">
              地 GND
            </text>
          </g>

          {/* 当前 I 大数字（右上角悬浮） */}
          <g transform="translate(540, 70)">
            <rect
              x="-90"
              y="-30"
              width="90"
              height="55"
              fill={isDangerous ? 'rgba(220, 38, 38, 0.15)' : 'rgba(127, 191, 110, 0.12)'}
              stroke={isDangerous ? '#fca5a5' : '#7FBF6E'}
              strokeWidth="1"
            />
            <text x="-45" y="-12" textAnchor="middle" fill="#888" fontSize="9" fontStyle="italic">
              当前流量 I
            </text>
            <text
              x="-45"
              y="13"
              textAnchor="middle"
              fill={isDangerous ? '#fca5a5' : '#86efac'}
              fontSize="22"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              fontWeight="500"
            >
              {I}
            </text>
            {isDangerous && (
              <text x="-45" y="22" textAnchor="middle" fill="#fca5a5" fontSize="10">⚠</text>
            )}
          </g>
        </svg>
      </div>

      {/* 控制条 */}
      <div className="px-4 py-3 space-y-3 border-t border-forge-border-subtle">
        {/* V slider */}
        <div className="flex items-center gap-3">
          <label className="text-[0.7rem] font-mono uppercase tracking-wider text-forge-fg-subtle w-32 shrink-0">
            水压 / 电压 V
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={V}
            onChange={(e) => setV(parseInt(e.target.value))}
            className="flex-1 accent-forge-accent cursor-pointer"
          />
          <span className="font-mono text-xs text-forge-accent w-12 text-right tabular-nums">
            {V}
          </span>
        </div>

        {/* R slider */}
        <div className="flex items-center gap-3">
          <label className="text-[0.7rem] font-mono uppercase tracking-wider text-forge-fg-subtle w-32 shrink-0">
            阀门紧 / 电阻 R
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={R}
            onChange={(e) => setR(parseInt(e.target.value))}
            className="flex-1 accent-forge-accent cursor-pointer"
          />
          <span className="font-mono text-xs text-forge-accent w-12 text-right tabular-nums">
            {R}
          </span>
        </div>
      </div>

      {/* 公式 + 提示 */}
      <div className="px-4 py-3 border-t border-forge-border-subtle bg-forge-bg-elevated">
        <p className="text-xs text-forge-fg-muted leading-relaxed">
          <span className="font-mono text-forge-accent mr-2">I = V / R</span>
          {isDangerous ? (
            <span className="text-forge-danger">
              电流爆表 — 这就是没限流电阻的 LED 瞬间烧的真相
            </span>
          ) : I === 0 ? (
            <span>没水压 / 没电流 — 拖左边 V 看效果</span>
          ) : (
            <span>水压越高、阀门越开，水流越大 — 电学一模一样</span>
          )}
        </p>
      </div>
    </div>
  )
}
