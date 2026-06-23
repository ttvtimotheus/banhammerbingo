# Banhammer Bingo: A Community Chaos Sim

Banhammer Bingo is a Reddit native daily chaos sim where the community votes through terrible moderation dilemmas and watches a fictional forum survive, mutate, or collapse.

## Full Game Description

Banhammer Bingo turns one subreddit into the shared leadership team of a fictional online community. Every day the interactive post presents one chaotic incident: a beloved power user becomes toxic, bots learn jokes, sponsors smell opportunity, a journalist starts watching, or the mod queue begins to feel like weather.

Players vote on one of four imperfect choices. The winning decision changes persistent community stats, creates a visible consequence, updates user role histories, unlocks future events, and moves the fictional community closer to one of several endings. The post is the arena, the comments are the debate chamber, and the community itself is the main character.

## How to Play

1. Open the Banhammer Bingo interactive post.
2. Read today's fictional moderation dilemma.
3. Vote for one of four choices.
4. After voting, explain your reasoning in the Reddit comments.
5. Return after resolution to see the winning choice, stat changes, Top Argument of the Day, and the next dilemma.

## How Voting Works

Each Reddit user can vote once per in-game day. Votes are keyed by Devvit user id and stored in Devvit Redis with the post's game state. After a user votes, the UI shows vote counts and percentages for all four choices and highlights the selected choice.

If votes tie during resolution, Banhammer Bingo breaks ties by choosing the tied choice with the highest Drama increase. If that is still tied, it chooses the highest Mod Stress increase. If that is still tied, the first tied choice wins.

## Daily Resolution

The game uses Devvit Scheduler plus a registered scheduler task in `devvit.json`:

```json
"scheduler": {
	"tasks": {
		"daily-resolution": {
			"endpoint": "/internal/scheduler/daily-resolution"
		}
	}
}
```

When a day resolves, the server:

1. Loads the current post's game state from Redis.
2. Determines the winning choice.
3. Applies stat effects and clamps stats between 0 and 100.
4. Stores the consequence and resolved day history.
5. Reads comments from the Reddit post.
6. Selects Top Argument of the Day.
7. Selects the next event using stats, tags, arcs, and recent history.
8. Advances the day and schedules the next resolution.
9. Checks endings, including the day 30 final report.

## Top Argument of the Day

During resolution, the app reads recent comments from the game post through the Devvit Reddit API. It does not show private information or internal ids. Comments are scored using:

- Reddit score.
- Comment length.
- Whether the comment mentions one of the choices.
- Whether it mentions the winning choice.
- Explanation words such as `because`, `since`, `risk`, `trust`, `drama`, `growth`, `quality`, and `stress`.
- Recency within the current day.

The displayed excerpt is sanitised, shortened, and rendered as plain text.

## User Roles

After voting, each user receives a role based on their voting history. Role scores persist per user per game post.

Roles include:

- Peacekeeper
- Drama Farmer
- Rule Lawyer
- Growth Hacker
- Quality Purist
- Banhammer Enthusiast
- Chaos Goblin
- Community Therapist
- Algorithm Whisperer
- Sponsor Gremlin

Choices that reduce Drama and increase Trust push users toward Peacekeeper. Choices that increase Growth push Growth Hacker. Choices that increase Growth while lowering Quality push Sponsor Gremlin. Punitive choices contribute to Banhammer Enthusiast. The role badge appears after voting.

## Endings

Banhammer Bingo includes eight endings:

- The Community Revolt: Trust reaches 0.
- The Eternal Flame War: Drama reaches 100.
- Burnout Logout: Mod Stress reaches 100.
- Healthy Community: Growth reaches 100, Quality is at least 70, and Drama is below 50.
- Content Farm: Growth reaches 100 and Quality is below 40.
- Platform Legend: Reputation reaches 100.
- Ghost Town: Growth reaches 0.
- Day 30 Final Report: the community survives through day 30.

The final report shows the ending, final stats, biggest decision, most chaotic day, top community role, final community rating, restart button, and shareable summary text.

## Demo Mode

Demo controls are built for local development and hackathon judging. They are hidden unless demo mode is enabled on the server.

Enable demo mode by setting either environment variable before running Devvit playtest:

```bash
BANHAMMER_BINGO_DEMO=true npm run dev
```

or:

```bash
DEVVIT_BANHAMMER_DEMO=true npm run dev
```

Demo mode supports:

- Resolve current day instantly.
- Add test votes.
- Force high Drama.
- Force low Trust.
- Force day 30.
- Reset game.
- View current raw state in a collapsed debug panel.

Demo endpoints are still server-gated, so normal production users do not see or use destructive controls unless the environment flag is enabled.

## Run Locally

Install dependencies if needed:

```bash
npm install
```

Run the Devvit playtest environment:

```bash
npm run dev
```

Useful checks:

```bash
npm run type-check
npm run lint
npm run test:logic
npm run build
```

## Install to a Subreddit

1. Log in to Devvit:

```bash
npm run login
```

2. Run local playtest or upload through the Devvit CLI:

```bash
npm run deploy
```

3. Install the app to a subreddit you moderate through the Devvit developer flow.

The app creates interactive posts with `reddit.submitCustomPost()` and uses the configured `default` inline entrypoint plus the expanded `game` entrypoint in `devvit.json`.

## Create a Demo Post

Once installed or running in playtest, use the moderator menu item:

```text
Create Banhammer Bingo post
```

The menu endpoint creates a new custom post titled `Banhammer Bingo: A Community Chaos Sim` and navigates to it.

## What Makes It Reddit Native

- It runs inside a Reddit Interactive Post using Devvit Web entrypoints.
- It uses Devvit Redis for persistent shared state.
- It uses Devvit Scheduler for daily resolution.
- It uses Reddit user identity to enforce one vote per user per day.
- It reads Reddit comments to select Top Argument of the Day.
- It is designed around shared voting, comments, daily return, community identity, and visible consequences.
- It has no external backend, paid services, official Reddit logos, or copyrighted external assets.

## Hackathon Alignment

Banhammer Bingo is built as a complete first public version for a Reddit games hackathon. It is understandable in under 10 seconds, mobile-first, persistent, comment-aware, and designed around subreddit behaviour rather than standalone web-game patterns.

The game includes 40 handcrafted events, 10 recurring arcs, 20+ fictional community names, 6 persistent stats, 10 user roles, 8 endings, restart support, demo controls, and a polished dark UI.

## Project Structure

```text
src/game
	comments.ts      Comment scoring and excerpt sanitisation
	endings.ts       Ending definitions and final report generation
	events.ts        40 handcrafted events and community names
	logic.ts         Deterministic game rules and resolution helpers
	roles.ts         Role scoring and descriptions
	storage.ts       Devvit Redis and Scheduler helpers
	types.ts         Shared game types

src/components
	ChoiceButton.tsx
	ConsequencePanel.tsx
	DemoControls.tsx
	DilemmaCard.tsx
	EndingScreen.tsx
	GameShell.tsx
	HowToPlay.tsx
	StatsPanel.tsx
	UserRoleBadge.tsx
	VoteResults.tsx

src/client
	game.tsx         Expanded interactive game view
	splash.tsx       Inline launch view
	hooks/useGame.ts Client API state hook

src/server
	core/game.ts     Server orchestration for state, votes, resolution, demo
	core/post.ts     Custom post creation
	routes/api.ts    Public web-view API endpoints
	routes/scheduler.ts Scheduler task endpoint
```

## Known Limitations

- Daily resolution depends on Devvit Scheduler timing and platform execution windows.
- Comment scoring is heuristic, not semantic AI.
- Demo controls are environment-flag gated, not a full moderator permission UI.
- Vote writes are stored in one Redis state document per post; for very large communities this could be evolved into hash-based vote storage.

## Future Roadmap

- Add season leaderboards for most common community roles.
- Add more final report visualisations.
- Add post comments that summarise daily resolution automatically.
- Add optional moderator-only settings for resolution cadence.
- Add more arcs and rare unlock events.
- Add live update support with Devvit realtime.

## Devpost Copy

Title: Banhammer Bingo: A Community Chaos Sim

Short description: A Reddit native daily chaos sim where the community votes through terrible moderation dilemmas and watches a fictional forum survive, mutate, or collapse.

Longer description: Banhammer Bingo turns a subreddit into the shared leadership team of a fictional online community. Every day, players vote on a chaotic moderation dilemma, argue their reasoning in the comments, and return to see how the winning decision changed the forum. Persistent stats, recurring story arcs, user roles, Top Argument of the Day, and multiple endings make the community itself the main character.
## Devvit React Starter

A starter to build web applications on Reddit's developer platform

- [Devvit](https://developers.reddit.com/): A way to build and deploy immersive games on Reddit
- [Vite](https://vite.dev/): For compiling the webView
- [React](https://react.dev/): For UI
- [Hono](https://hono.dev/): For backend logic
- [Tailwind](https://tailwindcss.com/): For styles
- [TypeScript](https://www.typescriptlang.org/): For type safety

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run type-check`: Type checks, lints, and prettifies your app
