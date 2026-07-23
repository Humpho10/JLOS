<?php

namespace App\Http\Controllers;

use App\Ai\Agents\InstitutionAgent;
use App\Http\Controllers\Concerns\ChatsWithFailover;
use App\Models\Institution;
use Illuminate\Http\Request;

class InstitutionChatController extends Controller
{
    use ChatsWithFailover;

    public function chat(Request $request, string $slug)
    {
        $request->validate([
            'message' => 'nullable|string|max:500',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:8192',
        ]);

        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            return response()->json([
                'message' => $request->input('message'),
                'reply' => 'Unknown institution.',
            ], 404);
        }

        if (! $request->filled('message') && ! $request->hasFile('attachment')) {
            return response()->json([
                'message' => '',
                'reply' => 'Please type a message or attach a file.',
            ], 422);
        }

        $message = $request->input('message') ?: 'Please review the attached file and tell me what it is and how it relates to this institution.';
        $attachments = $request->hasFile('attachment') ? [$request->file('attachment')] : [];

        return $this->respondWithFailover(
            fn (?string $provider) => (new InstitutionAgent($institution))->respond($message, $provider, $attachments),
            $message,
        );
    }
}
