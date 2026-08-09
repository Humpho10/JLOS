<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;

class AttachmentInterpreterAgent implements Agent
{
    use Promptable;

    // PDFs are handled separately (their text is extracted directly rather
    // than routed through here) — this agent only ever sees images now,
    // since there's no text to parse out of a photo without one.
    public function instructions(): string
    {
        return 'You are given an image attached by someone using a Justice Law and Order Sector (JLOS) '
            . 'assistant. Examine its actual visible content and describe it in 2-4 concise sentences: if it '
            . "is a document, transcribe or summarize the specific text/details it contains; if it's a photo "
            . 'of a situation, describe exactly what is shown. Do not phrase this as a first-person statement '
            . 'from the user, and do not add commentary, greetings, or explanation — reply with only the '
            . 'description.';
    }

    public function respond(array $attachments): AgentResponse
    {
        return $this->prompt('Describe this attachment.', attachments: $attachments);
    }
}
