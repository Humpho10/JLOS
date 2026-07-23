<?php

namespace App\Http\Controllers;

use App\Ai\Agents\InstitutionAgent;
use App\Models\Institution;
use Illuminate\Http\Request;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\Streaming\Events\Error as AiStreamError;
use Laravel\Ai\Streaming\Events\TextDelta;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class InstitutionChatController extends Controller
{
    /**
     * Same as chat(), but streams the reply as Server-Sent Events so the
     * frontend can render tokens as they arrive instead of waiting for the
     * whole embed -> search -> generate pipeline to finish.
     */
    public function stream(Request $request, string $slug): StreamedResponse
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $institution = Institution::where('slug', $slug)->first();
        $message = $request->input('message');

        return response()->stream(function () use ($institution, $message) {
            if (! $institution) {
                $this->emit(['type' => 'error', 'message' => 'Unknown institution.']);
                $this->emit(['type' => 'done']);
                return;
            }

            try {
                foreach ((new InstitutionAgent($institution))->stream($message) as $event) {
                    if ($event instanceof TextDelta) {
                        $this->emit(['type' => 'delta', 'text' => $event->delta]);
                    } elseif ($event instanceof AiStreamError) {
                        $this->emit(['type' => 'error', 'message' => 'The AI provider had a problem generating a reply. Please try again.']);
                    }
                }
            } catch (RateLimitedException $e) {
                $this->emit(['type' => 'error', 'message' => "I'm getting rate limited by the AI provider right now. Please wait a bit and try again."]);
            } catch (ProviderOverloadedException $e) {
                $this->emit(['type' => 'error', 'message' => 'The AI provider is temporarily overloaded. Please try again in a moment.']);
            } catch (Throwable $e) {
                report($e);
                $this->emit(['type' => 'error', 'message' => 'Something went wrong. Please try again.']);
            }

            $this->emit(['type' => 'done']);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    protected function emit(array $payload): void
    {
        echo 'data: '.json_encode($payload)."\n\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }

        flush();
    }

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