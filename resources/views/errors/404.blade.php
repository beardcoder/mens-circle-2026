@extends('layouts.app')

@section('title', 'Seite nicht gefunden – Männerkreis Straubing')
@section('robots', 'noindex, nofollow')

@section('content')
    <section class="section section--large">
        <div class="container container--narrow" style="text-align: center; padding: 4rem 0;">
            <div style="max-width: 600px; margin: 0 auto;">
                <h1 style="font-size: 6rem; font-weight: 600; color: var(--color-earth-deep, #3d2817); margin-bottom: 1rem; line-height: 1;">
                    404
                </h1>
                <h2 style="font-size: 2rem; font-weight: 500; margin-bottom: 1.5rem; color: var(--color-earth-deep, #3d2817);">
                    Seite nicht gefunden
                </h2>
                <p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
                    Die gesuchte Seite existiert leider nicht oder wurde verschoben.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <a href="{{ route('home') }}" class="btn btn--primary">
                        Zur Startseite
                    </a>
                    @if($hasNextEvent ?? false)
                        <a href="{{ route('event.show') }}" class="btn btn--secondary">
                            Nächster Termin
                        </a>
                    @endif
                </div>
            </div>
        </div>
    </section>
@endsection
