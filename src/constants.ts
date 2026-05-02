export const SITE_NAME = "音楽ツール+";

export type Tool = {
  path: string;
  title: string;
  description: string;
  sidebarIcon: string;
};

export const tools: Tool[] = [
  {
    path: "/metronome",
    title: "メトロノーム",
    description: "BPM、拍子、加速・減速、ショートカットに対応したメトロノーム",
    sidebarIcon: "material-symbols:timer-outline-rounded",
  },
];
