<?php

namespace App\Ai\Agents;

use App\Models\DocumentChunk;
use App\Models\Institution;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Embeddings;
use Laravel\Ai\Promptable;
use Laravel\Ai\Tools\SimilaritySearch;

class InstitutionAgent implements Agent, HasTools
{
    use Promptable;

    public function __construct(protected Institution $institution)
    {
        //
    }

    public function maxSteps(): int
    {
        // One step to call the search tool, one to compose the final answer.
        return 2;
    }

    public function instructions(): string
    {
        return "You are an informational assistant for the {$this->institution->name}, part of Uganda's Justice "
            . "Law and Order Sector (JLOS). When a user asks a question, use the content search tool to find "
            . "relevant passages scraped from the institution's official website, then answer using only what "
            . "the tool returns. When referencing a source, mention it naturally in your own words and include "
            . "its URL directly in the sentence (for example: \"as described on the ODPP Complaint page, "
            . "https://dpp.go.ug/complaint/\"). Do not use footnote markers, brackets, or citation symbols. If "
            . "the tool doesn't return anything relevant, say clearly that you don't have that information and "
            . "suggest checking {$this->institution->base_url} directly. Do not invent procedures, contact "
            . "details, or legal information that isn't in the retrieved content. This is informational only, "
            . "not legal advice.";
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
                        ->where('institution_id', $this->institution->id)
                        ->whereVectorSimilarTo('embedding', $queryVector, minSimilarity: 0.45)
                        ->with('scrapedPage:id,url,title')
                        ->limit(6)
                        ->get()
                        ->map(fn (DocumentChunk $chunk) => [
                            'text' => $chunk->chunk_text,
                            'source_title' => $chunk->scrapedPage->title,
                            'source_url' => $chunk->scrapedPage->url,
                        ]);
                }
            ))->withDescription("Search official {$this->institution->name} website content for relevant passages."),
        ];
    }
}