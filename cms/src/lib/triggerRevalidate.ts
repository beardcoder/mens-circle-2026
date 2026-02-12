/**
 * Triggers Astro revalidation via webhook
 * Called from Payload hooks when content changes
 */
export async function triggerRevalidate(collection?: string, slug?: string): Promise<void> {
  const revalidateUrl = process.env.ASTRO_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!revalidateUrl) {
    console.warn('ASTRO_REVALIDATE_URL not set, skipping Astro revalidation');
    return;
  }

  if (!secret) {
    console.warn('REVALIDATE_SECRET not set, skipping Astro revalidation');
    return;
  }

  try {
    const payload: { secret: string; collection?: string; slug?: string } = { secret };
    
    if (collection) payload.collection = collection;
    if (slug) payload.slug = slug;

    const response = await fetch(`${revalidateUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Astro revalidation failed: ${response.status} ${response.statusText}`);
    } else {
      console.log(`Astro revalidation triggered for ${collection || 'all'}${slug ? ` (${slug})` : ''}`);
    }
  } catch (error) {
    console.error('Error triggering Astro revalidation:', error);
  }
}
