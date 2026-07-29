<?php

namespace App\Services;

use App\Models\DocumentChunk;
use App\Models\Institution;
use Laravel\Ai\Embeddings;

/**
 * Chunks each scraped page for an institution and generates embeddings.
 * Extracted from the embed:institution command so it can be run from a
 * queued job as well as the CLI.
 */
class InstitutionEmbedder
{
    protected int $chunkSize = 200; // words per chunk
    protected int $overlap = 50;    // words shared between consecutive chunks
    protected int $embedBatchSize = 100; // Gemini's BatchEmbedContents cap per request

    /**
     * @param  callable(string $title, string $status): void|null  $onPageResult
     */
    public function run(Institution $institution, ?callable $onPageResult = null): void
    {
        foreach ($institution->scrapedPages as $page) {
            if ($page->embedded_hash !== null && $page->embedded_hash === $page->content_hash) {
                if ($onPageResult) {
                    $onPageResult($page->title, 'unchanged');
                }

                continue;
            }

            $chunkTexts = $this->chunkText($page->cleaned_text);

            if (empty($chunkTexts)) {
                if ($onPageResult) {
                    $onPageResult($page->title, 'no_text');
                }

                continue;
            }

            try {
                $embeddings = [];
                foreach (array_chunk($chunkTexts, $this->embedBatchSize) as $batch) {
                    array_push($embeddings, ...Embeddings::for($batch)->dimensions(768)->generate()->embeddings);
                }
            } catch (\Throwable $e) {
                if ($onPageResult) {
                    $onPageResult($page->title, 'failed');
                }

                continue;
            }

            // Replace existing chunks so re-runs don't create duplicates.
            $page->chunks()->delete();

            foreach ($chunkTexts as $index => $text) {
                DocumentChunk::create([
                    'scraped_page_id' => $page->id,
                    'institution_id' => $institution->id,
                    'chunk_index' => $index,
                    'chunk_text' => $text,
                    'embedding' => json_encode($embeddings[$index], JSON_THROW_ON_ERROR),
                ]);
            }

            $page->update(['embedded_hash' => $page->content_hash]);

            if ($onPageResult) {
                $onPageResult($page->title, 'ok');
            }
        }
    }

    protected function chunkText(string $text): array
    {
        $words = array_values(array_filter(preg_split('/\s+/', trim($text)), fn ($w) => $w !== ''));
        $totalWords = count($words);
        $chunks = [];
        $start = 0;

        while ($start < $totalWords) {
            $end = min($start + $this->chunkSize, $totalWords);
            $chunks[] = implode(' ', array_slice($words, $start, $end - $start));

            if ($end >= $totalWords) {
                break;
            }

            $start += ($this->chunkSize - $this->overlap);
        }

        return $chunks;
    }
}
