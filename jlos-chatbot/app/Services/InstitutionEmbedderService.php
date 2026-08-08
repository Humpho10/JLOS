<?php

namespace App\Services;

use App\Models\DocumentChunk;
use App\Models\Institution;
use Laravel\Ai\Embeddings;

/**
 * Chunks each scraped page for an institution and generates embeddings —
 * pulled out of the embed:institution Artisan command for the same reason
 * as InstitutionScraperService: so the CLI command and the admin-triggered
 * background job share one implementation.
 */
class InstitutionEmbedderService
{
    protected int $chunkSize = 200; // words per chunk
    protected int $overlap = 50;    // words shared between consecutive chunks
    protected int $embedBatchSize = 100; // Gemini's BatchEmbedContents cap per request

    public function embed(Institution $institution, callable $log): array
    {
        $pages = $institution->scrapedPages;

        if ($pages->isEmpty()) {
            $log('No scraped pages found. Scrape this institution first.');

            return ['embedded' => 0, 'unchanged' => 0, 'failed' => 0];
        }

        $embedded = 0;
        $unchanged = 0;
        $failed = 0;

        foreach ($pages as $page) {
            if ($page->embedded_hash !== null && $page->embedded_hash === $page->content_hash) {
                $log("Skipping \"{$page->title}\" (already embedded, unchanged).");
                $unchanged++;

                continue;
            }

            $log("Chunking \"{$page->title}\"...");

            $chunkTexts = $this->chunkText($page->cleaned_text);

            if (empty($chunkTexts)) {
                $log('  No text to chunk, skipping.');
                $failed++;

                continue;
            }

            $log('  Split into '.count($chunkTexts).' chunk(s), generating embeddings...');

            try {
                $embeddings = [];
                foreach (array_chunk($chunkTexts, $this->embedBatchSize) as $batch) {
                    $response = retry(3, fn () => Embeddings::for($batch)->dimensions(768)->generate(), 2000);
                    array_push($embeddings, ...$response->embeddings);
                }
            } catch (\Throwable $e) {
                $log("  Could not generate embeddings ({$e->getMessage()}), skipping page.");
                $failed++;

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

            $log('  Saved '.count($chunkTexts).' chunk(s) with embeddings.');
            $embedded++;
        }

        return ['embedded' => $embedded, 'unchanged' => $unchanged, 'failed' => $failed];
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
