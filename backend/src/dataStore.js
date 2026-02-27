import * as fs from 'fs';
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
const dbName = "familylog";
const collectionName = "datastore";


let data = {
    users: [],
    totalusersevercreated: 0
};

async function initData() {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const saved = await collection.findOne({ name: "appdata" });

  if (saved) {
    data = saved.data;
    console.log("✅ Data loaded from MongoDB");
  } else {
    await collection.insertOne({ name: "appdata", data });
    console.log("🆕 Initialized new datastore");
  }
}

async function persistData() {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  await collection.updateOne(
    { name: "appdata" },
    { $set: { data } }
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

function loadDataOnStartup() {
  try {
    const rawData = fs.readFileSync('data.json', 'utf-8');
    data = JSON.parse(rawData);
  } catch {
    console.log('Existing data could not be loaded or was not found, using default empty dataStore');
  }
}

/**
  * Save Data
  * Should be called every time an endpoint returns successfully
  * We should also consider calling it every time when an async function finishes running
*/
function saveDataPersistently() {
  try {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  } catch {
    console.log('Data could not be saved persistantly');
  }
}

export {
  getData,
  loadDataOnStartup,
  saveDataPersistently,
  initData,
  persistData
}
