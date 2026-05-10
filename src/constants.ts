export const SITE_NAME = "音楽ツール+";

export type Tool = {
  path: string;
  title: string;
  description: string;
  sidebarIcon: string;
};

export type ExternalTool = {
  url: string;
  title: string;
  description: string;
  sidebarIcon: string;
  category: string;
};

export type InfoPage = {
  path: string;
  title: string;
};

export interface PageMeta {
  title: string;
  description: string;
}

export const tools: Tool[] = [
  {
    path: "/metronome",
    title: "メトロノーム",
    description: "BPM、拍子、加速・減速、ショートカットに対応したメトロノーム",
    sidebarIcon: "material-symbols:timer-outline-rounded",
  },
];

export const experimentalTools: Tool[] = [
  {
    path: "/polyrhythm",
    title: "ポリリズム",
    description: "複数のリズムを同時に鳴らしてポリリズムを練習できるツール",
    sidebarIcon: "material-symbols:graphic-eq-rounded",
  },
];

export const allTools: Tool[] = [...tools, ...experimentalTools];

export const externalTools: ExternalTool[] = [
  {
    url: "https://chromewebstore.google.com/detail/chord-dictionary/lnefagbhokamcaedbeopnhdabkcemkcf",
    title: "Chord Dictionary",
    description: "コードの構成音や転回形を確認できるChrome拡張機能",
    sidebarIcon: "material-symbols:library-music-outline-rounded",
    category: "Chrome拡張機能",
  },
];

export function groupExternalToolsByCategory(items: ExternalTool[]) {
  const groups = new Map<string, ExternalTool[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

export const infoPages: InfoPage[] = [
  { path: "/operator", title: "運営者情報" },
  { path: "/contact", title: "お問い合わせ" },
  { path: "/privacy", title: "プライバシーポリシー" },
];

const toolPageMeta = Object.fromEntries(
  allTools.map((tool) => [
    tool.path,
    {
      title: tool.title,
      description: tool.description,
    } satisfies PageMeta,
  ]),
) as Record<string, PageMeta>;

export const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "ホーム",
    description:
      "インストール不要で使えるWeb音楽ツール集。メトロノームをはじめ、練習や演奏に役立つツールをまとめました。",
  },
  ...toolPageMeta,
  "/operator": {
    title: "運営者情報",
    description: `${SITE_NAME}の運営者情報とサイトコンセプトのご案内。`,
  },
  "/contact": {
    title: "お問い合わせ",
    description: `${SITE_NAME}へのご意見・不具合報告などのお問い合わせ窓口。`,
  },
  "/privacy": {
    title: "プライバシーポリシー",
    description: `${SITE_NAME}のプライバシーポリシーと免責事項。`,
  },
};
