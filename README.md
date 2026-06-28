# NJobs

A full-stack MERN job board platform — "Indeed Lite." Employers post jobs, applicants search and apply with one click, and applicants can rate and review the companies that interviewed or hired them.

![Stack](https://img.shields.io/badge/stack-MERN-0F766E) ![Node](https://img.shields.io/badge/node-%3E%3D18-0F766E) ![License](https://img.shields.io/badge/license-MIT-272D38)

---

## Three roles, one platform

- **Applicant** — browse and search jobs, filter by location/category/salary/experience, apply with a resume + cover letter, track application status, bookmark jobs, see recently viewed jobs, and rate/review companies.
- **Employer** — create a company profile, post/edit/delete jobs, view and manage applicants per job, update application status (Pending → Reviewed → Accepted/Rejected), and see a dashboard of applicant volume and company rating.
- **Admin** — platform-wide dashboard, manage (suspend/delete) any user, moderate (remove/delete) any job posting, and flag/unflag company reviews.

Admin accounts aren't self-registered — the first admin is created automatically on server startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`.

## Tech Stack

**Frontend:** React, Vite, React Router, Tailwind CSS, Axios, React Hook Form, Recharts, Lucide icons, React Hot Toast

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer + Cloudinary (optional file uploads for resumes/logos/avatars)

## Project Structure

```
njobs/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # ui, layout, jobs, employer, applicant, reviews
│       ├── pages/            # public pages + pages/applicant, pages/employer, pages/admin
│       ├── layouts/          # PublicLayout, DashboardLayout, AuthLayout
│       ├── context/          # Auth + theme context
│       ├── hooks/            # useDebounce
│       ├── services/         # Axios service modules per resource
│       └── utils/             # Constants and formatting helpers
└── server/                  # Express backend
    ├── controllers/          # auth, job, company, application, review, user, admin, employerStats
    ├── routes/                # one router per resource + role-scoped routers
    ├── models/                # User, Company, Job, Application, Review
    ├── middleware/            # auth (JWT + role authorize), upload, error handling
    ├── config/                # DB and Cloudinary configuration
    └── utils/                 # token generation, admin bootstrap, demo seed script
```

## Prerequisites

- Node.js 18+
- MongoDB (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- (Optional) A free [Cloudinary](https://cloudinary.com) account for resume/logo/avatar uploads

## Getting Started

### 1. Install

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**`server/.env`** (copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/njobs
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_EMAIL=admin@njobs.com
ADMIN_PASSWORD=change_this_admin_password
```

> Generate a strong `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**`client/.env`** (copy from `client/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run

```bash
# Terminal 1
cd server && npm run dev      # http://localhost:5000

# Terminal 2
cd client && npm run dev      # http://localhost:5173
```

The admin account from your `.env` is created automatically the first time the server starts.

### 4. (Optional) Seed demo data

```bash
cd server && npm run seed
```

Creates a demo applicant (with resume + application + review already on file), a demo employer (with a company profile and four job postings), and a demo admin — all credentials are printed to the terminal when the script finishes.

## Dark mode

Dark mode is built with Tailwind's `class` strategy. The toggle (sun/moon icon in the navbar and dashboard topbar) flips a `dark` class on `<html>`, and the preference is saved to `localStorage` under `njobs_theme`. A small inline script in `index.html` applies the saved theme before React mounts, so there's no flash of the wrong theme on page load. Light is the default for first-time visitors — if your browser shows dark mode immediately, it's remembering a previous toggle from `localStorage` (`njobs_theme`), not a bug; clear that key to reset to light.

## Company cover images

Employers can add a cover/banner image to their company profile from **Company Profile → Add cover photo** (recommended 1200×400px, max 8MB). Once set, it shows up in three places:

- The top of the **public company profile page**, with the logo overlapping the bottom edge
- A banner strip at the top of every **job card** in search results for that company
- The header of the **job details page** for any job posted by that company

Companies without a cover image fall back to a subtle gradient placeholder — nothing looks broken or empty either way.

## API Reference

All routes except auth, public job browsing, and public company/review viewing require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, role }` — role is `applicant` or `employer`, sends a verification email |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/google` | `{ credential, role }` — Google ID token; auto-creates the account on first sign-in |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/verify-email` | `{ token }` — confirms the email verification link |
| POST | `/api/auth/resend-verification` | Resends the verification email (requires login) |

### Jobs
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | List + search/filter/paginate — `search`, `location`, `category`, `experienceLevel`, `jobType`, `salaryMin`, `sort`, `page`, `limit` |
| GET | `/api/jobs/:id` | Public | Job details |
| GET | `/api/jobs/employer/mine` | Employer | Jobs posted by the logged-in employer |
| POST | `/api/jobs` | Employer | Create a job (must own the company) |
| PUT | `/api/jobs/:id` | Employer/Admin | Update a job |
| DELETE | `/api/jobs/:id` | Employer/Admin | Delete a job (cascades its applications) |

### Companies & Reviews
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/company` | Employer | Create company profile |
| GET | `/api/company/:id` | Public | Company profile + active jobs |
| PUT | `/api/company/:id` | Employer/Admin | Update company profile |
| GET | `/api/company/me/profile` | Employer | The logged-in employer's company |
| PUT | `/api/company/:id/logo` | Employer | Upload logo (multipart, field `logo`) |
| PUT | `/api/company/:id/cover` | Employer | Upload cover/banner image (multipart, field `cover`) |
| GET | `/api/company/:id/reviews` | Public | List reviews for a company |
| POST | `/api/company/:id/reviews` | Applicant | Rate + review a company |
| PUT | `/api/reviews/:id` | Owner | Edit own review |
| DELETE | `/api/reviews/:id` | Owner/Admin | Delete a review |

### Applications
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/applications` | Applicant | Apply — `{ job, coverLetter }` (uses resume on file) |
| GET | `/api/applications/my` | Applicant | Own applications — `status`, `page`, `limit` |
| DELETE | `/api/applications/:id` | Applicant | Withdraw an application |
| GET | `/api/employer/applicants` | Employer | Applicants across the employer's jobs — `jobId`, `status`, `page`, `limit` |
| PUT | `/api/employer/applicants/:id/status` | Employer | Update status — `{ status }` |
| GET | `/api/employer/stats` | Employer | Dashboard stats + applicants-per-job breakdown |

### User profile
| Method | Route | Description |
|---|---|---|
| PUT | `/api/users/profile` | Update name/email/headline/skills |
| PUT | `/api/users/password` | Change password |
| PUT | `/api/users/avatar` | Upload avatar (multipart, field `avatar`) |
| PUT | `/api/users/resume` | Upload resume — applicant only (multipart, field `resume`) |
| GET/PUT | `/api/users/bookmarks` / `/api/users/bookmarks/:jobId` | List / toggle bookmarked jobs |
| GET/POST | `/api/users/recently-viewed` / `/api/users/recently-viewed/:jobId` | List / record recently viewed jobs |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` | Platform-wide stats + monthly signups |
| GET | `/api/admin/users` | List users — `role`, `search`, `page`, `limit` |
| PUT | `/api/admin/users/:id/ban` | Suspend/reinstate a user |
| DELETE | `/api/admin/users/:id` | Delete a user (cascades their data) |
| GET | `/api/admin/jobs` | List all jobs for moderation |
| PUT | `/api/admin/jobs/:id/remove` | Hide a job from public listings |
| DELETE | `/api/admin/jobs/:id` | Permanently delete a job |
| GET | `/api/admin/reviews` | List reviews for moderation — `flagged` |
| PUT | `/api/admin/reviews/:id/flag` | Flag/unflag a review |

### Messages
| Method | Route | Description |
|---|---|---|
| GET | `/api/messages/conversations` | List the logged-in user's conversations, sorted by latest activity |
| GET | `/api/messages/conversations/unread-count` | Total unread message count across all conversations |
| POST | `/api/messages/conversations/by-application/:applicationId` | Open (or create) the conversation tied to an application |
| GET | `/api/messages/conversations/:conversationId/messages` | Message history for a conversation — also marks messages as read |
| POST | `/api/messages/conversations/:conversationId/messages` | Send a message over plain HTTP (fallback when not using Socket.io) |
| POST | `/api/messages/conversations/:conversationId/attachments` | Upload and send a file attachment (multipart, field `file`, optional `text`) |

**Socket.io events** (connect with `auth: { token }` using the JWT):
| Event | Direction | Payload |
|---|---|---|
| `conversation:join` | client → server | `conversationId` |
| `conversation:leave` | client → server | `conversationId` |
| `message:send` | client → server | `{ conversationId, text }`, ack callback returns `{ success, message }` |
| `message:new` | server → client | the new message, broadcast to everyone in the conversation room |
| `conversation:updated` | server → client | `{ conversationId, lastMessage, lastMessageAt }`, sent to the other participant |
| `messages:read` | client → server | `{ conversationId }` — marks the other person's messages as read |
| `messages:seen` | server → client | `{ conversationId, readBy, readAt }` — broadcast to the conversation room so the sender's bubble updates to "seen" |
| `attachment:sent` | client → server | `{ conversationId, message }` — relays an HTTP-uploaded attachment to the other participant in real time |
| `typing:start` / `typing:stop` | both directions | `{ conversationId }` |

### Password Reset
| Method | Route | Description |
|---|---|---|
| POST | `/api/password-reset/request/email` | `{ email }` — sends a reset link if the email exists (always returns success either way) |
| POST | `/api/password-reset/request/sms` | `{ phone }` — sends a 6-digit code if the phone exists (always returns success either way) |
| GET | `/api/password-reset/verify/token/:token` | Checks whether an email reset link is still valid, before showing the reset form |
| POST | `/api/password-reset/verify/code` | `{ phone, code }` — checks an SMS code without consuming it |
| POST | `/api/password-reset/reset/token` | `{ token, newPassword }` — completes the email reset flow |
| POST | `/api/password-reset/reset/code` | `{ phone, code, newPassword }` — completes the SMS reset flow |

### Phone Verification (saving a number to your profile)
| Method | Route | Description |
|---|---|---|
| POST | `/api/users/phone/send-verification` | `{ phone }` — sends a 6-digit code to confirm ownership before saving |
| POST | `/api/users/phone/confirm` | `{ phone, code }` — verifies the code and saves the phone number on success |

## Email Verification

Accounts created with email + password (not Google) start as **unverified**. A confirmation link is emailed on registration via Resend, valid for **24 hours**. Until the link is clicked:

- The account works completely normally — login, browsing, applying, posting jobs, everything. Verification is not a login gate.
- A dismissible banner appears at the top of every dashboard page (`client/src/components/ui/VerifyEmailBanner.jsx`) reminding the user to check their inbox, with a **"resend the email"** link if the original didn't arrive or expired.

Google sign-ins skip this entirely — `isEmailVerified` is set to `true` immediately, since Google has already confirmed the user owns that address.

If Resend isn't configured, the same fallback as password reset applies: the verification link is logged to the server console instead of emailed, so registration still works during local development.

## Forgot Password (email magic link + SMS code)

Users who forget their password can reset it two ways from **Login → Forgot password?**:

- **Email magic link** — enter your email, get a one-click reset link that expires in **5 minutes**. No code to type.
- **SMS code** — enter the phone number saved on your profile, get a **6-digit code** by text (also expires in 5 minutes, max 5 incorrect attempts before you need a new code).

Both flows never reveal whether an email or phone number is actually registered (the response message is identical either way) — this prevents attackers from using the reset form to discover which accounts exist. Reset tokens and codes are hashed before being stored, are single-use, and are automatically deleted by MongoDB once they expire (no cleanup job needed).

If neither Resend nor Twilio is configured, the corresponding option simply won't work — email reset requests log the reset link to the server console instead of emailing it (useful for local development without setting anything up), and SMS reset returns a clear "not configured" error.

### Setting up Resend (email)

1. Sign up free at [resend.com](https://resend.com).
2. Go to **API Keys** in the dashboard, click **Create API Key**, and copy it.
3. Add to `server/.env`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=NJobs <onboarding@resend.dev>
   ```
4. The default `onboarding@resend.dev` sender works immediately with no setup — fine for development and testing. To send from your own domain (e.g. `noreply@yourcompany.com`), go to **Domains** in Resend, add and verify your domain (a few DNS records), then update `RESEND_FROM_EMAIL` to use it.
5. Restart the server.

The reset email uses a custom NJobs-branded HTML template (`server/services/emailService.js`) — teal accent color, the NJobs logo mark, and a clear one-button call to action, matching the rest of the app's design.

### Setting up Twilio (SMS, via Twilio Verify)

SMS codes are sent through [Twilio Verify](https://www.twilio.com/docs/verify) — a purpose-built OTP service — rather than raw SMS messages. Verify handles code generation, expiry, and attempt-limiting on Twilio's side, and it doesn't require you to own/rent a phone number to send from.

1. Sign up free at [twilio.com/try-twilio](https://www.twilio.com/try-twilio) — free trial includes credit for testing.
2. From the [Twilio Console](https://console.twilio.com) dashboard, copy your **Account SID** and **Auth Token**.
3. Go to **Verify → Services** in the console sidebar, click **Create new Service**, name it (e.g. "NJobs"), and copy the **Service SID** (starts with `VA`).
4. Add to `server/.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Restart the server.

> **Twilio trial account note:** trial accounts can only verify phone numbers you've manually added in the Twilio Console (**Phone Numbers → Verified Caller IDs**) until you upgrade to a paid account. This is a Twilio restriction, not a limitation of this app — verify the test numbers you plan to use, or upgrade your Twilio account for production use. You do **not** need to buy a Twilio phone number for Verify to work — only the Verify Service SID is required.

### Adding a phone number to your account

A phone number can't simply be typed in and saved — it must be **verified first**, so nobody can put someone else's number on their account (which would let them receive that person's SMS reset codes). The flow, from **Profile & Resume → Account information** (applicant) or **Account Settings** (employer):

1. Enter the phone number and tap **Send verification code**.
2. A 6-digit code arrives by SMS (via Twilio Verify).
3. Enter the code to confirm — only then is the number saved to the account.

The backend also rejects a number that's already verified on a different account, so phone numbers can't be shared between users. This is all optional — the field can be left blank if you don't want SMS-based password reset.

The phone field uses a country-code picker (`client/src/components/ui/PhoneInput.jsx`, defaulting to 🇵🇭 +63) so it's not possible to accidentally save a number in the wrong format. Whatever you type into the national-number box is automatically combined with the selected country code into full E.164 format (e.g. `+639171234567`) before it's sent anywhere — Twilio requires this exact format and rejects local formats like `0917...`. As a second layer of safety, the backend (`server/utils/phoneNumber.js`) also normalizes any phone number it receives, stripping a leading `0` and prefixing the country code if one wasn't included, so this can't break even from old data or a direct API call.

## Troubleshooting: CORS errors / Google "origin_mismatch"

The Vite dev server is pinned to **port 5173** (`strictPort: true` in `client/vite.config.js`). If something else on your machine is already using 5173, Vite will fail to start with a clear "Port already in use" message instead of silently switching to 5174 — free up the port (or stop whatever's using it) rather than letting the dev server move, since that's what causes both of these errors:

- **CORS errors in the browser console** — the backend's `corsOriginCallback` (`server/utils/corsConfig.js`) already accepts any `localhost`/`127.0.0.1` port automatically outside of production, so this shouldn't happen as long as the frontend stays on 5173. If you intentionally run the client on a different port, add it to `CLIENT_URL` in `server/.env` as a comma-separated list, e.g. `CLIENT_URL=http://localhost:5173,http://localhost:5174`.
- **Google Sign-In "Access blocked: Authorization Error" / `origin_mismatch`** — Google checks the exact origin against what's registered in your OAuth client, and it does not auto-allow other localhost ports the way the app's own CORS does. If you ever run the frontend on a port other than 5173, add that origin under **Authorized JavaScript origins** in [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) for your OAuth client, then wait a few minutes for it to take effect.

## Troubleshooting: "Duplicate value for field: phone" on registration

This was a bug in earlier versions caused by a MongoDB unique index that didn't correctly exclude accounts with no phone number — every user without a phone was treated as having the same `null` value, so only the *first* account without a phone could ever be created. Fixed by switching to a **partial unique index** (`{ phone: { $type: 'string' } }` in `server/models/User.js`) that only enforces uniqueness on accounts that actually have a phone number saved.

If you're running an older copy of this database and still see this error, it's because MongoDB doesn't automatically rebuild indexes when the schema changes — the fix needs to apply to the existing index too. This is now handled automatically: `server/utils/syncIndexes.js` runs once on every server startup, detects the outdated index, drops it, and rebuilds it correctly. No manual database commands are needed — just restart the server and it self-heals.

## Google Sign-In setup

NJobs supports signing in with Google. A Google account that's never been seen before is automatically registered (no separate "create account" step) — for new sign-ups, the role chosen on the register page (Applicant/Employer) is used.

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create a project (or pick an existing one).
3. Click **Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - your production frontend URL, once deployed
6. Save, then copy the generated **Client ID**.
7. Add it to **both**:
   - `server/.env` → `GOOGLE_CLIENT_ID=<your client id>`
   - `client/.env` → `VITE_GOOGLE_CLIENT_ID=<your client id>`
8. Restart both the client and server dev servers.

If `VITE_GOOGLE_CLIENT_ID` is left blank, the Google button simply doesn't render — email/password auth keeps working normally either way.

## Remember me

The login page has a "Remember my email and password on this device" checkbox. When checked, the email and password are saved in the browser's `localStorage` (under `njobs_remembered_credentials`) and auto-filled the next time the login page loads. Unchecking it (or logging in with it unchecked) clears the saved values. This is a convenience feature for local/demo use — it is not encrypted, so don't rely on it on a shared computer.

## Resume & document uploads (Cloudinary)

Resume, avatar, and company logo uploads use Cloudinary. Without Cloudinary configured, upload endpoints respond with a clear "not configured" message instead of crashing — but file uploads simply won't work until you set it up.

### Setting up Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From your Cloudinary dashboard, copy your **Cloud name**, **API key**, and **API secret**.
3. Add them to `server/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Restart the server.

### About the "HTTP ERROR 401" on resume links

If a resume link returns a 401 error, it's almost always one of these:

- **The resume URL is a placeholder, not a real uploaded file.** The seed script uses a real public sample PDF so this works out of the box for demo data — but any resume URL you enter manually (rather than uploading through the app) needs to point to an actual, publicly accessible file.
- **Cloudinary's PDF/raw delivery is restricted.** By default, some Cloudinary accounts block direct delivery of raw files (PDF, DOC, etc.) for security. This project uploads PDFs and images with `resource_type: 'image'` and `access_mode: 'public'` specifically to avoid this — Cloudinary can serve PDFs through its image pipeline, which is publicly deliverable by default. Office documents (`.doc`/`.docx`/`.xls`/`.xlsx`) upload as `resource_type: 'raw'`; if your Cloudinary account restricts raw delivery, enable **"Allow delivery of PDF and ZIP files"** under **Settings → Security** in your Cloudinary dashboard.

### Resume preview in the app

Resumes open in an in-app preview modal (`components/ui/ResumePreviewModal.jsx`) rather than a raw new-tab link. PDFs and images render inline; Word/Excel files show a clear "open in new tab" fallback instead of risking a blank or broken page. If a file genuinely fails to load, the modal shows a friendly message instead of letting the browser surface its own error page.

## Real-time messaging (Socket.io)

Applicants and employers can message each other directly about a specific job application — accessible from **My Applications** (applicant) and **Applicants** (employer) via the "Message" link, and from the **Messages** page in either dashboard.

- A conversation is scoped to one **application** (one applicant + the employer who posted that job) — there's no way to message someone you haven't applied to or who hasn't received your application.
- **Naming in the chat list:** applicants see the **company name** they're talking to (not the employer's personal name); employers see the **applicant's real name**. This matches how each side actually thinks about the conversation — an applicant cares which company is messaging them, an employer cares which candidate they're talking to.
- **Read receipts ("Seen"):** when the other person opens the conversation, a small avatar of them appears beneath your most recent message — the same pattern as Messenger. This is tracked per-conversation via `messages:read` over the socket and a `readAt` timestamp on each message.
- **File attachments:** either side can attach images, videos, PDFs, Word, Excel, or PowerPoint files (up to 25MB) using the paperclip button. Images and videos preview inline in the chat; other documents show as a downloadable file card with name and size.
- Messages send and arrive in real time over Socket.io, with a typing indicator and an unread-count badge in the sidebar.
- If the socket connection drops, sending falls back to a plain HTTP request so messages still go through — they just won't show up instantly on the other end until they refresh or reconnect.
- The frontend never needs separate configuration — `VITE_API_URL` doubles as the Socket.io server origin.

## Data Models

- **User** — `name`, `email`, `password` (hashed, optional for Google accounts), `googleId`, `authProvider` (local/google), `role` (applicant/employer/admin), `avatar`, `phone`, `resume`, `headline`, `skills[]`, `bookmarkedJobs[]`, `recentlyViewedJobs[]`, `isBanned`, `isEmailVerified`
- **Company** — `companyName`, `logo`, `coverImage`, `description`, `website`, `industry`, `location`, `size`, `owner` (User ref), `ratingAverage`, `ratingCount`
- **Job** — `title`, `description`, `requirements`, `location`, `salaryMin/Max`, `category`, `experienceLevel`, `jobType`, `company` (ref), `createdBy` (User ref), `status`
- **Application** — `applicant` (User ref), `job` (ref), `resumeUrl`, `coverLetter`, `status`, `appliedAt` — unique per (applicant, job)
- **Review** — `company` (ref), `author` (User ref), `rating` (1-5), `title`, `comment`, `jobTitleAtCompany`, `isFlagged` — unique per (company, author)
- **Conversation** — `application` (ref, unique), `job` (ref), `applicant` (User ref), `employer` (User ref), `lastMessage`, `lastMessageAt`, `unreadByApplicant`, `unreadByEmployer`
- **Message** — `conversation` (ref), `sender` (User ref), `text` (optional if there's an attachment), `attachments[]` (`url`, `fileName`, `mimeType`, `fileType`: image/video/document, `size`), `readAt`
- **PasswordReset** — `user` (ref), `method` (email/sms), `tokenHash` (email), `codeHash` (sms), `expiresAt` (auto-deleted by MongoDB TTL index once passed), `used`, `attempts`
- **EmailVerification** — `user` (ref), `tokenHash`, `expiresAt` (auto-deleted by MongoDB TTL index after 24 hours), `used`

Relationships use Mongoose `ObjectId` references throughout (`Job.company → Company`, `Job.createdBy → User`, `Application.applicant/job`, `Review.company/author`, `Company.owner → User`).

## Rate limiting (anti-abuse / anti-DDoS)

Every API route is protected by [express-rate-limit](https://www.npmjs.com/package/express-rate-limit), tiered by sensitivity:

| Limiter | Window | Limit (production) | Applies to |
|---|---|---|---|
| `generalLimiter` | 15 min | 300 requests/IP | All `/api/*` routes (applied globally) |
| `authLimiter` | 15 min | 10 requests/IP | `/api/auth/register`, `/api/auth/login`, `/api/auth/google` |
| `passwordLimiter` | 15 min | 8 requests/IP | `/api/users/password` |
| `uploadLimiter` | 15 min | 60 requests/IP | Avatar, resume, logo, cover image, and chat attachment uploads |
| `reviewLimiter` | 60 min | 20 requests/IP | Submitting a company review |

`authLimiter` only counts failed attempts (`skipSuccessfulRequests: true`), so a legitimate user logging in repeatedly never gets blocked — only repeated failures (brute-force attempts) count toward the limit. Limits are higher outside production (`NODE_ENV !== 'production'`) so local development and testing aren't throttled.

`/api/health` is intentionally excluded from rate limiting so uptime monitors and load balancers always get through.

Socket.io messages have a separate, lightweight in-memory limiter (`server/sockets/socketServer.js`): a maximum of 20 messages per 10 seconds per connected user, since HTTP-based rate limiting doesn't apply to WebSocket events. Exceeding it returns a friendly error to the sender instead of disconnecting them.

This is sufficient for moderate abuse and scripted attacks from a single source. It is **not** a substitute for infrastructure-level DDoS protection (e.g. Cloudflare, a managed load balancer, or your hosting provider's network-layer protection) against large-scale or distributed attacks — pair this with that if you expect to be a target.

## Deployment

Frontend and backend are fully decoupled:

- **Backend** — Render, Railway, Fly.io, or any Node host. Set the env vars above and point `MONGO_URI` at Atlas.
- **Frontend** — Vercel, Netlify, or any static host. `npm run build`, set `VITE_API_URL` to your deployed API, and update the backend's `CLIENT_URL` to match your deployed frontend origin for CORS.

## License

MIT — free to use for learning, portfolios, or as a foundation for your own product.
