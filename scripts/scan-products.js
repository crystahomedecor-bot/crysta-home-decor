const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'data', 'products.js');
const CATEGORIES_FILE = path.join(ROOT, 'data', 'categories.js');
const PRODUCTS_DIR = path.join(ROOT, 'assets', 'images', 'products');

const IMAGE_EXTS = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.svg'
]);

// ── Helpers ──

function loadJSArray(filePath, varName) {
    const code = fs.readFileSync(filePath, 'utf-8');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(code.replace(`const ${varName}`, `var ${varName}`), sandbox);
    return sandbox[varName];
}

function escapeStr(s) {
    return String(s).replace(/'/g, "\\'");
}

function generateProductEntry(p) {
    let out = '';
    out += `\n    {\n`;
    out += `        id: '${escapeStr(p.id)}',\n`;
    out += `        name: '${escapeStr(p.name)}',\n`;
    out += `        category: '${escapeStr(p.category)}',\n`;
    out += `        subcategory: '${escapeStr(p.subcategory)}',\n`;
    out += `        price: ${p.price},\n`;
    out += `        oldPrice: ${p.oldPrice},\n`;
    out += `        stock: ${p.stock},\n`;
    out += `        images: [\n`;
    for (const img of p.images) {
        out += `            '${escapeStr(img)}',\n`;
    }
    out += `        ],\n`;
    out += `        description: '${escapeStr(p.description)}',\n`;
    out += `        specifications: {},\n`;
    out += `        tags: []\n`;
    out += `    },`;
    return out;
}

// ── Load categories ──

const categories = loadJSArray(CATEGORIES_FILE, 'CATEGORIES');

const subcatMap = {};
for (const cat of categories) {
    subcatMap[cat.slug] = new Set();
    for (const sub of (cat.subcategories || [])) {
        subcatMap[cat.slug].add(sub.slug);
    }
}

// ── Load existing products ──

const existingProducts = loadJSArray(PRODUCTS_FILE, 'PRODUCTS');
const existingIds = new Set(existingProducts.map(p => p.id));

// ── Build a reverse lookup: subcategory slug → category slug ──

const subcatToCat = {};
for (const cat of categories) {
    for (const sub of (cat.subcategories || [])) {
        subcatToCat[sub.slug] = cat.slug;
    }
}

// ── Scan filesystem ──

const found = [];
const toAdd = [];
const skipped = [];
const errors = [];

if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error(`ERROR: Products directory not found: ${PRODUCTS_DIR}`);
    process.exit(1);
}

const catDirs = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

for (const dirName of catDirs) {
    const dirPath = path.join(PRODUCTS_DIR, dirName);

    // Is this a known category?
    const isCategory = categories.some(c => c.slug === dirName);
    const isSubcategory = subcatToCat.hasOwnProperty(dirName);

    if (isCategory) {
        // Category folder — scan entries inside
        const entries = fs.readdirSync(dirPath, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);

        const catSubcats = subcatMap[dirName] || new Set();

        for (const entry of entries) {
            if (catSubcats.has(entry)) {
                // Subcategory folder — scan for product subfolders
                const subPath = path.join(dirPath, entry);
                const prodDirs = fs.readdirSync(subPath, { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => d.name);
                for (const prodDir of prodDirs) {
                    processProductFolder(dirPath, dirName, entry, prodDir);
                }
            } else {
                // Direct product folder
                processProductFolder(dirPath, dirName, '', entry);
            }
        }
    } else if (isSubcategory) {
        // Orphan subcategory folder at root level? Treat its subdirs as products
        const catSlug = subcatToCat[dirName];
        const prodDirs = fs.readdirSync(dirPath, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name);
        for (const prodDir of prodDirs) {
            processProductFolder(path.dirname(dirPath), catSlug, dirName, prodDir);
        }
    } else {
        // Unknown folder at root — skip
        errors.push(`${dirName}: Unknown folder (not a category or subcategory)`);
    }
}

function processProductFolder(basePath, catSlug, subcatSlug, prodDir) {
    const relPath = subcatSlug
        ? `${catSlug}/${subcatSlug}/${prodDir}`
        : `${catSlug}/${prodDir}`;
    found.push(relPath);

    if (existingIds.has(prodDir)) {
        skipped.push(relPath);
        return;
    }

    const folderPath = path.join(basePath, subcatSlug, prodDir);
    if (!fs.existsSync(folderPath)) {
        errors.push(`${relPath}: Folder does not exist`);
        return;
    }

    const files = fs.readdirSync(folderPath)
        .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
        .sort();

    if (files.length === 0) {
        errors.push(`${relPath}: No supported image files found`);
        return;
    }

    const images = files.map(f =>
        `assets/images/products/${catSlug}${subcatSlug ? '/' + subcatSlug : ''}/${prodDir}/${f}`
    );

    const name = prodDir
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    toAdd.push({
        id: prodDir,
        name: name,
        category: catSlug,
        subcategory: subcatSlug,
        price: 0,
        oldPrice: 0,
        stock: 0,
        images: images,
        description: 'Update Later',
        specifications: {},
        tags: []
    });
}

// ── Write updated products.js ──

if (toAdd.length > 0) {
    let content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const insertPos = content.lastIndexOf('];');
    if (insertPos === -1) {
        console.error('ERROR: Could not find "];" in products.js');
        process.exit(1);
    }

    let newEntriesText = '';
    for (let i = 0; i < toAdd.length; i++) {
        let entry = generateProductEntry(toAdd[i]);
        if (i === toAdd.length - 1) {
            entry = entry.replace(/,\n    \}$/, '\n    }');
        }
        newEntriesText += entry;
    }

    const before = content.substring(0, insertPos).trimEnd();
    const after = content.substring(insertPos);
    const newContent = before + ',' + newEntriesText + '\n' + after;

    fs.writeFileSync(PRODUCTS_FILE, newContent, 'utf-8');
}

// ── Print summary ──

console.log('');
console.log('═══════════════════════════════════════');
console.log('   Product Scanner — CRYSTA HOME DECOR');
console.log('═══════════════════════════════════════');
console.log('');
console.log(`  Products Found:     ${found.length}`);
console.log(`  Products Added:     ${toAdd.length}`);
console.log(`  Products Skipped:   ${skipped.length}`);
console.log(`  Errors:             ${errors.length}`);
console.log('');

if (toAdd.length > 0) {
    console.log('  ✨ Added:');
    for (const p of toAdd) {
        console.log(`     • ${p.id}  (${p.category}${p.subcategory ? ' → ' + p.subcategory : ''})`);
    }
    console.log('');
}

if (skipped.length > 0) {
    console.log('  ⏭️  Skipped (already exist):');
    for (const s of skipped) {
        console.log(`     • ${s}`);
    }
    console.log('');
}

if (errors.length > 0) {
    console.log('  ❌ Errors:');
    for (const e of errors) {
        console.log(`     • ${e}`);
    }
    console.log('');
}

console.log('───────────────────────────────────────');
