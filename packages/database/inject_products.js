const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres.xdxadyrdkppxxvizzloq:Advikrini%401408@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

// Category mapping to IDs
const categoriesMap = {
  "Frozen Foods": "cl0xnlukipryuva1e",
  "Cakes, Pastries & Desserts": "cr4taev4dbvp2sy9u",
  "Gift Items & Hampers": "c0d605vwyffvis9ve",
  "Home Baker Essentials": "ccy7w4j7uro59oq9b",
  "Party & Decoration Items": "cbwjskzt90brib5zg",
  "Bakery, Sweets & Restaurant": "cunodsbes6fz9hdtg",
  "Baking Tools & Equipment": "cqwdfcs1eselp1e7a",
  "Confectionery & Home Goods": "cx8vmwxiqpacyqisd",
  "Snacks & Chocolates": "czlahfd5m52zydlwc",
  "Beverages": "c95m1it5y1ik0flne"
};

// Category mapping to Unsplash placeholders
const imagesMap = {
  "Confectionery & Home Goods": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60",
  "Snacks & Chocolates": "https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=600&auto=format&fit=crop&q=60",
  "Beverages": "https://images.unsplash.com/photo-1527960656366-ee2a999e3286?w=600&auto=format&fit=crop&q=60",
  "Frozen Foods": "https://images.unsplash.com/photo-1560684352-8497838a2229?w=600&auto=format&fit=crop&q=60",
  "Cakes, Pastries & Desserts": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60",
  "Gift Items & Hampers": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=60",
  "Home Baker Essentials": "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&auto=format&fit=crop&q=60",
  "Party & Decoration Items": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=60",
  "Bakery, Sweets & Restaurant": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60",
  "Baking Tools & Equipment": "https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?w=600&auto=format&fit=crop&q=60"
};

const products = [
  // Confectionery & Home Goods
  { categoryName: "Confectionery & Home Goods", name: "Mala's Strawberry Jam", weight: "200 g", price: 50 },
  { categoryName: "Confectionery & Home Goods", name: "Pintola Peanut Butter", weight: "350 g", price: 170 },
  { categoryName: "Confectionery & Home Goods", name: "Hellmann's Mayonnaise", weight: "250 g", price: 90 },
  { categoryName: "Confectionery & Home Goods", name: "Pente Vuna Apple Juice", weight: "1 L", price: 120 },
  { categoryName: "Confectionery & Home Goods", name: "Amul Fresh Cream", weight: "250 ml", price: 72 },

  // Snacks & Chocolates
  { categoryName: "Snacks & Chocolates", name: "Cadbury Celebrations", weight: "109.64 g", price: 110 },
  { categoryName: "Snacks & Chocolates", name: "Bikaji Bikaneri Bhujia", weight: "200 g", price: 60 },
  { categoryName: "Snacks & Chocolates", name: "Amul Choco Minis", weight: "250 g", price: 130 },
  { categoryName: "Snacks & Chocolates", name: "Pringles Sour Cream & Onion", weight: "40 g", price: 55 },
  { categoryName: "Snacks & Chocolates", name: "Samyang Buldak Carbonara Noodles", weight: "130 g", price: 150 },

  // Beverages
  { categoryName: "Beverages", name: "Red Bull Energy Drink", weight: "250 ml", price: 125 },
  { categoryName: "Beverages", name: "Monster Energy Drink", weight: "350 ml", price: 125 },
  { categoryName: "Beverages", name: "Nescafé Iced Latte", weight: "170 ml", price: 50 },
  { categoryName: "Beverages", name: "Pepsi", weight: "750 ml", price: 40 },
  { categoryName: "Beverages", name: "Mirinda", weight: "750 ml", price: 40 },

  // Frozen Foods
  { categoryName: "Frozen Foods", name: "McCain Smiles (Veg)", weight: "415 g", price: 150 },
  { categoryName: "Frozen Foods", name: "Amul French Fries (Veg)", weight: "200 g", price: 40 },
  { categoryName: "Frozen Foods", name: "Delicious Chicken Nuggets", weight: "250 g", price: 160 },
  { categoryName: "Frozen Foods", name: "Meatzza Chicken Sausages", weight: "250 g", price: 165 },
  { categoryName: "Frozen Foods", name: "Amul Malai Paneer", weight: "200 g", price: 99 },

  // Cakes, Pastries & Desserts
  { categoryName: "Cakes, Pastries & Desserts", name: "Chocolate Cake", weight: "1 Pound", price: 500 },
  { categoryName: "Cakes, Pastries & Desserts", name: "Vanilla Cake", weight: "1 Pound", price: 400 },
  { categoryName: "Cakes, Pastries & Desserts", name: "Black Forest Pastry", weight: "Per Piece", price: 80 },
  { categoryName: "Cakes, Pastries & Desserts", name: "Blueberry Panda Pastry", weight: "Per Piece", price: 90 },
  { categoryName: "Cakes, Pastries & Desserts", name: "Glass Cake (Chocolate / Strawberry)", weight: "Per Piece", price: 80 },

  // Gift Items & Hampers
  { categoryName: "Gift Items & Hampers", name: "Lord Ganesha Water Fountain", weight: "1 Pc", price: 2500 },
  { categoryName: "Gift Items & Hampers", name: "Home Bird Showpiece", weight: "1 Pc", price: 1200 },
  { categoryName: "Gift Items & Hampers", name: "Peacock Showpiece", weight: "1 Pc", price: 1200 },
  { categoryName: "Gift Items & Hampers", name: "Buddha Showpiece", weight: "1 Pc", price: 500 },
  { categoryName: "Gift Items & Hampers", name: "Umbrella Couple Showpiece", weight: "1 Pc", price: 950 },

  // Home Baker Essentials
  { categoryName: "Home Baker Essentials", name: "Goodrich White Gold Whipping Cream", weight: "1 L", price: 180 },
  { categoryName: "Home Baker Essentials", name: "Vanilla Essence", weight: "20 ml", price: 30 },
  { categoryName: "Home Baker Essentials", name: "Liquid Food Colour", weight: "20 ml", price: 30 },
  { categoryName: "Home Baker Essentials", name: "1 Pound Corrugated Cake Box", weight: "Per Piece", price: 20 },
  { categoryName: "Home Baker Essentials", name: "1 Pound Corrugated Cake Base", weight: "Per Piece", price: 10 },

  // Party & Decoration Items
  { categoryName: "Party & Decoration Items", name: "Mix Colour Balloons (50 pcs)", weight: "Per Pack", price: 80 },
  { categoryName: "Party & Decoration Items", name: "288 Shots Firecracker", weight: "Per Piece", price: 1200 },
  { categoryName: "Party & Decoration Items", name: "Spiral Candles", weight: "Per Pack", price: 50 },
  { categoryName: "Party & Decoration Items", name: "LED Glasses", weight: "Per Piece", price: 80 },
  { categoryName: "Party & Decoration Items", name: "Pyro Gun", weight: "Per Piece", price: 200 },

  // Bakery, Sweets & Restaurant
  { categoryName: "Bakery, Sweets & Restaurant", name: "Chicken Roll", weight: "Per Piece", price: 100 },
  { categoryName: "Bakery, Sweets & Restaurant", name: "Paneer Patties", weight: "Per Piece", price: 30 },
  { categoryName: "Bakery, Sweets & Restaurant", name: "Rasmalai", weight: "Per Piece", price: 40 },
  { categoryName: "Bakery, Sweets & Restaurant", name: "Khasta Kachori", weight: "250 g", price: 50 },
  { categoryName: "Bakery, Sweets & Restaurant", name: "Bakery Bhujia", weight: "200 g", price: 50 },

  // Baking Tools & Equipment
  { categoryName: "Baking Tools & Equipment", name: "Cake Icing Knife", weight: "Per Piece", price: 220 },
  { categoryName: "Baking Tools & Equipment", name: "Cake Turntable (MS)", weight: "Per Piece", price: 1100 },
  { categoryName: "Baking Tools & Equipment", name: "12-inch Bread Knife", weight: "Per Piece", price: 240 },
  { categoryName: "Baking Tools & Equipment", name: "Measuring Cup Set", weight: "Per Piece", price: 120 },
  { categoryName: "Baking Tools & Equipment", name: "25-Piece Nozzle Set", weight: "Per Pack", price: 650 },
];

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function inject() {
  try {
    console.log(`Starting injection of ${products.length} products...`);
    
    for (const p of products) {
      const categoryId = categoriesMap[p.categoryName];
      if (!categoryId) {
        console.warn(`WARNING: Category not found for ${p.categoryName}, skipping.`);
        continue;
      }
      
      const slug = generateSlug(p.name) + '-' + Math.random().toString(36).substring(2, 6);
      const id = 'p' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      
      await pool.query('BEGIN');
      
      // 1. Insert Product
      await pool.query(`
        INSERT INTO "Product" (id, name, slug, description, "basePrice", stock, "isActive", weight, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, 100, true, $6, NOW())
      `, [id, p.name, slug, `${p.name} (${p.weight})`, p.price, p.weight]);
      
      // 2. Insert ProductCategory mapping
      await pool.query(`
        INSERT INTO "ProductCategory" ("productId", "categoryId")
        VALUES ($1, $2)
      `, [id, categoryId]);
      
      // 3. Insert ProductImage
      const imageId = 'pi' + Math.random().toString(36).substring(2, 10);
      const imageUrl = imagesMap[p.categoryName];
      await pool.query(`
        INSERT INTO "ProductImage" (id, "productId", url, "isPrimary")
        VALUES ($1, $2, $3, true)
      `, [imageId, id, imageUrl]);
      
      await pool.query('COMMIT');
      console.log(`Successfully injected: ${p.name} (${p.weight}) - ₹${p.price}`);
    }
    
    console.log("Injection completed successfully!");
  } catch (err) {
    console.error("INJECTION FAILED:", err);
  } finally {
    await pool.end();
  }
}

inject();
