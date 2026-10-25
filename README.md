# Bird Sightings

A mobile-first life list for the birds you've seen. Log a sighting (with an optional photo), then tap any bird to see where it's generally found in the US, season by season.

**Live:** https://spencergoergen.github.io/bird-sightings/

## Features

- **My birds:** a life list of every species you've seen, with counts for the species, this year, and total sightings. Each card shows your own photo, or a Wikipedia photo if you don't have one
- **Log a sighting:** search 137 common US birds or add your own. Set the date, how many, the location (📍 fills in your current town), notes, and an optional photo from your camera or library
- **Bird pages:** a US range map with All year, Spring, Summer, Fall and Winter views, colored by year-round, breeding, winter or migration. Tap a state to see its status. Each page also has a Wikipedia summary, a link to All About Birds' detailed maps, and your sighting history with photos
- **Explore:** browse and filter by group, seen or not seen, and "likely around me this season" for your home region
- **Backup:** download or restore everything, photos included, as a JSON file

## Data

- Sightings are stored in `localStorage`. Photos are resized to 1600 px and stored in IndexedDB. Nothing leaves the device
- Range data is simplified by region (13 US regions) in `src/birds.js`. Status codes: `Y` year-round, `S` breeding, `W` winter, `M` migration
- Reference photos and descriptions come from Wikipedia's keyless REST API. Reverse geocoding uses BigDataCloud's free client-side endpoint
- The map uses `us-atlas` (states-albers-10m) with `d3-geo` and `topojson-client`

## Local development

```sh
npm install
npm run dev      # start dev server
npm run build    # production build to dist/
npm run preview  # serve the build
```

No environment variables or API keys are required. Deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to the default branch.
