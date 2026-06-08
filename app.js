const products = window.CLOUDJADE_PRODUCTS || [];
const categories = ["Classic 100", "Classic 200", "Classic 300", "Air Stretch", "ChilyTech"];

const categoryMeta = {
  "Classic 100": ["Light insulation", "100 series warmth"],
  "Classic 200": ["Midweight fleece", "Core thermal platform"],
  "Classic 300": ["Heavy insulation", "Cold condition fleece"],
  "Air Stretch": ["Next-to-skin stretch", "Moisture management"],
  ChilyTech: ["Cooling base layer", "Quick-dry comfort"],
};

const tabs = document.querySelector("#categoryTabs");
const grid = document.querySelector("#productGrid");
const activeLabel = document.querySelector("#activeCategoryLabel");
const activeTitle = document.querySelector("#activeCategoryTitle");
const searchInput = document.querySelector("#productSearch");
const functionFilters = document.querySelector("#functionFilters");
const dialog = document.querySelector("#productDialog");
const dialogBody = document.querySelector("#dialogBody");
const closeDialog = document.querySelector(".dialog-close");

let activeCategory = categories[0];
let activeFunction = "All";
let searchTerm = "";

function imagePath(product) {
  return `./sample_catalog/assets/converted/${encodeURIComponent(product.image)}`;
}

function renderTabs() {
  tabs.innerHTML = categories
    .map((category) => {
      const count = products.filter((product) => product.category === category).length;
      const [line] = categoryMeta[category];
      return `
        <button class="category-tab ${category === activeCategory ? "active" : ""}" type="button" data-category="${category}">
          <strong>${category}</strong>
          <span>${count} fabrics · ${line}</span>
        </button>
      `;
    })
    .join("");
}

function renderFilters() {
  const current = products.filter((product) => product.category === activeCategory);
  const functionCounts = new Map();
  current.forEach((product) => {
    product.functions.forEach((item) => {
      const label = item.trim();
      functionCounts.set(label, (functionCounts.get(label) || 0) + 1);
    });
  });
  const filters = ["All", ...[...functionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label]) => label)];
  if (!filters.includes(activeFunction)) activeFunction = "All";
  functionFilters.innerHTML = filters
    .map((label) => {
      const count = label === "All" ? current.length : functionCounts.get(label);
      return `<button class="filter-chip ${label === activeFunction ? "active" : ""}" type="button" data-function="${label}">${label} · ${count}</button>`;
    })
    .join("");
}

function specBlock(product) {
  return `
    <dl class="spec-line"><dt>Weight</dt><dd>${product.weight || "On request"}</dd></dl>
    <dl class="spec-line"><dt>Width</dt><dd>${product.width || "On request"}</dd></dl>
    <dl class="spec-line"><dt>Content</dt><dd>${product.composition || "On request"}</dd></dl>
  `;
}

function renderProducts() {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const current = products.filter((product) => {
    if (product.category !== activeCategory) return false;
    if (activeFunction !== "All" && !product.functions.includes(activeFunction)) return false;
    if (!normalizedSearch) return true;
    const haystack = [
      product.code,
      product.family,
      product.name,
      product.composition,
      product.weight,
      product.width,
      product.functions.join(" "),
      product.applications.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });
  const [, title] = categoryMeta[activeCategory];
  activeLabel.textContent = `${activeCategory} · ${current.length} fabrics`;
  activeTitle.textContent = title;
  grid.innerHTML = current.length
    ? current
    .map(
      (product) => `
      <button class="product-card" type="button" data-code="${product.code}">
        <figure>
          <img src="${imagePath(product)}" alt="${product.family} ${product.code} fabric" loading="lazy" />
          <figcaption class="product-code">${product.code}</figcaption>
        </figure>
        <div class="body">
          <div class="family">${product.family}</div>
          <h3>${product.name}</h3>
          <div class="name">${product.applications.slice(0, 2).join(" / ")}</div>
          ${specBlock(product)}
        </div>
      </button>
    `
    )
    .join("")
    : `<p class="empty-state">No fabrics match the current filters.</p>`;
}

function renderDialog(product) {
  dialogBody.innerHTML = `
    <img src="${imagePath(product)}" alt="${product.family} ${product.code} fabric closeup" />
    <div class="dialog-copy">
      <p class="eyebrow">${product.category} · ${product.code}</p>
      <h2>${product.family}</h2>
      <h3>${product.name}</h3>
      ${specBlock(product)}
      <p class="eyebrow">Functions</p>
      <div class="chip-row">${product.functions.map((item) => `<span class="chip">${item}</span>`).join("")}</div>
      <p class="eyebrow">Applications</p>
      <div class="chip-row">${product.applications.map((item) => `<span class="chip">${item}</span>`).join("")}</div>
    </div>
  `;
  dialog.showModal();
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  activeFunction = "All";
  searchTerm = "";
  searchInput.value = "";
  renderTabs();
  renderFilters();
  renderProducts();
});

functionFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-function]");
  if (!button) return;
  activeFunction = button.dataset.function;
  renderFilters();
  renderProducts();
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

grid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-code]");
  if (!card) return;
  const product = products.find((item) => item.code === card.dataset.code);
  if (product) renderDialog(product);
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

renderTabs();
renderFilters();
renderProducts();
