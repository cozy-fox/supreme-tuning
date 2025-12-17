/**
 * Brand Groups Configuration
 * Defines performance divisions for brands like Audi RS, BMW M, Mercedes-AMG
 */

// Brand IDs from the database
const BRAND_IDS = {
  AUDI: 1,
  BMW: 2,
  MERCEDES: 4,
};

/**
 * Configuration for brands that have performance divisions
 * Each brand can have multiple groups (e.g., Standard + RS)
 */
export const BRAND_GROUPS = {
  [BRAND_IDS.AUDI]: {
    brandName: 'Audi',
    hasGroups: true,
    groups: [
      {
        id: 'standard',
        name: 'Audi',
        displayName: 'Non-RS',
        description: 'Reguliere Audi modellen',
        logo: 'Audi.png',
        // Models that belong to the standard group (exclude RS models)
        modelFilter: (model) => !isAudiRSModel(model.name),
      },
      {
        id: 'rs',
        name: 'Audi RS',
        displayName: 'RS',
        description: 'Audi RS & S Performance modellen',
        logo: 'Audi RS.png',
        // Models that belong to RS group
        modelFilter: (model) => isAudiRSModel(model.name),
      },
    ],
  },
  [BRAND_IDS.BMW]: {
    brandName: 'BMW',
    hasGroups: true,
    groups: [
      {
        id: 'standard',
        name: 'BMW',
        displayName: 'Non-M',
        description: 'Reguliere BMW modellen',
        logo: 'BMW.png',
        modelFilter: (model) => !isBMWMModel(model.name),
      },
      {
        id: 'm',
        name: 'BMW M',
        displayName: 'M',
        description: 'BMW M Performance modellen',
        logo: 'BMW M.png',
        modelFilter: (model) => isBMWMModel(model.name),
      },
    ],
  },
  [BRAND_IDS.MERCEDES]: {
    brandName: 'Mercedes',
    hasGroups: true,
    groups: [
      {
        id: 'standard',
        name: 'Mercedes',
        displayName: 'Non-AMG',
        description: 'Reguliere Mercedes modellen',
        logo: 'Mercedes.png',
        modelFilter: (model) => !isMercedesAMGModel(model.name),
      },
      {
        id: 'amg',
        name: 'Mercedes-AMG',
        displayName: 'AMG',
        description: 'Mercedes-AMG Performance modellen',
        logo: 'Mercedes-AMG.png',
        modelFilter: (model) => isMercedesAMGModel(model.name),
      },
    ],
  },
};

/**
 * Check if an Audi model is an RS/S performance model
 */
export function isAudiRSModel(modelName) {
  const name = modelName.toUpperCase();
  // RS models: RS3, RS4, RS5, RS6, RS7, RS Q3, RS Q8, RSQ3, RSQ8, TT RS, etc.
  // S models: S3, S4, S5, S6, S7, S8, SQ5, SQ7, SQ8, TTS, etc.

  // Check for RS models (RS followed by number or space)
  if (/^RS[0-9\s]/.test(name) || /^RSQ[0-9]/.test(name)) return true;

  // Check for S models (S followed by number, but not regular models like "Sportback")
  if (/^S[0-9]/.test(name) || /^SQ[0-9]/.test(name)) return true;

  // Check for TT RS or TTS
  if (name === 'TT RS' || name === 'TTS') return true;

  // Check for models with RS in the name (e.g., "Q3 RS")
  if (name.includes(' RS')) return true;

  return false;
}

/**
 * Check if a BMW model is an M performance model
 */
export function isBMWMModel(modelName) {
  const name = modelName.toUpperCase();
  // M models: M2, M3, M4, M5, M6, M8, X3 M, X4 M, X5 M, X6 M, XM, 1M

  // Check for M followed by number (M2, M3, M4, M5, M6, M8)
  if (/^M[0-9]/.test(name)) return true;

  // Check for X models with M suffix (X3 M, X4 M, X5 M, X6 M)
  if (/^X[0-9]\s*M/.test(name)) return true;

  // Check for XM
  if (name === 'XM') return true;

  // Check for 1M Coupé
  if (name.startsWith('1M')) return true;

  return false;
}

/**
 * Check if a Mercedes model is an AMG performance model
 */
export function isMercedesAMGModel(modelName) {
  const name = modelName.toUpperCase();
  // AMG models: AMG GT, models with AMG in name
  return name.includes('AMG');
}

/**
 * Get group configuration for a brand
 */
export function getBrandGroupConfig(brandId) {
  return BRAND_GROUPS[brandId] || null;
}

/**
 * Check if a brand has groups
 */
export function brandHasGroups(brandId) {
  return BRAND_GROUPS[brandId]?.hasGroups || false;
}

/**
 * Get the group ID for a model based on its name
 */
export function getModelGroup(brandId, modelName) {
  const config = BRAND_GROUPS[brandId];
  if (!config) return 'standard';
  
  for (const group of config.groups) {
    if (group.modelFilter({ name: modelName })) {
      return group.id;
    }
  }
  return 'standard';
}

/**
 * Filter models by group
 */
export function filterModelsByGroup(brandId, models, groupId) {
  const config = BRAND_GROUPS[brandId];
  if (!config) return models;
  
  const group = config.groups.find(g => g.id === groupId);
  if (!group) return models;
  
  return models.filter(group.modelFilter);
}

export { BRAND_IDS };

