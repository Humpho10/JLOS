<?php

namespace App\Console\Commands;

use App\Models\DocumentChunk;
use App\Models\Institution;
use Illuminate\Console\Command;
use Laravel\Ai\Embeddings;

class EmbedInstitutionPages extends Command
{
    protected $signature = 'embed:institution {slug}';

    protected $description = 'Chunk each scraped page for an institution and generate embeddings';

    protected int $chunkSize = 200; // words per chunk
    protected int $overlap = 50;    // words shared between consecutive chunks

    public function handle(): int
    {
        $slug = $this->argument('slug');
        $institution = Institution::where('slug', $slug)->first();

        if (! $institution) {
            $this->error("No institution found with slug [{$slug}].");
            return self::FAILURE;
        }

        $pages = $institution->scrapedPages;

        if ($pages->isEmpty()) {
            $this->error("No scraped pages found for [{$slug}]. Run scrape:institution first.");
            return self::FAILURE;
        }

        foreach ($pages as $page) {
            $this->info("Chunking \"{$page->title}\"...");

            $chunkTexts = $this->chunkText($page->cleaned_text);

            if (empty($chunkTexts)) {
                $this->warn('  No text to chunk, skipping.');
                continue;
            }

            $this->info('  Split into '.count($chunkTexts).' chunk(s), generating embeddings...');

            $embeddings = Embeddings::for($chunkTexts)->dimensions(768)->generate()->embeddings;
            //We are calling Gemini's embeddings API, to do the embeddings.

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

            $this->info('  Saved '.count($chunkTexts).' chunk(s) with embeddings.');
        }

        return self::SUCCESS;
    }
    
    //This function creates the chunks
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