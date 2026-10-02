/**
 * Tools & Products Hub Dataset
 * Author: Khalid Abdullah
 */

export const TOOLS = [
  {
    id: "tool-devils-door",
    name: "Devil's Door",
    tagline: "Endless Dark Fantasy 2.5D action-platformer with 6 playable ninja & samurai heroes.",
    category: "Game Engineering",
    icon: "swords",
    status: "Live / Playable",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "https://devils-door.vercel.app/",
    featured: true,
    badge: "Playable Game",
    description: "An atmospheric 2.5D dark fantasy action-platformer featuring 6 distinct hero classes (Shadow Ninja, Ronin, Oni Warrior, Cursed Monk, Assassin, Void Entity), dynamic biome cycles, and 60 FPS canvas combat physics.",
    capabilities: [
      "6 Playable Hero Classes with unique sprites, movement physics, and signature combat abilities",
      "Dynamic Biome Engine with 6 signature visual environments cycling every 3 minutes",
      "60 FPS 2.5D Canvas Physics Engine with frame-locked combat and dash strikes",
      "Playable directly in modern desktop and mobile web browsers without installation"
    ],
    pricing: "100% Free / Play Online",
    actionLabel: "Play Devil's Door ↗",
    github: "https://github.com/khalidabdullahh/DevilsDoor",
    relatedProject: "proj-devil-door"
  },
  {
    id: "tool-khalids-lab-cms",
    name: "KhalidsLab Admin Studio",
    tagline: "In-browser Git-based CMS & Markdown authoring workbench.",
    category: "Developer Tools",
    icon: "terminal",
    status: "Live / Active",
    statusColor: "emerald",
    isInteractiveInSite: false,
    externalUrl: "admin.html",
    featured: true,
    badge: "Built-in Tool",
    description: "A lightweight, secure CMS and Markdown authoring studio built directly into KhalidsLab for publishing articles and managing engineering case studies.",
    capabilities: [
      "Rich Markdown formatting toolbar with real-time live preview",
      "Drag-and-Drop and file selector image embedding",
      "Git-backed flat file content architecture with zero server overhead",
      "Word count and estimated reading time telemetry"
    ],
    pricing: "Internal Tool",
    actionLabel: "Launch Studio ↗",
    github: "https://github.com/khalidabdullahh/KhalidsLab",
    relatedProject: "proj-khalids-lab"
  }
];
