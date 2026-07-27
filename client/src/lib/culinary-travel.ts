export type CulinaryTravelSection = {
  image: string;
  title: string;
  description: string;
};

export function parseCulinaryTravelSections(
  value: unknown,
  fallback: CulinaryTravelSection[] = []
): CulinaryTravelSection[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map(section => ({
      image: typeof section?.image === "string" ? section.image : "",
      title: typeof section?.title === "string" ? section.title : "",
      description: typeof section?.description === "string" ? section.description : "",
    }));
  } catch {
    return fallback;
  }
}

export function legacyCulinaryTravelSections(city: any): CulinaryTravelSection[] {
  return [
    {
      image: city?.culinaryTravelLargeImage || "",
      title: city?.culinaryTravelLargeTitle || "",
      description: city?.culinaryTravelLargeDescription || "",
    },
    {
      image: city?.culinaryTravelSmall1Image || "",
      title: city?.culinaryTravelSmall1Title || "",
      description: city?.culinaryTravelSmall1Description || "",
    },
    {
      image: city?.culinaryTravelSmall2Image || "",
      title: city?.culinaryTravelSmall2Title || "",
      description: city?.culinaryTravelSmall2Description || "",
    },
  ].filter(section => section.image || section.title || section.description);
}
