# Interactive Weather — co jest do poprawy

Przegląd repozytorium [kacpermizera-dev/interactive-weather-app](https://github.com/kacpermizera-dev/interactive-weather-app), commit `6a79cd7` na `main` (19.10.2026).

## Podsumowanie

Aplikacja wygląda dobrze, a warstwa danych jest porządnie typowana. Lint jest czysty, wszystkie 9 testów przechodzi, build działa. Mimo to znalazłem **6 błędów, które zobaczy zwykły użytkownik**. Każdy z nich odtworzyłem w przeglądarce (wyniki w sekcji [Jak to sprawdziłem](#jak-to-sprawdziłem)). Dwa najpoważniejsze:

- **Po odmowie dostępu do lokalizacji aplikacja zostaje na zawsze w stanie ładowania.**
- **Wybrane miasto jest nadpisywane przez geolokalizację** i nie jest zapamiętywane po odświeżeniu strony.

Pozostałe uwagi dotyczą odporności, wydajności, struktury kodu i wyglądu repo dla rekrutera.

| # | Problem | Priorytet | Gdzie |
|---|---|---|---|
| 1 | Ładowanie nigdy się nie kończy po odmowie lokalizacji | 🔴 błąd | `App.tsx` |
| 2 | Wybrane miasto nadpisywane przez geolokalizację, brak zapamiętania | 🔴 błąd | `App.tsx` |
| 3 | Godziny przesunięte o strefę czasową odwiedzającego | 🔴 błąd | `WeatherCard.tsx` |
| 4 | Prognoza godzinowa, opady i UV liczone od północy | 🔴 błąd | `api/weather.ts` |
| 5 | Daty prognozy 7-dniowej o dzień wcześniej (na zachód od UTC) | 🔴 błąd | `WeatherCard.tsx` |
| 6 | Panel „Selected day” pokazuje dane poprzedniego miasta | 🔴 błąd | `WeatherCard.tsx` |
| 7–13 | Odporność i UX | 🟠 | różne |
| 14–16 | Wydajność | 🟡 | scena 3D, CSS |
| 17–23 | Struktura kodu i dostępność | 🔵 | różne |
| 24–29 | Repo, README, CI, testy | ⚪ | repo |

---

## 🔴 Błędy widoczne dla użytkownika

### 1. Ładowanie nigdy się nie kończy po odmowie lokalizacji

**Gdzie:** `src/App.tsx`, `handleUseDeviceLocation`

**Co się dzieje:** handler ustawia `setLoading(true)` i czeka na `getCurrentLocation()`. Po odmowie funkcja zwraca **ten sam obiekt** `DEFAULT_LOCATION`, który już jest w stanie. React pomija aktualizację, efekt pobierający pogodę się nie uruchamia, więc nikt nie ustawia `loading` z powrotem na `false`. Użytkownik zostaje na zawsze ze szkieletem i napisem „Updating forecast”.

**Jak odtworzyć:** pierwsza wizyta → „Use my location” → odmów dostępu.

**Poprawka:** stan `loading` powinien należeć wyłącznie do efektu, który pobiera dane. Na czas szukania lokalizacji wystarczy osobny stan:

```ts
const [locating, setLocating] = useState(false)

async function handleUseDeviceLocation() {
  setLocating(true)
  const { location, source } = await getCurrentLocation()
  setLocating(false)
  setActiveLocation(location)
  setLocationSource(source)
  setOnboardingComplete(true)
}
```

Dobrze też dodać komunikat w rodzaju „Location access was denied — showing the default city.”, gdy `source === 'fallback'`.

### 2. Wybrane miasto jest nadpisywane przez geolokalizację i nie jest zapamiętywane

**Gdzie:** `src/App.tsx`, efekt zależny od `[onboardingComplete]`

**Co się dzieje:** efekt uruchamia `getCurrentLocation()` przy każdej zmianie `onboardingComplete` na `true` i przy każdym wejściu na stronę. Wszystkie handlery (`handleSearchLocationSelect`, `handleUseDefaultLocation` itd.) ustawiają `onboardingComplete`, więc chwilę po wyborze miasta efekt podmienia je na lokalizację urządzenia albo na Los Angeles. Skutki:

- wybrany z wyszukiwarki Gdańsk po chwili zamienia się w „Your location”,
- przycisk „Search manually” i tak prosi o dostęp do lokalizacji,
- po odświeżeniu strony wybrane miasto znika,
- przy kolejnych wizytach pogoda pobiera się dwa razy: najpierw dla LA, potem dla urządzenia, a w międzyczasie przez chwilę widać pogodę z LA.

**Poprawka:**
1. Usunąć ten efekt. O geolokalizację pytamy tylko po kliknięciu „Use my location”.
2. Zapamiętywać ostatnią lokalizację i jej źródło w `localStorage`, tak jak już robisz to z ustawieniami:

```ts
const LAST_LOCATION_KEY = 'interactive-weather.last-location.v1'

const [activeLocation, setActiveLocation] = useState<LocationData>(
  () => readLastLocation() ?? DEFAULT_LOCATION,
)

useEffect(() => {
  safeSetItem(LAST_LOCATION_KEY, JSON.stringify(activeLocation))
}, [activeLocation])
```

3. Przy okazji przemianować „Search manually”. Ten przycisk tak naprawdę wybiera domyślne miasto, więc lepiej opisać go jako „Use default city” albo sprawić, żeby ustawiał fokus na polu wyszukiwania.

### 3. Godziny przesunięte o strefę czasową odwiedzającego

**Gdzie:** `src/components/ui/WeatherCard.tsx`, funkcje `formatDateTime` i `formatTime`

**Co się dzieje:** przy `timezone=auto` Open-Meteo zwraca czas lokalny miasta **bez strefy**, np. `"2026-10-19T11:45"`. `new Date(value)` interpretuje taki napis w strefie przeglądarki, a potem formatujesz go jeszcze raz z `timeZone: weather.timezone`. Przesunięcie liczy się więc dwa razy. Osoba z Polski oglądająca Los Angeles widzi „Local now 12:09”, ale „Updated Mon 03:00” i prognozę godzinową od 03:00, czyli 9 godzin za wcześnie.

**Poprawka:** te napisy już są czasem lokalnym miasta, więc wystarczy je wyświetlić bez przeliczania:

```ts
// Open-Meteo zwraca czas lokalny lokalizacji bez offsetu ("2026-10-19T11:45").
// Traktujemy go jako UTC i formatujemy w UTC, żeby nic się nie przesunęło.
function parseWallClock(value: string): Date {
  return new Date(`${value}Z`)
}

new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC', hour12 })
  .format(parseWallClock(hour.time))
```

`formatLocalTime` (zegar „Local now”) działa poprawnie, bo formatuje `new Date()` w strefie miasta.

### 4. Prognoza godzinowa, opady i UV liczone od północy

**Gdzie:** `src/api/weather.ts`, `getCurrentHourIndex`

**Co się dzieje:** `current.time` ma krok 15 minut (`"…T11:45"`), a `hourly.time` zawiera tylko pełne godziny (`"…T11:00"`). Wtedy `indexOf` zwraca `-1`, funkcja wraca do indeksu `0`, czyli północy. W efekcie „Next hours”, procent opadów i UV pochodzą z nocy. Działa to poprawnie tylko o pełnej godzinie, dlatego test tego nie łapie (fixture ma `T12:00`).

**Poprawka:**

```ts
const currentHour = `${currentTime.slice(0, 13)}:00`
const index = hourlyTimes.indexOf(currentHour)
```

Do tego test z `current.time = "…T11:45"`.

### 5. Daty prognozy 7-dniowej o dzień wcześniej

**Gdzie:** `src/components/ui/WeatherCard.tsx`, `formatDate`

**Co się dzieje:** `new Date("2026-10-19")` to północ **UTC**. W strefach na zachód od UTC, czyli w całych obu Amerykach, wychodzi z tego poprzedni dzień. Osoba z Nowego Jorku widzi pierwszy dzień jako „Sun, Oct 18”, choć w LA jest poniedziałek 19.

**Poprawka:** to samo podejście co w punkcie 3: `new Date(`${value}T00:00:00Z`)` i formatowanie z `timeZone: 'UTC'`.

### 6. Panel „Selected day” pokazuje dane poprzedniego miasta

**Gdzie:** `src/components/ui/WeatherCard.tsx`, `selectedDay`

**Co się dzieje:** w stanie trzymasz cały obiekt dnia. Po zmianie miasta kafelki pokazują już nowe dane, ale panel szczegółów dalej wyświetla stary obiekt. Przykład: po przejściu z LA do Oslo kafelek pokazuje 8°C / 5°C, a panel nadal 25°C / 16°C.

**Poprawka:** trzymać w stanie tylko datę, a dane wyliczać z bieżącej prognozy:

```ts
const [selectedDate, setSelectedDate] = useState<string | null>(null)
const activeSelectedDay =
  weather?.dailyForecast.find((day) => day.date === selectedDate) ?? weather?.dailyForecast[0] ?? null
```

---

## 🟠 Odporność i UX

7. **Alert o wietrze ignoruje wybraną jednostkę.** `getWeatherAlerts` ma na sztywno `km/h` w treści. Wystarczy użyć `formatWindSpeed(weather.windSpeed, settings.windSpeedUnit)`.
8. **Zapisy do `localStorage` bez `try/catch`.** W trybie prywatnym Safari albo po przekroczeniu limitu `setItem` rzuca wyjątek. Najgorzej jest z `writeCachedWeather`: siedzi wewnątrz `try` przy pobieraniu, więc **udane** pobranie zostaje potraktowane jak błąd i użytkownik widzi dane z cache albo komunikat „offline”. Warto mieć jeden helper `safeSetItem` i używać go we wszystkich efektach.
9. **Cache rośnie bez końca.** Każde wyszukane miasto dostaje osobny klucz `…cached-weather.v1.<id>`. Lepiej trzymać jedną mapę z limitem, np. ostatnie 8 miejsc plus zapisane.
10. **Zegar „Local now” się nie odświeża.** Jest liczony przy renderze, więc stoi do czasu następnej zmiany stanu. Wystarczy prosty tick co minutę (`setInterval` w efekcie).
11. **Zapisana lokalizacja urządzenia nazywa się „Your location”.** Dwie zapisane z różnych miejsc są nie do odróżnienia. Przyda się odwrotne geokodowanie albo chociaż etykieta ze współrzędnymi.
12. **Scena 3D ignoruje `prefers-reduced-motion`.** CSS to obsługuje, ale dryf kamery, `autoRotate`, cząsteczki i błyskawice działają dalej. `ShockLight` miga z częstotliwością ok. 15 Hz (`sin(t * 95)`), a to dotyczy osób wrażliwych na migające światło. Przy `reduce` trzeba wyłączyć błyski i ruch.
13. **`CameraDrift` i `OrbitControls` walczą o kamerę** *(z lektury kodu, nie sprawdzałem wizualnie)*. Oba co klatkę ustawiają pozycję kamery, więc przeciągnięcie myszą zostaje po chwili cofnięte przez dryf. Warto zostawić jedno albo wyłączać dryf na czas interakcji (`onStart`/`onEnd` w `OrbitControls`).

## 🟡 Wydajność

14. **Jeden bundle 1,1 MB (310 kB gzip).** Karta z pogodą czeka na three.js. Poprawka: `const WeatherScene = lazy(() => import('./components/3d/WeatherScene'))` w `<Suspense fallback={null}>`, żeby UI pojawiało się od razu, a scena doładowywała się w tle. To usuwa też ostrzeżenie Vite o rozmiarze chunka.
15. **Tekstura chmur z obcego CDN.** `<Cloud>` z drei domyślnie pobiera `cloud.png` z `rawcdn.githack.com`. Gdy ten serwis padnie, chmury znikną. Poprawka: wrzucić plik do `public/` i przekazać `texture={`${import.meta.env.BASE_URL}cloud.png`}`. `BASE_URL` jest ważny, bo portfolio serwuje aplikację spod `/demos/weather/`.
16. **Google Fonts przez `@import` w CSS.** To łańcuch zapytań blokujący render, a w UE także kwestia RODO. Lepiej hostować fonty u siebie (`@fontsource/sora`, `@fontsource/ibm-plex-mono`) albo przynajmniej przenieść je do `<link rel="preconnect">` w `index.html`.

## 🔵 Struktura kodu i dostępność

17. **`WeatherCard.tsx` ma 628 linii i 24 propsy.** Warto podzielić go na mniejsze komponenty: `OnboardingPanel`, `SettingsBar`, `CurrentConditions`, `HourlyStrip`, `DailyForecast`, `LocationSearch`, `SavedLocations`.
18. **Zduplikowane typy.** `LocationData` i `LocationSource` są zdefiniowane i w `App.tsx`, i w `WeatherCard.tsx`, a komponent importuje `AppSettings` z `App.tsx`, czyli zależy od korzenia aplikacji. Lepiej przenieść je do `src/types.ts`.
19. **Logika w `App.tsx` jako hooki.** Np. `useLocalStorageState`, `useWeather(location)`, `useSavedLocations`. Kod staje się czytelniejszy i, co ważniejsze, testowalny. Błędy 1, 2 i 6 wyszłyby w prostych testach hooków.
20. **Tailwind jest zainstalowany, ale używany do dwóch klas** (`w-full max-w-3xl`), a obok jest 1259 linii własnego CSS. Trzeba wybrać jedno. Przy tym designie prościej zostać przy własnym CSS i usunąć Tailwinda.
21. **Pozostałości szablonu:** nieużywane `src/assets/hero.png`, `react.svg`, `vite.svg` i `public/icons.svg`. Do tego sprawdzenia `typeof window === 'undefined'` są zbędne w aplikacji Vite bez SSR.
22. **Dostępność:**
    - przełączniki °C/°F, km/h/mph, 24h/12h i kafelki dni nie mają `aria-pressed`,
    - zmiany stanu („Updating forecast”, błędy, wyniki wyszukiwania) nie są ogłaszane czytnikom ekranu; potrzebny region `aria-live="polite"`,
    - `<div aria-label="Loading weather">` bez roli nic nie ogłasza; lepiej `role="status"`,
    - canvas sceny powinien mieć `aria-hidden`,
    - `<h2>` z onboardingu stoi przed `<h1>`.
23. **Domyślne miasto to Los Angeles.** Do rozważenia, czy lepszy nie byłby Kraków albo Warszawa. Rzecz gustu.

## ⚪ Repo, README, CI, testy

To ma znaczenie przede wszystkim dlatego, że repo jest podlinkowane w portfolio i rekruter tu zajrzy.

24. **README to wciąż szablon Vite.** Powinno zawierać:
    - jedno zdanie, czym jest aplikacja,
    - screenshot albo krótkie wideo,
    - link do live demo,
    - stack,
    - 3–4 decyzje techniczne (dlaczego Open-Meteo, jak działa cache offline, jak scena reaguje na pogodę),
    - instrukcję `npm install / dev / test`.
25. **Brak CI.** Wystarczy workflow GitHub Actions z `lint`, `test` i `build` na każdy push i PR, tak jak w repo wtyczki.
26. **Brak pliku `LICENSE`.**
27. **Brak własnego wdrożenia.** Statyczna aplikacja Vite pasuje do GitHub Pages albo Vercela. Warto mieć link do demo w README i w opisie repo.
28. **Historia gita.** Commit „Modified” z +3381 liniami nic nie mówi. Lepiej mniejsze commity z opisowymi nazwami. Do usunięcia są też scalone gałęzie `copilot/copilotstarter-project-3d-weather-app` i `revert-2-copilot/...`.
29. **Testy pokrywają tylko warstwę API i mapowanie kodów.** Brakuje testów:
    - formatowania czasu w różnych strefach (`process.env.TZ` albo `vi.stubEnv` w Vitest), to złapałoby błędy 3 i 5,
    - `getCurrentHourIndex` z `current.time` o niepełnej godzinie (błąd 4),
    - przepływów w `App` z React Testing Library: odmowa lokalizacji, wybór miasta, odświeżenie strony (błędy 1, 2, 6).

---

## Proponowana kolejność

1. **PR „Fix location and time handling”:** punkty 1–6 z testami do każdego. Po scaleniu przebuduję demo w portfolio (`npm run demo:weather`).
2. **PR „Harden storage and UX”:** punkty 7–13.
3. **PR „Lazy-load the 3D scene”:** punkty 14–16.
4. **PR „Split WeatherCard into components”:** punkty 17–22.
5. **README, CI, LICENSE, wdrożenie i porządek w gałęziach:** punkty 24–28. Najmniej pracy, a największy efekt dla kogoś, kto ogląda repo.

## Jak to sprawdziłem

- **Statycznie:** `npm ci`, `eslint .` (0 problemów), `vitest run` (9/9), `npm run build` (OK, z ostrzeżeniem o chunku powyżej 500 kB).
- **W przeglądarce:** Chromium przez Playwright, na zbudowanej wersji `6a79cd7`. Dane z prawdziwego Open-Meteo, strefy czasowe ustawione na poziomie przeglądarki.

| Scenariusz | Wynik |
|---|---|
| Odmowa lokalizacji → „Use my location” | po 6 s wciąż „UPDATING FORECAST” i widoczny szkielet (#1) |
| Lokalizacja dozwolona, wybór „Gdansk” z wyszukiwarki | aktywna lokalizacja zmienia się na „Your location” (#2) |
| „Search manually” | aplikacja i tak pobiera lokalizację urządzenia (#2) |
| Wybór Gdańska → odświeżenie strony | po odświeżeniu „Your location” zamiast Gdańska (#2) |
| Odwiedzający z Polski, prognoza dla LA | „Local now 12:09”, ale „Updated Mon 03:00” i godziny od 03:00 (#3) |
| Odwiedzający z Nowego Jorku, prognoza dla LA | pierwszy dzień „Sun, Oct 18”, w LA jest „Mon, Oct 19” (#5) |
| Wybór 2. dnia w LA → zmiana miasta na Oslo | kafelek 8°C / 5°C, panel nadal 25°C / 16°C (#6) |

Błąd #4 wynika z formatu odpowiedzi API: `hourly.time` zawiera tylko pełne godziny, a `current.time` ma krok 15 minut. Widać to na zrzucie z lokalnej wersji („Updated Mon 02:45”, czyli `current.time` = `…T11:45`). Zapytanie, które wysłałem do Open-Meteo o 12:00, zwróciło pełną godzinę, więc wtedy indeks wyszedł poprawny. Dlatego w testach i przy szybkim sprawdzeniu ten błąd łatwo przeoczyć.
