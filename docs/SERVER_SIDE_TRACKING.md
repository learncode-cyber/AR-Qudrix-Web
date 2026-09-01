# Server-Side Tracking Setup (Meta Conversions API + Google Ads API)

This is a companion to the main deployment guide, specifically for the fields under **Admin → Integrations → "Server-Side Upload"**. Everything here is optional — the site works fine with just the client-side Pixel ID and Google Ads Tag ID. This unlocks the more resilient, ad-blocker-proof version.

---

## Part A — Meta Conversions API Access Token

This one is quick, no approval wait required.

1. Go to https://business.facebook.com/events_manager2
2. Select your Pixel (the same one whose ID you already put in Admin → Integrations).
3. Go to **Settings** tab → scroll to **Conversions API**.
4. Click **Generate access token**.
5. Copy the token shown (it's long, starts with something like `EAA...`) and paste it into Admin → Integrations → "Conversions API Access Token".

That's it — Meta's server-side tracking is now active. No OAuth, no approval process.

---

## Part B — Google Ads API credentials

This one has more steps because Google requires a Developer Token and OAuth setup for any program (not just this site) that talks to the Google Ads API. Do this once; you'll reuse the same credentials indefinitely.

### B.1 — Apply for a Developer Token

1. Go to https://ads.google.com and sign in to the Google Ads account you'll be advertising from.
2. Go to **Tools & Settings** (wrench icon) → **Setup** → **API Center**.
3. If you don't see API Center, you need to be an admin on the account, or the account needs to be at least 90 days old / have some ad spend history — Google restricts who can apply.
4. Click **Apply for token**. You'll immediately get a **Test account** level token — this works right away but only against test/sandbox accounts.
5. To use your **real** account, apply for **Basic access** from the same page. Google reviews this manually; approval typically takes a few days. You can leave the server-side fields blank in Admin → Integrations until this is approved — the client-side Google Ads tracking (which you already have working) doesn't need any of this.
6. Once you have a token (test or approved), copy it into Admin → Integrations → "Developer Token".

### B.2 — Create OAuth credentials (Client ID + Secret)

1. Go to https://console.cloud.google.com
2. Create a new project (top-left dropdown → **New Project**), name it e.g. `arqudrix-ads-api`.
3. In the search bar, type **"Google Ads API"** → open it → click **Enable**.
4. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
5. If asked to configure a consent screen first: choose **External**, fill in an app name (e.g. "AR Qudrix Ads Integration") and your email, and add your own Google account under "Test users" (this keeps it in testing mode, which is fine — you're the only one using it).
6. For **Application type**, choose **Desktop app**. Name it anything.
7. Click **Create**. Google shows you a **Client ID** and **Client Secret** — copy both into Admin → Integrations → "OAuth Client ID" / "OAuth Client Secret".

### B.3 — Generate a Refresh Token (one-time, via OAuth Playground)

This is the trickiest step, but you only do it once — the refresh token doesn't expire under normal use.

1. Go to https://developers.google.com/oauthplayground
2. Click the **gear icon** (⚙️) top-right → check **"Use your own OAuth credentials"** → paste in the Client ID and Client Secret from step B.2.
3. In the left panel, scroll down (or search) to find **Google Ads API v17** — or just paste this scope directly into the "Input your own scopes" box:
   ```
   https://www.googleapis.com/auth/adwords
   ```
4. Click **Authorize APIs**. You'll be sent to a Google sign-in/consent screen — sign in with the same Google account that manages your Ads account, and approve access.
5. You'll be redirected back to the Playground with an authorization code already filled in. Click **Exchange authorization code for tokens**.
6. The Playground now shows a **Refresh token** field — copy that long string into Admin → Integrations → "OAuth Refresh Token".

### B.4 — Find your Customer ID and Login Customer ID

- **Customer ID**: this is the same as your Google Ads Tag ID without the `AW-` prefix — e.g. if your tag is `AW-1234567890`, your Customer ID is `1234567890`. You've already entered the `AW-...` version in the "Google Ads Tag ID" field above; nothing new to do here.
- **Login Customer ID**: only needed if you manage this account through a **Manager Account (MCC)**. If you log into Google Ads directly (no "switch account" MCC selector at the top), leave this blank. If you do use an MCC, this is the 10-digit ID of that manager account (found top-right when logged into the MCC).

### B.5 — Find your Conversion Action IDs

These are different from the "Conversion Label" you already set up for client-side tracking.

1. In Google Ads, go to **Goals** → **Conversions** → **Summary**.
2. Click into the conversion action you use for leads (or create one if you haven't — "Import" → "Website" or use the one auto-created when you set up the client-side tag).
3. Look at the URL in your browser's address bar — it ends in a number, e.g. `.../conversion_action/123456789` → that number is the **Conversion Action ID**.
4. Copy this number into Admin → Integrations → "Lead Conversion Action ID".
5. Repeat for your registration/signup conversion action (or use the same one for both if you're only tracking one type of conversion — leave the registration one blank if you don't have a separate action for it).

---

## Verifying it works

1. Save all fields in Admin → Integrations.
2. Submit a test lead through the public contact form, or register a test portal account, **using a URL with a fake gclid** to simulate arriving from a Google Ads click, e.g.:
   ```
   https://arqudrix.com/en/contact?gclid=TEST123
   ```
3. Check your server logs (Hostinger's application logs, or your terminal if testing locally) right after submitting — look for `[meta-conversions-api]` or `[google-ads-api]` lines. No error lines means the calls succeeded (both functions log only on failure).
4. In Meta Events Manager → your pixel → **Test Events** tab, you should see the server-side event appear within a minute.
5. In Google Ads, uploaded conversions can take up to a few hours to appear under Goals → Conversions — this delay is normal and on Google's side, not a bug.

---

## What happens if you skip this whole guide

Nothing breaks. Every field here is optional. Without them:
- Meta still tracks via the browser Pixel alone (Part A skipped).
- Google Ads still tracks via the browser gtag conversion alone (Part B skipped).

You lose some accuracy (conversions blocked by ad blockers or lost to multi-day delays between click and form submission won't be captured), but the site and both ad platforms work correctly either way.
