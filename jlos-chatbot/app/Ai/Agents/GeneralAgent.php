<?php

namespace App\Ai\Agents;

use App\Models\DocumentChunk;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Promptable;
use Laravel\Ai\Tools\SimilaritySearch;

class GeneralAgent implements Agent, HasTools
{
    use Promptable;

    public function maxSteps(): int
    {
        // Usually just one search + one answer, but the model sometimes needs
        // a second search round (a refined query) before it's ready to answer.
        // If that second tool call lands on the final allowed step, the
        // framework refuses to execute it and the reply comes back empty —
        // so budget extra steps rather than assuming the ideal-case count.
        return 4;
    }

    public function instructions(): string
    {
        return "You are an informational assistant for Uganda's Justice Law and Order Sector (JLOS), covering "
            . "multiple institutions (e.g. the Directorate of Public Prosecutions, the Uganda Human Rights "
            . "Commission, and others). When a user asks a question, use the content search tool to find relevant "
            . "passages scraped from the institutions' official websites, then answer using only what the tool "
            . "returns. The tool tells you which institution each passage came from — make that clear in your "
            . "answer when it isn't obvious from context. When referencing a source, mention it naturally in "
            . "your own words and include its URL directly in the sentence (for example: \"as described on the "
            . "ODPP Complaint page, https://dpp.go.ug/complaint/\"). Do not use footnote markers, brackets, "
            . "citation symbols, or markdown syntax (no asterisks, no #-style headings) — write in plain prose "
            . "paragraphs, using a new paragraph or a simple dash for each list item instead of markdown bullets. "
            . "If the tool doesn't return anything relevant, say clearly that you don't have "
            . "that information and suggest checking the relevant institution's official website directly. Do "
            . "not invent procedures, contact details, or legal information that isn't in the retrieved content. "
            . "This is informational only, not legal advice.";
    }

    public function tools(): iterable
    {
        return [
            (new SimilaritySearch(
                using: function (string $query) {
                    $queryVector = Embeddings::for([$query])
                        ->dimensions(768)
                        ->generate()
                        ->embeddings[0];

                    return DocumentChunk::query()
                        ->whereVectorSimilarTo('embedding', $queryVector, minSimilarity: 0.45)
                        ->with(['scrapedPage:id,url,title', 'institution:id,name'])
                        ->limit(6)
                        ->get()
                        ->map(fn (DocumentChunk $chunk) => [
                            'institution' => $chunk->institution->name,
                            'text' => $chunk->chunk_text,
                            'source_title' => $chunk->scrapedPage->title,
                            'source_url' => $chunk->scrapedPage->url,
                        ]);
                }
            ))->withDescription('Search official JLOS institution website content (across all institutions) for relevant passages.'),
        ];
    }
}
