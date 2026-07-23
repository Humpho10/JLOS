<?php

namespace App\Http\Controllers;

use App\Ai\Agents\GeneralAgent;
use App\Http\Controllers\Concerns\ChatsWithFailover;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    use ChatsWithFailover;

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:500',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:8192',
        ]);

        if (! $request->filled('message') && ! $request->hasFile('attachment')) {
            return response()->json([
                'message' => '',
                'reply' => 'Please type a message or attach a file.',
            ], 422);
        }

        $message = $request->input('message') ?: 'Please review the attached file and tell me what it is and how it relates to a JLOS institution.';
        $attachments = $request->hasFile('attachment') ? [$request->file('attachment')] : [];

        return $this->respondWithFailover(
            fn (?string $provider) => (new GeneralAgent)->respond($message, $provider, $attachments),
            $message,
        );
    }
}
