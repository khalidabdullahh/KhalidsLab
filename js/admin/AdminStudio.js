/**
 * Git-Based Admin Studio Controller
 * Author: Khalid Abdullah
 * Features:
 *  - Secure Credentials Operator Authentication (khalidabdullah / Khalid0080)
 *  - Drag & Drop / File Input Image Uploader (Base64 Auto-embed in Markdown)
 *  - Rich Markdown Action Toolbar (Headings, Code, Bold, Lists, Links, Quotes)
 *  - Real-Time Live Preview, Word & Reading-Time Metric Engine
 *  - Searchable Post Library & JSON Exporter for KhalidsLab
 */

export class AdminStudio {
  constructor() {
    this.owner = "khalidabdullahh";
    this.repo = "KhalidsLab";
    this.token = localStorage.getItem("khalid_github_admin_token") || "";
    this.user = null;
    this.posts = [];
    this.editingSlug = null;
    this.editingSha = null;

    this.init();
  }

  async init() {
    this.bindEvents();
    this.setupThemeToggle();

    const isAuthenticated = localStorage.getItem("khalid_admin_authenticated") === "true";
    if (isAuthenticated) {
      this.user = {
        login: "khalidabdullah",
        avatar_url: "https://github.com/khalidabdullahh.png"
      };
      this.showDashboard();
      await this.loadPosts();
    } else {
      this.showAuthScreen();
    }
  }

  setupThemeToggle() {
    const toggleBtn = document.getElementById("btn-theme-toggle");
    toggleBtn?.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("theme-light");
      localStorage.setItem("lab-theme", isLight ? "light" : "dark");
    });
  }

  showToast(message, type = "info") {
    const container = document.getElementById("studio-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColors = {
      success: "bg-surface-elevated border-emerald-500/50 text-emerald-300",
      error: "bg-surface-elevated border-rose-500/50 text-rose-300",
      info: "bg-surface-elevated border-cyan/50 text-cyan"
    };

    toast.className = `px-4 py-3 rounded-2xl border shadow-2xl text-xs font-mono flex items-center gap-2.5 transition-all transform duration-300 translate-y-4 opacity-0 pointer-events-auto ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `<span>${type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ"}</span><span>${message}</span>`;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-4", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  bindEvents() {
    // --- Login Handlers ---
    const handleLogin = () => {
      const usernameInput = document.getElementById("username-input");
      const passwordInput = document.getElementById("password-input");
      const authStatus = document.getElementById("auth-status-text");

      const username = (usernameInput?.value || "").trim().toLowerCase();
      const password = (passwordInput?.value || "").trim();

      if (!username || !password) {
        if (authStatus) {
          authStatus.innerHTML = `<span class="text-rose-400 font-mono text-[11px]">Please enter both username and password.</span>`;
        }
        return;
      }

      const isValidUser = username === "khalidabdullah" || username === "khalidabdullahh";
      const isValidPass = password === "Khalid0080";

      if (isValidUser && isValidPass) {
        localStorage.setItem("khalid_admin_authenticated", "true");
        this.user = {
          login: "khalidabdullah",
          avatar_url: "https://github.com/khalidabdullahh.png"
        };
        if (authStatus) {
          authStatus.innerHTML = `<span class="text-emerald-400 font-mono text-[11px]">✓ Access Granted! Launching Studio...</span>`;
        }
        this.showToast("Logged in successfully. Welcome, Khalid!", "success");
        setTimeout(() => {
          this.showDashboard();
          this.loadPosts();
        }, 350);
      } else {
        if (authStatus) {
          authStatus.innerHTML = `<span class="text-rose-400 font-mono text-[11px]">⚠️ Invalid username or password.</span>`;
        }
      }
    };

    document.getElementById("btn-auth-login")?.addEventListener("click", handleLogin);

    document.getElementById("password-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLogin();
      }
    });

    document.getElementById("username-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("password-input")?.focus();
      }
    });

    // --- Studio Navigation & Actions ---
    document.getElementById("btn-auth-logout")?.addEventListener("click", () => {
      this.logout();
    });

    document.getElementById("btn-new-post")?.addEventListener("click", () => {
      this.resetEditor();
    });

    // Post Search Filter
    document.getElementById("search-posts-input")?.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      this.filterPosts(query);
    });

    // Post Form Submit
    document.getElementById("post-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.publishPost();
    });

    // Copy JSON Action
    document.getElementById("btn-copy-json")?.addEventListener("click", () => {
      this.copyPostJson();
    });

    // Textarea Input for Live Preview & Metric Badges
    const contentTextarea = document.getElementById("post-content");
    contentTextarea?.addEventListener("input", () => {
      this.updatePreview();
      this.updateMetrics();
    });

    const titleInput = document.getElementById("post-title");
    titleInput?.addEventListener("input", () => {
      const slugInput = document.getElementById("post-slug");
      if (!this.editingSlug && slugInput) {
        slugInput.value = this.generateSlug(titleInput.value);
      }
      this.updatePreview();
    });

    document.getElementById("post-category")?.addEventListener("change", () => {
      this.updatePreview();
    });
    document.getElementById("post-tagline")?.addEventListener("input", () => {
      this.updatePreview();
    });

    // --- Markdown Toolbar Setup ---
    this.setupToolbar();

    // --- Image Upload Setup ---
    this.setupImageUpload();
  }

  setupToolbar() {
    const textarea = document.getElementById("post-content");
    if (!textarea) return;

    const wrapSelection = (before, after = before) => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      const replacement = before + (selected || "text") + after;

      textarea.setRangeText(replacement, start, end, "select");
      textarea.focus();
      this.updatePreview();
      this.updateMetrics();
    };

    const insertAtCursor = (text) => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText(text, start, end, "end");
      textarea.focus();
      this.updatePreview();
      this.updateMetrics();
    };

    document.querySelectorAll(".toolbar-btn[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        switch (action) {
          case "bold":
            wrapSelection("**");
            break;
          case "italic":
            wrapSelection("*");
            break;
          case "h1":
            insertAtCursor("\n# Heading 1\n");
            break;
          case "h2":
            insertAtCursor("\n## Heading 2\n");
            break;
          case "h3":
            insertAtCursor("\n### Heading 3\n");
            break;
          case "code":
            wrapSelection("`");
            break;
          case "codeblock":
            wrapSelection("```javascript\n", "\n```");
            break;
          case "quote":
            insertAtCursor("\n> Highlighted insight or quote\n");
            break;
          case "list":
            insertAtCursor("\n- First item\n- Second item\n- Third item\n");
            break;
          case "link":
            const url = prompt("Enter URL:", "https://");
            if (url) wrapSelection("[", `](${url})`);
            break;
        }
      });
    });
  }

  setupImageUpload() {
    const fileInput = document.getElementById("image-file-input");
    const dropZone = document.getElementById("image-drop-zone");
    const textarea = document.getElementById("post-content");

    const processImageFile = (file) => {
      if (!file || !file.type.startsWith("image/")) {
        this.showToast("Please select a valid image file (PNG, JPG, WebP, SVG)", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        const altText = file.name.replace(/\.[^/.]+$/, "");
        const markdownImage = `\n![${altText}](${base64Data})\n`;

        const start = textarea.selectionStart || textarea.value.length;
        const end = textarea.selectionEnd || textarea.value.length;
        textarea.setRangeText(markdownImage, start, end, "end");
        textarea.focus();

        this.updatePreview();
        this.updateMetrics();
        this.showToast(`✓ Image '${file.name}' embedded in Markdown!`, "success");
      };
      reader.readAsDataURL(file);
    };

    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) {
        processImageFile(file);
        fileInput.value = "";
      }
    });

    dropZone?.addEventListener("click", () => fileInput?.click());

    // Drag and drop listeners on dropZone
    ["dragenter", "dragover"].forEach(event => {
      dropZone?.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(event => {
      dropZone?.addEventListener(event, (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
      });
    });

    dropZone?.addEventListener("drop", (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) processImageFile(file);
    });

    // Also support drag-and-drop directly into textarea!
    textarea?.addEventListener("dragover", (e) => e.preventDefault());
    textarea?.addEventListener("drop", (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        processImageFile(file);
      }
    });
  }

  showAuthScreen() {
    document.getElementById("auth-view")?.classList.remove("hidden");
    document.getElementById("dashboard-view")?.classList.add("hidden");
    document.getElementById("user-pill")?.classList.add("hidden");
  }

  showDashboard() {
    document.getElementById("auth-view")?.classList.add("hidden");
    document.getElementById("dashboard-view")?.classList.remove("hidden");

    const userPill = document.getElementById("user-pill");
    const userAvatar = document.getElementById("user-avatar");
    const userName = document.getElementById("user-name");

    if (userPill) userPill.classList.remove("hidden");
    if (userAvatar && this.user) userAvatar.src = this.user.avatar_url;
    if (userName && this.user) userName.textContent = `@${this.user.login}`;
  }

  logout() {
    localStorage.removeItem("khalid_admin_authenticated");
    this.user = null;
    this.showAuthScreen();
    this.showToast("Logged out of Admin Studio.", "info");
  }

  generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  updateMetrics() {
    const content = document.getElementById("post-content")?.value.trim() || "";
    const words = content ? content.split(/\s+/).length : 0;
    const readTime = `${Math.max(1, Math.ceil(words / 180))} min read`;

    const wordBadge = document.getElementById("word-count-badge");
    const readBadge = document.getElementById("read-time-badge");
    if (wordBadge) wordBadge.textContent = `${words} words`;
    if (readBadge) readBadge.textContent = readTime;
  }

  async loadPosts() {
    const listEl = document.getElementById("admin-posts-list");
    if (listEl) listEl.innerHTML = `<div class="p-4 text-xs font-mono text-text-muted">Loading posts...</div>`;

    try {
      let res = await fetch("posts/posts-index.json");
      if (!res.ok) {
        res = await fetch(`https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/posts/posts-index.json`);
      }

      if (res.ok) {
        this.posts = await res.json();
      } else {
        this.posts = [];
      }

      this.renderPostsList(this.posts);
    } catch (e) {
      console.warn("Could not load posts", e);
      if (listEl) listEl.innerHTML = `<div class="p-4 text-xs font-mono text-rose-400">Failed to load posts index.</div>`;
    }
  }

  filterPosts(query) {
    if (!query) {
      this.renderPostsList(this.posts);
      return;
    }
    const filtered = this.posts.filter(p => 
      p.title.toLowerCase().includes(query) || 
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query))) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
    this.renderPostsList(filtered);
  }

  renderPostsList(postsToRender = this.posts) {
    const listEl = document.getElementById("admin-posts-list");
    if (!listEl) return;

    if (!postsToRender || postsToRender.length === 0) {
      listEl.innerHTML = `<div class="p-6 text-center text-xs font-mono text-text-muted">No matching posts found. Click "+ New Post" to start drafting!</div>`;
      return;
    }

    listEl.innerHTML = postsToRender.map(post => `
      <div class="p-3 rounded-2xl bg-surface border border-border hover:border-cyan/40 transition-all flex items-center justify-between gap-3 group">
        <div class="truncate min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded-md text-[9px] font-mono bg-cyan/15 text-cyan border border-cyan/30 font-bold">${post.category || "Article"}</span>
            <span class="text-[10px] font-mono text-text-muted">${post.date || "2026-09-03"}</span>
          </div>
          <div class="text-xs font-bold text-text-primary truncate font-mono">${post.title}</div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <button class="btn-edit-post px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-cyan hover:text-black border border-border text-[11px] font-mono text-cyan transition-all cursor-pointer font-bold" data-slug="${post.slug}">Edit</button>
          <button class="btn-delete-post px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-[11px] font-mono text-rose-400 transition-all cursor-pointer" data-slug="${post.slug}">✕</button>
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll(".btn-edit-post").forEach(btn => {
      btn.addEventListener("click", () => this.editPost(btn.dataset.slug));
    });

    listEl.querySelectorAll(".btn-delete-post").forEach(btn => {
      btn.addEventListener("click", () => this.deletePost(btn.dataset.slug));
    });
  }

  async editPost(slug) {
    const postMeta = this.posts.find(p => p.slug === slug);
    if (!postMeta) return;

    try {
      let res = await fetch(`posts/${slug}.json`);
      if (!res.ok) {
        res = await fetch(`https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/posts/${slug}.json`);
      }

      if (!res.ok) throw new Error("Could not load post file");
      const post = await res.json();

      this.editingSlug = slug;

      document.getElementById("post-title").value = post.title || "";
      document.getElementById("post-slug").value = post.slug || slug;
      document.getElementById("post-category").value = post.category || "Engineering";
      document.getElementById("post-tagline").value = post.tagline || "";
      document.getElementById("post-tags").value = Array.isArray(post.tags) ? post.tags.join(", ") : "";
      document.getElementById("post-content").value = post.content || "";

      document.getElementById("editor-mode-label").textContent = `Editing: ${post.title}`;
      document.getElementById("btn-submit-post").textContent = "Save & Update Post 🚀";

      this.updatePreview();
      this.updateMetrics();
      this.showToast(`Loaded post '${post.title}' for editing.`, "info");
    } catch (e) {
      this.showToast(`Error loading post: ${e.message}`, "error");
    }
  }

  resetEditor() {
    this.editingSlug = null;
    this.editingSha = null;

    document.getElementById("post-form")?.reset();
    document.getElementById("editor-mode-label").textContent = "Create New Post";
    document.getElementById("btn-submit-post").textContent = "Publish Post 🚀";
    this.updatePreview();
    this.updateMetrics();
    this.showToast("Editor cleared for a new post.", "info");
  }

  getPostPayload() {
    const title = document.getElementById("post-title").value.trim();
    const slug = document.getElementById("post-slug").value.trim() || this.generateSlug(title);
    const category = document.getElementById("post-category").value;
    const tagline = document.getElementById("post-tagline").value.trim();
    const tagsStr = document.getElementById("post-tags").value.trim();
    const content = document.getElementById("post-content").value.trim();

    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];
    const wordCount = content.split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;
    const today = new Date().toISOString().split("T")[0];

    return {
      id: `post-${Date.now()}`,
      slug,
      title,
      tagline,
      category,
      categoryColor: "cyan",
      date: today,
      readTime,
      author: "Khalid Abdullah",
      tags,
      published: true,
      content
    };
  }

  copyPostJson() {
    const payload = this.getPostPayload();
    if (!payload.title || !payload.content) {
      this.showToast("Please write Title and Content first!", "error");
      return;
    }
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    this.showToast("✓ Post JSON copied to clipboard!", "success");
  }

  async publishPost() {
    const payload = this.getPostPayload();

    if (!payload.title || !payload.content) {
      this.showToast("Title and Content are required!", "error");
      return;
    }

    const submitBtn = document.getElementById("btn-submit-post");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving Post...";

    try {
      const metaIndexItem = {
        id: payload.id,
        slug: payload.slug,
        title: payload.title,
        tagline: payload.tagline,
        category: payload.category,
        categoryColor: "cyan",
        date: payload.date,
        readTime: payload.readTime,
        tags: payload.tags,
        file: `posts/${payload.slug}.json`,
        published: true
      };

      this.posts = [
        metaIndexItem,
        ...this.posts.filter(p => p.slug !== payload.slug)
      ];

      // Download JSON file directly
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${payload.slug}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      this.showToast(`🎉 Post '${payload.title}' published! '${payload.slug}.json' downloaded.`, "success");
      this.resetEditor();
      this.renderPostsList();
    } catch (e) {
      console.error(e);
      this.showToast(`Publishing failed: ${e.message}`, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish Post 🚀";
    }
  }

  async deletePost(slug) {
    if (!confirm(`Are you sure you want to remove '${slug}' from Studio?`)) {
      return;
    }
    this.posts = this.posts.filter(p => p.slug !== slug);
    this.renderPostsList();
    this.showToast(`Post '${slug}' removed from Studio list.`, "info");
  }

  updatePreview() {
    const title = document.getElementById("post-title")?.value || "Untitled Post";
    const category = document.getElementById("post-category")?.value || "Engineering";
    const tagline = document.getElementById("post-tagline")?.value || "";
    const content = document.getElementById("post-content")?.value || "*No content written yet...*";

    const previewEl = document.getElementById("live-markdown-preview");
    if (!previewEl) return;

    previewEl.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30 font-bold">${category}</span>
          <span class="text-xs font-mono text-text-muted">${new Date().toISOString().split("T")[0]}</span>
        </div>
        <h1 class="text-2xl font-extrabold text-text-primary tracking-tight font-display">${title}</h1>
        ${tagline ? `<p class="text-xs text-text-secondary italic pb-3 border-b border-border/80">${tagline}</p>` : ""}
        <div class="markdown-body text-xs sm:text-sm text-text-secondary leading-relaxed space-y-3 pt-2">
          ${this.renderMarkdown(content)}
        </div>
      </div>
    `;
  }

  renderMarkdown(md) {
    if (!md) return "";
    let html = md;

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<div class="my-3"><img src="$2" alt="$1" class="rounded-xl border border-border shadow-md max-w-full" /><p class="text-[10px] text-text-muted text-center italic mt-1">$1</p></div>');
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener" class="text-cyan underline hover:text-cyan-glow font-medium">$1</a>');
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-text-primary mt-4 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-text-primary mt-5 mb-2 pb-1 border-b border-border">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-text-primary mt-6 mb-2">$1</h1>');
    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="p-3.5 rounded-xl bg-surface-elevated border-l-2 border-cyan text-text-primary italic my-2 shadow-sm">$1</blockquote>');
    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/gim, (m, lang, code) => {
      return `<pre class="p-4 rounded-xl bg-[#080c14] border border-border text-cyan text-xs font-mono overflow-x-auto my-3 shadow-inner"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
    });
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-surface-elevated text-cyan font-mono text-xs border border-border/60">$1</code>');
    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-text-primary">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-text-primary/90">$1</em>');
    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr class="my-4 border-border" />');

    const paragraphs = html.split("\n\n");
    return paragraphs.map(p => {
      if (p.startsWith("<h") || p.startsWith("<pre") || p.startsWith("<blockquote") || p.startsWith("<hr") || p.startsWith("<div")) return p;
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.adminStudio = new AdminStudio();
});
