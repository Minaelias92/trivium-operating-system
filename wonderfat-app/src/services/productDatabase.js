// Product analysis service
// Uses Open Food Facts API for barcode lookups
// and local scoring algorithm for health ratings

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2/product';

// Additive risk levels based on scientific research
const ADDITIVE_RISKS = {
  high: [
    'e102', 'e104', 'e110', 'e122', 'e124', 'e129', 'e131', 'e132', 'e133',
    'e142', 'e151', 'e155', 'e160b', 'e210', 'e211', 'e212', 'e213', 'e214',
    'e215', 'e216', 'e217', 'e218', 'e219', 'e220', 'e221', 'e222', 'e223',
    'e224', 'e225', 'e226', 'e227', 'e228', 'e230', 'e231', 'e232', 'e233',
    'e249', 'e250', 'e251', 'e252', 'e310', 'e311', 'e312', 'e319', 'e320',
    'e321', 'e338', 'e339', 'e340', 'e341', 'e343', 'e407', 'e450', 'e451',
    'e452', 'e621', 'e627', 'e631', 'e635', 'e900', 'e950', 'e951', 'e952',
    'e954', 'e955', 'e962',
  ],
  moderate: [
    'e100', 'e101', 'e120', 'e140', 'e141', 'e150a', 'e150b', 'e150c',
    'e150d', 'e153', 'e160a', 'e160c', 'e160d', 'e160e', 'e161b', 'e162',
    'e163', 'e170', 'e171', 'e172', 'e200', 'e201', 'e202', 'e203', 'e234',
    'e235', 'e260', 'e261', 'e262', 'e263', 'e270', 'e280', 'e281', 'e282',
    'e283', 'e290', 'e296', 'e297', 'e300', 'e301', 'e302', 'e303', 'e304',
    'e306', 'e307', 'e308', 'e309',
  ],
  low: [
    'e322', 'e325', 'e326', 'e327', 'e330', 'e331', 'e332', 'e333', 'e334',
    'e335', 'e336', 'e337', 'e375', 'e392', 'e400', 'e401', 'e402', 'e403',
    'e404', 'e405', 'e406', 'e407a', 'e410', 'e412', 'e414', 'e415', 'e416',
    'e417', 'e418', 'e420', 'e421', 'e422', 'e440', 'e460', 'e461', 'e462',
    'e463', 'e464', 'e465', 'e466', 'e470', 'e471', 'e472',
  ],
};

// Known harmful ingredients in cosmetics/skincare
const HARMFUL_SKINCARE_INGREDIENTS = {
  high: [
    'parabens', 'methylparaben', 'propylparaben', 'butylparaben',
    'formaldehyde', 'phthalates', 'dibutyl phthalate',
    'sodium lauryl sulfate', 'sls', 'sodium laureth sulfate', 'sles',
    'triclosan', 'oxybenzone', 'hydroquinone', 'lead',
    'coal tar', 'petroleum', 'petrolatum', 'mineral oil',
    'synthetic fragrance', 'parfum', 'bha', 'bht',
    'silicone', 'dimethicone', 'cyclomethicone',
    'polyethylene glycol', 'peg',
  ],
  moderate: [
    'phenoxyethanol', 'retinyl palmitate', 'aluminium',
    'ethanol', 'isopropyl alcohol', 'ceteareth',
    'polysorbate', 'triethanolamine',
  ],
  safe: [
    'tallow', 'grass-fed tallow', 'beef tallow',
    'manuka honey', 'jojoba oil', 'mango butter',
    'shea butter', 'coconut oil', 'olive oil',
    'vitamin e', 'tocopherol', 'aloe vera',
    'beeswax', 'cocoa butter', 'argan oil',
    'rosehip oil', 'avocado oil', 'hemp seed oil',
    'chamomile', 'calendula', 'lavender',
  ],
};

export async function lookupProduct(barcode) {
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      return normalizeProduct(data.product, barcode);
    }
    return null;
  } catch (error) {
    console.error('Product lookup failed:', error);
    return null;
  }
}

function normalizeProduct(product, barcode) {
  const nutriments = product.nutriments || {};
  const isFood = !product.categories_tags?.some(c =>
    c.includes('beauty') || c.includes('cosmetic') || c.includes('personal-care')
  );

  return {
    barcode,
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || 'Unknown Brand',
    image: product.image_front_url || product.image_url || null,
    categories: product.categories || '',
    isFood,
    ingredients: product.ingredients_text || product.ingredients_text_en || '',
    ingredientsList: (product.ingredients || []).map(i => ({
      name: i.text || i.id,
      percent: i.percent_estimate,
    })),
    additives: product.additives_tags || [],
    allergens: product.allergens_tags || [],
    labels: product.labels || '',
    isOrganic: (product.labels_tags || []).some(l =>
      l.includes('organic') || l.includes('bio')
    ),
    nutriScore: product.nutriscore_grade || null,
    novaGroup: product.nova_group || null,
    ecoScore: product.ecoscore_grade || null,
    nutrition: {
      energy: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
      fat: nutriments.fat_100g || 0,
      saturatedFat: nutriments['saturated-fat_100g'] || 0,
      sugars: nutriments.sugars_100g || 0,
      salt: nutriments.salt_100g || 0,
      fiber: nutriments.fiber_100g || 0,
      proteins: nutriments.proteins_100g || 0,
      carbs: nutriments.carbohydrates_100g || 0,
    },
    servingSize: product.serving_size || '100g',
  };
}

export function calculateHealthScore(product) {
  if (!product) return { score: 0, breakdown: {} };

  if (product.isFood) {
    return calculateFoodScore(product);
  }
  return calculateCosmeticScore(product);
}

function calculateFoodScore(product) {
  // 60% nutritional quality, 30% additives, 10% organic
  const nutritionScore = calculateNutritionScore(product.nutrition);
  const additiveScore = calculateAdditiveScore(product.additives);
  const organicBonus = product.isOrganic ? 10 : 0;

  const totalScore = Math.round(
    nutritionScore * 0.6 +
    additiveScore * 0.3 +
    organicBonus
  );

  const finalScore = Math.max(0, Math.min(100, totalScore));

  return {
    score: finalScore,
    breakdown: {
      nutrition: { score: nutritionScore, weight: '60%' },
      additives: { score: additiveScore, weight: '30%' },
      organic: { score: organicBonus * 10, weight: '10%', isOrganic: product.isOrganic },
    },
    concerns: identifyConcerns(product),
    positives: identifyPositives(product),
  };
}

function calculateNutritionScore(nutrition) {
  let score = 70; // Start at 70 (neutral-good)

  // Penalties for unhealthy nutrients (per 100g)
  if (nutrition.sugars > 22.5) score -= 25;
  else if (nutrition.sugars > 11.25) score -= 15;
  else if (nutrition.sugars > 5) score -= 5;

  if (nutrition.saturatedFat > 5) score -= 20;
  else if (nutrition.saturatedFat > 2.5) score -= 10;
  else if (nutrition.saturatedFat > 1) score -= 3;

  if (nutrition.salt > 1.5) score -= 20;
  else if (nutrition.salt > 0.75) score -= 10;
  else if (nutrition.salt > 0.3) score -= 3;

  if (nutrition.energy > 400) score -= 10;
  else if (nutrition.energy > 250) score -= 5;

  // Bonuses for healthy nutrients
  if (nutrition.fiber > 6) score += 15;
  else if (nutrition.fiber > 3) score += 8;

  if (nutrition.proteins > 15) score += 10;
  else if (nutrition.proteins > 8) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateAdditiveScore(additives) {
  if (!additives || additives.length === 0) return 100;

  let score = 100;
  const normalizedAdditives = additives.map(a =>
    a.replace('en:', '').toLowerCase()
  );

  for (const additive of normalizedAdditives) {
    if (ADDITIVE_RISKS.high.includes(additive)) {
      score -= 20;
    } else if (ADDITIVE_RISKS.moderate.includes(additive)) {
      score -= 8;
    } else if (ADDITIVE_RISKS.low.includes(additive)) {
      score -= 2;
    } else {
      score -= 5; // Unknown additive
    }
  }

  return Math.max(0, score);
}

function calculateCosmeticScore(product) {
  const ingredientsText = (product.ingredients || '').toLowerCase();
  let score = 80;
  const concerns = [];
  const positives = [];

  for (const ingredient of HARMFUL_SKINCARE_INGREDIENTS.high) {
    if (ingredientsText.includes(ingredient)) {
      score -= 15;
      concerns.push({ ingredient, risk: 'high', description: `Contains ${ingredient} - potentially harmful` });
    }
  }

  for (const ingredient of HARMFUL_SKINCARE_INGREDIENTS.moderate) {
    if (ingredientsText.includes(ingredient)) {
      score -= 7;
      concerns.push({ ingredient, risk: 'moderate', description: `Contains ${ingredient} - use with caution` });
    }
  }

  for (const ingredient of HARMFUL_SKINCARE_INGREDIENTS.safe) {
    if (ingredientsText.includes(ingredient)) {
      score += 3;
      positives.push({ ingredient, description: `Contains ${ingredient} - natural & beneficial` });
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    breakdown: {
      ingredients: { score: finalScore, weight: '100%' },
    },
    concerns,
    positives,
  };
}

function identifyConcerns(product) {
  const concerns = [];
  const n = product.nutrition;

  if (n.sugars > 22.5) concerns.push({ type: 'High Sugar', value: `${n.sugars}g/100g`, severity: 'high' });
  else if (n.sugars > 11.25) concerns.push({ type: 'Moderate Sugar', value: `${n.sugars}g/100g`, severity: 'moderate' });

  if (n.saturatedFat > 5) concerns.push({ type: 'High Saturated Fat', value: `${n.saturatedFat}g/100g`, severity: 'high' });
  if (n.salt > 1.5) concerns.push({ type: 'High Salt', value: `${n.salt}g/100g`, severity: 'high' });
  else if (n.salt > 0.75) concerns.push({ type: 'Moderate Salt', value: `${n.salt}g/100g`, severity: 'moderate' });

  if (product.additives?.length > 5) {
    concerns.push({ type: 'Many Additives', value: `${product.additives.length} additives`, severity: 'moderate' });
  }

  return concerns;
}

function identifyPositives(product) {
  const positives = [];
  const n = product.nutrition;

  if (product.isOrganic) positives.push({ type: 'Organic', description: 'Certified organic product' });
  if (n.fiber > 6) positives.push({ type: 'High Fiber', value: `${n.fiber}g/100g` });
  if (n.proteins > 15) positives.push({ type: 'High Protein', value: `${n.proteins}g/100g` });
  if (!product.additives || product.additives.length === 0) positives.push({ type: 'No Additives', description: 'No artificial additives' });
  if (n.sugars < 5) positives.push({ type: 'Low Sugar', value: `${n.sugars}g/100g` });

  return positives;
}

// Sample WonderFat products for demo
export const WONDERFAT_PRODUCTS = {
  'WONDERFAT001': {
    barcode: 'WONDERFAT001',
    name: 'WonderFat Whipped Tallow Balm',
    brand: 'WonderFat',
    image: null,
    categories: 'Skincare, Moisturizer',
    isFood: false,
    ingredients: 'Grass-Fed Beef Tallow, Manuka Honey, Jojoba Oil, Mango Butter, Vitamin E (Tocopherol)',
    ingredientsList: [
      { name: 'Grass-Fed Beef Tallow', percent: 55 },
      { name: 'Manuka Honey', percent: 15 },
      { name: 'Jojoba Oil', percent: 15 },
      { name: 'Mango Butter', percent: 10 },
      { name: 'Vitamin E (Tocopherol)', percent: 5 },
    ],
    additives: [],
    allergens: [],
    labels: 'Clean Beauty, No Synthetic Fragrance',
    isOrganic: false,
    nutrition: {},
  },
};
