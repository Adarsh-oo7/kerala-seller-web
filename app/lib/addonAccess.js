function featureLabel(code) {
  return String(code || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function addonFitsPlan(addon, planId) {
  const ids = addon?.compatible_plan_ids || [];
  if (!ids.length) return true;
  if (planId == null) return true;
  return ids.includes(planId);
}

export function addonCapacityLines(addon) {
  const lines = [];
  if (addon?.extra_product_limit) lines.push(`+${addon.extra_product_limit} products`);
  if (addon?.extra_staff_limit) lines.push(`+${addon.extra_staff_limit} staff logins`);
  if (addon?.extra_branch_limit) {
    lines.push(`+${addon.extra_branch_limit} location${addon.extra_branch_limit === 1 ? '' : 's'}`);
  }
  if (addon?.extra_category_limit) lines.push(`+${addon.extra_category_limit} categories`);
  (addon?.feature_codes || []).forEach((code) => lines.push(featureLabel(code)));
  return lines;
}

export function addonIsOwned(addon, activeIds) {
  return new Set(activeIds || []).has(addon.id);
}

export function addonHasCapacityBump(addon) {
  return Boolean(
    addon?.extra_product_limit
    || addon?.extra_staff_limit
    || addon?.extra_branch_limit
    || addon?.extra_category_limit,
  );
}

export function addonIncludedInPlan(addon, featureCodes) {
  const codes = addon?.feature_codes || [];
  if (!codes.length || addonHasCapacityBump(addon)) return false;
  const have = new Set(featureCodes || []);
  if (!have.size) return false;
  return codes.every((code) => have.has(code));
}

function catalogRowFromActive(row) {
  if (row?.id == null || !row.name) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price ?? 0,
    description: row.description,
    billing_period: row.billing_period,
    extra_product_limit: row.extra_product_limit,
    extra_staff_limit: row.extra_staff_limit,
    extra_branch_limit: row.extra_branch_limit,
    extra_category_limit: row.extra_category_limit,
    feature_codes: row.feature_codes,
    compatible_plan_ids: row.compatible_plan_ids,
  };
}

export function mergeAddonCatalog(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const addon of list || []) {
      if (addon == null || addon.id == null) continue;
      const prev = byId.get(addon.id);
      byId.set(addon.id, prev ? { ...prev, ...addon } : addon);
    }
  }
  return [...byId.values()].sort((a, b) => {
    const priceDiff = Number(a.price || 0) - Number(b.price || 0);
    if (priceDiff !== 0) return priceDiff;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

export function collectAddonCatalog(sources = {}) {
  const fromActive = (sources.activeAddons || []).map(catalogRowFromActive).filter(Boolean);
  return mergeAddonCatalog(fromActive, sources.publicAddons, sources.entitlementsAddons);
}

export function addonPurchaseCounts(activeAddons) {
  const counts = new Map();
  for (const row of activeAddons || []) {
    if (row?.id == null) continue;
    counts.set(row.id, (counts.get(row.id) || 0) + 1);
  }
  return counts;
}

export function addonBuyLabel(addon, purchasedCount = 0) {
  if (addonHasCapacityBump(addon) && purchasedCount > 0) return 'Add another';
  return `Add ${addon.name}`;
}

export function addonNeedHint(addon, purchasedCount = 0) {
  if (addonHasCapacityBump(addon)) {
    if (purchasedCount > 0) {
      return `Already on this shop ×${purchasedCount}. Add another if this shop needs a higher cap.`;
    }
    return 'Buy this only if this shop needs extra capacity. You can add it more than once.';
  }
  return 'Buy this only if this shop needs it. One purchase is enough.';
}

export function partitionAddons(addons, { planId, activeIds, featureCodes } = {}) {
  const active = new Set(activeIds || []);
  const compatible = [];
  const onPlan = [];
  const included = [];
  const otherPlans = [];
  for (const addon of addons || []) {
    if (!addonFitsPlan(addon, planId)) {
      otherPlans.push(addon);
      continue;
    }
    if (addonHasCapacityBump(addon)) {
      compatible.push(addon);
      continue;
    }
    if (addonIsOwned(addon, active)) included.push(addon);
    else if (addonIncludedInPlan(addon, featureCodes)) onPlan.push(addon);
    else compatible.push(addon);
  }
  return { compatible, onPlan, included, otherPlans };
}

export function addonCatalogIsEmpty(groups) {
  return groups.compatible.length === 0
    && groups.onPlan.length === 0
    && groups.included.length === 0
    && groups.otherPlans.length === 0;
}
