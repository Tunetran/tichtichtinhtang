import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { EVENT_CONFIG } from '@/config/event';
import type { GuestRecord } from '@/types/guest';
import { InviteExperience } from '@/components/invite/InviteExperience';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';

  if (!slug) {
    return {
      title: EVENT_CONFIG.eventName,
      description: EVENT_CONFIG.slogan,
    };
  }

  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('full_name')
    .eq('slug', slug)
    .single();

  if (!guest) {
    return {
      title: `Thiệp mời không tồn tại — ${EVENT_CONFIG.eventName}`,
      description: EVENT_CONFIG.slogan,
    };
  }

  const title = `Thư mời ${guest.full_name} — ${EVENT_CONFIG.eventName}`;
  const description = `${EVENT_CONFIG.slogan} | ${EVENT_CONFIG.eventDateLabel}`;
  const ogImageUrl = `${siteUrl}${EVENT_CONFIG.ogImage}`;

  return {
    title,
    description,
    openGraph: {
      title: `Trân trọng kính mời ${guest.full_name}`,
      description: `${EVENT_CONFIG.eventName} — ${EVENT_CONFIG.eventDateLabel}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Thiệp mời ${guest.full_name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Trân trọng kính mời ${guest.full_name}`,
      description: `${EVENT_CONFIG.eventName} — ${EVENT_CONFIG.eventDateLabel}`,
      images: [ogImageUrl],
    },
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const { data: guest, error } = await supabaseAdmin
    .from('guests')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !guest) {
    notFound();
  }

  return <InviteExperience guest={guest as GuestRecord} />;
}
