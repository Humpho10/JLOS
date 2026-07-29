<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\Message;
use Illuminate\Http\Request;

class InstitutionContactController extends Controller
{
    public function store(Request $request, string $slug)
    {
        $institution = Institution::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = Message::create([
            'institution_id' => $institution->id,
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
            'body' => $data['body'],
            'status' => 'new',
        ]);

        return response()->json(['message' => [
            'id' => $message->id,
            'status' => $message->status,
        ]], 201);
    }
}
