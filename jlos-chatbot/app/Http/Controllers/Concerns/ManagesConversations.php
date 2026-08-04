<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait ManagesConversations
{
    /**
     * Find the conversation this request is continuing, or start a new one.
     * A logged-in user (resolved from a Bearer token, if one was sent — no
     * route middleware needed for this) is scoped by user_id; a guest is
     * identified purely by their guest_token. Either way, ownership is
     * checked together with conversation_id — otherwise anyone could read
     * someone else's chat just by guessing a numeric ID.
     */
    protected function resolveConversation(Request $request, ?int $institutionId = null): Conversation
    {
        $user = auth('sanctum')->user();
        $guestToken = $request->input('guest_token');
        $conversationId = $request->input('conversation_id');

        if ($conversationId) {
            $conversation = Conversation::query()
                ->where('id', $conversationId)
                ->when($user, fn ($q) => $q->where('user_id', $user->id))
                ->when(! $user, fn ($q) => $q->where('guest_token', $guestToken))
                ->first();

            if ($conversation) {
                return $conversation;
            }
        }

        return Conversation::create([
            'user_id' => $user?->id,
            'guest_token' => $user ? null : $guestToken,
            'institution_id' => $institutionId,
        ]);
    }

    /**
     * Prior turns, formatted as plain text to prepend to the next prompt.
     * This works whether the agent uses tool-calling or manual retrieval
     * internally — it's just more text in the same prompt it already gets.
     */
    protected function historyText(Conversation $conversation): string
    {
        $messages = $conversation->messages;

        if ($messages->isEmpty()) {
            return '';
        }

        return "Previous conversation:\n".$messages->map(
            fn (Message $m) => ($m->role === 'user' ? 'User' : 'Assistant').': '.$m->content
        )->implode("\n")."\n\n";
    }

    protected function recordMessage(Conversation $conversation, string $role, string $content): void
    {
        $conversation->messages()->create(['role' => $role, 'content' => $content]);

        // First message becomes the title — gives a future history list
        // something readable instead of "Conversation #42".
        if (! $conversation->title && $role === 'user') {
            $conversation->update(['title' => Str::limit($content, 60)]);
        }
    }
}
