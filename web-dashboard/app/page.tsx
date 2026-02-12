'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bot, TrendingUp, Activity, ShieldCircle, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Dashboard() {
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        price: 0,
        signal: 'INITIALIZING',
        rsi: 0,
        ema_fast: 0,
        ema_slow: 0,
        status: 'DISCONNECTED'
    });
    const [signals, setSignals] = useState<any[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8765');

        ws.onopen = () => setStats(prev => ({ ...prev, status: 'CONNECTED' }));
        ws.onclose = () => setStats(prev => ({ ...prev, status: 'DISCONNECTED' }));

        ws.onmessage = (event) => {
            const payload = json.parse(event.data);
            if (payload.type === 'UPDATE' || payload.type === 'SIGNAL') {
                const info = payload.data;
                setStats(prev => ({
                    ...prev,
                    price: info.price,
                    signal: info.signal,
                    rsi: info.rsi,
                    ema_fast: info.ema_fast,
                    ema_slow: info.ema_slow
                }));

                setData(prev => [...prev.slice(-19), { time: new date().toLocaleTimeString(), price: info.price }]);

                if (payload.type === 'SIGNAL') {
                    setSignals(prev => [{
                        type: info.signal,
                        price: info.price,
                        time: new date().toLocaleTimeString(),
                        id: date.now()
                    }, ...prev.slice(0, 9)]);
                }
            }
        };

        return () => ws.close();
    }, []);

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 glass bg-accent-violet/10">
                        <Bot className="w-8 h-8 text-accent-violet" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Crypto Nexus</h1>
                        <p className="text-gray-400 font-medium">Real-time Trading Terminal</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${stats.status === 'CONNECTED' ? 'bg-accent-lime/10 border-accent-lime/20 text-accent-lime' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${stats.status === 'CONNECTED' ? 'bg-accent-lime' : 'bg-rose-500'}`} />
                    {stats.status}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Current Price" value={`$${stats.price.toLocaleString()}`} icon={<Activity className="text-accent-cyan" />} />
                <StatCard title="Bot Signal" value={stats.signal} icon={<Zap className="text-accent-lime" />} subValue={`RSI: ${stats.rsi}`} />
                <StatCard title="Global Sentiment" value="BULLISH" icon={<TrendingUp className="text-accent-violet" />} subValue="Score: 82%" />
                <StatCard title="Risk Manager" value="ACTIVE" icon={<ShieldCircle className="text-accent-cyan" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 glass p-6 aspect-video">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        BTC/USDT <span className="text-sm font-normal text-gray-500">Live Feed</span>
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis dataKey="time" stroke="#666" fontSize={12} />
                            <YAxis domain={['auto', 'auto']} stroke="#666" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#06b6d4' }}
                            />
                            <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Signals List */}
                <div className="glass p-6 overflow-hidden">
                    <h3 className="text-xl font-semibold mb-6">Execution Log</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {signals.map(s => (
                            <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center transition-all hover:bg-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${s.type === 'BUY' ? 'bg-accent-lime/20 text-accent-lime' : 'bg-rose-500/20 text-rose-500'}`}>
                                        {s.type === 'BUY' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="font-bold">{s.type} BTC</div>
                                        <div className="text-xs text-gray-500">{s.time}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono">${s.price}</div>
                                </div>
                            </div>
                        ))}
                        {signals.length === 0 && <div className="text-center py-12 text-gray-500 italic">In attesa di segnali...</div>}
                    </div>
                </div>
            </div>
        </main>
    );
}

function StatCard({ title, value, icon, subValue }: any) {
    return (
        <div className="glass p-6 transition-all hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 font-medium">{title}</span>
                <div className="p-2 rounded-lg bg-white/5">{icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
        </div>
    );
}
