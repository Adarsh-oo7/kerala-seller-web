export function canUseTool(allowed, permission, isOwner = true) {
  if (!permission) return true;
  const needed = Array.isArray(permission) ? permission : [permission];
  if (allowed === null) return Boolean(isOwner);
  return needed.some((code) => allowed.includes(code));
}

export function ownerToolsWhenStaffMeMissing(isOwner, allowed) {
  if (!isOwner) return allowed || [];
  if (allowed && allowed.length > 0) return allowed;
  return null;
}

export function asList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const key of ['results', 'products', 'bills', 'addons', 'expenses', 'items', 'plans']) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
}
