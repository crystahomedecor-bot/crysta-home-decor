const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const PORT = process.env.PORT || 3456;
const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_FILE = path.join(ROOT, 'data', 'products.js');
const CATEGORIES_FILE = path.join(ROOT, 'data', 'categories.js');
const BANNERS_FILE = path.join(ROOT, 'data', 'banners.js');
const SETTINGS_FILE = path.join(ROOT, 'data', 'settings.js');

// ── MIME types ──
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp',
    '.ico':  'image/x-icon',
    '.md':   'text/markdown; charset=utf-8',
};

// ── Helpers ──
function esc(s) { return String(s).replace(/'/g, "\\'"); }

function serializeArray(arr, indent) {
    if (!arr || arr.length === 0) return '[]';
    var allStr = arr.every(function(v) { return typeof v === 'string'; });
    var short = arr.every(function(v) { return typeof v === 'string' && v.length < 55; });
    if (allStr && short && arr.length <= 6) {
        return '[' + arr.map(function(v) { return "'" + esc(v) + "'"; }).join(', ') + ']';
    }
    var out = '[\n';
    for (var i = 0; i < arr.length; i++) {
        out += ' '.repeat(indent + 4) + "'" + esc(arr[i]) + "',\n";
    }
    out += ' '.repeat(indent) + ']';
    return out;
}

function serializeObject(obj, indent) {
    var keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    var out = '{\n';
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = obj[k];
        var vs = typeof v === 'string' ? "'" + esc(v) + "'" : String(v);
        out += ' '.repeat(indent + 4) + "'" + esc(k) + "': " + vs + ",\n";
    }
    out += ' '.repeat(indent) + '}';
    return out;
}

function generateCategoriesJS(categories) {
    var out = 'var CATEGORIES = [\n';
    for (var i = 0; i < categories.length; i++) {
        var c = categories[i];
        out += '    {\n';
        out += "        id: '" + esc(c.id) + "',\n";
        out += "        name: '" + esc(c.name) + "',\n";
        out += "        slug: '" + esc(c.slug) + "',\n";
        if (c.image) out += "        image: '" + esc(c.image) + "',\n";
        if (c.description) out += "        description: '" + esc(c.description) + "',\n";
        if (c.order !== undefined && c.order !== null) out += '        order: ' + Number(c.order) + ',\n';
        if (c.featured) out += '        featured: true,\n';
        if (c.active === false) out += '        active: false,\n';
        if (c.subcategories && c.subcategories.length > 0) {
            out += '        subcategories: [\n';
            for (var j = 0; j < c.subcategories.length; j++) {
                var s = c.subcategories[j];
                out += '            { id: "' + esc(s.id) + '", name: "' + esc(s.name) + '", slug: "' + esc(s.slug) + '" }';
                if (j < c.subcategories.length - 1) out += ',';
                out += '\n';
            }
            out += '        ],\n';
        } else {
            out += '        subcategories: [],\n';
        }
        out += '    }';
        if (i < categories.length - 1) out += ',';
        out += '\n';
    }
    out += '];\n';
    return out;
}

function generateBannersJS(banners) {
    var out = 'var BANNERS = [\n';
    for (var i = 0; i < banners.length; i++) {
        var b = banners[i];
        out += '    {\n';
        out += "        id: '" + esc(b.id) + "',\n";
        out += "        title: '" + esc(b.title) + "',\n";
        if (b.subtitle) out += "        subtitle: '" + esc(b.subtitle) + "',\n";
        if (b.imageDesktop) out += "        imageDesktop: '" + esc(b.imageDesktop) + "',\n";
        if (b.imageMobile) out += "        imageMobile: '" + esc(b.imageMobile) + "',\n";
        if (b.buttonText) out += "        buttonText: '" + esc(b.buttonText) + "',\n";
        if (b.buttonUrl) out += "        buttonUrl: '" + esc(b.buttonUrl) + "',\n";
        out += '        order: ' + (b.order !== undefined ? Number(b.order) : 0) + ',\n';
        out += '        active: ' + (b.active !== false ? 'true' : 'false') + ',\n';
        if (b.overlayOpacity !== undefined) out += '        overlayOpacity: ' + Number(b.overlayOpacity) + ',\n';
        if (b.textPosition) out += "        textPosition: '" + esc(b.textPosition) + "',\n";
        out += '    }';
        if (i < banners.length - 1) out += ',';
        out += '\n';
    }
    out += '];\n';
    return out;
}

function generateSettingsJS(settings) {
    var out = 'var SETTINGS = {\n';
    function writeSection(key, obj) {
        out += '    ' + key + ': {\n';
        var kk = Object.keys(obj);
        for (var i = 0; i < kk.length; i++) {
            var v = obj[kk[i]];
            if (typeof v === 'string') {
                out += "        " + kk[i] + ": '" + esc(v) + "',\n";
            } else {
                out += '        ' + kk[i] + ': ' + v + ',\n';
            }
        }
        out += '    },\n';
    }
    writeSection('general', settings.general || {});
    writeSection('contact', settings.contact || {});
    writeSection('seo', settings.seo || {});
    writeSection('social', settings.social || {});
    writeSection('shipping', settings.shipping || {});
    out += '};\n';
    return out;
}

function generateProductsJS(products) {
    var out = 'const PRODUCTS = [\n';
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        out += '    {\n';
        out += "        id: '" + esc(p.id) + "',\n";
        out += "        name: '" + esc(p.name) + "',\n";
        out += "        category: '" + esc(p.category) + "',\n";
        out += "        subcategory: '" + esc(p.subcategory || '') + "',\n";
        out += '        price: ' + Number(p.price) + ',\n';
        out += '        oldPrice: ' + Number(p.oldPrice || 0) + ',\n';
        out += '        stock: ' + Number(p.stock) + ',\n';
        out += '        images: ' + serializeArray(p.images || [], 8) + ',\n';
        out += "        description: '" + esc(p.description || '') + "',\n";
        out += '        specifications: ' + serializeObject(p.specifications || {}, 8) + ',\n';
        out += '        featured: ' + (p.featured ? 'true' : 'false') + ',\n';
        out += '        bestSeller: ' + (p.bestSeller ? 'true' : 'false') + ',\n';
        out += '        newArrival: ' + (p.newArrival ? 'true' : 'false') + ',\n';
        out += '        onSale: ' + (p.onSale ? 'true' : 'false') + ',\n';
        out += '        tags: ' + serializeArray(p.tags || [], 8) + ',\n';
        out += '    }';
        if (i < products.length - 1) out += ',';
        out += '\n';
    }
    out += '];\n';
    return out;
}

function getBody(req) {
    return new Promise(function(resolve, reject) {
        var body = '';
        req.on('data', function(chunk) { body += chunk; });
        req.on('end', function() {
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(new Error('Invalid JSON')); }
        });
        req.on('error', reject);
    });
}

function jsonResponse(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(data));
}

// ── Multipart form-data parser ──
function parseMultipart(body, boundary) {
    var parts = body.split('--' + boundary);
    var fields = {};
    var files = [];

    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if (part.trim() === '' || part.trim() === '--') continue;

        var headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        var headers = part.substring(0, headerEnd);
        var content = part.substring(headerEnd + 4);

        // Remove trailing \r\n before next boundary
        if (content.endsWith('\r\n')) content = content.slice(0, -2);

        var nameMatch = headers.match(/name="([^"]+)"/);
        if (!nameMatch) continue;
        var fieldName = nameMatch[1];

        var filenameMatch = headers.match(/filename="([^"]*)"/);
        if (filenameMatch) {
            var filename = filenameMatch[1];
            var contentTypeMatch = headers.match(/Content-Type:\s*(\S+)/i);
            var contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
            files.push({ field: fieldName, filename: filename, contentType: contentType, data: Buffer.from(content, 'binary') });
        } else {
            fields[fieldName] = content;
        }
    }

    return { fields: fields, files: files };
}

// ── Generate next product ID ──
function generateProductId(existingProducts, category) {
    var prefix = category ? category.replace(/-/g, '-') : 'product';
    // Use first 2 chars of category as prefix if available
    var catPrefix = category ? category.split('-')[0] : 'product';
    var maxNum = 0;
    for (var i = 0; i < existingProducts.length; i++) {
        var m = existingProducts[i].id.match(/-(\d+)$/);
        if (m) { var n = parseInt(m[1]); if (n > maxNum) maxNum = n; }
    }
    var newNum = maxNum + 1;
    var padded = String(newNum).padStart(3, '0');
    // Use a category-based prefix if possible, but maintain compatibility
    // Check if existing products use a category-based prefix
    var idPrefix = 'product';
    for (var i = 0; i < existingProducts.length; i++) {
        var parts = existingProducts[i].id.split('-');
        if (parts.length >= 2 && parts[parts.length - 1].match(/^\d+$/)) {
            // Get the prefix (everything before the last number)
            idPrefix = existingProducts[i].id.replace(/-\d+$/, '');
            if (idPrefix) break;
        }
    }
    // If no existing pattern, use category
    return idPrefix + '-' + padded;
}

// ── Parse products.js file ──
function parseProductsFile(content) {
    try {
        // Remove any leading BOM and trim
        var cleaned = content.replace(/^\uFEFF/, '').trim();
        // Remove variable declaration: var/const XXXX = [...]
        cleaned = cleaned.replace(/^(?:const|var)\s+\w+\s*=\s*/, '');
        var fn = new Function('return ' + cleaned);
        return fn();
    } catch (e) {
        console.error('parseProductsFile error:', e.message);
        return [];
    }
}

// ── Static file server ──
function serveStatic(req, res) {
    var safePath = req.url.split('?')[0];
    if (safePath === '/') safePath = '/index.html';
    var filePath = path.normalize(path.join(ROOT, decodeURIComponent(safePath)));

    if (filePath.indexOf(ROOT) !== 0) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, function(err, data) {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>' + esc(safePath) + '</p>');
            return;
        }
        var ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

// ── API handler ──
async function handleAPI(req, res) {
    var url = new URL(req.url, 'http://localhost:' + PORT);
    var pathname = url.pathname;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /api/health
    if (pathname === '/api/health' && req.method === 'GET') {
        var exists = fs.existsSync(PRODUCTS_FILE);
        var count = 0;
        if (exists) {
            var content = fs.readFileSync(PRODUCTS_FILE, 'utf8');
            var matches = content.match(/\{\s*\n\s*id:/g);
            count = matches ? matches.length : 0;
        }
        jsonResponse(res, 200, { status: 'ok', productsFileExists: exists, productCount: count });
        return;
    }

    // POST /api/save
    if (pathname === '/api/save' && req.method === 'POST') {
        try {
            var body = await getBody(req);
            var products = body.products;

            if (!Array.isArray(products)) {
                jsonResponse(res, 400, { success: false, message: 'Invalid data: products array required' });
                return;
            }

            // Backup
            var now = new Date();
            var ts = now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0') + '_' +
                String(now.getHours()).padStart(2, '0') +
                String(now.getMinutes()).padStart(2, '0') +
                String(now.getSeconds()).padStart(2, '0');
            var backupPath = PRODUCTS_FILE + '.backup.' + ts;
            try {
                if (fs.existsSync(PRODUCTS_FILE)) {
                    fs.copyFileSync(PRODUCTS_FILE, backupPath);
                }
            } catch (backupErr) {
                // Non-fatal
            }

            var content = generateProductsJS(products);
            fs.writeFileSync(PRODUCTS_FILE, content, 'utf-8');

            jsonResponse(res, 200, {
                success: true,
                message: 'Product saved successfully',
                productCount: products.length,
                backup: path.basename(backupPath)
            });
        } catch (err) {
            jsonResponse(res, 500, { success: false, message: err.message });
        }
        return;
    }

    // POST /api/products — Upload images + create product
    if (pathname === '/api/products' && req.method === 'POST') {
        try {
            var contentType = req.headers['content-type'] || '';
            var boundaryMatch = contentType.match(/boundary=(.+)/);
            if (!boundaryMatch) {
                jsonResponse(res, 400, { success: false, message: 'Expected multipart/form-data' });
                return;
            }
            var boundary = boundaryMatch[1];

            // Read raw body
            var chunks = [];
            req.on('data', function(c) { chunks.push(c); });
            await new Promise(function(resolve, reject) {
                req.on('end', resolve);
                req.on('error', reject);
            });
            var body = Buffer.concat(chunks).toString('binary');
            var parsed = parseMultipart(body, boundary);
            var fields = parsed.fields;
            var files = parsed.files;

            // Validate
            var name = (fields.name || '').trim();
            var category = (fields.category || '').trim();
            if (!name) { jsonResponse(res, 400, { success: false, message: 'Product name is required' }); return; }
            if (!category) { jsonResponse(res, 400, { success: false, message: 'Category is required' }); return; }

            // Read existing products
            var existingContent = fs.readFileSync(PRODUCTS_FILE, 'utf8');
            var existingProducts = parseProductsFile(existingContent);
            if (!Array.isArray(existingProducts)) existingProducts = [];

            // Generate ID
            var newId = generateProductId(existingProducts, category);

            // Create folder
            var productDir = path.join(ROOT, 'assets', 'images', 'products', category, newId);
            fs.mkdirSync(productDir, { recursive: true });

            // Save images as 1.webp, 2.webp, etc.
            var imagePaths = [];
            var imgIndex = 1;
            var imageFiles = files.filter(function(f) { return f.field === 'images'; });
            for (var i = 0; i < imageFiles.length; i++) {
                var ext = path.extname(imageFiles[i].filename).toLowerCase();
                var outputName = imgIndex + '.webp';
                var outputPath = path.join(productDir, outputName);
                try {
                    await sharp(imageFiles[i].data).webp({ quality: 85 }).toFile(outputPath);
                    imagePaths.push('assets/images/products/' + category + '/' + newId + '/' + outputName);
                    imgIndex++;
                } catch (imgErr) {
                    // If sharp fails (e.g. unsupported format), skip
                    console.error('Image conversion error:', imgErr.message);
                }
            }

            // Build product entry
            var newProduct = {
                id: newId,
                name: name,
                category: category,
                subcategory: fields.subcategory || '',
                price: parseInt(fields.price) || 0,
                oldPrice: parseInt(fields.oldPrice) || 0,
                stock: parseInt(fields.stock) || 0,
                images: imagePaths,
                description: fields.description || '',
                specifications: {},
                featured: fields.featured === 'true',
                bestSeller: fields.bestSeller === 'true',
                newArrival: fields.newArrival === 'true',
                onSale: fields.onSale === 'true',
                tags: (fields.tags || '').split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; })
            };

            // Append to products array
            existingProducts.push(newProduct);

            // Backup
            var now = new Date();
            var ts = now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0') + '_' +
                String(now.getHours()).padStart(2, '0') +
                String(now.getMinutes()).padStart(2, '0') +
                String(now.getSeconds()).padStart(2, '0');
            var backupPath = PRODUCTS_FILE + '.backup.' + ts;
            try { if (fs.existsSync(PRODUCTS_FILE)) fs.copyFileSync(PRODUCTS_FILE, backupPath); } catch (e) {}

            // Write
            var newContent = generateProductsJS(existingProducts);
            fs.writeFileSync(PRODUCTS_FILE, newContent, 'utf-8');

            jsonResponse(res, 200, {
                success: true,
                message: 'Product created successfully',
                product: newProduct,
                productCount: existingProducts.length,
                backup: path.basename(backupPath)
            });
        } catch (err) {
            console.error('Product creation error:', err);
            jsonResponse(res, 500, { success: false, message: err.message });
        }
        return;
    }

    // ── Categories API ──
    if (pathname === '/api/categories') {
        var action = url.searchParams.get('action') || 'save';

        // DELETE action
        if (req.method === 'POST' && action === 'delete') {
            try {
                var body = await getBody(req);
                var slug = body.slug;
                if (!slug) { jsonResponse(res, 400, { success: false, message: 'Slug required' }); return; }

                var catContent = fs.readFileSync(CATEGORIES_FILE, 'utf8');
                var cats = parseProductsFile(catContent); // reuse - same format
                if (!Array.isArray(cats)) cats = [];

                var idx = -1;
                for (var i = 0; i < cats.length; i++) {
                    if (cats[i].slug === slug) { idx = i; break; }
                }
                if (idx === -1) { jsonResponse(res, 404, { success: false, message: 'Category not found' }); return; }

                cats.splice(idx, 1);
                var newContent = generateCategoriesJS(cats);
                fs.writeFileSync(CATEGORIES_FILE, newContent, 'utf-8');

                jsonResponse(res, 200, { success: true, message: 'Category deleted' });
            } catch (err) {
                jsonResponse(res, 500, { success: false, message: err.message });
            }
            return;
        }

        // REORDER action
        if (req.method === 'POST' && action === 'reorder') {
            try {
                var body = await getBody(req);
                var orderedSlugs = body.slugs;
                if (!Array.isArray(orderedSlugs)) { jsonResponse(res, 400, { success: false, message: 'slugs array required' }); return; }

                var catContent = fs.readFileSync(CATEGORIES_FILE, 'utf8');
                var cats = parseProductsFile(catContent);
                if (!Array.isArray(cats)) cats = [];

                var map = {};
                for (var i = 0; i < cats.length; i++) map[cats[i].slug] = cats[i];

                var reordered = [];
                for (var i = 0; i < orderedSlugs.length; i++) {
                    if (map[orderedSlugs[i]]) reordered.push(map[orderedSlugs[i]]);
                }
                // Add any not in reorder list
                for (var i = 0; i < cats.length; i++) {
                    if (orderedSlugs.indexOf(cats[i].slug) === -1) reordered.push(cats[i]);
                }

                var newContent = generateCategoriesJS(reordered);
                fs.writeFileSync(CATEGORIES_FILE, newContent, 'utf-8');

                jsonResponse(res, 200, { success: true, message: 'Categories reordered', count: reordered.length });
            } catch (err) {
                jsonResponse(res, 500, { success: false, message: err.message });
            }
            return;
        }

        // SAVE / CREATE action (multipart with optional thumbnail)
        if (req.method === 'POST' && (action === 'save' || action === 'create')) {
            try {
                var contentType = req.headers['content-type'] || '';
                var boundaryMatch = contentType.match(/boundary=(.+)/);
                if (!boundaryMatch) { jsonResponse(res, 400, { success: false, message: 'Expected multipart/form-data' }); return; }
                var boundary = boundaryMatch[1];

                var chunks = [];
                req.on('data', function(c) { chunks.push(c); });
                await new Promise(function(resolve, reject) { req.on('end', resolve); req.on('error', reject); });
                var body = Buffer.concat(chunks).toString('binary');
                var parsed = parseMultipart(body, boundary);
                var fields = parsed.fields;
                var files = parsed.files;

                var name = (fields.name || '').trim();
                var slug = (fields.slug || '').trim();
                if (!name) { jsonResponse(res, 400, { success: false, message: 'Category name is required' }); return; }
                if (!slug) { jsonResponse(res, 400, { success: false, message: 'Slug is required' }); return; }

                // Read existing categories
                var catContent = fs.readFileSync(CATEGORIES_FILE, 'utf8');
                var cats = parseProductsFile(catContent);
                if (!Array.isArray(cats)) cats = [];

                // Validate uniqueness (skip self for edits)
                var editSlug = fields.editSlug || '';
                for (var i = 0; i < cats.length; i++) {
                    if (cats[i].name.toLowerCase() === name.toLowerCase() && cats[i].slug !== editSlug) {
                        jsonResponse(res, 400, { success: false, message: 'A category with this name already exists' }); return;
                    }
                    if (cats[i].slug === slug && cats[i].slug !== editSlug) {
                        jsonResponse(res, 400, { success: false, message: 'A category with this slug already exists' }); return;
                    }
                }

                // Handle thumbnail upload
                var imagePath = '';
                var thumbnailFiles = files.filter(function(f) { return f.field === 'thumbnail'; });
                if (thumbnailFiles.length > 0) {
                    var catDir = path.join(ROOT, 'assets', 'images', 'categories');
                    fs.mkdirSync(catDir, { recursive: true });
                    var ext = path.extname(thumbnailFiles[0].filename).toLowerCase();
                    var filename = slug + ext;
                    var filePath = path.join(catDir, filename);
                    // Write directly
                    fs.writeFileSync(filePath, thumbnailFiles[0].data);
                    imagePath = 'assets/images/categories/' + filename;
                } else if (fields.existingImage) {
                    imagePath = fields.existingImage;
                }

                // Parse subcategories
                var subcats = [];
                try {
                    if (fields.subcategories) {
                        subcats = JSON.parse(fields.subcategories);
                    }
                } catch(e) { subcats = []; }
                if (!Array.isArray(subcats)) subcats = [];

                // Build category object
                var catObj = {
                    id: slug,
                    name: name,
                    slug: slug,
                    image: imagePath || '',
                    description: fields.description || '',
                    order: parseInt(fields.order) || 0,
                    featured: fields.featured === 'true',
                    active: fields.active !== 'false',
                    subcategories: subcats
                };

                if (editSlug) {
                    // Update existing
                    var found = false;
                    for (var i = 0; i < cats.length; i++) {
                        if (cats[i].slug === editSlug) {
                            cats[i] = catObj;
                            found = true;
                            break;
                        }
                    }
                    if (!found) cats.push(catObj);
                } else {
                    cats.push(catObj);
                }

                var newContent = generateCategoriesJS(cats);
                fs.writeFileSync(CATEGORIES_FILE, newContent, 'utf-8');

                jsonResponse(res, 200, {
                    success: true,
                    message: editSlug ? 'Category updated' : 'Category created',
                    category: catObj,
                    count: cats.length
                });
            } catch (err) {
                console.error('Category save error:', err);
                jsonResponse(res, 500, { success: false, message: err.message });
            }
            return;
        }

        jsonResponse(res, 404, { success: false, message: 'Unknown categories action' });
        return;
    }

    // ── Banners API ──
    if (pathname === '/api/banners') {
        var action = url.searchParams.get('action') || 'save';

        if (req.method === 'POST' && action === 'delete') {
            try {
                var body = await getBody(req);
                var id = body.id;
                if (!id) { jsonResponse(res, 400, { success: false, message: 'ID required' }); return; }
                var banContent = fs.readFileSync(BANNERS_FILE, 'utf8');
                var re = /(?:const|var)\s+BANNERS\s*=\s*/;
                var arrStr = banContent.replace(re, '');
                var banners = new Function('return ' + arrStr)();
                if (!Array.isArray(banners)) banners = [];
                var idx = -1;
                for (var i = 0; i < banners.length; i++) {
                    if (banners[i].id === id) { idx = i; break; }
                }
                if (idx === -1) { jsonResponse(res, 404, { success: false, message: 'Banner not found' }); return; }
                banners.splice(idx, 1);
                fs.writeFileSync(BANNERS_FILE, generateBannersJS(banners), 'utf-8');
                jsonResponse(res, 200, { success: true, message: 'Banner deleted' });
            } catch (err) { jsonResponse(res, 500, { success: false, message: err.message }); }
            return;
        }

        if (req.method === 'POST' && (action === 'save' || action === 'create')) {
            try {
                var cType = req.headers['content-type'] || '';
                var bMatch = cType.match(/boundary=(.+)/);
                if (!bMatch) { jsonResponse(res, 400, { success: false, message: 'Expected multipart/form-data' }); return; }
                var boundary = bMatch[1];
                var chunks = [];
                req.on('data', function(c) { chunks.push(c); });
                await new Promise(function(resolve, reject) { req.on('end', resolve); req.on('error', reject); });
                var body = Buffer.concat(chunks).toString('binary');
                var parsed = parseMultipart(body, boundary);
                var fields = parsed.fields;
                var files = parsed.files;

                var title = (fields.title || '').trim();
                if (!title) { jsonResponse(res, 400, { success: false, message: 'Title is required' }); return; }

                var banContent = fs.readFileSync(BANNERS_FILE, 'utf8');
                var re = /(?:const|var)\s+BANNERS\s*=\s*/;
                var arrStr = banContent.replace(re, '');
                var banners = new Function('return ' + arrStr)();
                if (!Array.isArray(banners)) banners = [];

                var editId = fields.editId || '';
                var banId = editId || 'banner-' + Date.now();

                var bannerDir = path.join(ROOT, 'assets', 'images', 'banners');
                fs.mkdirSync(bannerDir, { recursive: true });

                var imgDesktop = fields.existingDesktop || '';
                var imgMobile = fields.existingMobile || '';

                var desktopFiles = files.filter(function(f) { return f.field === 'desktopImage'; });
                if (desktopFiles.length > 0) {
                    var ext = path.extname(desktopFiles[0].filename) || '.jpg';
                    var fname = banId + '-desktop' + ext;
                    fs.writeFileSync(path.join(bannerDir, fname), desktopFiles[0].data);
                    imgDesktop = 'assets/images/banners/' + fname;
                }

                var mobileFiles = files.filter(function(f) { return f.field === 'mobileImage'; });
                if (mobileFiles.length > 0) {
                    var ext = path.extname(mobileFiles[0].filename) || '.jpg';
                    var fname = banId + '-mobile' + ext;
                    fs.writeFileSync(path.join(bannerDir, fname), mobileFiles[0].data);
                    imgMobile = 'assets/images/banners/' + fname;
                }

                var bannerObj = {
                    id: banId,
                    title: title,
                    subtitle: fields.subtitle || '',
                    imageDesktop: imgDesktop,
                    imageMobile: imgMobile || imgDesktop,
                    buttonText: fields.buttonText || '',
                    buttonUrl: fields.buttonUrl || '',
                    order: parseInt(fields.order) || 0,
                    active: fields.active !== 'false',
                    overlayOpacity: parseFloat(fields.overlayOpacity) || 0.3,
                    textPosition: fields.textPosition || 'center'
                };

                if (editId) {
                    var found = false;
                    for (var i = 0; i < banners.length; i++) {
                        if (banners[i].id === editId) { banners[i] = bannerObj; found = true; break; }
                    }
                    if (!found) banners.push(bannerObj);
                } else {
                    banners.push(bannerObj);
                }

                fs.writeFileSync(BANNERS_FILE, generateBannersJS(banners), 'utf-8');
                jsonResponse(res, 200, { success: true, message: editId ? 'Banner updated' : 'Banner created', banner: bannerObj, count: banners.length });
            } catch (err) { console.error('Banner save error:', err); jsonResponse(res, 500, { success: false, message: err.message }); }
            return;
        }

        if (req.method === 'GET') {
            try {
                var banContent = fs.readFileSync(BANNERS_FILE, 'utf8');
                jsonResponse(res, 200, { success: true, data: banContent });
            } catch (err) { jsonResponse(res, 500, { success: false, message: err.message }); }
            return;
        }

        jsonResponse(res, 404, { success: false, message: 'Unknown banners action' });
        return;
    }

    // ── Settings API ──
    if (pathname === '/api/settings') {
        if (req.method === 'GET') {
            try {
                var setContent = fs.readFileSync(SETTINGS_FILE, 'utf8');
                jsonResponse(res, 200, { success: true, data: setContent });
            } catch (err) { jsonResponse(res, 500, { success: false, message: err.message }); }
            return;
        }

        if (req.method === 'POST') {
            try {
                var body = await getBody(req);
                var settings = body.settings;
                if (!settings) { jsonResponse(res, 400, { success: false, message: 'Settings required' }); return; }

                // Merge with defaults
                var setContent = fs.readFileSync(SETTINGS_FILE, 'utf8');
                var re = /(?:const|var)\s+SETTINGS\s*=\s*/;
                var objStr = setContent.replace(re, '');
                var current = new Function('return ' + objStr)();

                // Deep merge
                function mergeDeep(target, source) {
                    var keys = Object.keys(source);
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        if (typeof source[k] === 'object' && source[k] !== null && !Array.isArray(source[k])) {
                            target[k] = target[k] || {};
                            mergeDeep(target[k], source[k]);
                        } else {
                            target[k] = source[k];
                        }
                    }
                }
                mergeDeep(current, settings);

                fs.writeFileSync(SETTINGS_FILE, generateSettingsJS(current), 'utf-8');
                jsonResponse(res, 200, { success: true, message: 'Settings saved', settings: current });
            } catch (err) { jsonResponse(res, 500, { success: false, message: err.message }); }
            return;
        }

        jsonResponse(res, 404, { success: false, message: 'Unknown settings action' });
        return;
    }

    // POST /api/upload-setting-image
    if (pathname === '/api/upload-setting-image' && req.method === 'POST') {
        try {
            var cType = req.headers['content-type'] || '';
            var bMatch = cType.match(/boundary=(.+)/);
            if (!bMatch) { jsonResponse(res, 400, { success: false, message: 'Expected multipart/form-data' }); return; }
            var boundary = bMatch[1];
            var chunks = [];
            req.on('data', function(c) { chunks.push(c); });
            await new Promise(function(resolve, reject) { req.on('end', resolve); req.on('error', reject); });
            var body = Buffer.concat(chunks).toString('binary');
            var parsed = parseMultipart(body, boundary);
            var fields = parsed.fields;
            var files = parsed.files;

            var key = fields.key || 'image';
            var section = fields.section || 'general';
            var settingDir = path.join(ROOT, 'assets', 'images', 'settings');
            fs.mkdirSync(settingDir, { recursive: true });

            var imgFiles = files.filter(function(f) { return f.field === 'image'; });
            var imgPath = '';
            if (imgFiles.length > 0) {
                var ext = path.extname(imgFiles[0].filename).toLowerCase() || '.png';
                var fname = section + '-' + key + ext;
                fs.writeFileSync(path.join(settingDir, fname), imgFiles[0].data);
                imgPath = 'assets/images/settings/' + fname;
            }

            jsonResponse(res, 200, { success: true, path: imgPath, message: 'Image uploaded' });
        } catch (err) { jsonResponse(res, 500, { success: false, message: err.message }); }
        return;
    }

    // POST /api/scan
    if (pathname === '/api/scan' && req.method === 'POST') {
        try {
            var output = execSync('node scripts/scan-products.js', { cwd: ROOT, encoding: 'utf-8' });
            jsonResponse(res, 200, { success: true, output: output });
        } catch (err) {
            jsonResponse(res, 500, { success: false, message: err.message, output: err.stdout || '' });
        }
        return;
    }

    jsonResponse(res, 404, { success: false, message: 'Unknown endpoint' });
}

// ── Server ──
var server = http.createServer(function(req, res) {
    if (req.url.indexOf('/api/') === 0) {
        handleAPI(req, res);
    } else {
        serveStatic(req, res);
    }
});

server.listen(PORT, function() {
    console.log('');
    console.log('  \u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
    console.log('  \u2551   CRYSTA HOME DECOR \u2014 Admin Server   \u2551');
    console.log('  \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d');
    console.log('');
    console.log('  Admin Panel:  http://localhost:' + PORT + '/crysta-dashboard-2026.html');
    console.log('  Health Check: http://localhost:' + PORT + '/api/health');
    console.log('');
    console.log('  Press Ctrl+C to stop.');
    console.log('');
});
