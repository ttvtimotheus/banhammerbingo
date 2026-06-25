# Banhammer Bingo SVG Asset System

A lightweight visual asset system for the Reddit Devvit game **Banhammer Bingo**.

The goal is not big event art. The goal is fast scanning inside an Interactive Post:

- choice icons
- stat glyphs
- arc emblems
- role badges
- outcome markers
- small moderation chrome

## Folder structure

```text
svg/
  branding/
  stats/
  roles/
  arcs/
  choices/
  markers/
  chrome/
png/
  same folders as svg
asset_manifest.json
theme.css
preview.html
preview.png
```

## How to use

Recommended path in your Devvit React project:

```text
src/assets/banhammer-bingo/
```

Copy the `svg` folder and `theme.css` into your project. Use the SVGs as regular assets or inline them as React components.

## UI placement

- Choice cards: use one icon from `svg/choices` at the top left.
- Stats: use `svg/stats` with the number first, then a short label if needed.
- Dilemma card: use an emblem from `svg/arcs` next to the arc name.
- Role unlock: use one badge from `svg/roles` as a small toast reward.
- Vote state: use `svg/markers` for Your Vote, Leading, Dangerous, and Stable.
- Fallout cards: use `svg/chrome/chrome_report_tag.svg` or `svg/chrome/chrome_stamped_seal.svg`.

## Design principle

The icons should replace repeated text where possible. Keep the screen compact. Do not add large illustrations to the main game screen.
