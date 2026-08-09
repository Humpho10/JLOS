<?php

namespace App\Http\Controllers;

use App\Ai\Agents\AttachmentInterpreterAgent;
use App\Ai\Agents\GeneralAgent;
use App\Http\Controllers\Concerns\ManagesConversations;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\Streaming\Events\Error as AiStreamError;
use Laravel\Ai\Streaming\Events\TextDelta;
use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ChatController extends Controller
{
    use ManagesConversations;

    /**
     * Same as chat(), but streams the reply as Server-Sent Events so the
     * frontend can render tokens as they arrive instead of waiting for the
     * whole embed -> search -> generate pipeline to finish.
     */
    public function stream(Request $request): StreamedResponse
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'conversation_id' => 'nullable|integer',
            'guest_token' => 'nullable|string',
        ]);

        $conversation = $this->resolveConversation($request);
        $message = $request->input('message');
        $this->recordMessage($conversation, 'user', $message);
        $prompt = $this->historyText($conversation)."New question: {$message}";

        return response()->stream(function () use ($conversation, $prompt) {
            // Sent first so the frontend can remember the ID before any
            // text arrives — needed on a brand-new conversation's first message.
            $this->emit(['type' => 'conversation', 'id' => $conversation->id]);

            $fullReply = '';

            try {
                foreach ((new GeneralAgent)->stream($prompt) as $event) {
                    if ($event instanceof TextDelta) {
                        $fullReply .= $event->delta;
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

            // Only save if something was actually generated — an error-only
            // run shouldn't leave a blank assistant message in history.
            if ($fullReply !== '') {
                $this->recordMessage($conversation, 'assistant', $fullReply);
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

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'conversation_id' => 'nullable|integer',
            'guest_token' => 'nullable|string',
        ]);

        $conversation = $this->resolveConversation($request);
        $message = $request->input('message');
        $this->recordMessage($conversation, 'user', $message);
        $prompt = $this->historyText($conversation)."New question: {$message}";

        try {
            $response = (new GeneralAgent)->prompt($prompt);
        } catch (RateLimitedException $e) {
            return response()->json([
                'conversation_id' => $conversation->id,
                'message' => $message,
                'reply' => "I'm getting rate limited by the AI provider right now. Please wait a bit and try again.",
            ], 429);
        } catch (ProviderOverloadedException $e) {
            return response()->json([
                'conversation_id' => $conversation->id,
                'message' => $message,
                'reply' => "The AI provider is temporarily overloaded. Please try again in a moment.",
            ], 503);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'conversation_id' => $conversation->id,
                'message' => $message,
                'reply' => 'Something went wrong. Please try again.',
            ], 500);
        }

        $reply = $response->text ?: "I couldn't find relevant information for that — try rephrasing your question.";
        $this->recordMessage($conversation, 'assistant', $reply);

        return response()->json([
            'conversation_id' => $conversation->id,
            'message' => $message,
            'reply' => $reply,
        ]);
    }

    /**
     * Reads an attached image/PDF's real content, so it can be used as
     * grounding context for the actual question — a PDF's text is extracted
     * directly (no AI round-trip needed for that); an image still goes
     * through the AI since there's no text to parse out of a photo. This
     * used to hand back a one-sentence description phrased as if the user
     * had said it themselves, which meant the AI only ever saw a vague
     * gloss of the file instead of what it actually contains.
     */
    public function interpretAttachment(Request $request)
    {
        $request->validate([
            'attachment' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:8192',
        ]);

        $file = $request->file('attachment');

        try {
            $content = strtolower($file->getClientOriginalExtension()) === 'pdf'
                ? $this->extractPdfText($file)
                : trim((new AttachmentInterpreterAgent)->respond([$file])->text);
        } catch (RateLimitedException $e) {
            return response()->json(['error' => "I'm getting rate limited by the AI provider right now. Please wait a bit and try again."], 429);
        } catch (ProviderOverloadedException $e) {
            return response()->json(['error' => 'The AI provider is temporarily overloaded. Please try again in a moment.'], 503);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['error' => 'Could not read that file. Please try again or describe it yourself.'], 500);
        }

        if ($content === '') {
            return response()->json(['error' => "Could not find any readable text in that file — it might be a scanned image with no selectable text. Please describe it yourself instead."], 422);
        }

        return response()->json(['content' => $content]);
    }

    protected function extractPdfText(UploadedFile $file): string
    {
        $pdf = (new PdfParser())->parseContent(file_get_contents($file->getRealPath()));
        $text = trim(preg_replace('/\s+/', ' ', $pdf->getText()));

        // A full multi-page PDF could otherwise blow up the prompt sent to
        // the main agent — this is plenty for it to work with either way.
        return Str::limit($text, 6000, '... [truncated]');
    }
}
