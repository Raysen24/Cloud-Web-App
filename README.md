# CWA Assignment 1 & 2 – Coding Escape

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The app implements:

- A **Tabs** builder (Assignment 1)
- A full **Coding Escape Room** game with timer, puzzles and persistence (Assignment 2)
- Docker, Prisma, API routes, Playwright tests, cloud deployment and a serverless leaderboard page

---

## Getting Started (Local Development)

First, install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
# or
bun install
```

Run Prisma migrations / schema sync (SQLite):

```bash
npx prisma db push
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 with your browser to see the app.

The escape room page (locally) is available at:

```bash
http://localhost:3000/escape-room
```

## Running in Docker

Build the Docker image:

```bash
docker build -t cwa-assignment .
```

Run the container:

```bash
docker run --rm -p 3000:3000 cwa-assignment
```

Then open http://localhost:3000 to use the app running inside Docker.

## Key URLs (Deployed)

- #### Escape Room (deployed on Azure Container Apps)
  ```bash
  https://cwa-next-app.salmonsky-18cb5f22.southeastasia.azurecontainerapps.io/escape-room
  ```
- #### Root app (deployed)
  ```bash
  https://cwa-next-app.salmonsky-18cb5f22.southeastasia.azurecontainerapps.io/
  ```
- #### Lambda / Azure Function leaderboard (dynamic HTML)
  ```bash
  https://cwa-leaderboard-fn6553.azurewebsites.net/api/leaderboard?difficulty=easy
  ```
  (the difficulty parameter is switched from the UI: `easy | medium | hard`)

## Running Tests (Playwright)

Install Playwright browsers:
```bash
npx playwright install
```

Run all tests:
```bash
npx playwright test
```

Run specific suites:
```bash
# Escape room tests
npx playwright test tests/escape-room.spec.ts

# Tabs builder tests
npx playwright test tests/tabs.spec.ts
```

## 📊 Assignment 2 - Grading Criteria Fulfillment
### Court Room or Escape Room (✔ Full Score: 7 / 7)

#### Criteria:
Create a Timer · Create appropriate icons/buttons · Have appropriate game play · Output is operational · Allow the user to generate multiple options · GitHub screenshot

- ✅ **Escape Room implemented** at `/escape-room`, with multiple stages/rooms and coding puzzles to solve.

- ✅ **Manual set timer** per difficulty (easy/medium/hard) displayed in the escape HUD and driving game pressure.

- ✅ **Icons/buttons** (eye, gear, door, save button, etc.) used for hints, puzzle connection, and room transitions, matching the escape-room theme.

- ✅ **Background image** and visual styling give a clear “coding escape room” feel.

- ✅ **Gameplay is operational**: user can log in, start runs, solve rooms, progress through 6 rooms, and finish the game.

- ✅ **Multiple options** via difficulty selection (`easy | medium | hard`) and multiple puzzles/rooms.

- ✅ **GitHub history** shows multiple commits and feature iterations (screenshots to be provided in submission).

### Dockerize (✔ Full Score: 3 / 3)

#### Criteria:
App runs in a Docker container.

- ✅ **Dockerfile** (multi-stage) builds the Next.js app and Prisma client, and produces a production image exposing port `3000`.

- ✅ `docker build -t cwa-assignment .` successfully builds the container image.

- ✅ `docker run --rm -p 3000:3000 cwa-assignment` runs the app fully inside Docker; the app is reachable at `http://localhost:3000`.

### APIs CRUD and Database (✔ Full Score: 8 / 8)

#### Criteria:
Create a Database Schema · Create CRUD APIs that access the Schema

- ✅ **Database schema** defined with **Prisma + SQLite** in `prisma/schema.prisma`, including models such as:
    - `User` (authentication, profile)
    - `SaveState` (escape room saves)
    - `Session` / leaderboard-related entities (finished runs)

- ✅ **Auth APIs**:
    - `POST /api/auth/register` – create user
    - `POST /api/auth/login` – login and set auth cookie
    - `POST /api/auth/logout` – clear session

- ✅ **User CRUD API**:
    - `GET /api/users/me` – read current user
    - `PUT /api/users/me` – update user fields (e.g. display name / password)
    - `DELETE /api/users/me` – delete account (and associated data)

- ✅ **SaveState CRUD (Escape Room saves**):
    - `POST /api/save` – create/update (upsert) a save, used by the Save progress button
    - `GET /api/save/latest` – read latest (unfinished) save per user
    - `GET /api/save/history` – read full save history for a user
    - (delete endpoints implemented as appropriate in the save routes)

- ✅ **Leaderboard / Sessions APIs**:
    - `GET /api/leaderboard?difficulty=...` – read leaderboard for each difficulty
    - `POST /api/sessions` – record finished escape sessions

- ✅ The **Escape Room UI** uses these APIs for:
    - Saving progress to the DB
    - Resuming previous runs
    - Displaying leaderboards per difficulty.

### Instrument Your App (✔ Full Score: 4 / 4)

#### Criteria:
Add Instrumentation · Video should demonstrate Playwright two tests · Lighthouse Report · Discussion of feedback

- ✅ **Instrumentatio**n implemented in `src/lib/metrics.ts`:
    - logEvent(event: MetricEvent, payload?: Record<string, unknown>)` logs structured events.
    - `MetricEvent` includes events such as `user_register`, `user_login`, `save_progress`, `get_latest_save`, `get_save_history`, `session_finished`, `leaderboard_view`, etc.
    - Events are written as `[METRIC] <timestamp> <event> <json>` to server logs for later analysis.

- ✅ Instrumentation is called inside multiple API routes:
    - Auth routes (login/register/logout)
    - Save/load routes
    - Leaderboard and sessions routes

- ✅ **Playwright tests**:
    - `tests/escape-room.spec.ts`: covers escape room flows (difficulty selection, solving rooms, save/resume behaviour, user lifecycle).
    - `tests/tabs.spec.ts`: covers the tabs HTML generator (including multi-tab output).
    - Tests are run via `npx playwright test` and will be demonstrated in the Assignment 2 video.

- ✅ **Lighthouse**:
    - Performance, Accessibility, Best Practices and SEO scores are obtained using Chrome DevTools Lighthouse against the deployed app.
    - Screenshots of Lighthouse reports will be included in the submission and discussed in the video.

- ✅ **Feedback & ethics**:
    - Feedback has been gathered from **friends, family and industry** (tech lead & QA), including discussion of gameplay, UX, performance and educational value.
    - The La Trobe ethical survey link has been shared with participants as requested.
    - The video will include a discussion of this feedback and how it relates to accessibility, usability and ethical considerations.

### Deploy on Cloud + Lambda Function (✔ Full Score: 3 / 3)

#### Criteria:
Deploy on the Cloud · Add Lambda function

- ✅ **Cloud deployment**:
    - The application is built into a Docker image and deployed to **Azure Container Apps**.
    - Public escape room URL:
    https://cwa-next-app.salmonsky-18cb5f22.southeastasia.azurecontainerapps.io/escape-room

- ✅ **Serverless “lambda” function (Azure Function)**:
    - Azure Function App created with Node runtime.
    - HTTP-trigger function `Leaderboard` defined in `azure-function-leaderboard/Leaderboard`.
    - Accessible at: 
    https://cwa-leaderboard-fn6553.azurewebsites.net/api/leaderboard?difficulty=easy
    - The function accepts a `difficulty` query parameter and generates **dynamic HTML** based on data from the main app’s `/api/leaderboard`.

- ✅ **Integration with UI**:

  - In `DifficultySelect.tsx`, the “Lambda leaderboard page” link uses the current `boardDifficulty`:
  ```bash
  href={`https://cwa-leaderboard-fn6553.azurewebsites.net/api/leaderboard?difficulty=${boardDifficulty}`}
  ```

This allows users to click from the React UI to an external serverless HTML page while keeping the data consistent with the in-app leaderboard.

### 👉 Expected Assignment 2 Score Coverage

- Court Room or Escape Room: **7 / 7**

- Dockerize: **3 / 3**

- APIs CRUD and Database: **8 / 8**

- Instrument your app: **4 / 4**

- Deploy on Cloud + Lambda: **3 / 3**

#### Total Assignment 2: 25 / 25 (covered by implementation and deployment)
