import { integer, pgTable, serial, text, timestamp, real, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID / Shared ID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

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

export const attendanceRecords = pgTable('attendance_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  recordId: text('record_id').notNull(),
  date: text('date').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  classroom: text('classroom').notNull(),
  status: text('status').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studentTeams = pgTable('student_teams', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  teamId: text('team_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  bgLight: text('bg_light').notNull(),
  studentIds: text('student_ids').notNull(), // JSON string array of IDs
  createdAt: timestamp('created_at').defaultNow(),
});

export const appMetadata = pgTable('app_metadata', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  updatedAt: real('updated_at').notNull(),
  extra: jsonb('extra'),
});
