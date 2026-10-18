
// Astro v5+ content collections config
// Docs: https://docs.astro.build/en/guides/content-collections/

import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    gallery: z.array(z.object({
      src: z.string(),
      alt: z.string(),
    })).default([]),
    description: z.string(),
    thumbnail: z.string().optional(),
    video: z.string().optional(),
    tags: z.array(z.string()).default([]),
    url: z.string().url().optional(),    
    repo: z.string().url().optional(),       
    date: z.coerce.date(),                    // string or Date
    featured: z.boolean().default(false),
  }),
});

const creations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/creations" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().optional(),
    tags: z.array(z.string()).default([]),
    url: z.string().url().optional(),    
    repo: z.string().url().optional(),       
    date: z.coerce.date(),                    // handles string or Date
    featured: z.boolean().default(false),
  }),
});

const design = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/design" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(["poster", "ui", "visual"]),
    date: z.coerce.date(),
    tools: z.array(z.string()).default([]),
    gallery: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .min(1),
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/papers" }),
  schema: z.object({
    title: z.string(),
    abstract: z.string().optional(),
    url: z.string().url().optional(),        
    date: z.coerce.date(),
    published_in: z.string().optional(),      // journal/conference name
    pdf_url: z.string().url().optional(),
    coauthors: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    repo: z.string().url().optional(), 
  }),
});

export const collections = { projects, creations, papers, design };
