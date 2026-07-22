<?php

namespace App\Http\Controllers;

use App\Ai\Agents\InstitutionAgent;
use App\Models\Institution;
use Illuminate\Http\Request;
use Laravel\Ai\Exceptions\RateLimitedException;
use Throwable;

class InstitutionChatController extends Controller
{
    public function chat(Request $request, string $slug)
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            return response()->json([
                'message' => $request->input('message'),
                'reply' => 'Unknown institution.',
            ], 404);
        }

        try {
            $response = (new InstitutionAgent($institution))->prompt($request->input('message'));
        } catch (RateLimitedException $e) {
            return response()->json([
                'message' => $request->input('message'),
                'reply' => "I'm getting rate limited by the AI provider right now. Please wait a bit and try again.",
            ], 429);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => $request->input('message'),
                'reply' => 'Something went wrong. Please try again.',
            ], 500);
        }

        return response()->json([
            'message' => $request->input('message'),
            'reply' => $response->text ?: "I couldn't find relevant information for that — try rephrasing your question.",
        ]);
    }
}