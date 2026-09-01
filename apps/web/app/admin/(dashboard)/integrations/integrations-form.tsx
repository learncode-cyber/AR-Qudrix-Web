"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateIntegrationSettingsSchema, type UpdateIntegrationSettingsInput } from "@arqudrix/domain/schemas";
import type { IntegrationSettings } from "@arqudrix/db";

export function IntegrationsForm({
  initialValues,
  canEdit,
}: {
  initialValues: IntegrationSettings;
  canEdit: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateIntegrationSettingsInput>({
    resolver: zodResolver(updateIntegrationSettingsSchema),
    defaultValues: {
      metaPixelEnabled: initialValues.metaPixelEnabled,
      metaPixelId: initialValues.metaPixelId,
      metaConversionsApiAccessToken: initialValues.metaConversionsApiAccessToken,
      googleAdsEnabled: initialValues.googleAdsEnabled,
      googleAdsId: initialValues.googleAdsId,
      googleAdsLeadConversionLabel: initialValues.googleAdsLeadConversionLabel,
      googleAdsRegistrationConversionLabel: initialValues.googleAdsRegistrationConversionLabel,
      googleAdsDeveloperToken: initialValues.googleAdsDeveloperToken,
      googleAdsOAuthClientId: initialValues.googleAdsOAuthClientId,
      googleAdsOAuthClientSecret: initialValues.googleAdsOAuthClientSecret,
      googleAdsOAuthRefreshToken: initialValues.googleAdsOAuthRefreshToken,
      googleAdsLoginCustomerId: initialValues.googleAdsLoginCustomerId,
      googleAdsLeadConversionActionId: initialValues.googleAdsLeadConversionActionId,
      googleAdsRegistrationConversionActionId: initialValues.googleAdsRegistrationConversionActionId,
    },
  });

  const metaPixelEnabled = watch("metaPixelEnabled");
  const googleAdsEnabled = watch("googleAdsEnabled");

  async function onSubmit(data: UpdateIntegrationSettingsInput) {
    const response = await fetch("/api/v1/settings/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.message ?? "Failed to save settings");
      return;
    }

    toast.success("Integration settings updated — live on the site now");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
      {/* ---------------- META ---------------- */}
      <fieldset disabled={!canEdit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Meta Pixel</h2>
            <p className="mt-1 text-xs text-slate-400">Fires PageView, Lead, and CompleteRegistration events.</p>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("metaPixelEnabled")} className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Pixel ID</label>
          <input
            {...register("metaPixelId")}
            disabled={!metaPixelEnabled}
            placeholder="1234567890123456"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">Meta Events Manager → Data Sources → your pixel.</p>
          {errors.metaPixelId && <p className="mt-1 text-xs text-red-600">{errors.metaPixelId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Conversions API Access Token <span className="font-normal text-slate-400">(optional — enables server-side tracking)</span>
          </label>
          <input
            type="password"
            {...register("metaConversionsApiAccessToken")}
            disabled={!metaPixelEnabled}
            placeholder="EAAxxxxxxxxxxxxx..."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">
            Events Manager → Data Sources → your pixel → Settings → Conversions API → &ldquo;Generate access token&rdquo;.
            Without this, only browser-side tracking runs (still works, just less resilient to ad blockers).
          </p>
        </div>
      </fieldset>

      {/* ---------------- GOOGLE ADS (client-side) ---------------- */}
      <fieldset disabled={!canEdit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Google Ads</h2>
            <p className="mt-1 text-xs text-slate-400">Fires conversion events for leads and registrations.</p>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("googleAdsEnabled")} className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm font-medium text-slate-700">Enabled</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Google Ads Tag ID (Customer ID)</label>
          <input
            {...register("googleAdsId")}
            disabled={!googleAdsEnabled}
            placeholder="AW-1234567890"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">Google Ads → Tools &amp; Settings → Conversions → your account's tag.</p>
          {errors.googleAdsId && <p className="mt-1 text-xs text-red-600">{errors.googleAdsId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Lead Conversion Label</label>
            <input
              {...register("googleAdsLeadConversionLabel")}
              disabled={!googleAdsEnabled}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Registration Conversion Label</label>
            <input
              {...register("googleAdsRegistrationConversionLabel")}
              disabled={!googleAdsEnabled}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Both labels come from Google Ads → Tools &amp; Settings → Conversions → click a conversion action → &ldquo;Tag setup&rdquo;
          → the part after the slash in <code>send_to</code>, e.g. <code>AW-123/AbC-D_efGh</code> → label is <code>AbC-D_efGh</code>.
        </p>
      </fieldset>

      {/* ---------------- GOOGLE ADS (server-side) ---------------- */}
      <fieldset disabled={!canEdit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Google Ads — Server-Side Upload</h2>
          <p className="mt-1 text-xs text-slate-400">
            Optional. Without these, only the browser-side gtag conversion fires (works for most cases). Fill
            these in to also upload conversions server-side via GCLID, which survives ad blockers and delayed
            (multi-day) conversions. All fields below are required together for this to activate.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Developer Token</label>
          <input
            type="password"
            {...register("googleAdsDeveloperToken")}
            disabled={!googleAdsEnabled}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">
            Google Ads → Tools &amp; Settings → API Center. New accounts start with &ldquo;Test&rdquo; access; apply
            for &ldquo;Basic&rdquo; access (Google reviews this, can take a few days) before going live.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">OAuth Client ID</label>
            <input
              {...register("googleAdsOAuthClientId")}
              disabled={!googleAdsEnabled}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">OAuth Client Secret</label>
            <input
              type="password"
              {...register("googleAdsOAuthClientSecret")}
              disabled={!googleAdsEnabled}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Both from Google Cloud Console → APIs &amp; Services → Credentials → create an OAuth 2.0 Client ID
          (type: Desktop app is simplest for a one-time setup).
        </p>

        <div>
          <label className="block text-sm font-medium text-slate-700">OAuth Refresh Token</label>
          <input
            type="password"
            {...register("googleAdsOAuthRefreshToken")}
            disabled={!googleAdsEnabled}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">
            Generated once via Google's OAuth Playground using the Client ID/Secret above and the scope{" "}
            <code>https://www.googleapis.com/auth/adwords</code> — see the deployment guide for the exact steps.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Login Customer ID (MCC)</label>
          <input
            {...register("googleAdsLoginCustomerId")}
            disabled={!googleAdsEnabled}
            placeholder="1234567890"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
          />
          <p className="mt-1 text-xs text-slate-400">
            10 digits, no dashes. Only needed if your Developer Token is approved under a manager (MCC) account
            rather than this account directly — leave blank if unsure and add it later if uploads fail.
          </p>
          {errors.googleAdsLoginCustomerId && (
            <p className="mt-1 text-xs text-red-600">{errors.googleAdsLoginCustomerId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Lead Conversion Action ID</label>
            <input
              {...register("googleAdsLeadConversionActionId")}
              disabled={!googleAdsEnabled}
              placeholder="123456789"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Registration Conversion Action ID</label>
            <input
              {...register("googleAdsRegistrationConversionActionId")}
              disabled={!googleAdsEnabled}
              placeholder="123456789"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Numeric only — <strong>different from the Conversion Label above.</strong> Google Ads → Goals →
          Conversions → click the conversion action → the ID is in the page URL (
          <code>.../conversion_action/123456789</code>) or under &ldquo;Conversion action ID&rdquo; in its details.
        </p>
      </fieldset>

      {canEdit && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-light disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
      )}
    </form>
  );
}
