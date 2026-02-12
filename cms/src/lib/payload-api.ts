/**
 * Payload Local API Utilities
 * 
 * Server-side data fetching using Payload's local API (getPayload()).
 * No HTTP requests - direct database access within the same app.
 */

import { getPayload } from 'payload';
import config from '@/payload.config';
import type { Event, Page, Testimonial, Media } from '@/payload-types';

/**
 * Get the Payload instance
 */
export async function getPayloadInstance() {
  return await getPayload({ config });
}

/**
 * Site Settings
 */
export async function getSettings() {
  const payload = await getPayloadInstance();
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  });
  return settings;
}

/**
 * Pages
 */
export async function getPage(slug: string): Promise<Page | null> {
  const payload = await getPayloadInstance();
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: slug,
      },
      published: {
        equals: true,
      },
    },
    limit: 1,
    depth: 2,
  });
  
  return result.docs[0] || null;
}

/**
 * Events
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const payload = await getPayloadInstance();
  const today = new Date().toISOString().split('T')[0];
  
  const result = await payload.find({
    collection: 'events',
    where: {
      eventDate: {
        greater_than_equal: today,
      },
      published: {
        equals: true,
      },
    },
    sort: 'eventDate',
    limit: 50,
    depth: 1,
  });
  
  return result.docs;
}

export async function getPastEvents(): Promise<Event[]> {
  const payload = await getPayloadInstance();
  const today = new Date().toISOString().split('T')[0];
  
  const result = await payload.find({
    collection: 'events',
    where: {
      eventDate: {
        less_than: today,
      },
      published: {
        equals: true,
      },
    },
    sort: '-eventDate',
    limit: 50,
    depth: 1,
  });
  
  return result.docs;
}

export async function getNextEvent(): Promise<Event | null> {
  const payload = await getPayloadInstance();
  const today = new Date().toISOString().split('T')[0];
  
  const result = await payload.find({
    collection: 'events',
    where: {
      eventDate: {
        greater_than_equal: today,
      },
      published: {
        equals: true,
      },
    },
    sort: 'eventDate',
    limit: 1,
    depth: 1,
  });
  
  return result.docs[0] || null;
}

export async function getEvent(slug: string): Promise<Event | null> {
  const payload = await getPayloadInstance();
  
  const result = await payload.find({
    collection: 'events',
    where: {
      slug: {
        equals: slug,
      },
      published: {
        equals: true,
      },
    },
    limit: 1,
    depth: 1,
  });
  
  return result.docs[0] || null;
}

export async function getEventRegistrationCount(eventId: string): Promise<number> {
  const payload = await getPayloadInstance();
  
  const result = await payload.find({
    collection: 'registrations',
    where: {
      event: {
        equals: eventId,
      },
      status: {
        equals: 'confirmed',
      },
    },
    limit: 0,
  });
  
  return result.totalDocs;
}

/**
 * Testimonials
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  const payload = await getPayloadInstance();
  
  const result = await payload.find({
    collection: 'testimonials',
    where: {
      published: {
        equals: true,
      },
    },
    limit: 20,
    sort: 'sortOrder,-createdAt',
  });
  
  return result.docs;
}

/**
 * Type Guards and Utilities
 */
export function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'url' in value;
}

export function getMediaUrl(media: Media | number | string | null | undefined): string | null {
  if (!media) return null;
  if (typeof media === 'string') return media;
  if (typeof media === 'number') return null;
  if (isMedia(media)) return media.url || null;
  return null;
}

export function getMediaAlt(media: Media | number | string | null | undefined): string {
  if (!media) return '';
  if (typeof media === 'string' || typeof media === 'number') return '';
  if (isMedia(media)) return media.alt || '';
  return '';
}
