<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\Responses\AgentResponse;
use Throwable;

trait ChatsWithFailover
{
    /**
     * Run an agent's respond() call and turn the various ways it can fail
     * into a consistent JSON reply.
     *
     * The gemini/groq provider() failover on the agents already covers
     * explicit 429/503 responses from Gemini. It does NOT cover Gemini
     * simply hanging with no response at all (a connection timeout) —
     * that exception type isn't one the AI package treats as failoverable.
     * So on a timeout specifically, we manually retry once, forcing Groq
     * (agents that received an attachment ignore this and retry Gemini
     * instead, since Groq's model can't accept image/document content).
     */
    protected function respondWithFailover(callable $call, string $message): JsonResponse
    {
        try {
            return $this->chatSuccess($message, $call(null));
        } catch (ConnectionException $e) {
            report($e);

            try {
                return $this->chatSuccess($message, $call('groq'));
            } catch (Throwable $e2) {
                return $this->chatFailure($message, $e2);
            }
        } catch (Throwable $e) {
            return $this->chatFailure($message, $e);
        }
    }

    private function chatFailure(string $message, Throwable $e): JsonResponse
    {
        if ($e instanceof RateLimitedException) {
            return response()->json([
                'message' => $message,
                'reply' => "I'm getting rate limited by the AI provider right now. Please wait a bit and try again.",
            ], 429);
        }

        if ($e instanceof ProviderOverloadedException) {
            return response()->json([
                'message' => $message,
                'reply' => "The AI provider is temporarily overloaded. Please try again in a moment.",
            ], 503);
        }

        report($e);

        return response()->json([
            'message' => $message,
            'reply' => 'Something went wrong. Please try again.',
        ], 500);
    }

    private function chatSuccess(string $message, AgentResponse $response): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'reply' => $response->text ?: "I couldn't find relevant information for that — try rephrasing your question.",
        ]);
    }
}
