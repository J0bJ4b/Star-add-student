import { Student, Reward, StarLog, AttendanceRecord, StarCategory } from '../types';

export interface ExportDataPayload {
  students: Student[];
  classrooms: string[];
  rewards: Reward[];
  categories: StarCategory[];
  attendance: AttendanceRecord[];
  allLogs: StarLog[];
}

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * Search Google Drive for Google Spreadsheets that the user has access to
 */
export async function listUserSpreadsheets(accessToken: string): Promise<DriveSpreadsheetFile[]> {
  try {
    const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed = false");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,modifiedTime,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to fetch files (${response.status})`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (err: any) {
    console.error('Error listing spreadsheets:', err);
    throw err;
  }
}

/**
 * Fetch spreadsheet metadata (e.g. title and sheet tab names)
 */
export async function getSpreadsheetDetails(accessToken: string, spreadsheetId: string) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties(sheetId,title,gridProperties)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to get spreadsheet details (${response.status})`);
  }

  return await response.json();
}

/**
 * Read data from a specific sheet range
 */
export async function readSpreadsheetRange(accessToken: string, spreadsheetId: string, range: string) {
  const encodedRange = encodeURIComponent(range);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to read sheet data (${response.status})`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Helper to format date string
 */
const formatDateTime = (timestamp: number) => {
  try {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH')}`;
  } catch {
    return '';
  }
};

/**
 * Creates a brand new Google Spreadsheet formatted for "ดาวเด็กดี" with multiple tabs
 */
export async function createAndPopulateSpreadsheet(
  accessToken: string,
  title: string,
  data: ExportDataPayload
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Prepare initial spreadsheet with sheets
  const createPayload = {
    properties: {
      title: title || `ดาวเด็กดี - บันทึกคะแนนและประวัติ (${new Date().toLocaleDateString('th-TH')})`,
    },
    sheets: [
      { properties: { title: 'รายชื่อและคะแนนดาว', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'ประวัติการให้ดาว', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'บันทึกการเช็คชื่อ', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'รายการของรางวัล', gridProperties: { frozenRowCount: 1 } } },
    ],
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create spreadsheet (${createRes.status})`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate values in batch
  await updateAllTabsInSpreadsheet(accessToken, spreadsheetId, data);

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Updates or populates all tabs in an existing or new spreadsheet
 */
export async function updateAllTabsInSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  data: ExportDataPayload
): Promise<void> {
  const { students, rewards, attendance, allLogs } = data;

  // Prepare Students Tab
  const studentsRows: (string | number)[][] = [
    ['รหัสนักเรียน', 'ชื่อ - นามสกุล', 'ห้องเรียน', 'รูปประจำตัว', 'ดาวสะสมคงเหลือ (ดวง)', 'จำนวนครั้งที่ได้รับดาว', 'จำนวนรางวัลที่แลกแล้ว (ชิ้น)']
  ];
  students.forEach((s) => {
    studentsRows.push([
      s.id,
      s.name,
      s.classroom,
      s.avatar || '⭐',
      s.stars,
      (s.starHistory || []).length,
      (s.claimedRewards || []).length
    ]);
  });

  // Prepare Star Logs Tab
  const logsRows: (string | number)[][] = [
    ['วันและเวลา', 'ชื่อนักเรียน', 'ห้องเรียน', 'จำนวนดาว', 'เกณฑ์ความดี / หัวข้อ', 'บันทึกเพิ่มเติม', 'รหัสบันทึก']
  ];
  allLogs.forEach((l) => {
    logsRows.push([
      formatDateTime(l.timestamp),
      l.studentName,
      l.classroom,
      l.amount > 0 ? `+${l.amount}` : l.amount,
      l.category,
      l.note || '-',
      l.id
    ]);
  });

  // Prepare Attendance Tab
  const attendanceRows: (string | number)[][] = [
    ['วันที่ (ปี-เดือน-วัน)', 'ชื่อนักเรียน', 'ห้องเรียน', 'สถานะการมาเรียน', 'หมายเหตุ', 'รหัสเช็คชื่อ']
  ];
  const statusThai: Record<string, string> = {
    present: 'มาเรียนปกติ ✅',
    late: 'มาสาย ⏰',
    leave: 'ลาป่วย/ลากิจ 📝',
    absent: 'ขาดเรียน ❌',
  };
  attendance.forEach((a) => {
    attendanceRows.push([
      a.date,
      a.studentName,
      a.classroom,
      statusThai[a.status] || a.status,
      a.note || '-',
      a.id
    ]);
  });

  // Prepare Rewards Tab
  const rewardsRows: (string | number)[][] = [
    ['รหัสรางวัล', 'ไอคอน', 'ชื่อของรางวัล', 'ดาวที่ต้องใช้ (ดวง)', 'จำนวนคงเหลือในคลัง (ชิ้น)']
  ];
  rewards.forEach((r) => {
    rewardsRows.push([
      r.id,
      r.icon || '🎁',
      r.name,
      r.requiredStars,
      r.stock !== undefined ? r.stock : 'ไม่จำกัด'
    ]);
  });

  // Batch update values
  const valueData = [
    { range: 'รายชื่อและคะแนนดาว!A1', values: studentsRows },
    { range: 'ประวัติการให้ดาว!A1', values: logsRows },
    { range: 'บันทึกการเช็คชื่อ!A1', values: attendanceRows },
    { range: 'รายการของรางวัล!A1', values: rewardsRows },
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueData,
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to update spreadsheet cells (${updateRes.status})`);
  }
}

/**
 * Extracts spreadsheet ID from full URL or returns raw ID
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}
