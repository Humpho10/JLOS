<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /**
     * The guest's most recent conversation, with its messages, so the
     * frontend can rebuild the chat on page load/refresh instead of
     * starting a new one every time.
     */
    public function current(Request $request)
    {
        $user = auth('sanctum')->user();

        $conversation = Conversation::query()
            ->when($user, fn ($q) => $q->where('user_id', $user->id))
            ->when(! $user, fn ($q) => $q->where('guest_token', $request->query('guest_token')))
            ->latest('updated_at')
            ->with('messages')
            ->first();

        if (! $conversation) {
            return response()->json(['conversation_id' => null, 'messages' => []]);
        }

        return response()->json([
            'conversation_id' => $conversation->id,
            'messages' => $conversation->messages->map(fn ($m) => [
                'role' => $m->role,
                'content' => $m->content,
                'created_at' => $m->created_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Drops every message in the conversation from `since` onward. Backs
     * the "edit a past question" flow — editing has to erase the old
     * question/answer pair from the AI's memory too, not just hide it in
     * the UI, otherwise the next reply (and a future page reload) would
     * still be shaped by the version the user just edited away.
     */
    public function truncate(Request $request, Conversation $conversation)
    {
        $user = auth('sanctum')->user();

        $owns = $user
            ? $conversation->user_id === $user->id
            : ($conversation->guest_token !== null && $conversation->guest_token === $request->input('guest_token'));

        if (! $owns) {
            abort(403);
        }

        $request->validate(['since' => 'required|date']);

        $conversation->messages()->where('created_at', '>=', $request->input('since'))->delete();

        return response()->json(['message' => 'Truncated.']);
    }
}
