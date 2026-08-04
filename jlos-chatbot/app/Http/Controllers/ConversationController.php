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
            ]),
        ]);
    }
}
