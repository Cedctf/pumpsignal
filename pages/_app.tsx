import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Providers } from "@/lib/providers";
import Header from "@/components/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-400">
        {/* Grid Background Overlay */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
        <div className="fixed inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none z-0"></div>

        <div className="relative z-10">
          <Header />
          <Component {...pageProps} />
        </div>
      </div>
    </Providers>
  );
}
