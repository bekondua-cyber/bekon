"use client"

/** Ubah "00:02-00:07" jadi durasi detik untuk lebar proporsional segmen. */
function parseSpan(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)/)
  if (!match) return 1
  const start = Number(match[1]) * 60 + Number(match[2])
  const end = Number(match[3]) * 60 + Number(match[4])
  return Math.max(end - start, 1)
}

const SEGMENT_ROLE = ["Establish", "Aksi", "Payoff"]

export function BeatTimeline({ timeline }: { timeline: { time: string; action: string }[] }) {
  const spans = timeline.map((b) => parseSpan(b.time))
  const total = spans.reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-gray-100">
        {spans.map((span, i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-bekon-gold/70 to-bekon-gold"
            style={{ width: `${(span / total) * 100}%`, opacity: 0.55 + i * 0.22 }}
          />
        ))}
      </div>
      <div className="space-y-1">
        {timeline.map((beat, i) => (
          <div key={i} className="flex gap-2.5 text-xs">
            <span className="font-mono text-gray-400 shrink-0 w-24">{beat.time}</span>
            <span className="text-gray-300 shrink-0 w-16 hidden sm:block">{SEGMENT_ROLE[i] || `Beat ${i + 1}`}</span>
            <span className="text-gray-600 leading-snug">{beat.action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
