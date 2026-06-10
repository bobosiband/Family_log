import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("MONGO_URI is not configured");
}

const client = new MongoClient(mongoUri);
const dbName = "familylog";
const collectionName = "datastore";


let data = {
    users: [],
    totalusersevercreated: 0,
    messages: [],
    totalMessagesEverCreated: 0
};

let isConnected = false;

function normalizeDataShape(savedData = {}) {
  return {
    users: Array.isArray(savedData.users) ? savedData.users : [],
    totalusersevercreated: Number.isInteger(savedData.totalusersevercreated)
      ? savedData.totalusersevercreated
      : 0,
    messages: Array.isArray(savedData.messages) ? savedData.messages : [],
    totalMessagesEverCreated: Number.isInteger(savedData.totalMessagesEverCreated)
      ? savedData.totalMessagesEverCreated
      : 0,
  };
}

async function initData() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const saved = await collection.findOne({ name: "appdata" });

  if (saved) {
    data = normalizeDataShape(saved.data);
    for (const user of data.users) {
      if (!user.memberSince) {
        user.memberSince = new Date().toISOString();
      }
    }
  } else {
    data = normalizeDataShape(data);
    await collection.insertOne({ name: "appdata", data });
  }
}

async function persistData() {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  await collection.updateOne(
    { name: "appdata" },
    { $set: { data } },
    { upsert: true }
  );
}

/**
 * 
 * @returns 
 * 
 */
function getData() {
    return data;
}

export {
  getData,
  initData,
  persistData
}
