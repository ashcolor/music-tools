import { Link } from "react-router";
import { Icon } from "@iconify/react";
import { tools } from "../../constants";

export function Home() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-6">
      <p className="mb-8 text-center text-sm opacity-60">音楽便利ツール集</p>
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.path}
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
        ))}
      </div>
    </div>
  );
}
