<?php

namespace App\Ai\Agents\Concerns;

use App\Models\DocumentChunk;
use Illuminate\Support\Collection;
use Laravel\Ai\Embeddings;

trait RetrievesContext
{
    protected function retrieveChunks(string $query, ?int $institutionId = null, int $limit = 6): Collection
    {
        $queryVector = Embeddings::for([$query])
            ->dimensions(768)
            ->generate()
            ->embeddings[0];

        return DocumentChunk::query()
            ->when($institutionId, fn ($q) => $q->where('institution_id', $institutionId))
            ->whereVectorSimilarTo('embedding', $queryVector, minSimilarity: 0.45)
            ->with(['scrapedPage:id,url,title', 'institution:id,name'])
            ->limit($limit)
            ->get();
    }
      //Here we embed the users question, and then we run pgvector similarity vector against document_chunks.embedding,optionally filtered to one institution, keeping only chunks above a 0.45 similarity threshold, top 6.
    protected function formatContext(Collection $chunks): string
    {
        if ($chunks->isEmpty()) {
            return 'No relevant passages were found.';
        }

        return $chunks->values()->map(function (DocumentChunk $chunk, int $i) {
            $n = $i + 1;

            return "[{$n}] {$chunk->institution->name} — {$chunk->scrapedPage->title} ({$chunk->scrapedPage->url})\n{$chunk->chunk_text}";
        })->implode("\n\n");
    }
    //This turns the chunks into a numbered block of text
}
