import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, CheckCircle2, Clock3, Cpu, HardDrive, MemoryStick, Network, RefreshCw, Server, Wallet } from "lucide-react"
import { Meter } from "@/components/Meter"
import { type Node } from "@/lib/api"
import { bytes, daysUntil, osName, percent, rate, uptime } from "@/lib/format"
import { cn } from "@/lib/utils"

function code(value: string) { const v = value.trim().toUpperCase(); return /^[A-Z]{2}$/.test(v) ? v : "" }
function usage(node: Node) {
  if (node.traffic_mode === "up") return node.month_tx
  if (node.traffic_mode === "down") return node.month_rx
  if (node.traffic_mode === "max") return Math.max(node.month_rx, node.month_tx)
  return node.month_rx + node.month_tx
}
function Section({ title, icon: Icon, children }: { title: string; icon: typeof Server; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Icon className="size-4 text-sky-500" />{title}</h3>{children}</section>
}
function Fact({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[11px] text-slate-400">{label}</dt><dd className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{value || "—"}</dd></div>
}

export function NodeDetail({ node, onBack }: { node: Node; onBack: () => void }) {
  const m = node.metrics
  const traffic = node.traffic_limit > 0 ? percent(usage(node), node.traffic_limit) : null
  const days = daysUntil(node.expires_at)
  return (
    <div className="space-y-4 pb-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-sky-600"><ArrowLeft className="size-4" />返回服务器列表</button>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-7">
          <span className={cn("mt-2 size-3 shrink-0 rounded-full ring-4", node.online ? "bg-emerald-500 ring-emerald-500/10" : "bg-slate-300 ring-slate-300/10")} />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{node.name}</h1>{node.country && <span className="rounded bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">{code(node.country)}</span>}</div><p className="mt-2 text-xs text-slate-400">{node.os ? osName(node.os) : "Unknown"}{node.arch ? ` · ${node.arch}` : ""}{node.virt && node.virt !== "none" ? ` · ${node.virt}` : ""}{node.remark ? ` · ${node.remark}` : ""}</p></div>
          <span className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", node.online ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800")}>{node.online ? "在线" : "离线"}</span>
        </div>
        <dl className="grid grid-cols-2 gap-x-5 gap-y-5 p-5 sm:grid-cols-3 sm:p-7 lg:grid-cols-6">
          <Fact label="系统" value={osName(node.os)} /><Fact label="架构" value={node.arch} /><Fact label="处理器" value={`${node.cpu_cores} 核`} /><Fact label="虚拟化" value={node.virt === "none" ? "—" : node.virt} /><Fact label="Agent" value={node.agent_version} /><Fact label="在线时长" value={m ? uptime(m.uptime) : "—"} />
        </dl>
      </section>
      {m && <Section title="资源使用" icon={Server}><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Meter label={`CPU · ${node.cpu_cores} 核`} icon={<Cpu className="size-3" />} pct={m.cpu} foot={`负载 ${m.load[0].toFixed(2)} / ${m.load[1].toFixed(2)} / ${m.load[2].toFixed(2)}`} color="bg-sky-400" /><Meter label="内存" icon={<MemoryStick className="size-3" />} pct={percent(m.mem_used, m.mem_total)} foot={`${bytes(m.mem_used)} / ${bytes(m.mem_total)}`} color="bg-violet-400" /><Meter label="磁盘" icon={<HardDrive className="size-3" />} pct={percent(m.disk_used, m.disk_total)} foot={`${bytes(m.disk_used)} / ${bytes(m.disk_total)}`} color="bg-amber-400" /><Meter label="Swap" icon={<RefreshCw className="size-3" />} pct={m.swap_total ? percent(m.swap_used, m.swap_total) : null} empty="无" color="bg-cyan-400" /></div></Section>}
      <div className="grid gap-4 lg:grid-cols-2"><Section title="实时网络" icon={Network}><div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30"><ArrowUp className="size-4 text-emerald-500" /><p className="mt-3 text-xs text-slate-400">上行</p><strong className="mt-1 block text-xl text-emerald-600 dark:text-emerald-400">{m ? rate(m.net_tx) : "—"}</strong></div><div className="rounded-xl bg-sky-50 p-4 dark:bg-sky-950/30"><ArrowDown className="size-4 text-sky-500" /><p className="mt-3 text-xs text-slate-400">下行</p><strong className="mt-1 block text-xl text-sky-600 dark:text-sky-400">{m ? rate(m.net_rx) : "—"}</strong></div></div><div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs dark:border-slate-800"><Fact label="今日上行" value={bytes(node.day_tx)} /><Fact label="今日下行" value={bytes(node.day_rx)} /></div></Section><Section title="流量与服务" icon={Wallet}><div className="grid grid-cols-2 gap-x-5 gap-y-5"><Fact label="总上行" value={bytes(node.total_tx)} /><Fact label="总下行" value={bytes(node.total_rx)} /><Fact label="周期用量" value={`${bytes(usage(node))} / ${node.traffic_limit > 0 ? bytes(node.traffic_limit) : "∞"}`} /><Fact label="流量进度" value={traffic === null ? "无限流量" : `${traffic.toFixed(1)}%`} /><Fact label="到期时间" value={days === null ? "—" : days < 0 ? `已过期${-days}天` : `${days}天`} /><Fact label="计费周期" value={node.billing_cycle || "—"} /></div>{traffic !== null && <div className="mt-5 flex gap-1">{Array.from({ length: 24 }, (_, i) => <i key={i} className={cn("h-2 flex-1 rounded-full", i < Math.round(traffic / 100 * 24) ? "bg-sky-400" : "bg-slate-100 dark:bg-slate-800")} />)}</div>}</Section></div>
      <div className="grid gap-4 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><CheckCircle2 className="size-5 text-emerald-500" /><div><p className="text-xs text-slate-400">状态</p><strong className="text-sm">{node.online ? "服务正常" : "服务离线"}</strong></div></div><div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><Clock3 className="size-5 text-sky-500" /><div><p className="text-xs text-slate-400">最后上报</p><strong className="text-sm">{node.last_seen ? new Date(node.last_seen * 1000).toLocaleString("zh-CN") : "—"}</strong></div></div><div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><CalendarDays className="size-5 text-violet-500" /><div><p className="text-xs text-slate-400">到期提醒</p><strong className="text-sm">{days === null ? "无设置" : days > 0 ? `${days} 天后` : "需关注"}</strong></div></div></div>
    </div>
  )
}
