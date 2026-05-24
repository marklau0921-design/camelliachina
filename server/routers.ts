import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sendContactEmail } from "./mailer";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { enquiries, cityExperiences, experiences } from "../drizzle/schema";
import { desc, eq, notInArray } from "drizzle-orm";
import { ENV } from "./_core/env";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import {
  createMediaAsset, listMediaAssets, listHomepageAssets, getActiveHomepageAsset, getActiveBanners,
  setAssetActive, updateAssetSortOrder, replaceMediaAsset, deleteMediaAsset, getMediaAsset,
} from "./db-media";
import { storagePut, UPLOADS_ROOT } from "./storage";
import {
  listTags, createTag, updateTag, deleteTag,
  listCities, getCityById, createCity, updateCity, deleteCity, listCitiesWithExperiences,
  listCityExperiences, addCityExperience, updateCityExperience, removeCityExperience,
  listCityWhatToSee, addCityWhatToSee, updateCityWhatToSee, removeCityWhatToSee,
  // Experience types (第一层)
  listExperienceTypes, getExperienceTypeById, createExperienceType, updateExperienceType, deleteExperienceType, reorderExperienceType, listExperienceTypesWithNav,
  // Experiences (第二层)
  listExperiences, listExperiencesByType, listExperiencesByCity, getExperienceById, getExperienceTagIds, createExperience, updateExperience, deleteExperience, reorderExperience,
  // Experience details & labels (第三层)
  listExperienceDetails, createExperienceDetail, updateExperienceDetail, deleteExperienceDetail, replaceExperienceDetails,
  getExperienceLabels, replaceExperienceLabels,
  // Team Members
  listTeamMembers, getTeamMemberById, createTeamMember, updateTeamMember, deleteTeamMember,
  // Other CMS
  listItineraries, getItineraryById, getItineraryTagIds, createItinerary, updateItinerary, deleteItinerary,
  listStories, getStoryById, getStoryTagIds, createStory, updateStory, deleteStory,
  listVideos, getVideoById, getVideoTagIds, createVideo, updateVideo, deleteVideo,
  listImages, createImageRecord, deleteImageRecord,
  getRecommendedExperiences,
} from "./db-cms";

const ADMIN_COOKIE = "admin_session";

function getAdminCookie(req: { headers: { cookie?: string } }): string | undefined {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[ADMIN_COOKIE];
}

function getAdminTokenFromHeader(headers: Record<string, string | string[] | undefined>): string | undefined {
  const auth = headers["x-admin-token"];
  if (!auth) return undefined;
  return Array.isArray(auth) ? auth[0] : auth;
}

async function signAdminToken() {
  const secret = new TextEncoder().encode(ENV.cookieSecret || "admin-secret");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyAdminToken(token: string) {
  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret || "admin-secret");
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

async function requireAdmin(ctx: { req: { headers: Record<string, string | string[] | undefined> } }) {
  // Support both cookie (legacy) and x-admin-token header (localStorage-based)
  const tokenFromHeader = getAdminTokenFromHeader(ctx.req.headers);
  const tokenFromCookie = getAdminCookie(ctx.req as any);
  const token = tokenFromHeader || tokenFromCookie;
  if (!token || !(await verifyAdminToken(token))) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}

// ─── Zod schemas ─────────────────────────────────────────────────────────────
const tagInput = z.object({
  name: z.string().min(1),
  type: z.enum(["city", "experience_type", "other"]).default("other"),
  color: z.string().default("#888888"),
});

const cityInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  // City card image for Other Popular Destinations
  cityCardImage: z.string().optional(),
  // Introduction section
  introductionTitle: z.string().optional(),
  introductionDescription: z.string().optional(),
  // Culinary Travel section
  culinaryTravelLargeImage: z.string().optional(),
  culinaryTravelLargeTitle: z.string().optional(),
  culinaryTravelLargeDescription: z.string().optional(),
  culinaryTravelSmall1Image: z.string().optional(),
  culinaryTravelSmall1Title: z.string().optional(),
  culinaryTravelSmall1Description: z.string().optional(),
  culinaryTravelSmall2Image: z.string().optional(),
  culinaryTravelSmall2Title: z.string().optional(),
  culinaryTravelSmall2Description: z.string().optional(),
  // Call to Action
  ctaBgColor: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

const experienceTypeInput = z.object({
  name: z.string().min(1),
  coverImage: z.string().optional(),
  sortOrder: z.number().default(0),
});

const experienceInput = z.object({
  typeId: z.number().optional().nullable(),
  name: z.string().min(1),
  slug: z.string().optional(),
  when: z.string().optional(),
  price: z.string().optional(),
  duration: z.string().optional(),
  gallery: z.string().optional(),   // JSON array string
  description: z.string().optional(),
  ctaBgColor: z.string().default("#1a1a1a"),
  recommendationImage: z.string().optional(),  // 推荐卡片预览图
  recommendationTitle: z.string().optional(),  // 推荐卡片标题
  recommendationDescription: z.string().optional(),  // 推荐卡片描述
  cityDisplayImage: z.string().optional(),  // 城市页面 What to See and Do 展示图
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const experienceDetailInput = z.object({
  experienceId: z.number(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().default(0),
});

const detailBlockSchema = z.object({
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number(),
});

const teamMemberInput = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio1: z.string().optional(),
  bio2: z.string().optional(),
  quote: z.string().optional(),
  image: z.string().optional(),
  specialty: z.string().optional(),
  storyTitle: z.string().optional(),
  storySubtitle: z.string().optional(),
  storyText: z.string().optional(),
  storyImage: z.string().optional(),
  storyImage2: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

const itineraryInput = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  days: z.number().min(1).default(1),
  price: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  maxPeople: z.number().optional(),
  details: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.number()).default([]),
});

const storyInput = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.number()).default([]),
});

const videoInput = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().min(1),
  coverImage: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  tagIds: z.array(z.number()).default([]),
});

// ─── Router ───────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Admin auth ──────────────────────────────────────────────────────────
  admin: router({
    check: publicProcedure.query(async ({ ctx }) => {
      const tokenFromHeader = getAdminTokenFromHeader(ctx.req.headers as Record<string, string | string[] | undefined>);
      const tokenFromCookie = getAdminCookie(ctx.req as any);
      const token = tokenFromHeader || tokenFromCookie;
      if (!token) return { authenticated: false };
      const valid = await verifyAdminToken(token);
      return { authenticated: valid };
    }),

    login: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const correctPassword = ENV.adminPassword;
        if (!correctPassword || input.password !== correctPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid password" });
        }
        const token = await signAdminToken();
        // Also set cookie as fallback
        try {
          const cookieOpts = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(ADMIN_COOKIE, token, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
        } catch { /* ignore cookie errors */ }
        // Return token so frontend can store in localStorage
        return { success: true, token };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOpts = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(ADMIN_COOKIE, { ...cookieOpts, maxAge: -1 });
      return { success: true };
    }),

    listEnquiries: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      const db = await getDb();
      if (!db) return [];
      return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
    }),

    getEnquiry: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const rows = await db.select().from(enquiries).where(eq(enquiries.id, input.id));
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        return rows[0];
      }),

    // ── Tags ────────────────────────────────────────────────────────────────
    listTags: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listTags();
    }),

    createTag: publicProcedure
      .input(tagInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createTag(input);
      }),

    updateTag: publicProcedure
      .input(z.object({ id: z.number() }).merge(tagInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateTag(id, data);
        return { success: true };
      }),

    deleteTag: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteTag(input.id);
        return { success: true };
      }),

    // ── Cities ──────────────────────────────────────────────────────────────
    listCities: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listCities(true);
    }),

    getCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const city = await getCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),

    getCityById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const city = await getCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),

    createCity: publicProcedure
      .input(cityInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createCity(input);
      }),

    updateCity: publicProcedure
      .input(z.object({ id: z.number() }).merge(cityInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateCity(id, data);
        return { success: true };
      }),

    deleteCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteCity(input.id);
        return { success: true };
      }),


    // ── City Experiences ──────────────────────────────────────────────────────
    listCityExperiences: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listCityExperiences(input.cityId);
      }),

    addCityExperience: publicProcedure
      .input(z.object({
        cityId: z.number(),
        experienceId: z.number(),
        displayImage: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return addCityExperience(input);
      }),

    updateCityExperience: publicProcedure
      .input(z.object({
        id: z.number(),
        displayImage: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateCityExperience(id, data);
        return { success: true };
      }),

    removeCityExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await removeCityExperience(input.id);
        return { success: true };
      }),


    // ── City What to See and Do ──────────────────────────────────────────────
    listCityWhatToSee: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listCityWhatToSee(input.cityId);
      }),

    addCityWhatToSee: publicProcedure
      .input(z.object({
        cityId: z.number(),
        experienceId: z.number(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return addCityWhatToSee({
          cityId: input.cityId,
          experienceId: input.experienceId,
          sortOrder: input.sortOrder ?? 0,
        });
      }),

    updateCityWhatToSee: publicProcedure
      .input(z.object({
        id: z.number(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateCityWhatToSee(id, data);
        return { success: true };
      }),

    removeCityWhatToSee: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await removeCityWhatToSee(input.id);
        return { success: true };
      }),

    // ── Experience Types (第一层) ────────────────────────────────────────────
    listExperienceTypes: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listExperienceTypes();
    }),

    getExperienceType: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const type = await getExperienceTypeById(input.id);
        if (!type) throw new TRPCError({ code: "NOT_FOUND" });
        return type;
      }),

    createExperienceType: publicProcedure
      .input(experienceTypeInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createExperienceType(input);
      }),

    updateExperienceType: publicProcedure
      .input(z.object({ id: z.number() }).merge(experienceTypeInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateExperienceType(id, data);
        return { success: true };
      }),

    deleteExperienceType: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteExperienceType(input.id);
        return { success: true };
      }),

    reorderExperienceType: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderExperienceType(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Experiences (第二层) ─────────────────────────────────────────────────
    listExperiences: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listExperiences(true);
    }),

    listExperiencesByType: publicProcedure
      .input(z.object({ typeId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listExperiencesByType(input.typeId);
      }),

    getExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const exp = await getExperienceById(input.id);
        if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
        const details = await listExperienceDetails(input.id);
        const labels = await getExperienceLabels(input.id);
        return { ...exp, details, labels };
      }),

    createExperience: publicProcedure
      .input(experienceInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createExperience(input, []);
      }),

    updateExperience: publicProcedure
      .input(z.object({ id: z.number() }).merge(experienceInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateExperience(id, data);
        return { success: true };
      }),

    deleteExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteExperience(input.id);
        return { success: true };
      }),

    reorderExperience: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderExperience(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Experiences by City ────────────────────────────────────────────────────────
    listExperiencesByCity: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listExperiencesByCity(input.cityId);
      }),

    // Get all available experiences for selection (not yet associated with a city)
    listAvailableExperiencesForCity: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const db = await getDb();
        if (!db) return [];
        // Get all experiences that are not yet associated with this city
        const associated = await db
          .select({ experienceId: cityExperiences.experienceId })
          .from(cityExperiences)
          .where(eq(cityExperiences.cityId, input.cityId));
        const associatedIds = associated.map(a => a.experienceId);
        // Return all experiences except those already associated
        const allExps = await listExperiences(true);
        return allExps.filter(exp => !associatedIds.includes(exp.id));
      }),

    createExperienceForCity: publicProcedure
      .input(z.object({ cityId: z.number() }).merge(experienceInput))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { cityId, ...data } = input;
        return createExperience({ ...data, cityId, typeId: null }, []);
      }),

    deleteExperienceFromCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteExperience(input.id);
        return { success: true };
      }),

    reorderExperienceInCity: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await reorderExperience(input.id, input.sortOrder);
        return { success: true };
      }),

    // ── Copy Experience to another type ──────────────────────────────────────
    copyExperience: publicProcedure
      .input(z.object({
        id: z.number(),
        targetSlugPrefix: z.string(),
        targetTypeId: z.number().optional().nullable(),
        targetCityId: z.number().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const src = await getExperienceById(input.id);
        if (!src) throw new TRPCError({ code: 'NOT_FOUND', message: 'Source experience not found' });
        const srcDetails = await listExperienceDetails(input.id);
        const srcLabels = await getExperienceLabels(input.id);

        const newSlug = `${input.targetSlugPrefix}-${src.slug}`;

        const newExp = await createExperience({
          typeId: input.targetTypeId ?? null,
          cityId: input.targetCityId ?? null,
          name: src.name,
          slug: newSlug,
          when: src.when ?? undefined,
          price: src.price ?? undefined,
          duration: src.duration ?? undefined,
          gallery: src.gallery ?? undefined,
          description: src.description ?? undefined,
          ctaBgColor: (src as any).ctaBgColor ?? '#1a1a1a',
          isActive: false,
          sortOrder: 0,
        }, []);

        // Copy details
        if (srcDetails.length > 0) {
          await replaceExperienceDetails(newExp.id, srcDetails.map((d: any, i: number) => ({
            description: d.description ?? undefined,
            imageUrl: d.imageUrl ?? undefined,
            sortOrder: i,
          })));
        }

        // Copy labels
        if (srcLabels.length > 0) {
          await replaceExperienceLabels(newExp.id, srcLabels);
        }

        return { success: true, newId: newExp.id, newSlug };
      }),

    // ── Experience Details (第三层详情模块) ──────────────────────────────────
    listExperienceDetails: publicProcedure
      .input(z.object({ experienceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listExperienceDetails(input.experienceId);
      }),

    saveExperienceDetails: publicProcedure
      .input(z.object({
        experienceId: z.number(),
        details: z.array(detailBlockSchema),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await replaceExperienceDetails(input.experienceId, input.details);
        return { success: true };
      }),

    // ── Experience Labels (相似推荐标签) ─────────────────────────────────────
    getExperienceLabels: publicProcedure
      .input(z.object({ experienceId: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return getExperienceLabels(input.experienceId);
      }),

    saveExperienceLabels: publicProcedure
      .input(z.object({
        experienceId: z.number(),
        labels: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await replaceExperienceLabels(input.experienceId, input.labels);
        return { success: true };
      }),

    // ── Team Members ───────────────────────────────────────────────────────
    listTeamMembers: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listTeamMembers(true);
    }),

    getTeamMember: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const member = await getTeamMemberById(input.id);
        if (!member) throw new TRPCError({ code: "NOT_FOUND" });
        return member;
      }),

    createTeamMember: publicProcedure
      .input(teamMemberInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return createTeamMember(input);
      }),

    updateTeamMember: publicProcedure
      .input(z.object({ id: z.number() }).merge(teamMemberInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, ...data } = input;
        await updateTeamMember(id, data);
        return { success: true };
      }),

    deleteTeamMember: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteTeamMember(input.id);
        return { success: true };
      }),

    // ── Itineraries ─────────────────────────────────────────────────────────
    listItineraries: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listItineraries(true);
    }),

    getItinerary: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const itin = await getItineraryById(input.id);
        if (!itin) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getItineraryTagIds(input.id);
        return { ...itin, tagIds };
      }),

    createItinerary: publicProcedure
      .input(itineraryInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { tagIds, ...data } = input;
        return createItinerary(data, tagIds);
      }),

    updateItinerary: publicProcedure
      .input(z.object({ id: z.number() }).merge(itineraryInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, tagIds, ...data } = input;
        await updateItinerary(id, data, tagIds);
        return { success: true };
      }),

    deleteItinerary: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteItinerary(input.id);
        return { success: true };
      }),

    // ── Stories ─────────────────────────────────────────────────────────────
    listStories: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listStories(true);
    }),

    getStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const story = await getStoryById(input.id);
        if (!story) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getStoryTagIds(input.id);
        return { ...story, tagIds };
      }),

    createStory: publicProcedure
      .input(storyInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { tagIds, ...data } = input;
        return createStory(data, tagIds);
      }),

    updateStory: publicProcedure
      .input(z.object({ id: z.number() }).merge(storyInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, tagIds, ...data } = input;
        await updateStory(id, data, tagIds);
        return { success: true };
      }),

    deleteStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteStory(input.id);
        return { success: true };
      }),

    // ── Videos ──────────────────────────────────────────────────────────────
    listVideos: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx);
      return listVideos(true);
    }),

    getVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const video = await getVideoById(input.id);
        if (!video) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getVideoTagIds(input.id);
        return { ...video, tagIds };
      }),

    createVideo: publicProcedure
      .input(videoInput)
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { tagIds, ...data } = input;
        return createVideo(data, tagIds);
      }),

    updateVideo: publicProcedure
      .input(z.object({ id: z.number() }).merge(videoInput.partial()))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const { id, tagIds, ...data } = input;
        await updateVideo(id, data, tagIds);
        return { success: true };
      }),

    deleteVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await deleteVideo(input.id);
        return { success: true };
      }),

    // ── Images ──────────────────────────────────────────────────────────────
    listImages: publicProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listImages(input.category);
      }),

    deleteImage: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const record = await deleteImageRecord(input.id);
        if (record?.storagePath) {
          const fullPath = path.join(process.cwd(), "public", record.storagePath);
          try { fs.unlinkSync(fullPath); } catch { /* ignore */ }
        }
        return { success: true };
      }),
  }),

  // ─── Public CMS queries (for frontend) ──────────────────────────────────
  cms: router({
    listTags: publicProcedure.query(() => listTags()),

    listCities: publicProcedure.query(() => listCities(false)),

    listCitiesWithExperiences: publicProcedure.query(() => listCitiesWithExperiences()),

    getCityBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getCityBySlug } = await import("./db-cms");
        const city = await getCityBySlug(input.slug);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),

    listExperienceTypes: publicProcedure.query(() => listExperienceTypes()),

    listExperienceTypesWithNav: publicProcedure.query(() => listExperienceTypesWithNav()),

    listExperiencesByType: publicProcedure
      .input(z.object({ typeId: z.number() }))
      .query(({ input }) => listExperiencesByType(input.typeId)),

    listExperiences: publicProcedure
      .input(z.object({ typeId: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.typeId) return listExperiencesByType(input.typeId);
        return listExperiences(false);
      }),

    getExperienceBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getExperienceBySlug } = await import("./db-cms");
        const exp = await getExperienceBySlug(input.slug);
        if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
        const details = await listExperienceDetails(exp.id);
        const labels = await getExperienceLabels(exp.id);
        const recommended = await getRecommendedExperiences(exp.id, 8);
        return { ...exp, details, labels, recommended };
      }),

    listTeamMembers: publicProcedure.query(() => listTeamMembers(false)),

    listItineraries: publicProcedure.query(() => listItineraries(false)),

    getItineraryBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { itineraries } = await import("../drizzle/schema");
        const rows = await db.select().from(itineraries).where(eq(itineraries.slug, input.slug)).limit(1);
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getItineraryTagIds(rows[0].id);
        return { ...rows[0], tagIds };
      }),

    listStories: publicProcedure.query(() => listStories(false)),

    getStoryBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { stories } = await import("../drizzle/schema");
        const rows = await db.select().from(stories).where(eq(stories.slug, input.slug)).limit(1);
        if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getStoryTagIds(rows[0].id);
        return { ...rows[0], tagIds };
      }),

    listVideos: publicProcedure.query(() => listVideos(false)),

    listCityWhatToSee: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(({ input }) => listCityWhatToSee(input.cityId)),
    // Team Members (by ID)
    getTeamMember: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const member = await getTeamMemberById(input.id);
        if (!member) throw new TRPCError({ code: "NOT_FOUND" });
        return member;
      }),
    // City by ID
    getCity: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const city = await getCityById(input.id);
        if (!city) throw new TRPCError({ code: "NOT_FOUND" });
        return city;
      }),
    // Experience by ID
    getExperience: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const exp = await getExperienceById(input.id);
        if (!exp) throw new TRPCError({ code: "NOT_FOUND" });
        return exp;
      }),
    // Itinerary by ID
    getItinerary: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const itin = await getItineraryById(input.id);
        if (!itin) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getItineraryTagIds(input.id);
        return { ...itin, tagIds };
      }),
    // Story by ID
    getStory: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const story = await getStoryById(input.id);
        if (!story) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getStoryTagIds(input.id);
        return { ...story, tagIds };
      }),
    // Video by ID
    getVideo: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const video = await getVideoById(input.id);
        if (!video) throw new TRPCError({ code: "NOT_FOUND" });
        const tagIds = await getVideoTagIds(input.id);
        return { ...video, tagIds };
      }),
  }),

  // ─── Image upload (multipart handled in Express) ─────────────────────────
  images: router({
    upload: publicProcedure
      .input(z.object({
        filename: z.string(),
        base64: z.string(),
        mimeType: z.string(),
        category: z.string().default("other"),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const imagesDir = path.join(UPLOADS_ROOT, "images");
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        const ext = path.extname(input.filename) || ".jpg";
        const uniqueName = `${nanoid()}-${Date.now()}${ext}`;
        const filePath = path.join(imagesDir, uniqueName);
        const buffer = Buffer.from(input.base64, "base64");
        fs.writeFileSync(filePath, buffer);

        const storagePath = `/uploads/images/${uniqueName}`;
        const record = await createImageRecord({
          filename: input.filename,
          storagePath,
          fileSize: buffer.byteLength,
          mimeType: input.mimeType,
          category: input.category,
          description: input.description,
          uploadedBy: "admin",
        });

        return { id: record.id, url: storagePath, filename: uniqueName };
      }),
  }),

  // ─── Media Library ─────────────────────────────────────────────────────
  media: router({
    // 统一上传接口（base64）
    upload: publicProcedure
      .input(z.object({
        filename: z.string(),
        base64: z.string(),
        mimeType: z.string().default("image/jpeg"),
        fileSize: z.number().optional(),
        source: z.string().default("general"),
        sourceId: z.number().optional(),
        sourceLabel: z.string().optional(),
        sourceUrl: z.string().optional(),
        assetType: z.enum(["logo", "banner", "cta", "general"]).default("general"),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const buffer = Buffer.from(input.base64, "base64");
        const ext = path.extname(input.filename) || ".jpg";
        const storageKey = `media/${nanoid()}${ext}`;
        const { key, url } = await storagePut(storageKey, buffer, input.mimeType);
        const asset = await createMediaAsset({
          url,
          storageKey: key,
          filename: input.filename,
          mimeType: input.mimeType,
          fileSize: input.fileSize ?? buffer.byteLength,
          source: input.source,
          sourceId: input.sourceId,
          sourceLabel: input.sourceLabel,
          sourceUrl: input.sourceUrl,
          assetType: input.assetType,
          isActive: true,
          sortOrder: 0,
        });
        return { id: asset?.insertId, url, key };
      }),

    // 列出所有媒体资产（支持搜索）
    list: publicProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listMediaAssets(input.search);
      }),

    // 列出 Homepage Assets（按类型）
    listByType: publicProcedure
      .input(z.object({ assetType: z.enum(["logo", "banner", "cta"]) }))
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        return listHomepageAssets(input.assetType);
      }),

    // 公开接口：获取首页动态资产
    getHomepageAssets: publicProcedure.query(async () => {
      const [logo, cta, banners] = await Promise.all([
        getActiveHomepageAsset("logo"),
        getActiveHomepageAsset("cta"),
        getActiveBanners(),
      ]);
      return { logo, cta, banners };
    }),

    // 设置激活状态
    setActive: publicProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean(),
        assetType: z.enum(["logo", "banner", "cta"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await setAssetActive(input.id, input.isActive, input.assetType);
        return { success: true };
      }),

    // 更新排序
    updateSortOrder: publicProcedure
      .input(z.object({ id: z.number(), sortOrder: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        await updateAssetSortOrder(input.id, input.sortOrder);
        return { success: true };
      }),

    // 替换图片（保持原记录，更新 URL）
    replace: publicProcedure
      .input(z.object({
        id: z.number(),
        filename: z.string(),
        base64: z.string(),
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const buffer = Buffer.from(input.base64, "base64");
        const ext = path.extname(input.filename) || ".jpg";
        const storageKey = `media/${nanoid()}${ext}`;
        const { key, url } = await storagePut(storageKey, buffer, input.mimeType);
        await replaceMediaAsset(input.id, url, key, input.filename);
        return { url };
      }),

    // 删除媒体资产
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await requireAdmin(ctx);
        const asset = await getMediaAsset(input.id);
        if (!asset) throw new TRPCError({ code: "NOT_FOUND" });
        // 检查引用：sourceUrl 不为空说明被引用
        if (asset.sourceUrl) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This image is currently in use.",
          });
        }
                // 删除本地文件
        if (asset.storageKey) {
          const { storageDelete } = await import("./storage");
          storageDelete(asset.storageKey);
        }
        await deleteMediaAsset(input.id);
        return { success: true };
      }),
  }),
    // ─── Contact form ────────────────────────────────────────────────────────
  contact: router({
    submit: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().default(""),
        email: z.string().email(),
        phone: z.string().min(1),
        destination: z.string().default(""),
        month: z.string().default(""),
        year: z.string().default(""),
        duration: z.string().default(""),
        groupSize: z.string().default(""),
        budget: z.string().default(""),
        hearAboutUs: z.string().default(""),
        message: z.string().default(""),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (db) await db.insert(enquiries).values({
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            destination: input.destination || null,
            month: input.month || null,
            year: input.year || null,
            duration: input.duration || null,
            groupSize: input.groupSize || null,
            budget: input.budget || null,
            hearAboutUs: input.hearAboutUs || null,
            message: input.message || null,
          });
        } catch (dbError) {
          console.error("[Contact] Failed to save enquiry to DB:", dbError);
        }
        try {
          await sendContactEmail(input);
        } catch (error) {
          console.error("[Contact] Failed to send email:", error);
        }
        return { success: true };
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user || (ctx.user.role !== "admin" && ctx.user.role !== "user")) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];
      return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
    }),
  }),
});

export type AppRouter = typeof appRouter;
