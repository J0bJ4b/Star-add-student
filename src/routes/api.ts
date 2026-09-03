import express from 'express';
import { db } from '../db/index.js';
import { 
  users, 
  classrooms, 
  students, 
  categories, 
  rewards, 
  starLogs, 
  claimedRewards,
  attendanceRecords,
  studentTeams,
  appMetadata
} from '../db/schema.js';
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
      dbStarLogs,
      dbAttendance,
      dbTeams,
      dbMeta
    ] = await Promise.all([
      db.select().from(classrooms).where(eq(classrooms.userId, userId)),
      db.select().from(students).where(eq(students.userId, userId)),
      db.select().from(categories).where(eq(categories.userId, userId)),
      db.select().from(rewards).where(eq(rewards.userId, userId)),
      db.select().from(claimedRewards).where(eq(claimedRewards.userId, userId)),
      db.select().from(starLogs).where(eq(starLogs.userId, userId)).orderBy(desc(starLogs.timestamp)).limit(2000),
      db.select().from(attendanceRecords).where(eq(attendanceRecords.userId, userId)).limit(2000),
      db.select().from(studentTeams).where(eq(studentTeams.userId, userId)),
      db.select().from(appMetadata).where(eq(appMetadata.userId, userId))
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
        note: log.note || '',
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
      stock: r.stock ?? 10,
      icon: r.icon
    }));

    const mappedAttendance = dbAttendance.map(a => ({
      id: a.recordId,
      date: a.date,
      studentId: a.studentId,
      studentName: a.studentName,
      classroom: a.classroom,
      status: a.status,
      note: a.note || ''
    }));

    const mappedTeams = dbTeams.map(t => {
      let parsedStudentIds: string[] = [];
      try {
        parsedStudentIds = JSON.parse(t.studentIds);
      } catch {
        parsedStudentIds = [];
      }
      return {
        id: t.teamId,
        name: t.name,
        color: t.color,
        bgLight: t.bgLight,
        studentIds: parsedStudentIds
      };
    });

    const updatedAt = dbMeta[0]?.updatedAt || Date.now();

    res.json({
      updatedAt,
      hasData: dbStudents.length > 0 || dbClassrooms.length > 0,
      classrooms: dbClassrooms.map(c => c.name),
      students: mappedStudents,
      categories: dbCategories,
      rewards: mappedRewards,
      attendance: mappedAttendance,
      teams: mappedTeams
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Update entire state (batch operation)
router.post('/state', async (req: AuthRequest, res) => {
  const userId = req.user.dbId;
  const { 
    classrooms: newClassrooms, 
    students: newStudents, 
    categories: newCategories, 
    rewards: newRewards,
    attendance: newAttendance,
    teams: newTeams,
    timestamp: clientTimestamp
  } = req.body;
  
  const serverTimestamp = clientTimestamp || Date.now();

  try {
    await db.transaction(async (tx) => {
      // Classrooms
      if (newClassrooms && Array.isArray(newClassrooms)) {
        await tx.delete(classrooms).where(eq(classrooms.userId, userId));
        if (newClassrooms.length > 0) {
          await tx.insert(classrooms).values(newClassrooms.map((c: string) => ({ userId, name: c })));
        }
      }
      
      // Students
      if (newStudents && Array.isArray(newStudents)) {
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
            avatar: s.avatar || '⭐'
          })));

          const allHistory = newStudents.flatMap((s: any) => (s.starHistory || []).map((h: any) => ({
            userId,
            logId: h.id,
            studentId: h.studentId || s.id,
            studentName: h.studentName || s.name,
            classroom: h.classroom || s.classroom,
            amount: h.amount,
            category: h.category || 'ความดี',
            note: h.note || '',
            timestamp: h.timestamp || Date.now()
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
            timestamp: cr.timestamp || Date.now()
          })));

          if (allClaimed.length > 0) {
            await tx.insert(claimedRewards).values(allClaimed);
          }
        }
      }

      // Categories
      if (newCategories && Array.isArray(newCategories)) {
        await tx.delete(categories).where(eq(categories.userId, userId));
        if (newCategories.length > 0) {
          await tx.insert(categories).values(newCategories.map((c: any) => ({
            userId,
            name: c.name,
            color: c.color || 'text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100'
          })));
        }
      }

      // Rewards
      if (newRewards && Array.isArray(newRewards)) {
        await tx.delete(rewards).where(eq(rewards.userId, userId));
        if (newRewards.length > 0) {
          await tx.insert(rewards).values(newRewards.map((r: any) => ({
            userId,
            rewardId: r.id,
            name: r.name,
            requiredStars: r.requiredStars,
            stock: r.stock ?? 10,
            icon: r.icon || '🎁'
          })));
        }
      }

      // Attendance
      if (newAttendance && Array.isArray(newAttendance)) {
        await tx.delete(attendanceRecords).where(eq(attendanceRecords.userId, userId));
        if (newAttendance.length > 0) {
          await tx.insert(attendanceRecords).values(newAttendance.map((a: any) => ({
            userId,
            recordId: a.id,
            date: a.date,
            studentId: a.studentId,
            studentName: a.studentName,
            classroom: a.classroom,
            status: a.status,
            note: a.note || ''
          })));
        }
      }

      // Teams
      if (newTeams && Array.isArray(newTeams)) {
        await tx.delete(studentTeams).where(eq(studentTeams.userId, userId));
        if (newTeams.length > 0) {
          await tx.insert(studentTeams).values(newTeams.map((t: any) => ({
            userId,
            teamId: t.id,
            name: t.name,
            color: t.color,
            bgLight: t.bgLight,
            studentIds: JSON.stringify(t.studentIds || [])
          })));
        }
      }

      // Update app metadata
      await tx.delete(appMetadata).where(eq(appMetadata.userId, userId));
      await tx.insert(appMetadata).values({
        userId,
        updatedAt: serverTimestamp,
        extra: { lastSavedBy: req.user?.email || 'school-app' }
      });
    });

    res.json({ success: true, updatedAt: serverTimestamp });
  } catch (error) {
    console.error('Error saving state:', error);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

export default router;
