import { Link } from "react-router";
import { Icon } from "@iconify/react";
import type { Tool } from "../../constants";
import { experimentalTools, tools } from "../../constants";

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      to={tool.path}
      className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="card-body flex-row items-center gap-3 p-4">
        <Icon icon={tool.sidebarIcon} className="size-8 shrink-0 text-primary" />
        <div className="text-left">
          <div className="font-bold">{tool.title}</div>
          <div className="text-xs opacity-60">{tool.description}</div>
        </div>
      </div>
    </Link>
  );
}

export function Home() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-6">
      <p className="mb-8 text-center text-sm opacity-60">音楽ツール＋</p>
      <h2 className="mb-3 text-sm font-bold opacity-60">ツール</h2>
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.path} tool={tool} />
        ))}
      </div>
      <h2 className="mt-8 mb-3 text-sm font-bold opacity-60">実験</h2>
      <div className="flex flex-col gap-3">
        {experimentalTools.map((tool) => (
          <ToolCard key={tool.path} tool={tool} />
        ))}
      </div>
    </div>
  );
}
