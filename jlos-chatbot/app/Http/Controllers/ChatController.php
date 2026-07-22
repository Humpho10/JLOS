<?php

namespace App\Http\Controllers;

use App\Ai\Agents\GeneralAgent;
use Illuminate\Http\Request;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Throwable;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        try {
            $response = (new GeneralAgent)->prompt($request->input('message'));
        } catch (RateLimitedException $e) {
            return response()->json([
                'message' => $request->input('message'),
                'reply' => "I'm getting rate limited by the AI provider right now. Please wait a bit and try again.",
            ], 429);
        } catch (ProviderOverloadedException $e) {
            return response()->json([
                'message' => $request->input('message'),
                'reply' => "The AI provider is temporarily overloaded. Please try again in a moment.",
            ], 503);
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
