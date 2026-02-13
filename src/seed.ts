import { getPayload } from 'payload';
import config from './payload.config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIVE_DIR = path.resolve('./data/migrate');

function readJSON<T>(filename: string): T {
  const filePath = path.join(LIVE_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// --- Source types ---
interface SourceEvent {
  id: number;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  location_details: string;
  max_participants: number;
  cost_basis: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  image: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
}

interface SourceParticipant {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface SourceRegistration {
  id: number;
  event_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  participant_id: number;
  registered_at: string;
  cancelled_at: string | null;
}

interface SourceNewsletterSubscription {
  id: number;
  token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  participant_id: number;
  confirmed_at: string;
}

interface SourceNewsletter {
  id: number;
  subject: string;
  content: string;
  sent_at: string | null;
  recipient_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SourceTestimonial {
  id: number;
  quote: string;
  author_name: string;
  role: string | null;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface SourcePage {
  id: number;
  title: string;
  slug: string;
  meta: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface SourceContentBlock {
  id: number;
  type: string;
  data: string;
  block_id: string;
  order: number;
  created_at: string;
  updated_at: string;
  page_id: number;
}

interface SourceSetting {
  id: number;
  group: string;
  name: string;
  locked: boolean;
  payload: string;
  created_at: string;
  updated_at: string;
}

// --- HTML to Lexical conversion ---
function htmlToLexical(html: string) {
  // Convert HTML string to Lexical JSON structure
  // This is a simplified converter for the HTML patterns in the data
  const root: any = {
    type: 'root',
    children: [],
    direction: 'ltr',
    format: '' as const,
    indent: 0,
    version: 1,
  };

  if (!html || html.trim() === '') {
    root.children.push({
      type: 'paragraph',
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
    });
    return { root };
  }

  // Parse HTML into blocks
  const blocks = parseHtmlBlocks(html);
  root.children = blocks;

  if (root.children.length === 0) {
    root.children.push({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: html.replace(/<[^>]*>/g, ''),
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      textFormat: 0,
      textStyle: '',
    });
  }

  return { root };
}

function parseHtmlBlocks(html: string): any[] {
  const blocks: any[] = [];
  // Split by top-level block elements
  const parts = html.split(/(?=<(?:p|h[1-6]|ul|ol|hr|blockquote)[\s>])/i);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('<hr')) {
      blocks.push({
        type: 'horizontalrule',
        version: 1,
      });
    } else if (trimmed.match(/^<h([1-6])/i)) {
      const level = parseInt(trimmed.match(/^<h([1-6])/i)![1]);
      const innerHtml = trimmed.replace(/^<h[1-6][^>]*>/, '').replace(/<\/h[1-6]>.*$/s, '');
      blocks.push({
        type: 'heading',
        children: parseInlineHtml(innerHtml),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        tag: `h${level}`,
      });
    } else if (trimmed.startsWith('<ul')) {
      const items = trimmed.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      blocks.push({
        type: 'list',
        children: items.map((item) => {
          const innerHtml = item.replace(/<li[^>]*>/, '').replace(/<\/li>/, '');
          // Remove wrapping <p> tags inside list items
          const cleanInner = innerHtml
            .replace(/^<p[^>]*>/, '')
            .replace(/<\/p>$/, '')
            .trim();
          return {
            type: 'listitem',
            children: [
              {
                type: 'paragraph',
                children: parseInlineHtml(cleanInner),
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
                textFormat: 0,
                textStyle: '',
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
            value: 1,
          };
        }),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul',
      });
    } else if (trimmed.startsWith('<p')) {
      const innerHtml = trimmed.replace(/^<p[^>]*>/, '').replace(/<\/p>.*$/s, '');
      blocks.push({
        type: 'paragraph',
        children: parseInlineHtml(innerHtml),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      });
    } else if (trimmed.length > 0) {
      // Plain text
      blocks.push({
        type: 'paragraph',
        children: parseInlineHtml(trimmed),
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
        textStyle: '',
      });
    }
  }

  return blocks;
}

function parseInlineHtml(html: string): any[] {
  const nodes: any[] = [];
  if (!html || html.trim() === '') {
    return nodes;
  }

  // Process inline elements
  let remaining = html;

  while (remaining.length > 0) {
    // Find the next tag
    const tagMatch = remaining.match(/^([\s\S]*?)<(strong|em|b|i|u|a|br|span)(\s[^>]*)?>/i);

    if (!tagMatch) {
      // No more tags, add remaining as text
      const text = remaining.replace(/<[^>]*>/g, '');
      if (text) {
        nodes.push({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 });
      }
      break;
    }

    // Add text before the tag
    if (tagMatch[1]) {
      const text = tagMatch[1].replace(/<[^>]*>/g, '');
      if (text) {
        nodes.push({ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 });
      }
    }

    const tag = tagMatch[2].toLowerCase();
    const attrs = tagMatch[3] || '';
    remaining = remaining.substring(tagMatch[0].length);

    if (tag === 'br') {
      nodes.push({ type: 'linebreak', version: 1 });
      continue;
    }

    if (tag === 'a') {
      const hrefMatch = attrs.match(/href="([^"]*?)"/);
      const href = hrefMatch ? hrefMatch[1] : '';
      const closeMatch = remaining.match(/^([\s\S]*?)<\/a>/i);
      if (closeMatch) {
        const linkText = closeMatch[1].replace(/<[^>]*>/g, '');
        nodes.push({
          type: 'link',
          children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text: linkText, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 3,
          fields: {
            linkType: 'custom',
            newTab: true,
            url: href,
          },
        });
        remaining = remaining.substring(closeMatch[0].length);
      }
      continue;
    }

    // Handle formatting tags (strong, em, b, i, u)
    const closeTag = new RegExp(`^([\\s\\S]*?)<\\/${tag}>`, 'i');
    const closeMatch = remaining.match(closeTag);
    if (closeMatch) {
      const innerText = closeMatch[1].replace(/<[^>]*>/g, '');
      let format = 0;
      if (tag === 'strong' || tag === 'b') format = 1; // bold
      if (tag === 'em' || tag === 'i') format = 2; // italic
      if (tag === 'u') format = 8; // underline

      if (innerText) {
        nodes.push({ type: 'text', detail: 0, format, mode: 'normal', style: '', text: innerText, version: 1 });
      }
      remaining = remaining.substring(closeMatch[0].length);
    } else {
      // No closing tag found, skip
      remaining = remaining.substring(1);
    }
  }

  return nodes;
}

// --- Content block converters ---
// Returns an array of blocks (some source blocks map to multiple Payload blocks)
function convertContentBlock(block: SourceContentBlock): any[] {
  const data = JSON.parse(block.data);

  switch (block.type) {
    case 'hero':
      return [
        {
          blockType: 'hero',
          id: block.block_id,
          label: data.label || null,
          title: data.title || '',
          description: data.description || null,
          ctaText: data.button_text || null,
          ctaLink: data.button_link || null,
        },
      ];

    case 'intro': {
      const blocks: any[] = [
        {
          blockType: 'intro',
          id: block.block_id,
          eyebrow: data.eyebrow || null,
          title: data.title || '',
          text: data.text || '',
          quote: data.quote || null,
        },
      ];
      // Source intro block may contain a 'values' array -> separate valueItems block
      if (data.values && data.values.length > 0) {
        blocks.push({
          blockType: 'valueItems',
          items: data.values.map((v: any) => ({
            number: v.number || null,
            title: v.title,
            text: v.description,
          })),
        });
      }
      return blocks;
    }

    case 'text_section':
      return [
        {
          blockType: 'textSection',
          id: block.block_id,
          eyebrow: data.eyebrow || null,
          title: data.title || null,
          content: htmlToLexical(data.content || ''),
        },
      ];

    case 'testimonials':
      return [
        {
          blockType: 'testimonials',
          id: block.block_id,
        },
      ];

    case 'moderator':
      return [
        {
          blockType: 'moderator',
          id: block.block_id,
          name: data.name || '',
          bio: data.bio || '',
          quote: data.quote || null,
        },
      ];

    case 'journey_steps':
      return [
        {
          blockType: 'journeySteps',
          id: block.block_id,
          eyebrow: data.eyebrow || null,
          title: data.title || null,
          steps: (data.steps || []).map((step: any) => ({
            number: String(step.number),
            title: step.title,
            text: step.description,
          })),
        },
      ];

    case 'faq':
      return [
        {
          blockType: 'faq',
          id: block.block_id,
          eyebrow: data.eyebrow || null,
          title: data.title || null,
          items: (data.items || []).map((item: any) => ({
            question: item.question,
            answer: item.answer,
          })),
        },
      ];

    case 'newsletter':
      return [
        {
          blockType: 'newsletter',
          id: block.block_id,
          eyebrow: data.eyebrow || null,
          title: data.title || null,
          text: data.text || null,
        },
      ];

    case 'cta':
      return [
        {
          blockType: 'cta',
          id: block.block_id,
          eyebrow: data.eyebrow || null,
          title: data.title || '',
          text: data.text || null,
          buttonText: data.button_text || null,
          buttonLink: data.button_link || null,
        },
      ];

    case 'whatsapp_community':
      return [
        {
          blockType: 'whatsappCommunity',
          id: block.block_id,
        },
      ];

    default:
      console.warn(`  Unknown block type: ${block.type}`);
      return [];
  }
}

// --- Main migration ---
async function seed() {
  console.log('=== Starting migration from live data ===\n');

  const payload = await getPayload({ config });

  // Read source data
  const sourceEvents = readJSON<SourceEvent[]>('events.json');
  const sourceParticipants = readJSON<SourceParticipant[]>('participants.json');
  const sourceRegistrations = readJSON<SourceRegistration[]>('registrations.json');
  const sourceNewsletterSubs = readJSON<SourceNewsletterSubscription[]>('newsletter_subscriptions.json');
  const sourceNewsletters = readJSON<SourceNewsletter[]>('newsletters.json');
  const sourceTestimonials = readJSON<SourceTestimonial[]>('testimonials.json');
  const sourcePages = readJSON<SourcePage[]>('pages.json');
  const sourceContentBlocks = readJSON<SourceContentBlock[]>('content_blocks.json');
  const sourceSettings = readJSON<SourceSetting[]>('settings.json');

  // ID mapping: old ID -> new Payload ID
  const eventIdMap = new Map<number, number>();
  const participantIdMap = new Map<number, number>();
  const pageIdMap = new Map<number, number>();

  // 1. Migrate Events
  console.log(`--- Migrating ${sourceEvents.length} events ---`);
  for (const event of sourceEvents) {
    try {
      // Parse event_date to get just the date part
      const eventDate = event.event_date.split(' ')[0]; // "2024-05-19"
      // Parse start_time/end_time to HH:MM
      const startTime = event.start_time.substring(0, 5);
      const endTime = event.end_time.substring(0, 5);

      // Determine location and address
      let street = event.street;
      let zip = event.postal_code;
      let city = event.city;

      // If no street/zip/city, try to parse from location_details
      if (!street && event.location_details && event.location_details !== 'Online-Veranstaltung') {
        const addrMatch = event.location_details.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
        if (addrMatch) {
          street = addrMatch[1];
          zip = addrMatch[2];
          city = addrMatch[3];
        }
      }

      const created = await payload.create({
        collection: 'events',
        data: {
          title: event.title,
          slug: event.slug,
          description: event.description,
          eventDate: eventDate,
          startTime: startTime,
          endTime: endTime,
          location: event.location,
          street: street || undefined,
          zip: zip || undefined,
          city: city || undefined,
          maxParticipants: event.max_participants,
          costBasis: event.cost_basis,
          published: event.is_published,
        },
      });

      eventIdMap.set(event.id, created.id);
      console.log(`  Event: ${event.title} (${event.slug}) -> ID ${created.id}`);
    } catch (error: any) {
      console.error(`  ERROR creating event ${event.slug}: ${error.message}`);
    }
  }

  // 2. Migrate Participants
  console.log(`\n--- Migrating ${sourceParticipants.length} participants ---`);
  for (const participant of sourceParticipants) {
    try {
      const firstName = participant.first_name || '';
      const lastName = participant.last_name || '';

      const created = await payload.create({
        collection: 'participants',
        data: {
          firstName: firstName || '(unbekannt)',
          lastName: lastName || '(unbekannt)',
          email: participant.email,
          phone: participant.phone || undefined,
        },
      });

      participantIdMap.set(participant.id, created.id);
      console.log(`  Participant: ${firstName} ${lastName} <${participant.email}> -> ID ${created.id}`);
    } catch (error: any) {
      console.error(`  ERROR creating participant ${participant.email}: ${error.message}`);
    }
  }

  // 3. Migrate Registrations
  console.log(`\n--- Migrating ${sourceRegistrations.length} registrations ---`);
  for (const reg of sourceRegistrations) {
    try {
      const eventId = eventIdMap.get(reg.event_id);
      const participantId = participantIdMap.get(reg.participant_id);

      if (!eventId) {
        console.warn(`  SKIP registration ${reg.id}: event ${reg.event_id} not found`);
        continue;
      }
      if (!participantId) {
        console.warn(`  SKIP registration ${reg.id}: participant ${reg.participant_id} not found`);
        continue;
      }

      // Map "registered" -> "confirmed"
      const status = reg.status === 'cancelled' ? 'cancelled' : 'confirmed';

      await payload.create({
        collection: 'registrations',
        data: {
          event: eventId,
          participant: participantId,
          status,
          consentTimestamp: reg.registered_at,
        },
      });

      console.log(`  Registration: event=${reg.event_id} participant=${reg.participant_id}`);
    } catch (error: any) {
      console.error(`  ERROR creating registration ${reg.id}: ${error.message}`);
    }
  }

  // 4. Migrate Newsletter Subscriptions
  console.log(`\n--- Migrating ${sourceNewsletterSubs.length} newsletter subscriptions ---`);
  for (const sub of sourceNewsletterSubs) {
    try {
      const participantId = participantIdMap.get(sub.participant_id);

      if (!participantId) {
        console.warn(`  SKIP subscription ${sub.id}: participant ${sub.participant_id} not found`);
        continue;
      }

      // Determine status
      let status: 'pending' | 'confirmed' | 'unsubscribed' = 'pending';
      if (sub.unsubscribed_at) {
        status = 'unsubscribed';
      } else if (sub.confirmed_at) {
        status = 'confirmed';
      }

      await payload.create({
        collection: 'newsletter-subscriptions',
        data: {
          participant: participantId,
          status,
          token: sub.token,
          requestedAt: sub.subscribed_at || sub.created_at,
          confirmedAt: sub.confirmed_at || undefined,
          unsubscribedAt: sub.unsubscribed_at || undefined,
        },
      });

      console.log(`  Subscription: participant=${sub.participant_id} status=${status}`);
    } catch (error: any) {
      console.error(`  ERROR creating subscription ${sub.id}: ${error.message}`);
    }
  }

  // 5. Migrate Newsletters
  console.log(`\n--- Migrating ${sourceNewsletters.length} newsletters ---`);
  for (const newsletter of sourceNewsletters) {
    try {
      const content = htmlToLexical(newsletter.content);

      await payload.create({
        collection: 'newsletters',
        data: {
          subject: newsletter.subject,
          content,
          status: newsletter.status as 'draft' | 'sending' | 'sent',
          sentAt: newsletter.sent_at || undefined,
          recipientsCount: newsletter.recipient_count,
        },
      });

      console.log(`  Newsletter: "${newsletter.subject}" (${newsletter.status})`);
    } catch (error: any) {
      console.error(`  ERROR creating newsletter "${newsletter.subject}": ${error.message}`);
    }
  }

  // 6. Migrate Testimonials
  console.log(`\n--- Migrating ${sourceTestimonials.length} testimonials ---`);
  for (const testimonial of sourceTestimonials) {
    // Skip soft-deleted
    if (testimonial.deleted_at) {
      console.log(`  SKIP testimonial ${testimonial.id}: soft-deleted`);
      continue;
    }

    try {
      await payload.create({
        collection: 'testimonials',
        data: {
          content: testimonial.quote,
          authorName: testimonial.author_name || undefined,
          authorRole: testimonial.role || undefined,
          email: 'unbekannt@mens-circle.de', // Not in source data, required in Payload
          published: testimonial.is_published,
          publishedAt: testimonial.published_at || undefined,
          sortOrder: testimonial.sort_order,
        },
      });

      console.log(`  Testimonial: "${testimonial.author_name}" published=${testimonial.is_published}`);
    } catch (error: any) {
      console.error(`  ERROR creating testimonial ${testimonial.id}: ${error.message}`);
    }
  }

  // 7. Migrate Pages with Content Blocks
  console.log(`\n--- Migrating ${sourcePages.length} pages ---`);
  for (const page of sourcePages) {
    try {
      // Parse meta JSON
      const meta = JSON.parse(page.meta || '{}');

      // Get content blocks for this page, sorted by order
      const pageBlocks = sourceContentBlocks.filter((b) => b.page_id === page.id).sort((a, b) => a.order - b.order);

      // Convert blocks (flatMap because one source block may become multiple Payload blocks)
      const content = pageBlocks.flatMap((block) => convertContentBlock(block));

      const created = await payload.create({
        collection: 'pages',
        data: {
          title: page.title,
          slug: page.slug,
          content: content.length > 0 ? content : undefined,
          meta: {
            metaTitle: meta.title || undefined,
            metaDescription: meta.description || undefined,
          },
          published: page.is_published,
        },
      });

      pageIdMap.set(page.id, created.id);
      console.log(`  Page: "${page.title}" (${page.slug}) -> ID ${created.id}, ${content.length} blocks`);
    } catch (error: any) {
      console.error(`  ERROR creating page "${page.title}": ${error.message}`);
    }
  }

  // 8. Migrate Site Settings
  console.log(`\n--- Migrating site settings ---`);
  try {
    const settingsMap = new Map<string, any>();
    for (const setting of sourceSettings) {
      settingsMap.set(setting.name, JSON.parse(setting.payload));
    }

    // Map social links
    const sourceSocialLinks = settingsMap.get('social_links') || [];
    const socialLinks = sourceSocialLinks.map((link: any) => {
      let platform = 'website';
      if (link.icon === 'envelope' || link.label?.includes('@')) platform = 'email';
      else if (link.icon === 'globe-alt') platform = 'website';
      return {
        platform,
        url: link.value,
        label: link.label || undefined,
      };
    });

    // Add WhatsApp link if exists
    const whatsappLink = settingsMap.get('whatsapp_community_link');
    if (whatsappLink) {
      socialLinks.push({
        platform: 'whatsapp',
        url: whatsappLink,
        label: 'WhatsApp Community',
      });
    }

    // Find homepage ID
    const homePageId = pageIdMap.get(1); // Page 1 = Home

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: settingsMap.get('site_name') || 'Männerkreis Niederbayern',
        siteDescription: settingsMap.get('site_description') || undefined,
        contactEmail: settingsMap.get('contact_email') || undefined,
        contactPhone: settingsMap.get('contact_phone') || undefined,
        footerText: settingsMap.get('footer_text') || undefined,
        socialLinks,
        homepage: homePageId || undefined,
      },
    });

    console.log('  Site settings updated successfully');
  } catch (error: any) {
    console.error(`  ERROR updating site settings: ${error.message}`);
  }

  // --- Summary ---
  console.log('\n=== Migration Summary ===');
  console.log(`Events:                  ${eventIdMap.size} / ${sourceEvents.length}`);
  console.log(`Participants:            ${participantIdMap.size} / ${sourceParticipants.length}`);
  console.log(`Registrations:           migrated from ${sourceRegistrations.length} records`);
  console.log(`Newsletter Subscriptions: migrated from ${sourceNewsletterSubs.length} records`);
  console.log(`Newsletters:             migrated from ${sourceNewsletters.length} records`);
  console.log(`Testimonials:            migrated (excl. deleted)`);
  console.log(`Pages:                   ${pageIdMap.size} / ${sourcePages.length}`);
  console.log(`Site Settings:           done`);
  console.log('\n=== Migration complete ===');

  process.exit(0);
}

seed().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
