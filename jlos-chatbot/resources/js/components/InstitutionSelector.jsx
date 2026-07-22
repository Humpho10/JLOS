import React, { useState, useEffect } from 'react';

export default function InstitutionSelector({ onSelect }) {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/institutions')
            .then((res) => res.json())
            .then((data) => {
                setInstitutions(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load institutions. Please refresh the page.');
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-slate-800 text-white px-6 py-10 text-center">
                <h1 className="text-2xl font-semibold">JLOS Assistant</h1>
                <p className="text-slate-300 mt-2 max-w-xl mx-auto">
                    Ask questions about Uganda's Justice Law and Order Sector institutions,
                    answered using each institution's own official information.
                </p>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
                {loading && <p className="text-slate-500 text-center">Loading institutions...</p>}
                {error && <p className="text-red-600 text-center">{error}</p>}

                {!loading && !error && institutions.length === 0 && (
                    <p className="text-slate-500 text-center">No institutions are available yet.</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    {institutions.map((inst) => (
                        <button
                            key={inst.slug}
                            onClick={() => onSelect(inst)}
                            className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 hover:shadow-md transition"
                        >
                            <h2 className="font-semibold text-slate-800">{inst.name}</h2>
                            <p className="text-sm text-slate-500 mt-1">Ask about {inst.name}</p>
                            <span className="inline-block mt-3 text-sm text-slate-700 font-medium">
                                Start chatting →
                            </span>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
