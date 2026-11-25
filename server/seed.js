import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config()
import connectDB from './config/db.js'
import User from './models/User.js'
import Product from './models/Product.js'
import Order from './models/Order.js'
import Cart from './models/Cart.js'

const img = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=1000&auto=format&fit=crop`
const P = {
  a: img('1595950653106-6c9ebd614d3a'), b: img('1600185365483-26d7a4cc7519'), c: img('1606107557195-0e29a4b5b4aa'),
  d: img('1460353581641-37baddab0fa2'), e: img('1595341888016-a392ef81b7de'), f: img('1491553895911-0055eca6402d'),
  g: img('1465453869711-7e174808ace9'), h: img('1552346154-21d32810aba3'), i: img('1608231387042-66d1773070a5'),
  j: img('1543508282-6319a3e2621f'), k: img('1600269452121-4f2416e55c28'),
}

const blurbs = {
  Running: 'Featherlight engineered mesh, a responsive foam midsole and a propulsive carbon-infused plate keep every stride efficient from the first kilometre to the last.',
  Lifestyle: 'A clean, minimal silhouette in premium leather and suede with all-day cushioning — built to move from the street to the studio without missing a beat.',
  Training: 'A stable, grippy platform with reinforced lateral support and a breathable knit upper, engineered for heavy sessions and explosive change of direction.',
  Signature: 'A limited statement piece crafted from select materials with hand-finished gold detailing. Numbered, numbered-run production — made for those who move different.',
}

// [name, category, price, rating, colors, sizes, images, tag, popularity, featured]
const rows = [
  ['Apex Runner', 'Running', 189, 4.8, ['Black', 'White', 'Gold'], [39, 40, 41, 42, 43], [P.a, P.i, P.b], 'New', 320, true],
  ['Velocity Pro', 'Running', 215, 4.6, ['Black', 'Red'], [40, 41, 42, 43, 44], [P.b, P.a, P.i], '', 210, true],
  ['Street Form', 'Lifestyle', 149, 4.5, ['White', 'Blue'], [38, 39, 40, 41, 42], [P.c, P.j, P.d], '', 180, true],
  ['Urban Drift', 'Lifestyle', 165, 4.7, ['Black', 'Gold', 'White'], [39, 40, 41, 42, 43, 44], [P.d, P.c, P.j], 'Popular', 410, true],
  ['Iron Grip', 'Training', 175, 4.4, ['Black', 'Red', 'Blue'], [40, 41, 42, 43], [P.e, P.f, P.k], '', 120, true],
  ['Core Flex', 'Training', 159, 4.3, ['White', 'Black'], [38, 39, 40, 41], [P.f, P.e, P.k], '', 95, false],
  ['Regal Gold', 'Signature', 289, 5.0, ['Gold', 'Black'], [40, 41, 42, 43, 44], [P.g, P.h, P.k], 'Limited', 260, true],
  ['Monarch Edition', 'Signature', 320, 4.9, ['Gold', 'White'], [39, 40, 41, 42], [P.h, P.g, P.k], 'Limited', 230, false],
  ['Pulse Runner', 'Running', 199, 4.5, ['White', 'Blue', 'Red'], [39, 40, 41, 42, 43], [P.i, P.a, P.b], '', 150, false],
  ['Everyday Low', 'Lifestyle', 129, 4.2, ['Black', 'White'], [38, 39, 40, 41, 42, 43], [P.j, P.c, P.d], '', 140, false],
  ['Grit Trainer', 'Training', 169, 4.4, ['Black', 'Gold'], [40, 41, 42, 43, 44], [P.k, P.e, P.f], '', 85, false],
  ['Onyx Signature', 'Signature', 275, 4.9, ['Black'], [41, 42, 43, 44], [P.k, P.g, P.h], 'Limited', 175, false],
  ['Stride Elite', 'Running', 229, 4.7, ['Black', 'Gold'], [40, 41, 42, 43, 44], [P.a, P.b, P.i], 'New', 130, false],
  ['Tempo Lite', 'Running', 139, 4.1, ['White', 'Blue'], [38, 39, 40, 41, 42], [P.b, P.i, P.a], '', 110, false],
  ['Marathon X', 'Running', 249, 4.8, ['Red', 'Black'], [41, 42, 43, 44], [P.i, P.b, P.a], '', 190, false],
  ['Metro Classic', 'Lifestyle', 139, 4.3, ['White', 'Black'], [38, 39, 40, 41, 42, 43], [P.c, P.d, P.j], '', 160, false],
  ['Loft Court', 'Lifestyle', 155, 4.4, ['White', 'Gold'], [39, 40, 41, 42], [P.d, P.j, P.c], '', 100, false],
  ['Skyline Mid', 'Lifestyle', 175, 4.6, ['Black', 'Blue'], [40, 41, 42, 43, 44], [P.j, P.d, P.c], 'New', 125, false],
  ['Forge Trainer', 'Training', 185, 4.5, ['Black', 'Red'], [40, 41, 42, 43, 44], [P.e, P.k, P.f], '', 105, false],
  ['Flex Pro', 'Training', 145, 4.2, ['White', 'Blue', 'Black'], [38, 39, 40, 41, 42], [P.f, P.e, P.k], '', 90, false],
  ['Titan Lift', 'Training', 195, 4.7, ['Black', 'Gold'], [41, 42, 43, 44], [P.k, P.f, P.e], '', 115, false],
  ['Aurum Prime', 'Signature', 349, 5.0, ['Gold'], [40, 41, 42, 43], [P.g, P.k, P.h], 'Limited', 205, false],
  ['Obsidian One', 'Signature', 299, 4.8, ['Black', 'Gold'], [39, 40, 41, 42, 43], [P.h, P.k, P.g], '', 145, false],
  ['Eclipse Edition', 'Signature', 335, 4.9, ['Black', 'White', 'Gold'], [40, 41, 42, 43, 44], [P.k, P.h, P.g], 'Limited', 165, false],
]

const toProduct = ([name, category, price, rating, colors, sizes, images, tag, popularity, featured]) => ({
  name, category, price, rating, colors, sizes, images, tag, popularity, featured,
  numReviews: Math.round(popularity / 4),
  stock: 40 + (popularity % 35),
  description: `${name} — ${blurbs[category]}`,
})

async function run() {
  await connectDB()
  await Promise.all([Product.deleteMany(), Order.deleteMany(), Cart.deleteMany(), User.deleteMany()])
  console.log('Cleared existing data')
  if (process.argv.includes('--destroy')) return

  const admin = await User.create({
    name: process.env.ADMIN_NAME || 'SOLE Admin',
    email: process.env.ADMIN_EMAIL || 'admin@sole.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  })
  const customer = await User.create({ name: 'Demo Customer', email: 'customer@sole.com', password: 'Customer@123', role: 'customer' })
  await Product.insertMany(rows.map(toProduct))
  console.log(`Seeded ${rows.length} products`)
  console.log(`Admin:    ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`)
  console.log(`Customer: ${customer.email} / Customer@123`)
}

run()
  .catch((e) => { console.error(e); process.exitCode = 1 })
  .finally(() => mongoose.disconnect())
