'use client';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Station = {
  id: 'A'|'B'; name: string; age: string; weightKg: number; food: string; uid: string;
  portion: number; state: string; weight: number; remaining: number;
  present: boolean; pending: boolean; sensorOk: boolean; calibrated: boolean;
  schedules: string[];
};

export default function Home() {
  const [data, setData] = useState<{time: string; timeValid: boolean; stations: Station[]} | null>(null);
  const [hist, setHist] = useState<{hora: string; A: number; B: number}[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const r = await fetch('/api/status', { cache: 'no-store' });
      const j = await r.json();
      setData(j);
      setHist(prev => {
        const hora = new Date().toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'});
        const A = j.stations?.find((s: Station) => s.id === 'A')?.weight ?? 0;
        const B = j.stations?.find((s: Station) => s.id === 'B')?.weight ?? 0;
        return [...prev.slice(-29), { hora, A, B }];
      });
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, []);

  async function cmd(action: string, station: 'A'|'B', args = '') {
    await fetch('/api/commands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, station, args })
    });
    load();
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold">🐱 Comedero inteligente</h1>
          <p className="text-slate-400 text-sm">Wi-Fi hogar · NTP · DS1307 de respaldo</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Hora del comedero</div>
          <div className="text-xl font-semibold">{data?.time ?? '—'} {data?.timeValid ? '' : '⚠'}</div>
        </div>
      </header>

      {loading && <div className="text-slate-400">Cargando…</div>}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.stations.map(s => (
          <article key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Estación {s.id} · {s.name}</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                s.state === 'EATING' ? 'bg-emerald-500/20 text-emerald-300' :
                s.state === 'DISPENSING' ? 'bg-sky-500/20 text-sky-300' :
                s.state === 'PAUSED' ? 'bg-amber-500/20 text-amber-300' :
                s.state === 'EXPIRED' ? 'bg-rose-500/20 text-rose-300' :
                'bg-slate-700 text-slate-300'}`}>{s.state}</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{s.age} · {s.weightKg} kg · {s.food}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Peso actual</div>
                <div className="text-2xl font-bold">{s.weight.toFixed(1)} g</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-400 text-xs">Porción</div>
                <div className="text-2xl font-bold">{s.portion} g</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs mt-3">
              <div className={`p-2 rounded ${s.present ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                {s.present ? '🐾 Presente' : 'Sin gato'}
              </div>
              <div className={`p-2 rounded ${s.pending ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                {s.pending ? '⏳ Pendiente' : 'Sin pendiente'}
              </div>
              <div className={`p-2 rounded ${s.calibrated ? 'bg-sky-500/20' : 'bg-rose-500/20'}`}>
                {s.calibrated ? '⚖️ Calibrada' : '⚠ Sin calibrar'}
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-400">Horarios: {s.schedules.join(' · ')}</div>
            <div className="mt-1 text-xs text-slate-500">UID: {s.uid}</div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => cmd('feed', s.id)}
                className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-sm font-semibold">🍽️ Alimentar</button>
              <button onClick={() => cmd('learn', s.id)}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">🏷️ Aprender collar</button>
              <button onClick={() => cmd('reset', s.id)}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">🧽 Limpieza</button>
              <button onClick={() => cmd('sync', s.id)}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm">⏱️ Sync NTP</button>
            </div>
          </article>
        ))}
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-6">
        <h3 className="text-lg font-semibold mb-3">Peso en el tiempo (últimos ~7 min)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hist}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="hora" stroke="#64748b" />
              <YAxis stroke="#64748b" unit=" g" />
              <Tooltip contentStyle={{ background:'#0f172a', border:'1px solid #1e293b' }} />
              <Area type="monotone" dataKey="A" name="Niña" stroke="#34d399" fill="#34d39955" />
              <Area type="monotone" dataKey="B" name="Gato B" stroke="#60a5fa" fill="#60a5fa55" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <footer className="text-xs text-slate-500 mt-8">
        Los pesos y estados son estimaciones. No sustituyen supervisión veterinaria.
      </footer>
    </main>
  );
}
