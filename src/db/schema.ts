import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Since the old app stored entire state in a single document `teachers/{uid}`, 
// we will migrate to a similar robust table structure, or simple document-like structure, 
// but since we want to fully use Cloud SQL, let's make it normalized where necessary.
// We can store classrooms, students, rewards, categories in tables.

export const classrooms = pgTable('classrooms', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  studentId: text('student_id').notNull(), // Front-end string ID
  name: text('name').notNull(),
  classroom: text('classroom').notNull(),
  stars: real('stars').notNull().default(0),
  avatar: text('avatar').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const starLogs = pgTable('star_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  logId: text('log_id').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  classroom: text('classroom').notNull(),
  amount: real('amount').notNull(),
  category: text('category').notNull(),
  note: text('note'),
  timestamp: real('timestamp').notNull(),
});

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  rewardId: text('reward_id').notNull(),
  name: text('name').notNull(),
  requiredStars: real('required_stars').notNull(),
  stock: integer('stock'),
  icon: text('icon').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const claimedRewards = pgTable('claimed_rewards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  studentId: text('student_id').notNull(),
  rewardId: text('reward_id').notNull(),
  rewardName: text('reward_name').notNull(),
  requiredStars: real('required_stars').notNull(),
  timestamp: real('timestamp').notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
