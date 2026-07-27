export type CulinaryTravelCard = {
  image: string;
  title: string;
  description: string;
};

export type CulinaryTravelSection = {
  large: CulinaryTravelCard;
  small1: CulinaryTravelCard;
  small2: CulinaryTravelCard;
};

export const emptyCulinaryTravelCard = (): CulinaryTravelCard => ({
  image: "",
  title: "",
  description: "",
});

export const emptyCulinaryTravelSection = (): CulinaryTravelSection => ({
  large: emptyCulinaryTravelCard(),
  small1: emptyCulinaryTravelCard(),
  small2: emptyCulinaryTravelCard(),
});

function normalizeCard(value: any): CulinaryTravelCard {
  return {
    image: typeof value?.image === "string" ? value.image : "",
    title: typeof value?.title === "string" ? value.title : "",
    description: typeof value?.description === "string" ? value.description : "",
  };
}

export function parseCulinaryTravelSections(
  value: unknown,
  fallback: CulinaryTravelSection[] = []
): CulinaryTravelSection[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return fallback;
    if (parsed.length === 0) return [];

    // Current format: every item is one complete three-card block.
    if (parsed.some(section => section?.large || section?.small1 || section?.small2)) {
      return parsed.map(section => ({
        large: normalizeCard(section?.large),
        small1: normalizeCard(section?.small1),
        small2: normalizeCard(section?.small2),
      }));
    }

    // Compatibility with the briefly used flat format: group every three cards.
    const cards = parsed.map(normalizeCard);
    const sections: CulinaryTravelSection[] = [];
    for (let index = 0; index < cards.length; index += 3) {
      sections.push({
        large: cards[index] || emptyCulinaryTravelCard(),
        small1: cards[index + 1] || emptyCulinaryTravelCard(),
        small2: cards[index + 2] || emptyCulinaryTravelCard(),
      });
    }
    return sections;
  } catch {
    return fallback;
  }
}

export function legacyCulinaryTravelSections(city: any): CulinaryTravelSection[] {
  const section = {
    large: {
      image: city?.culinaryTravelLargeImage || "",
      title: city?.culinaryTravelLargeTitle || "",
      description: city?.culinaryTravelLargeDescription || "",
    },
    small1: {
      image: city?.culinaryTravelSmall1Image || "",
      title: city?.culinaryTravelSmall1Title || "",
      description: city?.culinaryTravelSmall1Description || "",
    },
    small2: {
      image: city?.culinaryTravelSmall2Image || "",
      title: city?.culinaryTravelSmall2Title || "",
      description: city?.culinaryTravelSmall2Description || "",
    },
  };
  return Object.values(section).some(card => card.image || card.title || card.description) ? [section] : [];
}
