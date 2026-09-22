import { Globe2, Radio, Server, Activity } from "lucide-react"
import { speedHistory, type Node } from "@/lib/api"
import { bytes, rate } from "@/lib/format"

export function Summary({ nodes }: { nodes: Node[] }) {
  const online = nodes.filter((n) => n.online)
  const regions = new Set(nodes.map((n) => n.country).filter(Boolean)).size
  const totalRx = nodes.reduce((s, n) => s + n.total_rx, 0)
  const totalTx = nodes.reduce((s, n) => s + n.total_tx, 0)
  const now = speedHistory.at(-1) ?? { rx: 0, tx: 0 }
  const stats = [
    { icon: <Server />, label: "在线", value: `${online.length} / ${nodes.length}`, sub: "节点" },
    { icon: <Globe2 />, label: "地区", value: String(regions), sub: "个地区" },
    { icon: <Radio />, label: "实时网速", value: `${rate(now.tx)} / ${rate(now.rx)}`, sub: "↑ 上行 · ↓ 下行" },
    { icon: <Activity />, label: "总流量", value: `${bytes(totalTx)} / ${bytes(totalRx)}`, sub: "↑ 上行 · ↓ 下行" },
  ]
  return (
    <section className="flow-overview">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">Status overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">服务器状态</h1>
        </div>
        <p className="hidden text-xs text-slate-400 sm:block">实时数据 · 自动刷新</p>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-800 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white px-4 py-4 dark:bg-slate-900 sm:px-5">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-sky-500 [&>svg]:size-4">{s.icon}</span>{s.label}
            </div>
            <div className="mt-2 truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">{s.value}</div>
            <div className="mt-1 text-[10px] text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
