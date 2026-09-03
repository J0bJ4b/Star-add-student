import express from 'express';
import { db } from '../db/index.js';
import { users, classrooms, students, categories, rewards, starLogs, claimedRewards } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { AuthRequest } from '../../server.js';

const router = express.Router();

// Middleware to ensure user exists in db (defaults to shared school account)
const SHARED_UID = 'shared-school-account';

const ensureUser = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const uid = req.user?.uid || SHARED_UID;
  const email = req.user?.email || 'school@stargooddeeds.local';
  
  try {
    let userResult = await db.select().from(users).where(eq(users.uid, uid));
    if (userResult.length === 0) {
      userResult = await db.insert(users).values({ uid, email: email || '' }).returning();
    }
    if (!req.user) {
      req.user = {};
    }
    req.user.dbId = userResult[0].id;
    next();
  } catch (error) {
    console.error('Error in ensureUser middleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

router.use(ensureUser);

// Get all state
router.get('/state', async (req: AuthRequest, res) => {
  const userId = req.user.dbId;
  
  try {
    const [
      dbClassrooms,
      dbStudents,
      dbCategories,
      dbRewards,
      dbClaimedRewards,
      dbStarLogs
    ] = await Promise.all([
      db.select().from(classrooms).where(eq(classrooms.userId, userId)),
      db.select().from(students).where(eq(students.userId, userId)),
      db.select().from(categories).where(eq(categories.userId, userId)),
      db.select().from(rewards).where(eq(rewards.userId, userId)),
      db.select().from(claimedRewards).where(eq(claimedRewards.userId, userId)),
      db.select().from(starLogs).where(eq(starLogs.userId, userId)).orderBy(desc(starLogs.timestamp)).limit(500)
    ]);

    // Group logs and rewards by studentId
    const historyByStudent = dbStarLogs.reduce((acc, log) => {
      acc[log.studentId] = acc[log.studentId] || [];
      acc[log.studentId].push({
        id: log.logId,
        studentId: log.studentId,
        studentName: log.studentName,
        classroom: log.classroom,
        amount: log.amount,
        category: log.category,
        note: log.note,
        timestamp: log.timestamp
      });
      return acc;
    }, {} as Record<string, any[]>);

    const claimedByStudent = dbClaimedRewards.reduce((acc, cr) => {
      acc[cr.studentId] = acc[cr.studentId] || [];
      acc[cr.studentId].push({
        id: cr.id,
        rewardId: cr.rewardId,
        rewardName: cr.rewardName,
        requiredStars: cr.requiredStars,
        timestamp: cr.timestamp
      });
      return acc;
    }, {} as Record<string, any[]>);

    const mappedStudents = dbStudents.map(s => ({
      id: s.studentId,
      name: s.name,
      classroom: s.classroom,
      stars: s.stars,
      avatar: s.avatar,
      starHistory: historyByStudent[s.studentId] || [],
      claimedRewards: claimedByStudent[s.studentId] || []
    }));

    const mappedRewards = dbRewards.map(r => ({
      id: r.rewardId,
      name: r.name,
      requiredStars: r.requiredStars,
      stock: r.stock,
      icon: r.icon
    }));

    res.json({
      classrooms: dbClassrooms.map(c => c.name),
      students: mappedStudents,
      categories: dbCategories,
      rewards: mappedRewards
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Update entire state (batch operation)
// This is to easily mimic the current Firebase behavior where the whole state is saved
router.post('/state', async (req: AuthRequest, res) => {
  const userId = req.user.dbId;
  const { classrooms: newClassrooms, students: newStudents, categories: newCategories, rewards: newRewards } = req.body;
  
  try {
    await db.transaction(async (tx) => {
      // For simplicity, we can delete and re-insert, or intelligently upsert.
      // Given the simple app context, a full replace or careful upsert is needed.
      
      // Classrooms
      if (newClassrooms) {
        await tx.delete(classrooms).where(eq(classrooms.userId, userId));
        if (newClassrooms.length > 0) {
          await tx.insert(classrooms).values(newClassrooms.map((c: string) => ({ userId, name: c })));
        }
      }
      
      // Students
      if (newStudents) {
        await tx.delete(starLogs).where(eq(starLogs.userId, userId));
        await tx.delete(claimedRewards).where(eq(claimedRewards.userId, userId));
        await tx.delete(students).where(eq(students.userId, userId));
        
        if (newStudents.length > 0) {
          await tx.insert(students).values(newStudents.map((s: any) => ({
            userId,
            studentId: s.id,
            name: s.name,
            classroom: s.classroom,
            stars: s.stars,
            avatar: s.avatar || ''
          })));

          const allHistory = newStudents.flatMap((s: any) => (s.starHistory || []).map((h: any) => ({
            userId,
            logId: h.id,
            studentId: h.studentId,
            studentName: h.studentName,
            classroom: h.classroom,
            amount: h.amount,
            category: h.category,
            note: h.note || '',
            timestamp: h.timestamp
          })));

          if (allHistory.length > 0) {
            await tx.insert(starLogs).values(allHistory);
          }

          const allClaimed = newStudents.flatMap((s: any) => (s.claimedRewards || []).map((cr: any) => ({
            userId,
            studentId: s.id,
            rewardId: cr.rewardId,
            rewardName: cr.rewardName,
            requiredStars: cr.requiredStars,
            timestamp: cr.timestamp
          })));

          if (allClaimed.length > 0) {
            await tx.insert(claimedRewards).values(allClaimed);
          }
        }
      }

      // Categories
      if (newCategories) {
        await tx.delete(categories).where(eq(categories.userId, userId));
        if (newCategories.length > 0) {
          await tx.insert(categories).values(newCategories.map((c: any) => ({
            userId,
            name: c.name,
            color: c.color
          })));
        }
      }

      // Rewards
      if (newRewards) {
        await tx.delete(rewards).where(eq(rewards.userId, userId));
        if (newRewards.length > 0) {
          await tx.insert(rewards).values(newRewards.map((r: any) => ({
            userId,
            rewardId: r.id,
            name: r.name,
            requiredStars: r.requiredStars,
            stock: r.stock,
            icon: r.icon
          })));
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving state:', error);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

export default router;
