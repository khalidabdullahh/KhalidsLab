/**
 * Live GitHub Repositories Showcase & Interactive README Reader
 * Author: Khalid Abdullah
 * Features:
 *  - Real-time GitHub API Repository Telemetry
 *  - 1-Click Live README.md Fetch & Markdown Rendering Modal
 *  - Repository Search & Language Filter
 *  - Copy Clone URL & Quick GitHub Navigation
 */

import { PROJECTS } from "../data/projects.js";
import { githubService } from "../services/GitHubService.js";

export class ProjectsSection {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.readmeCache = new Map();
    this.activeRepo = null;
    this.searchQuery = "";
    this.selectedLanguage = "all";

    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.bindEvents();
  }

  getFilteredRepos() {
    const liveRepos = githubService.repos || [];
    return liveRepos.filter(repo => {
      const matchesSearch = !this.searchQuery || 
        repo.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesLang = this.selectedLanguage === "all" || 
        (repo.language && repo.language.toLowerCase() === this.selectedLanguage.toLowerCase());

      return matchesSearch && matchesLang;
    });
  }

  getAvailableLanguages() {
    const liveRepos = githubService.repos || [];
    const langs = new Set();
    liveRepos.forEach(r => {
      if (r.language && r.language !== "Unknown") langs.add(r.language);
    });
    return Array.from(langs);
  }

  render() {
    const featuredProjects = PROJECTS.filter(p => p.featured);
    const supportingProjects = PROJECTS.filter(p => !p.featured);
    const filteredRepos = this.getFilteredRepos();
    const availableLangs = this.getAvailableLanguages();

    const lastSyncLabel = githubService.lastSyncTime 
      ? `Synced ${githubService.getTimeAgo(githubService.lastSyncTime.toISOString())}`
      : "Auto-synced";

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <!-- Section Header -->
        <div class="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan uppercase mb-2">
              <span>📂</span>
              <span>GITHUB REPOSITORIES // LIVE README SHOWCASE</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight font-display">
              Open Source Repositories & Documentation
            </h2>
            <p class="text-base text-text-secondary mt-2 max-w-2xl">
              Explore live code repositories with direct in-browser <code class="text-cyan font-mono font-bold">README.md</code> documentation reader.
            </p>
          </div>

          <!-- Controls: Sync Button & Search -->
          <div class="flex flex-wrap items-center gap-3">
            <button id="btn-sync-github" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-border border border-border hover:border-cyan/40 text-xs font-mono font-bold text-cyan transition-all shadow-sm cursor-pointer" title="Fetch latest updates from GitHub">
              <span id="sync-icon" class="inline-block">🔄</span>
              <span id="sync-label">Sync Repos</span>
            </button>

            <div class="px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-mono text-text-muted flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span id="sync-status-text">${lastSyncLabel} (@khalidabdullahh)</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="mb-8 p-4 rounded-2xl bg-surface-elevated border border-border flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div class="relative flex-1 min-w-[240px]">
            <input type="text" id="repo-search-input" value="${this.searchQuery}" placeholder="Search repositories by name or keyword..." class="w-full px-4 py-2 rounded-xl bg-surface border border-border focus:border-cyan text-xs font-mono text-text-primary placeholder:text-text-muted/60 focus:outline-none" />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button class="lang-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${this.selectedLanguage === "all" ? "bg-cyan text-black" : "bg-surface hover:bg-border text-text-secondary"}" data-lang="all">
              All (${githubService.repos.length})
            </button>
            ${availableLangs.map(lang => `
              <button class="lang-filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${this.selectedLanguage.toLowerCase() === lang.toLowerCase() ? "bg-cyan text-black" : "bg-surface hover:bg-border text-text-secondary"}" data-lang="${lang}">
                ${lang}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Repositories Grid -->
        ${filteredRepos.length === 0 ? `
          <div class="p-12 text-center rounded-3xl bg-surface border border-border">
            <p class="text-sm font-mono text-text-muted">No repositories match your filter query.</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${filteredRepos.map(repo => `
              <div class="group relative p-6 rounded-2xl bg-surface border border-border hover:border-cyan/50 hover:bg-surface-elevated/70 transition-all duration-300 flex flex-col justify-between shadow-xl repo-card cursor-pointer" data-repo-name="${repo.name}" data-repo-url="${repo.htmlUrl}">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="flex items-center gap-1.5 text-xs font-mono text-text-muted">
                      <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${githubService.getLanguageColor(repo.language)}"></span>
                      <span class="font-bold text-text-primary">${repo.language}</span>
                    </span>
                    <span class="text-[11px] font-mono text-text-muted">${githubService.getTimeAgo(repo.pushedAt)}</span>
                  </div>

                  <h3 class="text-lg font-bold text-text-primary group-hover:text-cyan transition-colors font-mono tracking-tight mb-2 flex items-center justify-between">
                    <span class="truncate">${repo.name}</span>
                    <span class="text-xs font-mono text-cyan opacity-0 group-hover:opacity-100 transition-opacity">📖 Readme ↗</span>
                  </h3>

                  <p class="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    ${repo.description || "No description provided for this repository."}
                  </p>
                </div>

                <!-- Card Footer Actions -->
                <div class="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-xs font-mono">
                  <div class="flex items-center gap-3">
                    <span class="text-amber-400 font-bold flex items-center gap-1">
                      <span>★</span>
                      <span>${repo.stars}</span>
                    </span>
                    <span class="text-text-muted flex items-center gap-1">
                      <span>🍴</span>
                      <span>${repo.forks}</span>
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button class="btn-open-readme px-3 py-1.5 rounded-lg bg-cyan/15 hover:bg-cyan text-cyan hover:text-black border border-cyan/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1" data-repo-name="${repo.name}">
                      <span>📖 README</span>
                    </button>
                    <a href="${repo.htmlUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-surface-elevated hover:bg-border border border-border text-text-muted hover:text-text-primary transition-all" title="View on GitHub" onclick="event.stopPropagation()">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <!-- Live README Reader Modal -->
      <div id="readme-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div class="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-3xl border border-cyan/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          
          <!-- Modal Header -->
          <div class="p-5 sm:p-6 bg-surface-elevated border-b border-border flex items-center justify-between gap-4 shrink-0">
            <div class="flex items-center gap-3 truncate">
              <div class="p-2 rounded-xl bg-cyan/15 text-cyan border border-cyan/30 text-lg">
                📖
              </div>
              <div class="truncate">
                <div class="flex items-center gap-2">
                  <h3 id="readme-modal-title" class="text-base sm:text-lg font-bold text-text-primary font-mono truncate"></h3>
                  <span id="readme-modal-badge" class="px-2 py-0.5 rounded text-[10px] font-mono bg-surface text-cyan border border-cyan/30"></span>
                </div>
                <p id="readme-modal-subtitle" class="text-xs text-text-muted truncate mt-0.5"></p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <a id="readme-modal-github-link" href="#" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-surface hover:bg-border border border-border text-xs font-mono text-cyan transition-all hidden sm:flex items-center gap-1.5">
                <span>View on GitHub</span>
                <span>↗</span>
              </a>
              <button id="btn-close-readme-modal" class="p-2 rounded-xl bg-surface hover:bg-rose-500/20 text-text-muted hover:text-rose-400 border border-border transition-all cursor-pointer text-sm font-bold">
                ✕
              </button>
            </div>
          </div>

          <!-- Modal Body (Rendered Markdown) -->
          <div id="readme-modal-content" class="p-6 sm:p-8 overflow-y-auto text-xs sm:text-sm leading-relaxed space-y-4 font-sans text-text-secondary markdown-body">
            <!-- Loading skeleton or Markdown -->
          </div>

          <!-- Modal Footer -->
          <div class="p-4 bg-surface-elevated/80 border-t border-border flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
            <div class="flex items-center gap-2 text-text-muted">
              <span>Clone:</span>
              <code id="readme-clone-cmd" class="px-2 py-1 rounded bg-surface border border-border text-cyan select-all">git clone https://github.com/khalidabdullahh/...</code>
            </div>

            <button id="btn-copy-clone-cmd" class="px-3 py-1.5 rounded-lg bg-surface hover:bg-cyan hover:text-black border border-border text-text-primary transition-all cursor-pointer font-bold">
              📋 Copy Clone URL
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Sync Button
    const syncBtn = document.getElementById("btn-sync-github");
    const syncIcon = document.getElementById("sync-icon");
    const syncLabel = document.getElementById("sync-label");

    syncBtn?.addEventListener("click", async () => {
      syncIcon?.classList.add("animate-spin");
      if (syncLabel) syncLabel.textContent = "Syncing...";

      await githubService.sync(true);

      syncIcon?.classList.remove("animate-spin");
      if (syncLabel) syncLabel.textContent = "Synced!";
      setTimeout(() => {
        if (syncLabel) syncLabel.textContent = "Sync Repos";
      }, 2000);
    });

    // Search Input
    const searchInput = document.getElementById("repo-search-input");
    searchInput?.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.render();
      this.bindEvents();
      // Restore cursor focus
      const updatedInput = document.getElementById("repo-search-input");
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
      }
    });

    // Language Filter Buttons
    this.container.querySelectorAll(".lang-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.selectedLanguage = btn.dataset.lang;
        this.render();
        this.bindEvents();
      });
    });

    // Repo Cards & Open Readme Buttons
    this.container.querySelectorAll(".repo-card, .btn-open-readme").forEach(el => {
      el.addEventListener("click", (e) => {
        const repoName = el.dataset.repoName;
        if (repoName) this.openReadmeModal(repoName);
      });
    });

    // Close Modal Button & Overlay Click
    const modal = document.getElementById("readme-modal");
    const closeBtn = document.getElementById("btn-close-readme-modal");

    closeBtn?.addEventListener("click", () => this.closeReadmeModal());
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) this.closeReadmeModal();
    });

    // Copy Clone Command Button
    const copyCloneBtn = document.getElementById("btn-copy-clone-cmd");
    copyCloneBtn?.addEventListener("click", () => {
      if (!this.activeRepo) return;
      const cmd = `git clone https://github.com/khalidabdullahh/${this.activeRepo.name}.git`;
      navigator.clipboard.writeText(cmd);
      copyCloneBtn.textContent = "✓ Copied!";
      setTimeout(() => {
        copyCloneBtn.textContent = "📋 Copy Clone URL";
      }, 2000);
    });

    // ESC Key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeReadmeModal();
    });

    window.addEventListener("github-sync-complete", () => {
      this.render();
      this.bindEvents();
    });
  }

  async openReadmeModal(repoName) {
    const repo = (githubService.repos || []).find(r => r.name.toLowerCase() === repoName.toLowerCase());
    if (!repo) return;

    this.activeRepo = repo;
    const modal = document.getElementById("readme-modal");
    const modalTitle = document.getElementById("readme-modal-title");
    const modalSubtitle = document.getElementById("readme-modal-subtitle");
    const modalBadge = document.getElementById("readme-modal-badge");
    const modalGithubLink = document.getElementById("readme-modal-github-link");
    const modalContent = document.getElementById("readme-modal-content");
    const cloneCmd = document.getElementById("readme-clone-cmd");

    if (modalTitle) modalTitle.textContent = repo.name;
    if (modalSubtitle) modalSubtitle.textContent = repo.description || "GitHub Repository Documentation";
    if (modalBadge) modalBadge.textContent = repo.language || "Repository";
    if (modalGithubLink) modalGithubLink.href = repo.htmlUrl;
    if (cloneCmd) cloneCmd.textContent = `git clone https://github.com/khalidabdullahh/${repo.name}.git`;

    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
    }

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="p-12 text-center space-y-3">
          <div class="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs font-mono text-cyan">Fetching README.md from GitHub...</p>
        </div>
      `;
    }

    // Fetch README content
    const readmeMarkdown = await this.fetchReadme(repo.name, repo.defaultBranch || "main");
    if (modalContent) {
      modalContent.innerHTML = this.renderMarkdown(readmeMarkdown, repo.name);
    }
  }

  closeReadmeModal() {
    const modal = document.getElementById("readme-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }
    this.activeRepo = null;
  }

  async fetchReadme(repoName, defaultBranch = "main") {
    if (this.readmeCache.has(repoName)) {
      return this.readmeCache.get(repoName);
    }

    const branches = [defaultBranch, "main", "master"];
    let content = null;

    for (const branch of branches) {
      try {
        const url = `https://raw.githubusercontent.com/khalidabdullahh/${repoName}/${branch}/README.md`;
        const res = await fetch(url);
        if (res.ok) {
          content = await res.text();
          break;
        }
      } catch (e) {
        console.warn(`Could not fetch README for ${repoName} on branch ${branch}`);
      }
    }

    if (!content) {
      content = `# ${repoName}\n\n*No README.md documentation file found in this repository.* \n\nYou can explore the source code directly on [GitHub](https://github.com/khalidabdullahh/${repoName}).`;
    }

    this.readmeCache.set(repoName, content);
    return content;
  }

  renderMarkdown(md, repoName) {
    if (!md) return "<p>No content.</p>";
    let html = md;

    // Badges & Images (Convert relative links to raw github)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, (match, alt, src) => {
      let resolvedSrc = src;
      if (!src.startsWith("http")) {
        resolvedSrc = `https://raw.githubusercontent.com/khalidabdullahh/${repoName}/main/${src.replace(/^\.\//, "")}`;
      }
      return `<div class="my-3"><img src="${resolvedSrc}" alt="${alt}" class="rounded-xl border border-border shadow-md max-w-full inline-block" /></div>`;
    });

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener" class="text-cyan underline hover:text-cyan-glow font-medium">$1</a>');
    
    // Headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-text-primary mt-6 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-black text-text-primary mt-8 mb-3 pb-1 border-b border-border">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-text-primary mt-6 mb-4 font-display">$1</h1>');
    
    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="p-3.5 rounded-xl bg-surface-elevated border-l-2 border-cyan text-text-primary italic my-3 shadow-sm">$1</blockquote>');
    
    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (m, lang, code) => {
      return `<pre class="p-4 rounded-xl bg-[#080c14] border border-border text-cyan text-xs font-mono overflow-x-auto my-4 shadow-inner"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-surface-elevated text-cyan font-mono text-xs border border-border/60">$1</code>');
    
    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-text-primary/90">$1</em>');
    
    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr class="my-6 border-border" />');

    const paragraphs = html.split("\n\n");
    return paragraphs.map(p => {
      if (p.startsWith("<h") || p.startsWith("<pre") || p.startsWith("<blockquote") || p.startsWith("<hr") || p.startsWith("<div")) return p;
      return `<p class="mb-3 leading-relaxed">${p.replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }
}
