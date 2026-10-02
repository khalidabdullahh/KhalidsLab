/**
 * Tools & Products Hub Component
 * Author: Khalid Abdullah
 * Interactive multi-bench studio & production software directory
 */

import { TOOLS } from "../data/tools.js";
import { ATSAnalyzer } from "./InteractiveTools/ATSAnalyzer.js";
import { RegimeSimulator } from "./InteractiveTools/RegimeSimulator.js";
import { KellyCalculator } from "./InteractiveTools/KellyCalculator.js";
import { VectorNormVisualizer } from "./InteractiveTools/VectorNormVisualizer.js";

export class ToolsSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeBench = "cv-builder"; // "cv-builder" | "regime-simulator" | "kelly-calc" | "vector-visualizer"
    this.toolInstance = null;

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
    this.mountActiveTool();
  }

  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>🛠️</span>
              <span>TOOLS & PRODUCTS HUB // USABLE ARTIFACTS</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-display">
              Interactive Tools & Production Software
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              «What people can actually use.» Test live AI resume builders, algorithmic simulators, and launch production web apps directly from this hub.
            </p>
          </div>

          <!-- Bench Selector Pills -->
          <div class="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface-elevated border border-border shadow-md">
            <button class="bench-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${this.activeBench === "cv-builder" ? "bg-cyan text-black shadow-md" : "text-text-secondary hover:text-text-primary"}" data-bench="cv-builder">
              📄 AI CV Studio
            </button>
            <button class="bench-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${this.activeBench === "regime-simulator" ? "bg-cyan text-black shadow-md" : "text-text-secondary hover:text-text-primary"}" data-bench="regime-simulator">
              📈 Market Regime
            </button>
            <button class="bench-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${this.activeBench === "kelly-calc" ? "bg-cyan text-black shadow-md" : "text-text-secondary hover:text-text-primary"}" data-bench="kelly-calc">
              🎲 Kelly Sizer
            </button>
            <button class="bench-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${this.activeBench === "vector-visualizer" ? "bg-cyan text-black shadow-md" : "text-text-secondary hover:text-text-primary"}" data-bench="vector-visualizer">
              📐 Vector Space
            </button>
          </div>
        </div>

        <!-- 1. Interactive Tool In-Browser Workbench -->
        <div class="mb-16 rounded-3xl bg-surface-elevated/40 border border-cyan/30 shadow-2xl overflow-hidden relative">
          <!-- Dynamic Mount Container for Active Interactive Tool -->
          <div id="interactive-tool-mount"></div>
        </div>

        <!-- 2. Product Ecosystem Directory -->
        <div class="flex items-center justify-between mb-8 pb-3 border-b border-border">
          <h3 class="text-xs font-mono font-bold tracking-widest text-text-muted uppercase">
            PRODUCTION SOFTWARE & PRODUCT ECOSYSTEM
          </h3>
          <span class="text-xs font-mono text-cyan">${TOOLS.length} Verified Production Artifacts</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${TOOLS.map(tool => `
            <div class="tool-card group relative p-6 rounded-2xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-surface-elevated border border-border text-cyan">
                    ${tool.category}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                    tool.statusColor === "emerald" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" :
                    tool.statusColor === "amber" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                    "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                  }">
                    ● ${tool.status}
                  </span>
                </div>

                <h4 class="text-lg font-bold text-text-primary group-hover:text-cyan transition-colors tracking-tight font-mono">
                  ${tool.name}
                </h4>

                <p class="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                  ${tool.description}
                </p>

                <!-- Capabilities list -->
                <ul class="space-y-1.5 mt-4 pt-3 border-t border-border/60">
                  ${tool.capabilities.slice(0, 3).map(cap => `
                    <li class="flex items-start gap-2 text-[11px] text-text-secondary">
                      <span class="text-cyan font-bold">✓</span>
                      <span class="line-clamp-1">${cap}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>

              <!-- Footer Actions -->
              <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between gap-2">
                <span class="text-[11px] font-mono text-text-muted">${tool.pricing}</span>

                ${tool.benchId ? `
                  <button class="launch-bench-btn text-xs font-mono font-bold text-cyan hover:underline flex items-center gap-1 cursor-pointer" data-bench="${tool.benchId}">
                    <span>${tool.actionLabel}</span>
                  </button>
                ` : tool.isInteractiveInSite ? `
                  <button class="launch-bench-btn text-xs font-mono font-bold text-cyan hover:underline flex items-center gap-1 cursor-pointer" data-bench="cv-builder">
                    <span>${tool.actionLabel}</span>
                  </button>
                ` : `
                  <a href="${tool.externalUrl}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono font-bold text-cyan hover:underline flex items-center gap-1">
                    <span>${tool.actionLabel}</span>
                  </a>
                `}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Bench tab buttons
    this.container.querySelectorAll(".bench-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeBench = btn.dataset.bench;
        this.container.querySelectorAll(".bench-tab-btn").forEach(b => {
          b.className = "bench-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer text-text-secondary hover:text-text-primary";
        });
        btn.className = "bench-tab-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer bg-cyan text-black shadow-md";
        this.mountActiveTool();
      });
    });

    // Launch bench button on tool cards
    this.container.querySelectorAll(".launch-bench-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const benchId = btn.dataset.bench;
        if (benchId) {
          this.activeBench = benchId;
          this.render();
          this.bindEvents();
          this.mountActiveTool();
          const mount = document.getElementById("interactive-tool-mount");
          mount?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  mountActiveTool() {
    const mountPoint = document.getElementById("interactive-tool-mount");
    if (!mountPoint) return;

    mountPoint.innerHTML = "";

    switch (this.activeBench) {
      case "regime-simulator":
        this.toolInstance = new RegimeSimulator("interactive-tool-mount");
        break;
      case "kelly-calc":
        this.toolInstance = new KellyCalculator("interactive-tool-mount");
        break;
      case "vector-visualizer":
        this.toolInstance = new VectorNormVisualizer("interactive-tool-mount");
        break;
      case "cv-builder":
      default:
        this.toolInstance = new ATSAnalyzer("interactive-tool-mount");
        break;
    }
  }
}
