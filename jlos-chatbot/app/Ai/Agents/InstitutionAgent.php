<?php

namespace App\Ai\Agents;

use App\Ai\Agents\Concerns\RetrievesContext;
use App\Models\Institution;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;

class InstitutionAgent implements Agent
{
    use Promptable;
    use RetrievesContext;

    public function __construct(protected Institution $institution)
    {
        //
    }

    public function instructions(): string
    {
        return "You are an informational assistant for the {$this->institution->name}, part of Uganda's Justice "
            . "Law and Order Sector (JLOS). Answer the user's question using only the context passages provided "
            . "below the question — they were retrieved from the institution's official website. When "
            . "referencing a source, mention it naturally in your own words and include its URL directly in the "
            . "sentence (for example: \"as described on the ODPP Complaint page, https://dpp.go.ug/complaint/\"). "
            . "Do not use footnote markers, brackets, citation symbols, or markdown syntax (no asterisks, no "
            . "#-style headings) — write in plain prose paragraphs, using a new paragraph or a simple dash for "
            . "each list item instead of markdown bullets. If the user attaches an image or document, examine it "
            . "directly and describe or answer based on what it actually shows (e.g. a form, ID, or complaint "
            . "letter), combining that with the context passages where relevant. If the context doesn't contain "
            . "anything relevant, say clearly that you don't have that information and suggest checking "
            . "{$this->institution->base_url} directly. Do not invent procedures, contact details, or legal "
            . "information that isn't in the retrieved content. This is informational only, not legal advice.";
    }

    public function respond(string $question, ?string $provider = null, array $attachments = []): AgentResponse
    {
        $chunks = $this->retrieveChunks($question, $this->institution->id);

        $augmented = "Context passages:\n\n".$this->formatContext($chunks)."\n\nQuestion: {$question}";

        // Vision/document analysis genuinely takes longer than a text-only
        // reply, so give attachments more room before we give up and fail
        // over — the 20s default (see timeout()) is for text-only requests.
        $timeout = $attachments === [] ? null : 45;

        // Groq's configured model can't accept image/document content at all
        // (it requires plain-string message content), so failing over to it
        // for an attachment request is guaranteed to fail anyway — stick to
        // Gemini alone rather than surface that confusing error.
        $resolvedProvider = $attachments === [] ? $provider : 'gemini';

        return $this->prompt($augmented, attachments: $attachments, provider: $resolvedProvider, timeout: $timeout);
    }

    // Fail over to Groq if Gemini is rate-limited or overloaded, so a single
    // provider having a bad moment doesn't take the chatbot down mid-demo.
    public function provider(): array
    {
        return ['gemini', 'groq'];
    }

    // A connection hang (Gemini not responding at all) should fail fast
    // rather than tie up the request for a minute before the controller
    // even gets a chance to retry against Groq.
    public function timeout(): int
    {
        return 20;
    }
}
