@extends('layouts.app')

@section('title', $page->title ?? 'Männerkreis Straubing')
@section('meta_title', $page->meta['meta_title'] ?? $page->title ?? 'Männerkreis Straubing')
@section('meta_description', $page->meta['meta_description'] ?? 'Authentischer Austausch, Gemeinschaft und persönliches Wachstum für Männer in Niederbayern.')
@section('meta_keywords', $page->meta['meta_keywords'] ?? 'Männerkreis, Niederbayern, Männergruppe, persönliches Wachstum, Gemeinschaft, Männer')

@section('og_title', $page->meta['og_title'] ?? $page->title ?? 'Männerkreis Straubing')
@section('og_description', $page->meta['og_description'] ?? $page->meta['meta_description'] ?? 'Authentischer Austausch, Gemeinschaft und persönliches Wachstum für Männer in Niederbayern.')
@if(!empty($page->meta['og_image']))
    @section('og_image', asset('storage/' . $page->meta['og_image']))
@endif

@push('structured_data')
<script type="application/ld+json">
{
    "@@context": "https://schema.org",
    "@@type": "Organization",
    "name": "Männerkreis Straubing",
    "url": "{{ url('/') }}",
    "logo": "{{ asset('images/logo.png') }}",
    "description": "Authentischer Austausch, Gemeinschaft und persönliches Wachstum für Männer in Niederbayern.",
    "address": {
        "@@type": "PostalAddress",
        "addressLocality": "Straubing",
        "addressRegion": "Bayern",
        "addressCountry": "DE"
    },
    "email": "hallo@mens-circle.de",
    "areaServed": {
        "@@type": "Place",
        "name": "Niederbayern"
    },
    "sameAs": []
}
</script>
@endpush

@section('content')
    @if($page->content_blocks && is_array($page->content_blocks))
        @foreach($page->content_blocks as $block)
            @if($block['type'] === 'hero')
                <x-blocks.hero :block="$block" />
            @elseif($block['type'] === 'intro')
                <x-blocks.intro :block="$block" />
            @elseif($block['type'] === 'text_section')
                <x-blocks.text-section :block="$block" />
            @elseif($block['type'] === 'value_items')
                <x-blocks.value-items :block="$block" />
            @elseif($block['type'] === 'moderator')
                <x-blocks.moderator :block="$block" />
            @elseif($block['type'] === 'journey_steps')
                <x-blocks.journey-steps :block="$block" />
            @elseif($block['type'] === 'faq')
                <x-blocks.faq :block="$block" />
            @elseif($block['type'] === 'newsletter')
                <x-blocks.newsletter :block="$block" />
            @elseif($block['type'] === 'cta')
                <x-blocks.cta :block="$block" />
            @elseif($block['type'] === 'whatsapp_community')
                <x-blocks.whatsapp-community />
            @endif
        @endforeach
    @endif

    {{-- WhatsApp Community section - shown when link is set in settings --}}
    @if(!empty($whatsappCommunityLink))
        <x-blocks.whatsapp-community />
    @endif
@endsection
