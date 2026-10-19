-- Migration to add profile picture and banner URLs to users table
ALTER TABLE users 
ADD COLUMN profile_pic_url TEXT,
ADD COLUMN banner_url TEXT;
