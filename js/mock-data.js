/**
 * Mock Data — ระบบแจ้งซ่อมอาคารนอน
 * ใช้เป็น seed สำหรับ state-manager (localStorage)
 * เอกสารอ้างอิง: report/ + PROJECT_CONTEXT.md
 */

const MOCK_DATA = {
  accounts: {
    cadet01: { username: 'cadet01', password: '1234', name: 'นนอ.สมชาย ใจดี', role: 'cadet' },
    admin01: { username: 'admin01', password: '1234', name: 'ร.อ.พิเชฐ ประจำอาคาร', role: 'admin' },
    tech01:  { username: 'tech01',  password: '1234', name: 'ช่างไฟฟ้า A',         role: 'tech' },
    exec01:  { username: 'exec01',  password: '1234', name: 'ร.ท.ผู้บังคับบัญชา',   role: 'exec' }
  },

  roleMeta: {
    cadet: { label: 'นักเรียนนายเรืออากาศ', home: '/cadet/home' },
    admin: { label: 'ผู้ดูแลอาคาร',          home: '/admin/list' },
    tech:  { label: 'ช่าง',                  home: '/tech/jobs' },
    exec:  { label: 'ผู้บังคับบัญชา',        home: '/exec/dashboard' }
  },

  statuses: [
    { key: 'รอตรวจสอบ', label: 'รอตรวจสอบ' },
    { key: 'รับเรื่อง',   label: 'รับเรื่อง' },
    { key: 'กำลังซ่อม',  label: 'กำลังซ่อม' },
    { key: 'ซ่อมเสร็จ',  label: 'ซ่อมเสร็จ' }
  ],

  buildings: ['อาคาร 1', 'อาคาร 2', 'อาคาร 3'],
  floors: ['1', '2', '3', '4'],
  problemTypes: ['ไฟฟ้า', 'ประปา', 'แอร์', 'เฟอร์นิเจอร์', 'โครงสร้าง', 'อื่นๆ'],
  urgencies: ['ปกติ', 'ด่วน'],

  technicians: [
    { id: 'tech01', name: 'ช่างไฟฟ้า A',   specialty: 'ไฟฟ้า' },
    { id: 'tech02', name: 'ช่างประปา B',  specialty: 'ประปา' },
    { id: 'tech03', name: 'ช่างแอร์ C',    specialty: 'แอร์' }
  ],

  nav: {
    cadet: [
      { route: '/cadet/home',     label: 'หน้าหลัก',     icon: '🏠' },
      { route: '/cadet/form',     label: 'แจ้งซ่อม',     icon: '🔧' },
      { route: '/cadet/tracking', label: 'ติดตามสถานะ', icon: '📋' }
    ],
    admin: [
      { route: '/admin/list',   label: 'รายการแจ้งซ่อม', icon: '📋' },
      { route: '/admin/list',   label: 'งานซ่อม',        icon: '🔧', query: { status: 'กำลังซ่อม' } },
      { route: '/admin/report', label: 'ภาพรวม / รายงาน', icon: '📊' },
      { route: '/admin/users',  label: 'ผู้ใช้และสิทธิ์',  icon: '👥' }
    ],
    tech: [
      { route: '/tech/jobs',    label: 'งานของฉัน',      icon: '🔧' },
      { route: '/tech/jobs',    label: 'กำลังซ่อม',      icon: '🛠️', query: { status: 'กำลังซ่อม' } },
      { route: '/tech/jobs',    label: 'ประวัติการซ่อม', icon: '📂', query: { status: 'ซ่อมเสร็จ' } }
    ],
    exec: [
      { route: '/exec/dashboard', label: 'ภาพรวม',  icon: '📊' },
      { route: '/exec/dashboard', label: 'รายงาน',  icon: '📈' },
      { route: '/exec/dashboard', label: 'ค่าใช้จ่าย', icon: '💰' }
    ]
  },

  seedRequests: [
    {
      id: 'REP-0001',
      reporter: 'นนอ.สมชาย ใจดี',
      reporterUser: 'cadet01',
      building: 'อาคาร 2', floor: '3', room: '301',
      problemType: 'ไฟฟ้า', urgency: 'ปกติ',
      description: 'หลอดไฟโต๊ะอ่านหนังสือเสีย ไม่ติดเลยครับ',
      photo: null,
      submittedAt: '21 ก.ย. 2567 09:30',
      status: 'รอตรวจสอบ',
      assignedTechnician: null, assignedAt: null,
      startAt: null, completedAt: null,
      repairResult: null,
      expense: { parts: [], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '21 ก.ย. 2567 09:30', actor: 'นนอ.สมชาย ใจดี', note: 'สร้างคำขอแจ้งซ่อม' }
      ]
    },
    {
      id: 'REP-0005',
      reporter: 'นนอ.สมชาย ใจดี',
      reporterUser: 'cadet01',
      building: 'อาคาร 2', floor: '3', room: '310',
      problemType: 'ไฟฟ้า', urgency: 'ด่วน',
      description: 'ปลั๊กไฟในห้องมีเสียงดังและมีกลิ่นไหม้',
      photo: null,
      submittedAt: '20 ก.ย. 2567 16:40',
      status: 'รับเรื่อง',
      assignedTechnician: 'ช่างไฟฟ้า A', assignedAt: '20 ก.ย. 2567 17:10',
      startAt: null, completedAt: null,
      repairResult: null,
      expense: { parts: [], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '20 ก.ย. 2567 16:40', actor: 'นนอ.กิตติ รักเรียน', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '20 ก.ย. 2567 17:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '20 ก.ย. 2567 17:10', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างไฟฟ้า A' }
      ]
    },
    {
      id: 'REP-0002',
      reporter: 'นนอ.วิชัย รักเรียน',
      reporterUser: 'cadet02',
      building: 'อาคาร 1', floor: '2', room: '205',
      problemType: 'ประปา', urgency: 'ด่วน',
      description: 'ท่อน้ำห้องน้ำรั่ว น้ำไหลไม่หยุด',
      photo: null,
      submittedAt: '20 ก.ย. 2567 14:20',
      status: 'กำลังซ่อม',
      assignedTechnician: 'ช่างประปา B', assignedAt: '20 ก.ย. 2567 15:00',
      startAt: '20 ก.ย. 2567 15:20', completedAt: null,
      repairResult: null,
      expense: { parts: [], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '20 ก.ย. 2567 14:20', actor: 'นนอ.วิชัย รักเรียน', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '20 ก.ย. 2567 14:50', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '20 ก.ย. 2567 15:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างประปา B' },
        { status: 'กำลังซ่อม', timestamp: '20 ก.ย. 2567 15:20', actor: 'ช่างประปา B', note: 'เริ่มดำเนินการซ่อม' }
      ]
    },
    {
      id: 'REP-0007',
      reporter: 'นนอ.ธนพล สว่าง',
      reporterUser: 'cadet02',
      building: 'อาคาร 3', floor: '1', room: '110',
      problemType: 'ไฟฟ้า', urgency: 'ปกติ',
      description: 'ไฟเพดานห้องกะพริบตลอดเวลา',
      photo: null,
      submittedAt: '19 ก.ย. 2567 10:05',
      status: 'กำลังซ่อม',
      assignedTechnician: 'ช่างไฟฟ้า A', assignedAt: '19 ก.ย. 2567 10:40',
      startAt: '19 ก.ย. 2567 11:00', completedAt: null,
      repairResult: null,
      expense: { parts: [], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '19 ก.ย. 2567 10:05', actor: 'นนอ.ธนพล สว่าง', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '19 ก.ย. 2567 10:30', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '19 ก.ย. 2567 10:40', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างไฟฟ้า A' },
        { status: 'กำลังซ่อม', timestamp: '19 ก.ย. 2567 11:00', actor: 'ช่างไฟฟ้า A', note: 'เริ่มดำเนินการซ่อม' }
      ]
    },
    {
      id: 'REP-0003',
      reporter: 'นนอ.อาทิตย์ สว่าง',
      reporterUser: 'cadet02',
      building: 'อาคาร 3', floor: '1', room: '101',
      problemType: 'แอร์', urgency: 'ปกติ',
      description: 'แอร์ไม่เย็น มีน้ำหยดจากเครื่อง',
      photo: null,
      submittedAt: '19 ก.ย. 2567 16:45',
      status: 'ซ่อมเสร็จ',
      assignedTechnician: 'ช่างแอร์ C', assignedAt: '19 ก.ย. 2567 17:00',
      startAt: '20 ก.ย. 2567 08:30', completedAt: '20 ก.ย. 2567 11:00',
      repairResult: 'เติมน้ำยาแอร์และทำความสะอาดเครื่องกรองอากาศ',
      expense: { parts: [ { name: 'น้ำยาแอร์ R22', qty: 1, unitPrice: 750 } ], laborCost: 100, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '19 ก.ย. 2567 16:45', actor: 'นนอ.อาทิตย์ สว่าง', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '19 ก.ย. 2567 17:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '19 ก.ย. 2567 17:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างแอร์ C' },
        { status: 'กำลังซ่อม', timestamp: '20 ก.ย. 2567 08:30', actor: 'ช่างแอร์ C', note: 'เริ่มดำเนินการซ่อม' },
        { status: 'ซ่อมเสร็จ', timestamp: '20 ก.ย. 2567 11:00', actor: 'ช่างแอร์ C', note: 'บันทึกผลการซ่อมและปิดงาน' }
      ]
    },
    {
      id: 'REP-0006',
      reporter: 'นนอ.ศักดิ์ชัย แก้ว',
      reporterUser: 'cadet02',
      building: 'อาคาร 1', floor: '2', room: '212',
      problemType: 'ประปา', urgency: 'ปกติ',
      description: 'โถสุขภัณฑ์ชำรุด กดแล้วไม่ชักโครก',
      photo: null,
      submittedAt: '18 ก.ย. 2567 09:00',
      status: 'ซ่อมเสร็จ',
      assignedTechnician: 'ช่างประปา B', assignedAt: '18 ก.ย. 2567 09:30',
      startAt: '18 ก.ย. 2567 10:00', completedAt: '18 ก.ย. 2567 11:30',
      repairResult: 'เปลี่ยนลูกยางชักโครกและซ่อมกลไกการกดน้ำ',
      expense: { parts: [ { name: 'ลูกยางชักโครก', qty: 1, unitPrice: 180 } ], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '18 ก.ย. 2567 09:00', actor: 'นนอ.ศักดิ์ชัย แก้ว', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '18 ก.ย. 2567 09:30', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '18 ก.ย. 2567 09:30', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างประปา B' },
        { status: 'กำลังซ่อม', timestamp: '18 ก.ย. 2567 10:00', actor: 'ช่างประปา B', note: 'เริ่มดำเนินการซ่อม' },
        { status: 'ซ่อมเสร็จ', timestamp: '18 ก.ย. 2567 11:30', actor: 'ช่างประปา B', note: 'บันทึกผลการซ่อมและปิดงาน' }
      ]
    },
    {
      id: 'REP-0008',
      reporter: 'นนอ.สมชาย ใจดี',
      reporterUser: 'cadet01',
      building: 'อาคาร 2', floor: '1', room: '102',
      problemType: 'ไฟฟ้า', urgency: 'ปกติ',
      description: 'หลอดไฟหลอดไส้ในห้องนอนเสีย 2 หลอด',
      photo: null,
      submittedAt: '18 ก.ย. 2567 13:25',
      status: 'ซ่อมเสร็จ',
      assignedTechnician: 'ช่างไฟฟ้า A', assignedAt: '18 ก.ย. 2567 14:00',
      startAt: '18 ก.ย. 2567 14:30', completedAt: '18 ก.ย. 2567 15:00',
      repairResult: 'เปลี่ยนหลอดไฟใหม่ 2 หลอด',
      expense: { parts: [ { name: 'หลอดไฟ LED', qty: 2, unitPrice: 120 } ], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '18 ก.ย. 2567 13:25', actor: 'นนอ.สมชาย ใจดี', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '18 ก.ย. 2567 14:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '18 ก.ย. 2567 14:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างไฟฟ้า A' },
        { status: 'กำลังซ่อม', timestamp: '18 ก.ย. 2567 14:30', actor: 'ช่างไฟฟ้า A', note: 'เริ่มดำเนินการซ่อม' },
        { status: 'ซ่อมเสร็จ', timestamp: '18 ก.ย. 2567 15:00', actor: 'ช่างไฟฟ้า A', note: 'บันทึกผลการซ่อมและปิดงาน' }
      ]
    },
    {
      id: 'REP-0004',
      reporter: 'นนอ.นภดล ใจดี',
      reporterUser: 'cadet03',
      building: 'อาคาร 1', floor: '1', room: '105',
      problemType: 'เฟอร์นิเจอร์', urgency: 'ปกติ',
      description: 'โต๊ะเขียนหนังสือเขย่า ขาข้างหนึ่งหัก',
      photo: null,
      submittedAt: '17 ก.ย. 2567 11:10',
      status: 'รอตรวจสอบ',
      assignedTechnician: null, assignedAt: null,
      startAt: null, completedAt: null,
      repairResult: null,
      expense: { parts: [], laborCost: 0, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '17 ก.ย. 2567 11:10', actor: 'นนอ.นภดล ใจดี', note: 'สร้างคำขอแจ้งซ่อม' }
      ]
    },
    {
      id: 'REP-0009',
      reporter: 'นนอ.ปกรณ์กิจ สุข',
      reporterUser: 'cadet03',
      building: 'อาคาร 1', floor: '3', room: '308',
      problemType: 'โครงสร้าง', urgency: 'ปกติ',
      description: 'รอยร้าวที่ผนังห้องและสีหลุดล่อน',
      photo: null,
      submittedAt: '16 ก.ย. 2567 15:30',
      status: 'ซ่อมเสร็จ',
      assignedTechnician: 'ช่างไฟฟ้า A', assignedAt: '16 ก.ย. 2567 16:00',
      startAt: '17 ก.ย. 2567 09:00', completedAt: '17 ก.ย. 2567 12:00',
      repairResult: 'อุดรอยร้าวและทาสีทับใหม่',
      expense: { parts: [ { name: 'สีทาภายใน', qty: 1, unitPrice: 420 }, { name: 'ปูนอุดรอยร้าว', qty: 1, unitPrice: 85 } ], laborCost: 150, otherCost: 0 },
      history: [
        { status: 'รอตรวจสอบ', timestamp: '16 ก.ย. 2567 15:30', actor: 'นนอ.ปกรณ์กิจ สุข', note: 'สร้างคำขอแจ้งซ่อม' },
        { status: 'รับเรื่อง', timestamp: '16 ก.ย. 2567 16:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'ตรวจสอบและรับเรื่อง' },
        { status: 'รับเรื่อง', timestamp: '16 ก.ย. 2567 16:00', actor: 'ร.อ.พิเชฐ ประจำอาคาร', note: 'มอบหมาย ช่างไฟฟ้า A' },
        { status: 'กำลังซ่อม', timestamp: '17 ก.ย. 2567 09:00', actor: 'ช่างไฟฟ้า A', note: 'เริ่มดำเนินการซ่อม' },
        { status: 'ซ่อมเสร็จ', timestamp: '17 ก.ย. 2567 12:00', actor: 'ช่างไฟฟ้า A', note: 'บันทึกผลการซ่อมและปิดงาน' }
      ]
    }
  ]
};