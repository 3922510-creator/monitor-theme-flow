import { ArrowDown, ArrowUp, Cpu, HardDrive, MemoryStick, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Meter } from "@/components/Meter"
import { type Node } from "@/lib/api"
import { bytes, daysUntil, osName, percent, rate, uptime } from "@/lib/format"
import { cn } from "@/lib/utils"

function usage(node: Node) {
  if (node.traffic_mode === "up") return node.month_tx
  if (node.traffic_mode === "down") return node.month_rx
  if (node.traffic_mode === "max") return Math.max(node.month_rx, node.month_tx)
  return node.month_rx + node.month_tx
}

function deployed(node: Node) { return node.cpu_cores > 0 || node.mem_total > 0 }
function code(value: string) { const v = value.trim().toUpperCase(); return /^[A-Z]{2}$/.test(v) ? v : "" }

function MiniSpeed({ node }: { node: Node }) {
  const m = node.metrics
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-950/50">
      <div><div className="flex items-center gap-1 text-[10px] text-slate-400"><ArrowUp className="size-3 text-emerald-500" />上行实时</div><strong className="mt-1 block text-sm text-emerald-600 dark:text-emerald-400">{m ? rate(m.net_tx) : "—"}</strong></div>
      <div><div className="flex items-center gap-1 text-[10px] text-slate-400"><ArrowDown className="size-3 text-sky-500" />下行实时</div><strong className="mt-1 block text-sm text-sky-600 dark:text-sky-400">{m ? rate(m.net_rx) : "—"}</strong></div>
    </div>
  )
}

export function NodeCard({ node, onOpen }: { node: Node; onOpen: () => void }) {
  const m = node.metrics
  const traffic = node.traffic_limit > 0 ? percent(usage(node), node.traffic_limit) : null
  const days = daysUntil(node.expires_at)
  return (
    <Card className="flow-server-card overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <button className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left dark:border-slate-800 sm:px-5" onClick={onOpen}>
        <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full ring-4", node.online ? "bg-emerald-500 ring-emerald-500/10" : "bg-slate-300 ring-slate-300/10")} />
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2"><strong className="truncate text-sm font-bold text-slate-900 dark:text-white">{node.name}</strong>{node.country && <b className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">{code(node.country)}</b>}</span>
          <span className="mt-1 block truncate text-[11px] text-slate-400">{node.os ? osName(node.os) : "等待首次上报"}{node.arch ? ` · ${node.arch}` : ""}{node.remark ? ` · ${node.remark}` : ""}</span>
        </span>
        <span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold", node.online ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800")}>{node.online ? "在线" : "离线"}</span>
      </button>
      {deployed(node) ? <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Meter label={`处理器 · ${node.cpu_cores} 核`} icon={<Cpu className="size-3" />} pct={m?.cpu ?? null} foot={m ? `负载 ${m.load[0].toFixed(2)}` : undefined} color="bg-sky-400" />
          <Meter label="内存" icon={<MemoryStick className="size-3" />} pct={m ? percent(m.mem_used, m.mem_total) : null} foot={m ? `${bytes(m.mem_used)} / ${bytes(m.mem_total)}` : undefined} color="bg-violet-400" />
          <Meter label="磁盘" icon={<HardDrive className="size-3" />} pct={m ? percent(m.disk_used, m.disk_total) : null} foot={m ? `${bytes(m.disk_used)} / ${bytes(m.disk_total)}` : undefined} color="bg-amber-400" />
          <Meter label="Swap" icon={<RefreshCw className="size-3" />} pct={m && m.swap_total > 0 ? percent(m.swap_used, m.swap_total) : null} empty="无" color="bg-cyan-400" />
        </div>
        <MiniSpeed node={node} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <div><span className="text-slate-400">总流量</span><p className="tnum mt-0.5 font-semibold"><ArrowUp className="mr-1 inline size-3 text-emerald-500" />{bytes(node.total_tx)} <ArrowDown className="ml-1 mr-1 inline size-3 text-sky-500" />{bytes(node.total_rx)}</p></div>
          <div><span className="text-slate-400">周期流量</span><p className="tnum mt-0.5 font-semibold">{bytes(usage(node))} / {node.traffic_limit > 0 ? bytes(node.traffic_limit) : "∞"}</p></div>
          <div><span className="text-slate-400">到期</span><p className="tnum mt-0.5 font-semibold">{days === null ? "—" : days < 0 ? `已过期${-days}天` : `${days}天`}</p></div>
          <div><span className="text-slate-400">在线时长</span><p className="tnum mt-0.5 font-semibold">{m ? uptime(m.uptime) : "—"}</p></div>
        </div>
        {traffic !== null && <div className="flex gap-1">{Array.from({ length: 20 }, (_, i) => <i key={i} className={cn("h-1.5 flex-1 rounded-full", i < Math.round(traffic / 5) ? "bg-sky-400" : "bg-slate-100 dark:bg-slate-800")} />)}</div>}
      </div> : <p className="p-5 text-xs text-slate-400">还没有接入。在后台生成安装命令并执行一次。</p>}
    </Card>
  )
}

export function Country({ node }: { node: Node }) { return node.country ? <span className="text-xs text-slate-500">{code(node.country)}</span> : null }
export function Status({ node }: { node: Node }) { return <span className="text-xs text-slate-500">{node.online ? `在线 ${node.metrics ? uptime(node.metrics.uptime) : ""}` : "离线"}</span> }
