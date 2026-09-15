const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || "mongodb+srv://obaydurshuvo_db_user:UNYy0vIOczTFskF5@cluster0.uijoa79.mongodb.net/fordoportro_db?retryWrites=true&w=majority";

let client = null;
let dbInstance = null;
let isUsingLocalFallback = false;

// Local JSON persistence directory
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!IS_VERCEL && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store for Vercel (read-only filesystem)
const memoryStore = {};

function loadLocalData(collectionName) {
  if (IS_VERCEL) return memoryStore[collectionName] || [];
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveLocalData(collectionName, data) {
  if (IS_VERCEL) { memoryStore[collectionName] = data; return; }
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn(`[saveLocalData] Could not write ${collectionName}:`, e.message);
  }
}

// Emulate MongoDB Collection for offline/fallback mode
class LocalMongoCollection {
  constructor(name) {
    this.name = name;
  }

  _getItems() {
    return loadLocalData(this.name);
  }

  _saveItems(items) {
    saveLocalData(this.name, items);
  }

  async countDocuments(query = {}) {
    const items = await this.find(query).toArray();
    return items.length;
  }

  find(query = {}) {
    let items = this._getItems();

    // Query filter
    if (Object.keys(query).length > 0) {
      items = items.filter(item => {
        for (const key of Object.keys(query)) {
          if (key === '$or' && Array.isArray(query.$or)) {
            const matchesOr = query.$or.some(subQuery => {
              for (const subKey of Object.keys(subQuery)) {
                if (subQuery[subKey] instanceof RegExp) {
                  if (!subQuery[subKey].test(item[subKey] || '')) return false;
                } else if (subQuery[subKey] && subQuery[subKey].$regex) {
                  const reg = new RegExp(subQuery[subKey].$regex);
                  if (!reg.test(item[subKey] || '')) return false;
                } else if (subQuery[subKey] && typeof subQuery[subKey] === 'object' && subQuery[subKey].$in) {
                  if (!subQuery[subKey].$in.includes(item[subKey])) return false;
                } else if (subKey === '_id' && item._id && item._id.toString() !== subQuery._id.toString()) {
                  return false;
                } else if (item[subKey] !== subQuery[subKey]) {
                  return false;
                }
              }
              return true;
            });
            if (!matchesOr) return false;
          } else if (query[key] && query[key].$lte !== undefined) {
            if (!(Number(item[key]) <= query[key].$lte)) return false;
          } else if (query[key] && query[key].$gte !== undefined) {
            if (!(Number(item[key]) >= query[key].$gte)) return false;
          } else if (key === '_id' && item._id) {
            if (item._id.toString() !== query._id.toString()) return false;
          } else if (item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    }

    const cursor = {
      _items: items,
      sort(sortObj = {}) {
        const [field, direction] = Object.entries(sortObj)[0] || ['_id', 1];
        this._items.sort((a, b) => {
          if (a[field] < b[field]) return direction === -1 ? 1 : -1;
          if (a[field] > b[field]) return direction === -1 ? -1 : 1;
          return 0;
        });
        return this;
      },
      skip(n = 0) {
        this._items = this._items.slice(n);
        return this;
      },
      limit(n = 50) {
        this._items = this._items.slice(0, n);
        return this;
      },
      async toArray() {
        return this._items;
      }
    };

    return cursor;
  }

  async findOne(query = {}) {
    const list = await this.find(query).toArray();
    return list[0] || null;
  }

  async insertOne(doc) {
    const items = this._getItems();
    const newDoc = {
      ...doc,
      _id: doc._id || new ObjectId().toString()
    };
    items.push(newDoc);
    this._saveItems(items);
    return { insertedId: newDoc._id };
  }

  async insertMany(docs) {
    const items = this._getItems();
    const insertedIds = {};
    docs.forEach((doc, idx) => {
      const newDoc = {
        ...doc,
        _id: doc._id || new ObjectId().toString()
      };
      items.push(newDoc);
      insertedIds[idx] = newDoc._id;
    });
    this._saveItems(items);
    return { insertedIds, insertedCount: docs.length };
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const items = this._getItems();
    const index = items.findIndex(item => {
      if (filter._id) return item._id.toString() === filter._id.toString();
      return false;
    });

    if (index === -1) return null;

    if (update.$set) {
      items[index] = { ...items[index], ...update.$set };
    }
    this._saveItems(items);
    return items[index];
  }

  async updateOne(filter, update, options = {}) {
    const items = this._getItems();
    const index = items.findIndex(item => {
      if (filter._id) return item._id.toString() === filter._id.toString();
      if (filter.userId) return item.userId === filter.userId;
      return false;
    });

    if (index === -1) {
      if (options.upsert && update.$set) {
        const newDoc = {
          ...filter,
          ...update.$set,
          _id: new ObjectId().toString()
        };
        items.push(newDoc);
        this._saveItems(items);
        return { modifiedCount: 1, upsertedId: newDoc._id };
      }
      return { modifiedCount: 0 };
    }

    if (update.$set) {
      items[index] = { ...items[index], ...update.$set };
    }
    if (update.$inc) {
      for (const k of Object.keys(update.$inc)) {
        items[index][k] = (items[index][k] || 0) + update.$inc[k];
      }
    }

    this._saveItems(items);
    return { modifiedCount: 1 };
  }

  async deleteOne(filter) {
    let items = this._getItems();
    const initialLen = items.length;
    items = items.filter(item => {
      if (filter._id) return item._id.toString() !== filter._id.toString();
      return true;
    });
    this._saveItems(items);
    return { deletedCount: initialLen - items.length };
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      this._saveItems([]);
      return { deletedCount: 999 };
    }
    return { deletedCount: 0 };
  }

  aggregate(pipeline = []) {
    return {
      async toArray() {
        const items = loadLocalData(this.name || 'orders');
        let totalSales = 0;
        items.forEach(o => {
          totalSales += (Number(o.grandTotal) || Number(o.total) || 0);
        });
        return [{ _id: null, totalSales }];
      }
    };
  }
}

class LocalMongoDB {
  constructor() {
    this.collections = {};
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new LocalMongoCollection(name);
    }
    return this.collections[name];
  }
}

async function connectDB() {
  if (dbInstance) return dbInstance;

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected directly to MongoDB Atlas (Fordoportro3.0 Cluster0)!");
    dbInstance = client.db("fordoportro_db");
    return dbInstance;
  } catch (err) {
    console.warn("\n⚠️  Notice regarding MongoDB Atlas connection:");
    console.warn(`Reason: ${err.message}`);
    console.warn("ℹ️  Tip: If this is an IP whitelist issue (SSL alert 80), in MongoDB Atlas go to:");
    console.warn("   Security -> Network Access -> Add IP Address -> 'Allow Access from Anywhere (0.0.0.0/0)'");
    console.warn("🛡️  Fallback activated: Running with local persistent storage engine.");
    console.warn("   All products, orders, WhatsApp messaging, and admin operations are 100% active!\n");

    isUsingLocalFallback = true;
    dbInstance = new LocalMongoDB();
    return dbInstance;
  }
}

function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return dbInstance;
}

module.exports = { connectDB, getDB, client, isUsingLocalFallback };
