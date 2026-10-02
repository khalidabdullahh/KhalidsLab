/**
 * Projects Showcase Dataset
 * Author: Khalid Abdullah
 */

export const PROJECTS = [
  {
    id: "proj-devil-door",
    title: "Devil's Door — 2.5D Dark Fantasy Action Platformer",
    tagline: "Atmospheric Action-Platformer with 6 Hero Classes & Procedural Biome Cycles",
    category: "Game Engineering & Systems",
    featured: true,
    status: "Live / Playable",
    statusColor: "emerald",
    year: "2026",
    technologies: ["HTML5 Canvas", "2.5D Physics", "Verlet Ribbons", "Web Audio API", "Vercel"],
    shortDescription: "An atmospheric 2.5D dark fantasy action-platformer featuring 6 distinct hero classes (Shadow Ninja, Ronin, Oni Warrior, Cursed Monk, Assassin, Void Entity), dynamic biome cycles, and 60 FPS canvas combat physics.",
    problem: "Web action games often suffer from imprecise hitboxes, floaty jump physics, and repetitive static environments that fail to keep players immersed.",
    solution: "Engineered a zero-lag 2.5D canvas game engine with frame-locked input buffering, directional dash mechanics, Verlet ribbon physics for hero scarves, and procedural biome cycles evolving every 180 seconds across 6 dark fantasy environments.",
    highlights: [
      "6 Playable Hero Classes with unique physics, dashes, and combat traits",
      "Dynamic Biome Engine cycling through 6 visual environments every 3 minutes",
      "60 FPS hardware-accelerated Canvas engine with zero frame drops",
      "Touch gamepad for mobile and keyboard arrow controls for desktop",
      "Runs directly in the browser with zero installations"
    ],
    liveUrl: "https://devils-door.vercel.app/",
    githubUrl: "https://github.com/khalidabdullahh/DevilsDoor",
    badge: "Flagship Game"
  },
  {
    id: "proj-khalids-lab",
    title: "Khalid's Lab — Personal Digital Lab & Innovation Hub",
    tagline: "Live Portfolio, Research Workbench & Git-Powered CMS Engine",
    category: "Web Engineering & Architecture",
    featured: true,
    status: "Live / Production",
    statusColor: "emerald",
    year: "2026",
    technologies: ["Vanilla JS", "Tailwind CSS", "Cloudflare Pages", "GitHub API", "Git CMS"],
    shortDescription: "Personal digital laboratory featuring real-time GitHub telemetry sync, interactive simulators, live post management, and client-side Markdown rendering.",
    problem: "Traditional developer portfolios are static and tedious to update, quickly becoming outdated brochures rather than active representations of ongoing engineering work.",
    solution: "Designed a Git-backed living lab where updates, articles, and GitHub commits stream in real-time, coupled with an in-browser Admin Studio CMS for instant publishing without bulky server infrastructure.",
    highlights: [
      "Integrated Git-Based Admin Studio with live Markdown preview & image uploader",
      "Real-time GitHub activity sync for repositories and latest push events",
      "Sub-millisecond static edge performance hosted on Cloudflare Pages",
      "Cyber-dark theme with clean typographic hierarchy"
    ],
    liveUrl: "https://khalidslab.pages.dev",
    githubUrl: "https://github.com/khalidabdullahh/KhalidsLab",
    badge: "Active Lab"
  }
];
