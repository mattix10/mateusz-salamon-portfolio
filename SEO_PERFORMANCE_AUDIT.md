# Audyt SEO i wydajności — salamonsoftware.com

Data: 27 października 2026. Cel: rekrutacja na stanowisko Senior Frontend Developera z Angularem oraz Lighthouse Performance co najmniej 95/100.

## Zakres i wyniki

Zmiany wykonano w lokalnym repozytorium `mateusz-sal-portfolio`. Nie wdrażano ich na domenę produkcyjną. Pomiary Lighthouse wykonano na serwerze HTTP `127.0.0.1:4185`, w Chrome, z domyślnym profilem mobilnym oraz presetem desktop. Wynik domeny produkcyjnej wymaga ponownego pomiaru po wdrożeniu; wpływają na niego odpowiedź serwera, kompresja i cache. Bezpośredni odczyt domeny przez narzędzie internetowe nie powiódł się.

| Kategoria | Telefon | Komputer |
|---|---:|---:|
| Performance | 95 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

| Metryka | Telefon | Komputer |
|---|---:|---:|
| FCP | 1,7 s | 0,4 s |
| LCP | 2,3 s | 0,5 s |
| TBT | 60 ms | 0 ms |
| CLS | 0 | 0 |
| Speed Index | 4,4 s | 0,7 s |

Raporty źródłowe: `lighthouse-mobile.report.html`, `lighthouse-mobile.report.json`, `lighthouse-desktop.report.html`, `lighthouse-desktop.report.json`. Wstępny pomiar miał zablokowany dostęp do Google Fonts, dlatego nie jest wiarygodnym porównaniem wydajności „przed i po” i nie służy jako dowód procentowego przyspieszenia. Desktop był już testowany po zapisaniu miniatury zdjęcia.

To wyniki laboratoryjne. Nie zmierzono rzeczywistego INP użytkowników ani danych terenowych Core Web Vitals. Wyniki Lighthouse mogą się wahać między uruchomieniami.

## Znaleziska i poprawki

1. **Nieprecyzyjne pozycjonowanie kandydata.** Tytuł skupiał się na frontendzie i konsultingu AI, a H1 pomijał poziom Senior i Angular. Tytuł, H1, opis profilu, metadane społecznościowe, dane Person i `llms.txt` wskazują teraz Senior Angular Frontend Developera. Zachowano informacje o fintech, technologiach i doświadczeniu wynikające z istniejących treści.
2. **Uszkodzony kontakt.** Trzy adresy `mailto:` i pole e-mail w JSON-LD zawierały dwa znaki `@`. Ujednolicono je do `contact@salamonsoftware.com`, który występował już w `llms.txt`. Potwierdzono składnię i zgodność linków; nie wysyłano wiadomości ani nie potwierdzano działania skrzynki.
3. **Nieistniejące zasoby w metadanych.** `assets/og-image.png` i `assets/photo.jpg` nie istniały. Metadane Open Graph, Twitter i Person korzystają z istniejącego zdjęcia. Karta Twitter ma format `summary`, dopasowany do portretu.
4. **Brak mapy witryny.** `robots.txt` wskazywał nieistniejący `sitemap.xml`. Dodano mapę zawierającą jedyny indeksowalny adres strony. Zachowano produkcyjny canonical i możliwość indeksowania.
5. **Blokujące fonty zewnętrzne.** Google Fonts wymagały zewnętrznych połączeń przed renderowaniem. Zapisano zmienne fonty Geist i Geist Mono lokalnie jako WOFF2, dodano licencję SIL Open Font License, preload podstawowego fontu oraz `font-display: optional`. Przy wolnym połączeniu pierwsze wyświetlenie może użyć fontu systemowego bez późniejszego przeskoku układu.
6. **Zbyt duży portret w interfejsie.** Oryginał 35 609 B jest wyświetlany jako awatar 82 px. Dodano wariant 192 × 199 px o rozmiarze 7 742 B, `srcset`, `sizes`, lazy loading i asynchroniczne dekodowanie. Oryginał pozostaje dla metadanych i ekranów o większej gęstości pikseli.
7. **Dostępność.** Brakowało głównego obszaru `main` i linku pomijającego nawigację. Dodano oba elementy oraz poprawiono zbyt niski kontrast podpisu demonstracji.
8. **Niedziałający link w stopce.** Odnośnik LinkedIn prowadził do `#`. Wskazuje teraz istniejący profil używany już w pozostałej części strony.
9. **Brak favicony.** Dodano lokalny plik SVG i odnośnik, usuwając żądanie do brakującego `favicon.ico`.

## Walidacja

- Lighthouse mobile i desktop: wszystkie cztery podstawowe kategorie co najmniej 95/100.
- Chrome przez Puppeteer: szerokości 390 i 1440 px; brak poziomego przewijania, jeden H1 i jeden main, poprawne odnośniki do sekcji, parsowanie JSON-LD.
- Wykres: zmiana okresu na 1M i stanu `aria-pressed` działa.
- Tabela sesji: zmiana strefy na Londyn i stanu `aria-pressed` działa.
- Brak błędów wykonania JavaScript i odpowiedzi HTTP 4xx/5xx podczas obu testów.
- Zrzuty ekranu zapisano w `audit-screenshots/`.
- `git diff --check`: bez błędów whitespace.
- Projekt jest statycznym HTML/CSS/JS; nie zawiera `package.json` ani kroku build. Nie instalowano zależności projektu. Wykorzystano istniejące lokalne narzędzia.

Powtórzenie testów interakcji: `node verify-portfolio.mjs <ścieżka-do-modułu-puppeteer-core> [adres-serwera]`, z ustawionym `CHROME_PATH` oraz działającym lokalnym serwerem.

## Dalsze działania po publikacji

- Wdrożyć zmienione pliki wraz z `assets/fonts/`, miniaturą portretu, faviconą i mapą witryny. Raporty i skrypt weryfikacyjny nie są wymagane do działania strony.
- Zmierzyć publiczny adres w PageSpeed Insights na telefonie i komputerze. Localhost nie pozwala ocenić produkcyjnej kompresji, cache ani opóźnienia hostingu.
- Dodać `sitemap.xml` do Google Search Console, poprosić o ponowne zindeksowanie strony i obserwować zapytania oraz kliknięcia. Wynik SEO 100 w Lighthouse oznacza przejście podstawowych kontroli technicznych, nie pozycję w Google.
- Rozważyć link do aktualnego CV i konkretnych publicznych realizacji, jeśli mogą zostać udostępnione. Nie dodawano brakujących dokumentów ani nie wymyślano osiągnięć.
- Wzmocnić linkowanie do portfolio z LinkedIn i profili zawodowych. W rekrutacji ważne są frazy stanowiska, imię i nazwisko oraz dowody doświadczenia.

Źródło interpretacji Lighthouse: [oficjalna dokumentacja punktacji](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring).
