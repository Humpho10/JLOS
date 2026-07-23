<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Laravel\Ai\Responses\AgentResponse;

class AttachmentInterpreterAgent implements Agent
{
    use Promptable;

    public function instructions(): string
    {
        return "You are given an image or PDF attached by someone using a Justice Law and Order Sector (JLOS) "
            . "assistant. Examine it and write a single, concise sentence describing what it is and what it's "
            . "about, phrased as if the person were describing their situation or the document in their own "
            . "words to ask for help (for example: \"I have a police arrest form for a theft case\" or \"This is "
            . "a copy of the Human Rights Enforcement Act 2019\"). Do not add any commentary, greeting, or "
            . "explanation — reply with only that one descriptive sentence.";
    }

    public function respond(array $attachments): AgentResponse
    {
        return $this->prompt('Describe this attachment.', attachments: $attachments);
    }
}
