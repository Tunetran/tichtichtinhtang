import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getEventConfig } from '@/lib/event-settings';
import { getSiteSettings } from '@/lib/site-settings';
import type { GuestRecord } from '@/types/guest';
import { InviteExperience } from '@/components/invite/InviteExperience';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';
  const config = await getEventConfig();

  if (!slug) {
    return {
      title: config.eventName,
      description: config.slogan,
    };
  }

  const { data: guest } = await supabaseAdmin
    .from('guests')
    .select('full_name')
    .eq('slug', slug)
    .single();

  if (!guest) {
    return {
      title: `Thiệp mời không tồn tại — ${config.eventName}`,
      description: config.slogan,
    };
  }

  const title = `Thư mời ${guest.full_name} — ${config.eventName}`;
  const description = `${config.slogan} | ${config.eventDateLabel}`;
  const ogImageUrl = `${siteUrl}${config.ogImage}`;

  return {
    title,
    description,
    openGraph: {
      title: `Trân trọng kính mời ${guest.full_name}`,
      description: `${config.eventName} — ${config.eventDateLabel}`,
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
      description: `${config.eventName} — ${config.eventDateLabel}`,
      images: [ogImageUrl],
    },
  };
}

export default async function InvitePage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const [guestResult, config, siteSettings] = await Promise.all([
    supabaseAdmin.from('guests').select('*').eq('slug', slug).single(),
    getEventConfig(),
    getSiteSettings(),
  ]);

  let guest = guestResult.data as GuestRecord | null;
  if (!guest && (slug === 'demo' || slug === 'thay-co' || !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('placeholder'))) {
    guest = {
      id: 'demo-guest',
      slug,
      full_name: slug === 'thay-co' ? 'Quý Thầy/Cô' : 'Quý Khách Mời',
      custom_message: 'Sự hiện diện của Quý vị là niềm vinh hạnh to lớn đối với đoàn kịch The Light chúng em.',
      status: 'NOT_OPENED',
      attendees_count: 1,
      song_request: null,
      wish_message: null,
      opened_at: null,
      responded_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } else if (!guest) {
    notFound();
  }

  return (
    <div className="font-sans-ui overflow-x-clip min-h-[100dvh]">
      <InviteExperience
        guest={guest}
        config={config}
        initialLogoUrl={siteSettings.event_logo_url}
        initialBgUrl={siteSettings.event_bg_url}
        initialWaxSealUrl={siteSettings.wax_seal_url}
        initialOrganizerContact={siteSettings.organizer_contact}
      />
    </div>
  );
}
