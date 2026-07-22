import React, { useState, useRef, useEffect } from 'react';

export default function ChatWindow({ institution, onBack }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function sendMessage(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`/api/institutions/${institution.slug}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Error reaching the server.' },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white">
            <header className="bg-slate-800 text-white px-6 py-4 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="text-slate-300 hover:text-white text-sm shrink-0"
                >
                    ← Institutions
                </button>
                <div>
                    <h1 className="text-lg font-semibold">{institution.name}</h1>
                    <p className="text-sm text-slate-300">JLOS Assistant</p>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 && (
                    <p className="text-slate-400 text-sm">
                        Try: "How do I file a complaint?"
                    </p>
                )}

                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                                m.role === 'user'
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-800'
                            }`}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2 text-sm">
                            Thinking...
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <form onSubmit={sendMessage} className="border-t px-6 py-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${institution.name}...`}
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-800 text-white rounded-full px-5 py-2 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
