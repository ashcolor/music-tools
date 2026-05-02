export const SITE_NAME = "音楽ツール+";

export type Tool = {
  path: string;
  title: string;
  description: string;
  sidebarIcon: string;
};

export type InfoPage = {
  path: string;
  title: string;
};

export const tools: Tool[] = [
  {
    path: "/metronome",
    title: "メトロノーム",
    description: "BPM、拍子、加速・減速、ショートカットに対応したメトロノーム",
    sidebarIcon: "material-symbols:timer-outline-rounded",
  },
];

export const infoPages: InfoPage[] = [
  { path: "/operator", title: "運営者情報" },
  { path: "/contact", title: "お問い合わせ" },
  { path: "/privacy", title: "プライバシーポリシー" },
];
