import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Swords,
  TrendingUp,
  ShieldAlert,
  Zap,
  Trophy,
  ArrowRight,
  Flame,
  Target,
  Users,
  Skull
} from 'lucide-react';
import { fetchCurves } from '../lib/goldsky';
import { scoreCurves } from '../lib/scoring';
import { Curve } from '../types';

const App = () => {
  // Fetch real data
  const { data: curves, isLoading } = useSWR<Curve[]>(
    'latestCurves',
    fetchCurves,
    { refreshInterval: 5000 }
  );

  // Process data for battles
  const liveBattles = React.useMemo(() => {
    if (!curves || curves.length < 2) return [];

    // Score and sort to find top active tokens
    const scored = scoreCurves(curves);
    const sorted = scored
      .filter(c => !c.isDead && c.volumeEth > 0) // Filter dead/inactive
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Take top 4

    // Create pairs for battles
    const battles = [];
    for (let i = 0; i < sorted.length; i += 2) {
      if (i + 1 < sorted.length) {
        const coinA = sorted[i];
        const coinB = sorted[i + 1];

        // Calc health based on bonding curve progress (approx)
        const getHealth = (c: typeof coinA) => {
          const progress = c.graduated
            ? 100
            : Math.min((Number(c.totalVolumeEth) / 4) * 100, 100);
          return Math.round(progress);
        };

        // Format time ago
        const getTime = (timestamp: string) => {
          const diff = Date.now() - Number(timestamp) * 1000;
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(mins / 60);
          if (hrs > 0) return `${hrs}h ${mins % 60}m`;
          return `${mins}m`;
        };

        // Calculate combined volume for "Pot"
        const pot = (Number(coinA.totalVolumeEth) + Number(coinB.totalVolumeEth)).toFixed(2);

        battles.push({
          id: i,
          coinA: {
            name: coinA.name,
            symbol: coinA.symbol,
            health: getHealth(coinA),
            color: 'text-emerald-500' // Winner dynamic color? For now static
          },
          coinB: {
            name: coinB.name,
            symbol: coinB.symbol,
            health: getHealth(coinB),
            color: 'text-red-500'
          },
          pot: `${pot} ETH`,
          timer: getTime(coinA.createdAt) // Using age as timer/duration
        });
      }
    }
    return battles;
  }, [curves]);

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden px-4">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
              <Zap className="w-3 h-3 fill-emerald-400" /> Live on Robin Pump
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 italic leading-none">
              WHERE <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">DEGENS</span><br />
              GO TO WAR
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The first combat arena for Pump.fun tokens. Stake your favorite coins, watch them battle in real-time liquidity duels, and claim the massive prize pools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/robin-pump">
                <button className="group px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 w-full sm:w-auto">
                  ENTER THE RING <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/leaderboard">
                <button className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-white font-black text-lg rounded-2xl transition-all w-full sm:w-auto">
                  VIEW LEADERBOARD
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Battle Simulation Section */}
        <section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-emerald-500">Live Battles</h2>
            </div>

            {isLoading && (
              <div className="text-center py-20 text-zinc-500 animate-pulse">
                INITIALIZING BATTLEGROUND...
              </div>
            )}

            {!isLoading && liveBattles.length === 0 && (
              <div className="text-center py-20 text-zinc-500">
                NO ACTIVE BATTLES DETECTED.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {liveBattles.map((battle) => (
                <div key={battle.id} className="relative group p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">

                  </div>

                  <div className="flex justify-between items-center mb-12 mt-4 relative">
                    {/* Coin A */}
                    <div className="text-center w-1/3">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-zinc-800 border-2 border-emerald-500 flex items-center justify-center font-black text-xl italic overflow-hidden">
                        {battle.coinA.symbol.slice(0, 4)}
                      </div>
                      <h3 className="font-black text-xs uppercase text-zinc-300 truncate px-2">{battle.coinA.name}</h3>
                    </div>

                    {/* VS */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-black border border-zinc-700 flex items-center justify-center z-10">
                        <span className="text-xs font-black italic text-zinc-500">VS</span>
                      </div>
                      <div className="h-px w-24 bg-gradient-to-r from-transparent via-zinc-700 to-transparent absolute top-1/2"></div>
                    </div>

                    {/* Coin B */}
                    <div className="text-center w-1/3">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center font-black text-xl italic overflow-hidden">
                        {battle.coinB.symbol.slice(0, 4)}
                      </div>
                      <h3 className="font-black text-xs uppercase text-zinc-300 truncate px-2">{battle.coinB.name}</h3>
                    </div>
                  </div>

                  {/* Health Bars */}
                  <div className="space-y-4">
                    <div className="relative h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className={`absolute left-0 top-0 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000`}
                        style={{ width: `${battle.coinA.health}%` }}
                      ></div>
                      <div className="absolute right-0 top-0 h-full bg-red-500/40" style={{ width: `${battle.coinB.health}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
                      <span>HP: {battle.coinA.health}%</span>
                      <span>DURATION: {battle.timer}</span>
                      <span>HP: {battle.coinB.health}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-4 bg-zinc-950/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black italic mb-4">ENGINEERED FOR <span className="text-emerald-500">CHAOS</span></h2>
              <p className="text-zinc-500 max-w-xl mx-auto">The ultimate utility layer for the Robin Pump ecosystem.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-900/80 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <TrendingUp className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 italic uppercase">Liquidity Wars</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Every buy order acts as a power-up for your coin. The more volume your coin generates during the battle, the harder it hits.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-900/80 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <ShieldAlert className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 italic uppercase">Fair Play Engine</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Anti-bot mechanisms ensure that real community support determines the winner, not flash-loan snipers.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-900/80 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Trophy className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3 italic uppercase">Winner Takes All</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Losing coins get burned or taxes are distributed back to the winners. High stakes, high adrenaline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action - The "Pump" Section */}
        <section className="py-20 px-4 overflow-hidden relative">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-emerald-500 p-12 text-center text-black relative">
            <div className="absolute -top-10 -right-10 opacity-10">
              <Swords size={200} />
            </div>
            <div className="relative z-10">
              <Flame className="w-12 h-12 mx-auto mb-6 fill-black" />
              <h2 className="text-4xl md:text-6xl font-black italic mb-6 leading-none uppercase">
                READY TO SEND YOUR COIN TO THE MOON?
              </h2>
              <p className="text-emerald-900 font-bold text-lg mb-8 max-w-xl mx-auto">
                Launch your coin on Robin Pump and register for the next battle bracket in seconds.
              </p>
              <button className="px-10 py-5 bg-black text-emerald-500 font-black text-xl rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95">
                REGISTER MY TOKEN
              </button>
            </div>
          </div>
        </section>

        {/* Stats Ticker */}
        <div className="bg-emerald-500/5 border-y border-emerald-500/10 py-4 flex overflow-hidden whitespace-nowrap">
          <div className="flex gap-12 animate-marquee items-center text-emerald-500/60 font-mono text-xs uppercase font-bold tracking-[0.2em]">
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <span className="flex items-center gap-2">
                  <Target className="w-3 h-3" /> TOTAL VOLUME: $4.2M
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-3 h-3" /> ACTIVE GLADIATORS: 12,402
                </span>
                <span className="flex items-center gap-2">
                  <Skull className="w-3 h-3" /> COINS REKT: 891
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-12 px-4 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-emerald-500" />
            <span className="text-lg font-black tracking-tighter text-white uppercase italic">PumpFight</span>
          </div>
          <div className="flex gap-8 text-zinc-500 text-sm font-medium">
            <a href="#" className="hover:text-emerald-500 transition-colors">Twitter</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Telegram</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Discord</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">DexScreener</a>
          </div>
          <p className="text-zinc-600 text-xs">© 2024 PumpFight Protocol. Duel at your own risk.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
    </>
  );
};

export default App;
