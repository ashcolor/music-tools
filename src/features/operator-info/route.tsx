import { SITE_NAME } from "../../constants";

export function OperatorInfo() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-6">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-4 sm:p-6">
          <h1 className="text-xl font-bold">運営者情報</h1>

          <div className="mt-3 space-y-2 text-sm leading-relaxed opacity-80">
            <p>運営者名: あっしゅからー</p>
            <p>
              X (Twitter):{" "}
              <a
                href="https://x.com/ashcolor06"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                @ashcolor06
              </a>
            </p>
            <p>サイト名: {SITE_NAME}</p>
            <p>Webサイト: https://music-tools.ashcolor.jp/</p>
          </div>

          <div className="mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <h2 className="text-base font-bold opacity-100">サイトのコンセプト</h2>
            <p>このサイトでは音楽の練習や演奏に役立つツールを提供しています。</p>
            <p>「ユーザ目線で使いやすさと機能性にこだわったツールを提供する」がコンセプトです。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
