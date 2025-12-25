<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Intervention\Image\ImageManager;

class ImageService
{
    public function __construct(protected ImageManager $manager) {}

    /**
     * Generate optimized image formats (WebP, AVIF) with responsive srcset
     *
     * @param  array<string, mixed>  $attributes
     */
    public function responsiveImage(
        string $src,
        string $alt = '',
        string $class = '',
        string $loading = 'lazy',
        ?int $width = null,
        ?int $height = null,
        array $attributes = [],
        ?string $sizes = null,
    ): string {
        // Strip HTML tags from alt and title attributes
        $alt = $this->stripHtmlTags($alt);
        if (isset($attributes['title'])) {
            $attributes['title'] = $this->stripHtmlTags($attributes['title']);
        }

        $imagePath = public_path('storage/'.ltrim($src, '/'));

        if (! file_exists($imagePath)) {
            return '';
        }

        // Skip optimization for SVGs
        if (strtolower(pathinfo($imagePath, PATHINFO_EXTENSION)) === 'svg') {
            return $this->buildImgTag($src, $alt, $class, $loading, $width, $height, $attributes);
        }

        // Cache the existence/generation of optimized formats to avoid disk I/O on every request
        $cacheKey = 'responsive_image_'.md5($src.filemtime($imagePath));
        $cacheDuration = config('image.cache_duration', 2592000);

        $imageData = Cache::remember($cacheKey, now()->addSeconds($cacheDuration), function () use ($src, $imagePath) {
            return $this->generateResponsiveFormats($src, $imagePath);
        });

        if (empty($imageData['formats']) && empty($imageData['srcset'])) {
            return $this->buildImgTag($src, $alt, $class, $loading, $width, $height, $attributes);
        }

        return $this->buildResponsivePictureTag(
            $src,
            $imageData,
            $alt,
            $class,
            $loading,
            $width,
            $height,
            $attributes,
            $sizes
        );
    }

    /**
     * Optimize a single image and return optimized path
     */
    public function optimize(string $src, string $format = 'webp', ?int $quality = null): ?string
    {
        $imagePath = public_path('storage/'.ltrim($src, '/'));

        if (! file_exists($imagePath)) {
            return null;
        }

        // Use quality from config if not specified
        if ($quality === null) {
            $quality = config("image.quality.{$format}", 85);
        }

        $pathInfo = pathinfo($src);
        $baseDir = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

        $newPath = $baseDir.'/'.$filename.'.'.$format;
        $fullPath = public_path('storage/'.ltrim($newPath, '/'));

        if (! file_exists($fullPath)) {
            try {
                if (! is_dir(dirname($fullPath))) {
                    mkdir(dirname($fullPath), 0755, true);
                }

                $image = $this->manager->read($imagePath);

                match ($format) {
                    'webp' => $image->toWebp($quality),
                    'avif' => $image->toAvif($quality),
                    'jpg', 'jpeg' => $image->toJpeg($quality),
                    'png' => $image->toPng(),
                    default => $image,
                };

                $image->save($fullPath);
            } catch (\Exception $e) {
                report($e);

                return null;
            }
        }

        return $newPath;
    }

    /**
     * Generate responsive image data including srcset for multiple widths and formats
     *
     * @return array{
     *     original_width: int,
     *     original_height: int,
     *     formats: array<string, string>,
     *     srcset: array<string, array<int, string>>
     * }
     */
    protected function generateResponsiveFormats(string $src, string $imagePath): array
    {
        // Get original image dimensions
        $imageInfo = getimagesize($imagePath);
        $originalWidth = $imageInfo[0] ?? 0;
        $originalHeight = $imageInfo[1] ?? 0;

        $results = [
            'original_width' => $originalWidth,
            'original_height' => $originalHeight,
            'formats' => [],
            'srcset' => [
                'original' => [],
                'webp' => [],
                'avif' => [],
            ],
        ];

        // Get configured responsive widths
        $responsiveWidths = config('image.responsive_widths', []);
        $respectOriginalSize = config('image.respect_original_size', true);

        // Filter widths based on original image size
        if ($respectOriginalSize && $originalWidth > 0) {
            $responsiveWidths = array_filter($responsiveWidths, fn ($w) => $w <= $originalWidth);
        }

        // Sort widths ascending
        sort($responsiveWidths);

        // Generate resized versions for each width
        foreach ($responsiveWidths as $targetWidth) {
            // Generate original format at this width
            $resizedPath = $this->resizeForSrcset($src, $targetWidth);
            if ($resizedPath) {
                $results['srcset']['original'][$targetWidth] = $resizedPath;

                // Generate WebP version of resized image
                if (config('image.formats.webp', true)) {
                    $webpPath = $this->optimizeResized($resizedPath, 'webp');
                    if ($webpPath) {
                        $results['srcset']['webp'][$targetWidth] = $webpPath;
                    }
                }

                // Generate AVIF version of resized image
                if (config('image.formats.avif', true)) {
                    $avifPath = $this->optimizeResized($resizedPath, 'avif');
                    if ($avifPath) {
                        $results['srcset']['avif'][$targetWidth] = $avifPath;
                    }
                }
            }
        }

        // Also generate full-size modern formats as fallback
        if (config('image.formats.webp', true)) {
            $results['formats']['webp'] = $this->optimize($src, 'webp');
        }

        if (config('image.formats.avif', true)) {
            $results['formats']['avif'] = $this->optimize($src, 'avif');
        }

        // Add original at full width to srcsets
        if ($originalWidth > 0) {
            $results['srcset']['original'][$originalWidth] = $src;
            if (! empty($results['formats']['webp'])) {
                $results['srcset']['webp'][$originalWidth] = $results['formats']['webp'];
            }
            if (! empty($results['formats']['avif'])) {
                $results['srcset']['avif'][$originalWidth] = $results['formats']['avif'];
            }
        }

        return $results;
    }

    /**
     * Resize an image for srcset generation
     */
    protected function resizeForSrcset(string $src, int $width): ?string
    {
        $imagePath = public_path('storage/'.ltrim($src, '/'));

        if (! file_exists($imagePath)) {
            return null;
        }

        $pathInfo = pathinfo($src);
        $baseDir = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];
        $extension = $pathInfo['extension'];

        $newPath = $baseDir.'/'.$filename.'-'.$width.'w.'.$extension;
        $fullPath = public_path('storage/'.ltrim($newPath, '/'));

        if (! file_exists($fullPath)) {
            try {
                if (! is_dir(dirname($fullPath))) {
                    mkdir(dirname($fullPath), 0755, true);
                }

                $image = $this->manager->read($imagePath);
                $image->scaleDown(width: $width);
                $image->save($fullPath);
            } catch (\Exception $e) {
                report($e);

                return null;
            }
        }

        return $newPath;
    }

    /**
     * Optimize an already-resized image to a different format
     */
    protected function optimizeResized(string $src, string $format = 'webp', ?int $quality = null): ?string
    {
        $imagePath = public_path('storage/'.ltrim($src, '/'));

        if (! file_exists($imagePath)) {
            return null;
        }

        if ($quality === null) {
            $quality = config("image.quality.{$format}", 85);
        }

        $pathInfo = pathinfo($src);
        $baseDir = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];

        $newPath = $baseDir.'/'.$filename.'.'.$format;
        $fullPath = public_path('storage/'.ltrim($newPath, '/'));

        if (! file_exists($fullPath)) {
            try {
                if (! is_dir(dirname($fullPath))) {
                    mkdir(dirname($fullPath), 0755, true);
                }

                $image = $this->manager->read($imagePath);

                match ($format) {
                    'webp' => $image->toWebp($quality),
                    'avif' => $image->toAvif($quality),
                    'jpg', 'jpeg' => $image->toJpeg($quality),
                    'png' => $image->toPng(),
                    default => $image,
                };

                $image->save($fullPath);
            } catch (\Exception $e) {
                report($e);

                return null;
            }
        }

        return $newPath;
    }

    /**
     * Build a simple img tag
     */
    protected function buildImgTag(
        string $src,
        string $alt,
        string $class,
        string $loading,
        ?int $width,
        ?int $height,
        array $attributes
    ): string {
        $attrs = [];
        $attrs[] = 'src="'.asset('storage/'.ltrim($src, '/')).'"';
        $attrs[] = 'alt="'.e($alt).'"';
        $attrs[] = 'decoding="async"';

        if ($class) {
            $attrs[] = 'class="'.e($class).'"';
        }
        if ($loading) {
            $attrs[] = 'loading="'.e($loading).'"';
        }

        foreach ($attributes as $key => $value) {
            $attrs[] = e($key).'="'.e($value).'"';
        }

        return '<img '.implode(' ', $attrs).'>';
    }

    /**
     * Build a responsive picture tag with srcset for multiple widths and formats
     *
     * @param  array{
     *     original_width: int,
     *     original_height: int,
     *     formats: array<string, string>,
     *     srcset: array<string, array<int, string>>
     * }  $imageData
     * @param  array<string, mixed>  $attributes
     */
    protected function buildResponsivePictureTag(
        string $src,
        array $imageData,
        string $alt,
        string $class,
        string $loading,
        ?int $width,
        ?int $height,
        array $attributes,
        ?string $sizes = null
    ): string {
        $sources = [];
        $sizesAttr = $sizes ?? config('image.default_sizes', '100vw');

        // Build AVIF source with srcset
        if (! empty($imageData['srcset']['avif'])) {
            $srcsetParts = [];
            foreach ($imageData['srcset']['avif'] as $w => $path) {
                $srcsetParts[] = asset('storage/'.ltrim($path, '/')).' '.$w.'w';
            }
            if (! empty($srcsetParts)) {
                $sources[] = '<source srcset="'.implode(', ', $srcsetParts).'" sizes="'.e($sizesAttr).'" type="image/avif">';
            }
        }

        // Build WebP source with srcset
        if (! empty($imageData['srcset']['webp'])) {
            $srcsetParts = [];
            foreach ($imageData['srcset']['webp'] as $w => $path) {
                $srcsetParts[] = asset('storage/'.ltrim($path, '/')).' '.$w.'w';
            }
            if (! empty($srcsetParts)) {
                $sources[] = '<source srcset="'.implode(', ', $srcsetParts).'" sizes="'.e($sizesAttr).'" type="image/webp">';
            }
        }

        // Build original format srcset for the img tag
        $imgSrcset = '';
        $smallestSrc = $src; // Default to original if no srcset
        if (! empty($imageData['srcset']['original'])) {
            $srcsetParts = [];
            $smallestWidth = null;
            foreach ($imageData['srcset']['original'] as $w => $path) {
                $srcsetParts[] = asset('storage/'.ltrim($path, '/')).' '.$w.'w';
                // Track the smallest width image to use as default src
                if ($smallestWidth === null || $w < $smallestWidth) {
                    $smallestWidth = $w;
                    $smallestSrc = $path;
                }
            }
            if (! empty($srcsetParts)) {
                $imgSrcset = implode(', ', $srcsetParts);
            }
        }

        // Use original dimensions if not explicitly provided
        $imgWidth = $width ?? $imageData['original_width'] ?? null;
        $imgHeight = $height ?? $imageData['original_height'] ?? null;

        $img = $this->buildImgTagWithSrcset($smallestSrc, $alt, $class, $loading, $imgWidth, $imgHeight, $attributes, $imgSrcset, $sizesAttr);

        return '<picture>'.implode('', $sources).$img.'</picture>';
    }

    /**
     * Build an img tag with srcset attribute
     *
     * @param  array<string, mixed>  $attributes
     */
    protected function buildImgTagWithSrcset(
        string $src,
        string $alt,
        string $class,
        string $loading,
        ?int $width,
        ?int $height,
        array $attributes,
        string $srcset = '',
        string $sizes = ''
    ): string {
        $attrs = [];
        $attrs[] = 'src="'.asset('storage/'.ltrim($src, '/')).'"';
        $attrs[] = 'alt="'.e($alt).'"';
        $attrs[] = 'decoding="async"';

        if ($srcset) {
            $attrs[] = 'srcset="'.e($srcset).'"';
        }
        if ($sizes && $srcset) {
            $attrs[] = 'sizes="'.e($sizes).'"';
        }
        if ($class) {
            $attrs[] = 'class="'.e($class).'"';
        }
        if ($loading) {
            $attrs[] = 'loading="'.e($loading).'"';
        }

        foreach ($attributes as $key => $value) {
            $attrs[] = e($key).'="'.e($value).'"';
        }

        return '<img '.implode(' ', $attrs).'>';
    }

    /**
     * Resize an image to specific dimensions
     */
    public function resize(string $src, int $width, ?int $height = null, bool $aspectRatio = true): ?string
    {
        $imagePath = public_path('storage/'.ltrim($src, '/'));

        if (! file_exists($imagePath)) {
            return null;
        }

        $pathInfo = pathinfo($src);
        $baseDir = $pathInfo['dirname'];
        $filename = $pathInfo['filename'];
        $extension = $pathInfo['extension'];

        $newPath = $baseDir.'/'.$filename.'-'.$width.'x'.($height ?? 'auto').'.'.$extension;
        $fullPath = public_path('storage/'.ltrim($newPath, '/'));

        if (! file_exists($fullPath)) {
            try {
                if (! is_dir(dirname($fullPath))) {
                    mkdir(dirname($fullPath), 0755, true);
                }

                $image = $this->manager->read($imagePath);

                if ($aspectRatio) {
                    $image->scale($width, $height);
                } else {
                    $image->resize($width, $height);
                }

                $image->save($fullPath);
            } catch (\Exception $e) {
                report($e);

                return null;
            }
        }

        return $newPath;
    }

    /**
     * Clear cached image data
     */
    public function clearCache(string $src): void
    {
        $imagePath = public_path('storage/'.ltrim($src, '/'));

        if (file_exists($imagePath)) {
            $cacheKey = 'responsive_image_'.md5($src.filemtime($imagePath));
            Cache::forget($cacheKey);
        }
    }

    /**
     * Strip HTML tags from a string
     */
    protected function stripHtmlTags(string $text): string
    {
        return strip_tags($text);
    }
}
