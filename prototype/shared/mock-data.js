/**
 * Mock Data สำหรับ Prototype
 * ใช้ REP-0001 เป็น Single Source of Truth
 */
const MOCK_DATA = {
  // Current user session
  currentUser: null,
  currentRole: null,

  // Demo accounts
  accounts: {
    'cadet01': { name: 'นนอ.สมชาย ใจดี', role: 'cadet', building: 'อาคาร 2', room: '301' },
    'admin01': { name: 'ร.อ.พิเชฐ ประจำอาคาร', role: 'admin' },
    'tech01': { name: 'ช่างไฟฟ้า A', role: 'tech' },
    'exec01': { name: 'ร.ท.ผู้บังคับบัญชา', role: 'exec' }
  },

  // REP-0001 - Sample Case
  repairCase: {
    id: 'REP-0001',
    reporter: 'นนอ.สมชาย ใจดี',
    building: 'อาคาร 2',
    floor: '3',
    room: '301',
    problemType: 'ไฟฟ้า',
    urgency: 'ปกติ',
    description: 'หลอดไฟโต๊ะอ่านหนังสือเสีย ไม่ติดเลยครับ',
    photo: null,
    submittedAt: '21 ก.ย. 2567 09:30',

    // Status timeline
    statusHistory: [
      { status: 'รอตรวจสอบ', timestamp: '21 ก.ย. 2567 09:30', actor: 'ระบบ', note: 'สร้างคำขอแจ้งซ่อม' },
      { status: 'รับเรื่อง', timestamp: '21 ก.ย. 2567 10:15', actor: 'ร.อ.พิเชฐ', note: 'ตรวจสอบและรับเรื่อง' },
      { status: 'กำลังซ่อม', timestamp: '21 ก.ย. 2567 11:00', actor: 'ช่างไฟฟ้า A', note: 'เริ่มดำเนินการซ่อม' },
      { status: 'ซ่อมเสร็จ', timestamp: '21 ก.ย. 2567 12:30', actor: 'ช่างไฟฟ้า A', note: 'บันทึกผลการซ่อมและปิดงาน' }
    ],
    currentStatusIndex: 0, // เริ่มที่ 'รอตรวจสอบ'

    // Assignment
    assignedTechnician: 'ช่างไฟฟ้า A',
    assignedAt: '21 ก.ย. 2567 10:20',

    // Expense
    expense: {
      parts: [
        { name: 'หลอดไฟ LED 12W', qty: 1, unitPrice: 120, total: 120 }
      ],
      laborCost: 0,
      totalCost: 120
    }
  },

  // All repair requests (for Admin list)
  repairRequests: [
    {
      id: 'REP-0001',
      reporter: 'นนอ.สมชาย ใจดี',
      building: 'อาคาร 2',
      room: '301',
      problemType: 'ไฟฟ้า',
      urgency: 'ปกติ',
      status: 'รอตรวจสอบ',
      submittedAt: '21 ก.ย. 2567 09:30'
    },
    {
      id: 'REP-0002',
      reporter: 'นนอ.วิชัย รักเรียน',
      building: 'อาคาร 1',
      room: '205',
      problemType: 'ประปา',
      urgency: 'ด่วน',
      status: 'กำลังซ่อม',
      submittedAt: '20 ก.ย. 2567 14:20'
    },
    {
      id: 'REP-0003',
      reporter: 'นนอ.อาทิตย์ สว่าง',
      building: 'อาคาร 3',
      room: '101',
      problemType: 'แอร์',
      urgency: 'ปกติ',
      status: 'ซ่อมเสร็จ',
      submittedAt: '19 ก.ย. 2567 16:45'
    }
  ],

  // Technicians
  technicians: [
    { id: 'tech01', name: 'ช่างไฟฟ้า A', specialty: 'ไฟฟ้า', status: 'พร้อมงาน' },
    { id: 'tech02', name: 'ช่างประปา B', specialty: 'ประปา', status: 'กำลังซ่อม' },
    { id: 'tech03', name: 'ช่างแอร์ C', specialty: 'แอร์', status: 'พร้อมงาน' }
  ],

  // Statistics for Executive Dashboard
  stats: {
    totalRequests: 128,
    inProgress: 12,
    completed: 96,
    totalCost: 24850,
    byType: {
      'ไฟฟ้า': 52,
      'ประปา': 38,
      'แอร์': 25,
      'อื่นๆ': 13
    }
  },

  // Status configuration
  statuses: [
    { key: 'รอตรวจสอบ', label: 'รอตรวจสอบ', color: '#F59E0B', icon: '🟡' },
    { key: 'รับเรื่อง', label: 'รับเรื่อง', color: '#3B82F6', icon: '🔵' },
    { key: 'กำลังซ่อม', label: 'กำลังซ่อม', color: '#F97316', icon: '🟠' },
    { key: 'ซ่อมเสร็จ', label: 'ซ่อมเสร็จ', color: '#22C55E', icon: '🟢' }
  ],

  // Navigation per role
  navItems: {
    cadet: [
      { id: 'home', label: 'หน้าหลัก', icon: '🏠' },
      { id: 'form', label: 'แจ้งซ่อม', icon: '🔧' },
      { id: 'tracking', label: 'ติดตามสถานะ', icon: '📋' },
      { id: 'profile', label: 'บัญชี', icon: '👤' }
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'list', label: 'คำขอแจ้งซ่อม', icon: '📋' },
      { id: 'jobs', label: 'งานซ่อม', icon: '🔧' },
      { id: 'profile', label: 'บัญชี', icon: '👤' }
    ],
    tech: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'jobs', label: 'งานของฉัน', icon: '🔧' },
      { id: 'history', label: 'ประวัติการซ่อม', icon: '📋' },
      { id: 'profile', label: 'บัญชี', icon: '�พ' }
    ],
    exec: [
      { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { id: 'reports', label: 'รายงาน', icon: '📊' },
      { id: 'costs', label: 'ค่าใช้จ่าย', icon: '💰' },
      { id: 'profile', label: 'บัญชี', icon: '👤' }
    ]
  }
};

// Helper functions
function getCurrentUser() {
  return MOCK_DATA.currentUser;
}

function getCurrentRole() {
  return MOCK_DATA.currentRole;
}

function setCurrentUser(username) {
  const account = MOCK_DATA.accounts[username];
  if (account) {
    MOCK_DATA.currentUser = account;
    MOCK_DATA.currentRole = account.role;
    return true;
  }
  return false;
}

function logout() {
  MOCK_DATA.currentUser = null;
  MOCK_DATA.currentRole = null;
}

function getRepairCase() {
  return MOCK_DATA.repairCase;
}

function getRepairRequests() {
  return MOCK_DATA.repairRequests;
}

function getTechnicians() {
  return MOCK_DATA.technicians;
}

function getStats() {
  return MOCK_DATA.stats;
}

function getStatuses() {
  return MOCK_DATA.statuses;
}

function getNavItems(role) {
  return MOCK_DATA.navItems[role] || [];
}

function getStatusConfig(statusKey) {
  return MOCK_DATA.statuses.find(s => s.key === statusKey) || MOCK_DATA.statuses[0];
}

function formatTHB(amount) {
  return '฿' + amount.toLocaleString();
}

function advanceStatus() {
  const case_ = MOCK_DATA.repairCase;
  if (case_.currentStatusIndex < case_.statusHistory.length - 1) {
    case_.currentStatusIndex++;
    case_.status = case_.statusHistory[case_.currentStatusIndex].status;
  }
  return case_.currentStatusIndex;
}

function setStatus(index) {
  const case_ = MOCK_DATA.repairCase;
  if (index >= 0 && index < case_.statusHistory.length) {
    case_.currentStatusIndex = index;
    case_.status = case_.statusHistory[index].status;
  }
  return case_.currentStatusIndex;
}