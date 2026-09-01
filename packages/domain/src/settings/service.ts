import { prisma, type UserRole } from "@arqudrix/db";
import { assertPermission } from "@arqudrix/auth";
import type {
  UpdateIntegrationSettingsInput,
  PublicIntegrationSettings,
  ServerTrackingCredentials,
} from "./dto";

const TENANT_ID = "arqudrix-core";

interface ActingUser {
  id: string;
  role: UserRole;
}

/**
 * IntegrationSettings is a singleton row (one per tenant). `getOrCreate`
 * lazily creates the row with all-disabled defaults the first time it's
 * read, so there's no separate seed/migration step required before the
 * admin Integrations page works.
 */
export class SettingsService {
  private async getOrCreate() {
    const existing = await prisma.integrationSettings.findUnique({ where: { tenantId: TENANT_ID } });
    if (existing) return existing;
    return prisma.integrationSettings.create({ data: { tenantId: TENANT_ID } });
  }

  /**
   * Public read, used server-side by apps/web to decide which pixel/tag
   * scripts to render in the browser. Pixel/Tag IDs are not secrets — they
   * are always visible in any browser's network tab once loaded — so no
   * RBAC check is needed here. Access tokens and OAuth credentials are
   * deliberately excluded from this shape; use getServerTrackingCredentials()
   * for those, from a server-only code path.
   */
  async getPublicSettings(): Promise<PublicIntegrationSettings> {
    const settings = await this.getOrCreate();
    return {
      metaPixelId: settings.metaPixelEnabled ? settings.metaPixelId : null,
      googleAdsId: settings.googleAdsEnabled ? settings.googleAdsId : null,
      googleAdsLeadConversionLabel: settings.googleAdsEnabled ? settings.googleAdsLeadConversionLabel : null,
      googleAdsRegistrationConversionLabel: settings.googleAdsEnabled
        ? settings.googleAdsRegistrationConversionLabel
        : null,
    };
  }

  /**
   * Server-only read including secrets. Callers: the lead/registration API
   * route handlers, to fire Meta Conversions API and Google Ads
   * click-conversion-upload calls. NEVER expose this to a client component
   * or an API response body.
   */
  async getServerTrackingCredentials(): Promise<ServerTrackingCredentials> {
    const settings = await this.getOrCreate();
    return {
      metaPixelId: settings.metaPixelEnabled ? settings.metaPixelId : null,
      metaConversionsApiAccessToken: settings.metaPixelEnabled ? settings.metaConversionsApiAccessToken : null,
      googleAdsId: settings.googleAdsEnabled ? settings.googleAdsId : null,
      googleAdsLeadConversionLabel: settings.googleAdsEnabled ? settings.googleAdsLeadConversionLabel : null,
      googleAdsRegistrationConversionLabel: settings.googleAdsEnabled
        ? settings.googleAdsRegistrationConversionLabel
        : null,
      googleAdsDeveloperToken: settings.googleAdsEnabled ? settings.googleAdsDeveloperToken : null,
      googleAdsOAuthClientId: settings.googleAdsEnabled ? settings.googleAdsOAuthClientId : null,
      googleAdsOAuthClientSecret: settings.googleAdsEnabled ? settings.googleAdsOAuthClientSecret : null,
      googleAdsOAuthRefreshToken: settings.googleAdsEnabled ? settings.googleAdsOAuthRefreshToken : null,
      googleAdsLoginCustomerId: settings.googleAdsEnabled ? settings.googleAdsLoginCustomerId : null,
      googleAdsLeadConversionActionId: settings.googleAdsEnabled ? settings.googleAdsLeadConversionActionId : null,
      googleAdsRegistrationConversionActionId: settings.googleAdsEnabled
        ? settings.googleAdsRegistrationConversionActionId
        : null,
    };
  }

  async getForAdmin(actor: ActingUser) {
    assertPermission(actor.role, "integration:read");
    return this.getOrCreate();
  }

  async update(actor: ActingUser, input: UpdateIntegrationSettingsInput) {
    assertPermission(actor.role, "integration:manage_credentials");

    await this.getOrCreate(); // ensure the row exists before upserting

    const updated = await prisma.integrationSettings.update({
      where: { tenantId: TENANT_ID },
      data: { ...input, updatedById: actor.id },
    });

    // Deliberately do NOT log the secret values themselves (token, client
    // secret, refresh token) into the audit trail — only which platforms
    // were toggled. AuditLog rows are visible to any ADMIN, not just
    // SUPER_ADMIN, and should never become a second place secrets leak from.
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "integration_settings.updated",
        entityType: "IntegrationSettings",
        entityId: updated.id,
        metadata: {
          metaPixelEnabled: input.metaPixelEnabled,
          metaConversionsApiConfigured: Boolean(input.metaConversionsApiAccessToken),
          googleAdsEnabled: input.googleAdsEnabled,
          googleAdsServerSideConfigured: Boolean(
            input.googleAdsDeveloperToken && input.googleAdsOAuthRefreshToken
          ),
        },
      },
    });

    return updated;
  }
}

export const settingsService = new SettingsService();
