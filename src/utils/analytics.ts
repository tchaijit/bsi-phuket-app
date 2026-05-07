import type { Partner, ZoneScore, WhitespaceOpportunity, ZoneName, ContractStatus } from '../types';
import { zones } from '../data/zones';
import { PARTNER_CATEGORIES } from '../data/constants';

// Derive contract status from dates
export const deriveStatus = (partner: Partner): ContractStatus => {
  if (!partner.contract) return 'prospect';
  if (partner.contract.status) return partner.contract.status;

  const endDate = partner.contract.end_date ? new Date(partner.contract.end_date) : null;
  if (!endDate) return 'prospect';

  const days = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring_soon';
  return 'active';
};

// Calculate Zone Advantage Scores
export const computeZoneScores = (partners: Partner[]): Record<ZoneName, ZoneScore> => {
  const scores: Record<string, ZoneScore> = {};

  Object.keys(zones).forEach((zoneName) => {
    const zone = zones[zoneName as ZoneName];
    const inZone = partners.filter((p) => p.zone === zoneName);
    const bsiPartners = inZone.filter((p) => PARTNER_CATEGORIES.includes(p.category));
    // Note: No longer tracking competitors separately as all hospitals are now 'hospital' category
    const competitors = inZone.filter((p) => p.competitor_details); // Count by competitor_details instead

    const active = bsiPartners.filter((p) => deriveStatus(p) === 'active').length;
    const expiring = bsiPartners.filter((p) => deriveStatus(p) === 'expiring_soon').length;
    const expired = bsiPartners.filter((p) => deriveStatus(p) === 'expired').length;
    const noOwner = bsiPartners.filter(
      (p) => !p.contract || !p.contract.renewal_owner || p.contract.renewal_owner === '(unassigned)'
    ).length;
    const stale = bsiPartners.filter((p) => {
      if (!p.contract || !p.contract.last_reviewed) return false;
      const months =
        (new Date().getTime() - new Date(p.contract.last_reviewed).getTime()) /
        (1000 * 60 * 60 * 24 * 30);
      return months > 12;
    }).length;

    const target = zone.target;
    const total = bsiPartners.length || 1;

    // Coverage score
    const coverage = Math.min(100, (active / target) * 100);

    // Health score
    const health = Math.max(
      0,
      Math.min(
        100,
        (active / total) * 100 -
          (expiring / total) * 30 -
          (expired / total) * 60 -
          (noOwner / total) * 20 -
          (stale / total) * 15
      )
    );

    // Pressure (inverse of competitor presence)
    const pressureInv = Math.max(0, 100 - Math.min(100, competitors.length * 5));

    // Diversity (distinct categories)
    const distinctCategories = new Set(
      bsiPartners.filter((p) => deriveStatus(p) === 'active').map((p) => p.category)
    ).size;
    const diversity = (distinctCategories / 8) * 100; // Changed from 6 to 8 categories

    // Cluster cannibalization (placeholder)
    const cluster = 100;

    // Zone Advantage Score
    const zas = 0.3 * coverage + 0.25 * health + 0.2 * pressureInv + 0.15 * diversity + 0.1 * cluster;

    scores[zoneName] = {
      zone: zoneName as ZoneName,
      coverage,
      health,
      pressureInv,
      diversity,
      cluster,
      zas,
      bsiCount: bsiPartners.length,
      activeCount: active,
      competitorCount: competitors.length,
    };
  });

  return scores as Record<ZoneName, ZoneScore>;
};

// Find whitespace opportunities
export const findWhitespace = (partners: Partner[]): WhitespaceOpportunity[] => {
  const opportunities: WhitespaceOpportunity[] = [];

  Object.entries(zones).forEach(([zoneName, zone]) => {
    if (zone.density === 'low') return;

    PARTNER_CATEGORIES.forEach((category) => {
      const bsiCount = partners.filter(
        (p) => p.zone === zoneName && p.category === category && deriveStatus(p) === 'active'
      ).length;

      // Count competitors by checking for competitor_details
      const compCount = partners.filter(
        (p) => p.zone === zoneName && p.competitor_details
      ).length;

      if (bsiCount === 0 && compCount >= 1) {
        const priority = (zone.target - bsiCount) * compCount * zone.weight;
        opportunities.push({
          zone: zoneName as ZoneName,
          zoneLabel: zone.label,
          category,
          bsiCount,
          compCount,
          priority,
        });
      }
    });
  });

  return opportunities.sort((a, b) => b.priority - a.priority).slice(0, 5);
};

// Get expiring contracts
export const getExpiringContracts = (partners: Partner[], days: number = 90): Partner[] => {
  return partners.filter((p) => {
    if (!p.contract?.end_date) return false;
    const endDate = new Date(p.contract.end_date);
    const daysUntilExpiry = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= days;
  }).sort((a, b) => {
    const aDate = new Date(a.contract!.end_date!);
    const bDate = new Date(b.contract!.end_date!);
    return aDate.getTime() - bDate.getTime();
  });
};

// Get expired contracts
export const getExpiredContracts = (partners: Partner[]): Partner[] => {
  return partners.filter((p) => deriveStatus(p) === 'expired');
};

// Get channel mix statistics
export const getChannelMix = (partners: Partner[]) => {
  const mix: Record<string, { bsi: number; competitor: number }> = {};

  PARTNER_CATEGORIES.forEach((category) => {
    const bsi = partners.filter(
      (p) => p.category === category && deriveStatus(p) === 'active'
    ).length;
    const competitor = 0; // Competitors don't have category breakdown
    mix[category] = { bsi, competitor };
  });

  return mix;
};

// Calculate dashboard KPIs
export const calculateKPIs = (partners: Partner[]) => {
  const total = partners.filter((p) => PARTNER_CATEGORIES.includes(p.category)).length;
  const active = partners.filter(
    (p) => PARTNER_CATEGORIES.includes(p.category) && deriveStatus(p) === 'active'
  ).length;
  const expiringCount = getExpiringContracts(partners).length;
  const expiredCount = getExpiredContracts(partners).length;

  const zoneScores = computeZoneScores(partners);
  const zasAvg =
    Object.values(zoneScores).reduce((sum, score) => sum + score.zas, 0) /
    Object.values(zoneScores).length;

  const whitespace = findWhitespace(partners);

  return {
    totalPartners: total,
    activePartners: active,
    activeRate: total ? Math.round((active / total) * 100) : 0,
    zasAverage: Math.round(zasAvg),
    expiringCount,
    expiredCount,
    whitespaceCount: whitespace.length,
  };
};
