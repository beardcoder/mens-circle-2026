import type { APIRoute } from 'astro';

/**
 * Revalidation endpoint for Payload CMS webhooks
 * Called by Payload hooks when content changes to trigger cache invalidation
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { secret, collection, slug } = body;

    // Verify the secret token
    const expectedSecret = import.meta.env.REVALIDATE_SECRET;
    if (!expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'REVALIDATE_SECRET not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (secret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Invalid secret' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log the revalidation request
    console.log(`Revalidation triggered for ${collection || 'all'}${slug ? ` (${slug})` : ''}`);

    // In SSR mode with Bun adapter, we don't have traditional static page generation
    // Instead, we rely on the server to fetch fresh data on each request
    // This endpoint serves as a webhook receiver and logger
    
    // For future optimization, you could implement:
    // - Cache invalidation for specific routes
    // - Pub/sub pattern to notify running instances
    // - Webhook to trigger CI/CD rebuild for static exports

    return new Response(
      JSON.stringify({ 
        revalidated: true, 
        collection,
        slug,
        message: 'Revalidation acknowledged. SSR will fetch fresh data on next request.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
