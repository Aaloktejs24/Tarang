from pymongo import MongoClient

client = MongoClient("mongodb://admin:admin123@localhost:27017/?authSource=admin")
db = client.lms_db

res1 = db.enrollments.delete_many({})
print("Deleted", res1.deleted_count, "enrollments")

res2 = db.courses.update_many({}, {"$set": {"students": 0}})
print("Updated", res2.modified_count, "courses")
