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

async function initData() {
  if (isConnected) return;

  await client.connect();
  isConnected = true;

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const saved = await collection.findOne({ name: "appdata" });

  if (saved) {
    data = saved.data;
    for (const user of data.users) {
      if (!user.memberSince) {
        user.memberSince = new Date().toISOString();
      }
    }
    if (!data.messages) data.messages = [];
    if (!data.totalMessagesEverCreated) data.totalMessagesEverCreated = 0;
  } else {
    await collection.insertOne({ name: "appdata", data });
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

// function loadDataOnStartup() {
//   try {
//     const rawData = fs.readFileSync('data.json', 'utf-8');
//     data = JSON.parse(rawData);
//   } catch {
//     console.log('Existing data could not be loaded or was not found, using default empty dataStore');
//   }
// }

/**
  * Save Data
  * Should be called every time an endpoint returns successfully
  * We should also consider calling it every time when an async function finishes running
*/
// function saveDataPersistently() {
//   try {
//     fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
//   } catch {
//     console.log('Data could not be saved persistantly');
//   }
// }

export {
  getData,
  // loadDataOnStartup,
  // saveDataPersistently,
  initData,
  persistData
}
