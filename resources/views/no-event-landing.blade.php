@extends('layouts.app')

@section('title', 'Männerkreis Straubing – Bleib informiert')
@section('meta_title', 'Männerkreis Straubing – Bleib informiert')
@section('meta_description', 'Melde dich für unseren Newsletter an und erhalte eine Benachrichtigung, sobald der nächste Männerkreis stattfindet. Authentischer Austausch und Gemeinschaft für Männer in Niederbayern.')
@section('meta_keywords', 'Männerkreis, Straubing, Newsletter, WhatsApp Community, Männergruppe, Niederbayern')

@section('og_title', 'Männerkreis Straubing – Bleib informiert')
@section('og_description', 'Melde dich für unseren Newsletter an und erhalte eine Benachrichtigung, sobald der nächste Männerkreis stattfindet.')

@push('structured_data')
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Männerkreis Straubing",
    "url": "{{ url('/') }}",
    "logo": "{{ asset('images/logo.png') }}",
    "description": "Authentischer Austausch, Gemeinschaft und persönliches Wachstum für Männer in Niederbayern.",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Straubing",
        "addressRegion": "Bayern",
        "addressCountry": "DE"
    },
    "email": "hallo@mens-circle.de",
    "areaServed": {
        "@type": "Place",
        "name": "Niederbayern"
    },
    "sameAs": []
}
</script>
@endpush

@section('content')
    {{-- Hero Section --}}
    <section class="hero hero--no-event">
        <div class="hero__bg"></div>

        <div class="hero__circles" aria-hidden="true">
            <div class="hero__circle hero__circle--1"></div>
            <div class="hero__circle hero__circle--2"></div>
            <div class="hero__circle hero__circle--3"></div>
            <div class="hero__circle hero__circle--4"></div>
        </div>

        <div class="container">
            <div class="hero__content hero__content--centered">
                <p class="hero__label fade-in">Männerkreis Straubing</p>

                <h1 class="hero__title fade-in fade-in-delay-1">
                    Der nächste Kreis<br>
                    wird <span class="text-highlight">bald bekannt gegeben</span>
                </h1>

                <div class="hero__bottom fade-in fade-in-delay-2">
                    <p class="hero__description hero__description--large">
                        Bleib auf dem Laufenden und verpasse keinen Termin. Melde dich für unseren Newsletter an
                        und erhalte eine Benachrichtigung, sobald der nächste Männerkreis stattfindet.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {{-- Newsletter Section --}}
    <section class="section newsletter-section" id="newsletter">
        <div class="container">
            <div class="newsletter__layout fade-in">
                <div class="newsletter__content">
                    <p class="newsletter__eyebrow">Newsletter</p>
                    <h2 class="newsletter__title">Verpasse <span class="text-highlight">keinen Termin</span></h2>
                    <p class="newsletter__text">
                        Erhalte eine E-Mail, sobald ein neuer Männerkreis-Termin feststeht. Dazu bekommst du
                        Einblicke, Impulse und Ankündigungen rund um den Männerkreis Straubing.
                    </p>
                </div>

                <div class="newsletter__form-wrapper">
                    <form id="newsletterForm" class="newsletter__form">
                        <input
                            type="email"
                            name="email"
                            placeholder="Deine E-Mail-Adresse"
                            required
                            class="newsletter__input"
                            aria-label="E-Mail-Adresse"
                        >
                        <button type="submit" class="btn btn--primary">
                            Anmelden
                        </button>
                        <div id="newsletterMessage"></div>
                    </form>
                </div>
            </div>
        </div>
    </section>

    {{-- WhatsApp Community section --}}
    @if(!empty($whatsappCommunityLink))
        <x-blocks.whatsapp-community />
    @endif

    {{-- Info Section --}}
    <section class="section">
        <div class="container">
            <div class="text-section fade-in">
                <div class="text-section__content text-section__content--centered">
                    <h2 class="text-section__title">Was ist der Männerkreis?</h2>
                    <div class="text-section__text">
                        <p>
                            Der Männerkreis Straubing ist ein Raum für echte Begegnung unter Männern.
                            Ein Ort für authentischen Austausch, Gemeinschaft und persönliches Wachstum
                            in Niederbayern.
                        </p>
                        <p>
                            In einer vertrauensvollen Atmosphäre teilen wir, was uns bewegt, unterstützen
                            uns gegenseitig und wachsen gemeinsam. Ohne Bewertung, ohne Konkurrenz –
                            einfach als Menschen, die den Mut haben, sich zu zeigen.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
