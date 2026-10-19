const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/lms_db?authSource=admin";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("lms_db");
    const result1 = await db.collection("enrollments").deleteMany({});
    const result2 = await db.collection("courses").updateMany({}, { $set: { students: 0 } });
    console.log("Deleted", result1.deletedCount, "enrollments");
    console.log("Updated", result2.modifiedCount, "courses");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
