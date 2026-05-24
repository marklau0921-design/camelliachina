import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  cities, tags, experiences, experienceTags, experienceTypes, experienceDetails, experienceLabels,
  teamMembers, itineraries, itineraryTags, stories, storyTags,
  videos, videoTags, images, cityExperiences, cityWhatToSee,
  homepageHero, homepageIntro, homepageStories, homepageSponsors, homepageStorySections,
  aboutSections, whyUsSections,
  type InsertCity, type InsertTag, type InsertExperience, type InsertExperienceType,
  type InsertExperienceDetail, type InsertTeamMember,
  type InsertItinerary, type InsertStory, type InsertVideo, type InsertImage,
  type InsertCityExperience, type InsertCityWhatToSee,
  type HomepageHero, type HomepageIntro, type HomepageStory, type HomepageSponsor,
  type HomepageStorySection,
  type InsertHomepageStory, type InsertHomepageSponsor, type InsertHomepageStorySection,
  type AboutSection, type InsertAboutSection,
  type WhyUsSection, type InsertWhyUsSection,
} from "../drizzle/schema";

// ─── Slug helper ─────────────────────────────────────────────────────────────
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Tags ─────────────────────────────────────────────────────────────────────
export async function listTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).orderBy(tags.type, tags.name);
}

export async function createTag(data: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(tags).values(data);
  return { id: (result as any).insertId };
}

export async function updateTag(id: number, data: Partial<InsertTag>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(tags).set(data).where(eq(tags.id, id));
}

export async function deleteTag(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(tags).where(eq(tags.id, id));
}

// ─── Cities ───────────────────────────────────────────────────────────────────
export async function listCities(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return db.select().from(cities).where(eq(cities.isActive, true)).orderBy(cities.sortOrder, cities.name);
  }
  return db.select().from(cities).orderBy(cities.sortOrder, cities.name);
}

export async function listCitiesWithExperiences() {
  const db = await getDb();
  if (!db) return [];

  // Get all cities in one query
  const cityList = await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(cities.sortOrder, cities.name);
  if (cityList.length === 0) return [];

  // Get all city-experience links in one JOIN query
  const allLinks = await db
    .select({
      cityId: cityExperiences.cityId,
      sortOrder: cityExperiences.sortOrder,
      id: experiences.id,
      name: experiences.name,
      title: experiences.title,
      slug: experiences.slug,
      typeId: experiences.typeId,
      typeName: experienceTypes.name,
    })
    .from(cityExperiences)
    .leftJoin(experiences, eq(cityExperiences.experienceId, experiences.id))
    .leftJoin(experienceTypes, eq(experiences.typeId, experienceTypes.id))
    .orderBy(cityExperiences.cityId, cityExperiences.sortOrder);

  // Group experiences by cityId
  const expsByCityId = new Map<number, typeof allLinks>();
  for (const link of allLinks) {
    if (!link.cityId) continue;
    if (!expsByCityId.has(link.cityId)) expsByCityId.set(link.cityId, []);
    expsByCityId.get(link.cityId)!.push(link);
  }

  return cityList.map(city => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    coverImage: city.coverImage,
    experiences: expsByCityId.get(city.id) || [],
  }));
}

export async function getCityBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getCityById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cities).where(eq(cities.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createCity(data: Omit<InsertCity, "slug"> & { slug?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(cities).values({ ...data, slug });
  return { id: (result as any).insertId, slug };
}

export async function updateCity(id: number, data: Partial<InsertCity>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cities).set({ ...data, updatedAt: new Date() }).where(eq(cities.id, id));
}

export async function deleteCity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cityExperiences).where(eq(cityExperiences.cityId, id));
  await db.delete(cities).where(eq(cities.id, id));
}

// ─── City Experiences (城市与体验项目的关联) ────────────────────────────────────────────────────────────────
export async function listCityExperiences(cityId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: cityExperiences.id,
      cityId: cityExperiences.cityId,
      experienceId: cityExperiences.experienceId,
      displayImage: cityExperiences.displayImage,
      sortOrder: cityExperiences.sortOrder,
      experienceName: experiences.name,
      experienceTitle: experiences.title,
      experienceSlug: experiences.slug,
      experienceDescription: experiences.description,
    })
    .from(cityExperiences)
    .leftJoin(experiences, eq(cityExperiences.experienceId, experiences.id))
    .where(eq(cityExperiences.cityId, cityId))
    .orderBy(cityExperiences.sortOrder);
  return rows;
}

export async function addCityExperience(data: InsertCityExperience) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(cityExperiences).values(data);
  return { id: (result as any).insertId };
}

export async function updateCityExperience(id: number, data: Partial<InsertCityExperience>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cityExperiences).set(data).where(eq(cityExperiences.id, id));
}

export async function removeCityExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cityExperiences).where(eq(cityExperiences.id, id));
}

// ─── City What to See and Do ──────────────────────────────────────────────────────
export async function listCityWhatToSee(cityId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: cityWhatToSee.id,
      cityId: cityWhatToSee.cityId,
      experienceId: cityWhatToSee.experienceId,
      sortOrder: cityWhatToSee.sortOrder,
      experienceName: experiences.name,
      experienceTitle: experiences.title,
      experienceSlug: experiences.slug,
      experienceDescription: experiences.description,
      cityDisplayImage: experiences.cityDisplayImage,
      experienceTypeName: experienceTypes.name,
    })
    .from(cityWhatToSee)
    .leftJoin(experiences, eq(cityWhatToSee.experienceId, experiences.id))
    .leftJoin(experienceTypes, eq(experiences.typeId, experienceTypes.id))
    .where(eq(cityWhatToSee.cityId, cityId))
    .orderBy(cityWhatToSee.sortOrder);
  return rows;
}

export async function addCityWhatToSee(data: InsertCityWhatToSee) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(cityWhatToSee).values(data);
  return { id: (result as any).insertId };
}

export async function updateCityWhatToSee(id: number, data: Partial<InsertCityWhatToSee>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(cityWhatToSee).set(data).where(eq(cityWhatToSee.id, id));
}

export async function removeCityWhatToSee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(cityWhatToSee).where(eq(cityWhatToSee.id, id));
}

// ─── Experience Types (第一层) ────────────────────────────────────────────────
export async function listExperienceTypes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experienceTypes).orderBy(experienceTypes.sortOrder, experienceTypes.name);
}

export async function getExperienceTypeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(experienceTypes).where(eq(experienceTypes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createExperienceType(data: Omit<InsertExperienceType, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(experienceTypes).values(data);
  return { id: (result as any).insertId };
}

export async function updateExperienceType(id: number, data: Partial<InsertExperienceType>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experienceTypes).set({ ...data, updatedAt: new Date() }).where(eq(experienceTypes.id, id));
}

export async function deleteExperienceType(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Delete all experiences under this type first
  const exps = await db.select({ id: experiences.id }).from(experiences).where(eq(experiences.typeId, id));
  for (const exp of exps) {
    await deleteExperience(exp.id);
  }
  await db.delete(experienceTypes).where(eq(experienceTypes.id, id));
}

export async function reorderExperienceType(id: number, newSortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experienceTypes).set({ sortOrder: newSortOrder }).where(eq(experienceTypes.id, id));
}

// 导航用：返回所有类型（按 sortOrder 排序）及其激活的子体验
export async function listExperienceTypesWithNav() {
  const db = await getDb();
  if (!db) return [];
  const types = await db.select().from(experienceTypes).orderBy(experienceTypes.sortOrder, experienceTypes.name);
  const result = await Promise.all(
    types.map(async (type) => {
      const items = await db!
        .select({ id: experiences.id, name: experiences.name, slug: experiences.slug })
        .from(experiences)
        .where(and(eq(experiences.typeId, type.id), eq(experiences.isActive, true)))
        .orderBy(experiences.sortOrder, experiences.name);
      return {
        id: type.id,
        name: type.name,
        coverImage: type.coverImage,
        items,
      };
    })
  );
  return result;
}

// ─── Experiences (第二层) ─────────────────────────────────────────────────────
export async function listExperiences(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return db.select().from(experiences).where(eq(experiences.isActive, true)).orderBy(experiences.sortOrder, experiences.name);
  }
  return db.select().from(experiences).orderBy(experiences.sortOrder, experiences.name);
}

export async function listExperiencesByType(typeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experiences).where(eq(experiences.typeId, typeId)).orderBy(experiences.sortOrder, experiences.name);
}

export async function listExperiencesByCity(cityId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experiences).where(eq(experiences.cityId, cityId)).orderBy(experiences.sortOrder, experiences.name);
}

export async function getExperienceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(experiences).where(eq(experiences.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getExperienceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(experiences).where(eq(experiences.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getExperienceTagIds(experienceId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(experienceTags).where(eq(experienceTags.experienceId, experienceId));
  return rows.map(r => r.tagId);
}

export async function createExperience(data: Omit<InsertExperience, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(experiences).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(experienceTags).values(tagIds.map(tagId => ({ experienceId: id, tagId })));
  }
  return { id, slug };
}

export async function updateExperience(id: number, data: Partial<InsertExperience>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experiences).set({ ...data, updatedAt: new Date() }).where(eq(experiences.id, id));
  if (tagIds !== undefined) {
    await db.delete(experienceTags).where(eq(experienceTags.experienceId, id));
    if (tagIds.length > 0) {
      await db.insert(experienceTags).values(tagIds.map(tagId => ({ experienceId: id, tagId })));
    }
  }
}

export async function deleteExperience(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceTags).where(eq(experienceTags.experienceId, id));
  await db.delete(experienceLabels).where(eq(experienceLabels.experienceId, id));
  await db.delete(experienceDetails).where(eq(experienceDetails.experienceId, id));
  await db.delete(experiences).where(eq(experiences.id, id));
}

export async function reorderExperience(id: number, newSortOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experiences).set({ sortOrder: newSortOrder }).where(eq(experiences.id, id));
}

// ─── Experience Details (详情模块) ────────────────────────────────────────────
export async function listExperienceDetails(experienceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(experienceDetails)
    .where(eq(experienceDetails.experienceId, experienceId))
    .orderBy(experienceDetails.sortOrder);
}

export async function createExperienceDetail(data: InsertExperienceDetail) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(experienceDetails).values(data);
  return { id: (result as any).insertId };
}

export async function updateExperienceDetail(id: number, data: Partial<InsertExperienceDetail>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(experienceDetails).set(data).where(eq(experienceDetails.id, id));
}

export async function deleteExperienceDetail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceDetails).where(eq(experienceDetails.id, id));
}

export async function replaceExperienceDetails(experienceId: number, details: Array<{ description?: string; imageUrl?: string; sortOrder: number }>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceDetails).where(eq(experienceDetails.experienceId, experienceId));
  if (details.length > 0) {
    await db.insert(experienceDetails).values(details.map(d => ({
      experienceId,
      description: d.description ?? null,
      imageUrl: d.imageUrl ?? null,
      sortOrder: d.sortOrder,
    })));
  }
}

// ─── Experience Labels (自由字符串标签，用于相似推荐) ─────────────────────────
export async function getExperienceLabels(experienceId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(experienceLabels).where(eq(experienceLabels.experienceId, experienceId));
  return rows.map(r => r.label);
}

export async function replaceExperienceLabels(experienceId: number, labels: string[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(experienceLabels).where(eq(experienceLabels.experienceId, experienceId));
  if (labels.length > 0) {
    const uniqueSet = new Set(labels.map(l => l.trim()).filter(Boolean));
    const unique = Array.from(uniqueSet);
    await db.insert(experienceLabels).values(unique.map(label => ({ experienceId, label })));
  }
}

// ─── Recommendations (基于自由标签匹配) ──────────────────────────────────────
export async function getRecommendedExperiences(experienceId: number, limit = 8) {
  const db = await getDb();
  if (!db) return [];
  // Get current experience's labels
  const currentLabels = await getExperienceLabels(experienceId);
  if (currentLabels.length === 0) {
    // No labels: return latest active experiences (excluding current)
    const results = await db.select().from(experiences)
      .where(and(eq(experiences.isActive, true), sql`${experiences.id} != ${experienceId}`))
      .orderBy(desc(experiences.createdAt))
      .limit(limit);
    // Add typeName for each experience
    return Promise.all(results.map(async (exp) => {
      if (!exp.typeId) return exp;
      const type = await getExperienceTypeById(exp.typeId);
      return { ...exp, typeName: type?.name || '' };
    }));
  }
  // Find all experiences sharing at least one label
  const allActive = await db.select().from(experiences)
    .where(and(eq(experiences.isActive, true), sql`${experiences.id} != ${experienceId}`));
  const scored: Array<{ exp: typeof allActive[0]; score: number }> = [];
  for (const exp of allActive) {
    const expLabels = await getExperienceLabels(exp.id);
    const shared = expLabels.filter(l => currentLabels.includes(l)).length;
    if (shared > 0) scored.push({ exp, score: shared });
  }
  scored.sort((a, b) => b.score - a.score);
  // Add typeName for each experience
  return Promise.all(scored.slice(0, limit).map(async (s) => {
    if (!s.exp.typeId) return s.exp;
    const type = await getExperienceTypeById(s.exp.typeId);
    return { ...s.exp, typeName: type?.name || '' };
  }));
}

// ─── Team Members ─────────────────────────────────────────────────────────────
export async function listTeamMembers(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return db.select().from(teamMembers).where(eq(teamMembers.isActive, true)).orderBy(teamMembers.sortOrder, teamMembers.name);
  }
  return db.select().from(teamMembers).orderBy(teamMembers.sortOrder, teamMembers.name);
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(teamMembers).values(data);
  return { id: (result as any).insertId };
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(teamMembers).set({ ...data, updatedAt: new Date() }).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ─── Itineraries ──────────────────────────────────────────────────────────────
export async function listItineraries(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return db.select().from(itineraries).where(eq(itineraries.isActive, true)).orderBy(itineraries.sortOrder, itineraries.name);
  }
  return db.select().from(itineraries).orderBy(itineraries.sortOrder, itineraries.name);
}

export async function getItineraryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(itineraries).where(eq(itineraries.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getItineraryTagIds(itineraryId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(itineraryTags).where(eq(itineraryTags.itineraryId, itineraryId));
  return rows.map(r => r.tagId);
}

export async function createItinerary(data: Omit<InsertItinerary, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(itineraries).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(itineraryTags).values(tagIds.map(tagId => ({ itineraryId: id, tagId })));
  }
  return { id, slug };
}

export async function updateItinerary(id: number, data: Partial<InsertItinerary>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(itineraries).set({ ...data, updatedAt: new Date() }).where(eq(itineraries.id, id));
  if (tagIds !== undefined) {
    await db.delete(itineraryTags).where(eq(itineraryTags.itineraryId, id));
    if (tagIds.length > 0) {
      await db.insert(itineraryTags).values(tagIds.map(tagId => ({ itineraryId: id, tagId })));
    }
  }
}

export async function deleteItinerary(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(itineraryTags).where(eq(itineraryTags.itineraryId, id));
  await db.delete(itineraries).where(eq(itineraries.id, id));
}

// ─── Stories ──────────────────────────────────────────────────────────────────
export async function listStories(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return db.select().from(stories).where(eq(stories.isActive, true)).orderBy(stories.sortOrder, desc(stories.createdAt));
  }
  return db.select().from(stories).orderBy(stories.sortOrder, desc(stories.createdAt));
}

export async function getStoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(stories).where(eq(stories.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getStoryTagIds(storyId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(storyTags).where(eq(storyTags.storyId, storyId));
  return rows.map(r => r.tagId);
}

export async function createStory(data: Omit<InsertStory, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.title);
  const [result] = await db.insert(stories).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(storyTags).values(tagIds.map(tagId => ({ storyId: id, tagId })));
  }
  return { id, slug };
}

export async function updateStory(id: number, data: Partial<InsertStory>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(stories).set({ ...data, updatedAt: new Date() }).where(eq(stories.id, id));
  if (tagIds !== undefined) {
    await db.delete(storyTags).where(eq(storyTags.storyId, id));
    if (tagIds.length > 0) {
      await db.insert(storyTags).values(tagIds.map(tagId => ({ storyId: id, tagId })));
    }
  }
}

export async function deleteStory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(storyTags).where(eq(storyTags.storyId, id));
  await db.delete(stories).where(eq(stories.id, id));
}

// ─── Videos ───────────────────────────────────────────────────────────────────
export async function listVideos(includeInactive = false) {
  const db = await getDb();
  if (!db) return [];
  if (!includeInactive) {
    return db.select().from(videos).where(eq(videos.isActive, true)).orderBy(videos.sortOrder, desc(videos.createdAt));
  }
  return db.select().from(videos).orderBy(videos.sortOrder, desc(videos.createdAt));
}

export async function getVideoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getVideoTagIds(videoId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(videoTags).where(eq(videoTags.videoId, videoId));
  return rows.map(r => r.tagId);
}

export async function createVideo(data: Omit<InsertVideo, "slug"> & { slug?: string }, tagIds: number[] = []) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.title);
  const [result] = await db.insert(videos).values({ ...data, slug });
  const id = (result as any).insertId;
  if (tagIds.length > 0) {
    await db.insert(videoTags).values(tagIds.map(tagId => ({ videoId: id, tagId })));
  }
  return { id, slug };
}

export async function updateVideo(id: number, data: Partial<InsertVideo>, tagIds?: number[]) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(videos).set({ ...data, updatedAt: new Date() }).where(eq(videos.id, id));
  if (tagIds !== undefined) {
    await db.delete(videoTags).where(eq(videoTags.videoId, id));
    if (tagIds.length > 0) {
      await db.insert(videoTags).values(tagIds.map(tagId => ({ videoId: id, tagId })));
    }
  }
}

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(videoTags).where(eq(videoTags.videoId, id));
  await db.delete(videos).where(eq(videos.id, id));
}

// ─── Images ───────────────────────────────────────────────────────────────────
export async function listImages(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(images).where(eq(images.category, category)).orderBy(desc(images.createdAt));
  }
  return db.select().from(images).orderBy(desc(images.createdAt));
}

export async function createImageRecord(data: InsertImage) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(images).values(data);
  return { id: (result as any).insertId };
}

export async function deleteImageRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const rows = await db.select().from(images).where(eq(images.id, id)).limit(1);
  await db.delete(images).where(eq(images.id, id));
  return rows[0] ?? null;
}

// ─── Homepage Management ──────────────────────────────────────────────────────

// Hero
export async function getHomepageHero() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(homepageHero).limit(1);
  return rows[0] ?? null;
}
export async function upsertHomepageHero(data: Partial<HomepageHero>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(homepageHero).limit(1);
  if (existing.length === 0) {
    await db.insert(homepageHero).values({
      isVisible: data.isVisible ?? true,
      backgroundImage: data.backgroundImage ?? null,
      title: data.title ?? "THE LUXURY TRAVEL EXPERTS",
      subtitle: data.subtitle ?? "TAILOR-MADE TRIPS, AWARD WINNING SERVICE. EST. 2005.",
    });
  } else {
    await db.update(homepageHero).set(data).where(eq(homepageHero.id, existing[0].id));
  }
  const rows = await db.select().from(homepageHero).limit(1);
  return rows[0];
}

// Intro
export async function getHomepageIntro() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(homepageIntro).limit(1);
  return rows[0] ?? null;
}
export async function upsertHomepageIntro(data: Partial<HomepageIntro>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(homepageIntro).limit(1);
  if (existing.length === 0) {
    await db.insert(homepageIntro).values({
      isVisible: data.isVisible ?? true,
      title: data.title ?? "THE LUXURY TRAVEL EXPERTS",
      content: data.content ?? "",
    });
  } else {
    await db.update(homepageIntro).set(data).where(eq(homepageIntro.id, existing[0].id));
  }
  const rows = await db.select().from(homepageIntro).limit(1);
  return rows[0];
}

// Stories
export async function listHomepageStories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(homepageStories).orderBy(homepageStories.sortOrder);
}
export async function createHomepageStory(data: InsertHomepageStory) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(homepageStories).values(data);
  return { id: (result as any).insertId };
}
export async function updateHomepageStory(id: number, data: Partial<HomepageStory>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(homepageStories).set(data).where(eq(homepageStories.id, id));
  const rows = await db.select().from(homepageStories).where(eq(homepageStories.id, id)).limit(1);
  return rows[0] ?? null;
}
export async function deleteHomepageStory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(homepageStories).where(eq(homepageStories.id, id));
}

// Sponsors
export async function listHomepageSponsors() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(homepageSponsors).orderBy(homepageSponsors.sortOrder);
}
export async function createHomepageSponsor(data: InsertHomepageSponsor) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(homepageSponsors).values(data);
  return { id: (result as any).insertId };
}
export async function updateHomepageSponsor(id: number, data: Partial<HomepageSponsor>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(homepageSponsors).set(data).where(eq(homepageSponsors.id, id));
  const rows = await db.select().from(homepageSponsors).where(eq(homepageSponsors.id, id)).limit(1);
  return rows[0] ?? null;
}
export async function deleteHomepageSponsor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(homepageSponsors).where(eq(homepageSponsors.id, id));
}

// Story Sections (板块标题/简述)
export async function getHomepageStorySection(sectionType: "image" | "video"): Promise<HomepageStorySection | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
  return rows[0] ?? null;
}
export async function upsertHomepageStorySection(sectionType: "image" | "video", data: Partial<InsertHomepageStorySection>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getHomepageStorySection(sectionType);
  if (existing) {
    await db.update(homepageStorySections).set(data).where(eq(homepageStorySections.sectionType, sectionType));
    const rows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
    return rows[0] ?? null;
  } else {
    await db.insert(homepageStorySections).values({ sectionType, title: "Stories From the Road", subtitle: "Real stories. Meaningful journeys.", ...data });
    const rows = await db.select().from(homepageStorySections).where(eq(homepageStorySections.sectionType, sectionType)).limit(1);
    return rows[0] ?? null;
  }
}
export async function listHomepageStoriesByType(type: "image" | "video") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(homepageStories).where(eq(homepageStories.type, type)).orderBy(homepageStories.sortOrder);
}

// ─── About Page Management ────────────────────────────────────────────────────
export async function listAboutSections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aboutSections).orderBy(aboutSections.sortOrder);
}

export async function createAboutSection(data: Omit<InsertAboutSection, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const slug = data.slug || toSlug(data.name);
  const [result] = await db.insert(aboutSections).values({ ...data, slug });
  return { id: (result as any).insertId, slug };
}

export async function updateAboutSection(id: number, data: Partial<InsertAboutSection>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(aboutSections).set({ ...data, updatedAt: new Date() }).where(eq(aboutSections.id, id));
  const rows = await db.select().from(aboutSections).where(eq(aboutSections.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteAboutSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(aboutSections).where(eq(aboutSections.id, id));
}

// ─── Why Us Sections ─────────────────────────────────────────────────────────
export async function listWhyUsSections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(whyUsSections).orderBy(whyUsSections.sortOrder);
}

export async function createWhyUsSection(data: Omit<InsertWhyUsSection, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(whyUsSections).values(data);
  return { id: (result as any).insertId };
}

export async function updateWhyUsSection(id: number, data: Partial<InsertWhyUsSection>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(whyUsSections).set({ ...data, updatedAt: new Date() }).where(eq(whyUsSections.id, id));
  const rows = await db.select().from(whyUsSections).where(eq(whyUsSections.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteWhyUsSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.delete(whyUsSections).where(eq(whyUsSections.id, id));
}
