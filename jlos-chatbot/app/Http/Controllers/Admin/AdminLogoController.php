<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\DomCrawler\Crawler;

/**
 * Helps an admin pick a real logo for an institution instead of hunting one
 * down by hand: candidates() scrapes the institution's own site for likely
 * logo images (never a search engine or third party, so whatever comes back
 * is genuinely theirs); fetchLogo() only runs once the admin has looked at
 * the candidates and clicked the one that's actually correct.
 */
class AdminLogoController extends Controller
{
    protected array $imageExtensionsByMime = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/jpg' => 'jpg',
        'image/webp' => 'webp',
        'image/svg+xml' => 'svg',
        'image/x-icon' => 'ico',
        'image/vnd.microsoft.icon' => 'ico',
    ];

    public function candidates(Request $request)
    {
        $data = $request->validate(['base_url' => 'required|url|max:255']);
        $baseUrl = rtrim($data['base_url'], '/');

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'JLOS-Chatbot-Prototype/1.0 (contact: your-email-here@example.com)',
            ])->timeout(15)->get($baseUrl.'/');
        } catch (\Throwable) {
            return response()->json(['candidates' => [], 'message' => "Could not reach {$baseUrl}."]);
        }

        if ($response->failed()) {
            return response()->json(['candidates' => [], 'message' => "That site returned an error (HTTP {$response->status()})."]);
        }

        $crawler = new Crawler($response->body());
        $candidates = [];

        $crawler->filter('meta[property="og:image"]')->each(function (Crawler $node) use (&$candidates, $baseUrl) {
            if ($content = $node->attr('content')) {
                $candidates[] = ['label' => 'Preview image', 'url' => $this->resolveUrl($baseUrl, $content)];
            }
        });

        $crawler->filter('link[rel*="icon"]')->each(function (Crawler $node) use (&$candidates, $baseUrl) {
            if ($href = $node->attr('href')) {
                $candidates[] = ['label' => 'Site icon', 'url' => $this->resolveUrl($baseUrl, $href)];
            }
        });

        $crawler->filter('img')->each(function (Crawler $node) use (&$candidates, $baseUrl) {
            $hint = strtolower(($node->attr('class') ?? '').' '.($node->attr('id') ?? '').' '.($node->attr('alt') ?? ''));
            $src = $node->attr('src');
            if ($src && str_contains($hint, 'logo')) {
                $candidates[] = ['label' => 'Header logo', 'url' => $this->resolveUrl($baseUrl, $src)];
            }
        });

        // De-dupe by resolved URL — og:image and a header <img> often point
        // at the exact same file, and there's no reason to show it twice.
        $seen = [];
        $unique = array_values(array_filter($candidates, function ($c) use (&$seen) {
            if (isset($seen[$c['url']])) return false;
            $seen[$c['url']] = true;
            return true;
        }));

        return response()->json(['candidates' => array_slice($unique, 0, 8)]);
    }

    public function fetchLogo(Request $request)
    {
        $data = $request->validate([
            'slug' => 'required|string|alpha_dash|max:255',
            'image_url' => 'required|url|max:2000',
        ]);

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'JLOS-Chatbot-Prototype/1.0 (contact: your-email-here@example.com)',
            ])->timeout(15)->get($data['image_url']);
        } catch (\Throwable) {
            return response()->json(['message' => 'Could not download that image.'], 422);
        }

        if ($response->failed()) {
            return response()->json(['message' => 'Could not download that image.'], 422);
        }

        $mimeType = strtolower(explode(';', $response->header('Content-Type') ?? '')[0]);
        $extension = $this->imageExtensionsByMime[$mimeType] ?? null;

        if (! $extension) {
            return response()->json(['message' => 'That URL is not a supported image type.'], 422);
        }

        $path = "institutions/{$data['slug']}.{$extension}";

        // Writes straight into public/uploads/institutions/ — no symlink
        // involved, see config/filesystems.php's 'uploads' disk for why.
        // Typed explicitly as FilesystemAdapter (what Storage::disk()
        // actually returns) rather than the generic Filesystem contract,
        // since url() only exists on the concrete class.
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('uploads');
        $disk->put($path, $response->body());

        return response()->json(['logo_url' => $disk->url($path)]);
    }

    /**
     * Turns whatever's in an href/src/content attribute — absolute,
     * protocol-relative, root-relative, or a bare relative path — into a
     * real absolute URL against the institution's own base URL.
     */
    protected function resolveUrl(string $baseUrl, string $url): string
    {
        $url = trim($url);

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }
        if (str_starts_with($url, '//')) {
            return 'https:'.$url;
        }

        $parts = parse_url($baseUrl);
        $origin = ($parts['scheme'] ?? 'https').'://'.($parts['host'] ?? '').(isset($parts['port']) ? ':'.$parts['port'] : '');

        return str_starts_with($url, '/') ? $origin.$url : $origin.'/'.$url;
    }
}
