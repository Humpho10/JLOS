<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Message::query()->with('institution:id,name,slug')->latest();

        if ($user->role === 'super_admin') {
            if ($request->filled('institution_id')) {
                $query->where('institution_id', $request->integer('institution_id'));
            }
        } else {
            $query->where('institution_id', $user->institution_id);
        }

        return $query->get();
    }

    public function show(Request $request, Message $message)
    {
        abort_unless($request->user()->can('view', $message), 403);

        return $message->load('institution:id,name,slug');
    }

    public function reply(Request $request, Message $message)
    {
        abort_unless($request->user()->can('reply', $message), 403);

        $data = $request->validate([
            'reply_body' => ['required', 'string', 'max:5000'],
        ]);

        $message->update([
            'reply_body' => $data['reply_body'],
            'status' => 'replied',
            'replied_at' => now(),
        ]);

        return $message->fresh()->load('institution:id,name,slug');
    }
}
