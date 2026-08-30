export type RequestSource = 'balady-business' | 'balady-plus';
export type RequestStatus = 'new' | 'under-review' | 'needs-edit' | 'approved' | 'rejected';
export type RequestType =
  | 'issue-license' | 'renew-license' | 'cancel-license'
  | 'add-place' | 'edit-name' | 'edit-building-name' | 'edit-building-address'
  | 'correct-location' | 'edit-phone' | 'edit-website' | 'edit-activity'
  | 'edit-hours' | 'change-status-closed' | 'building-not-found' | 'report-missing';

export interface POIRequest {
  id: string;
  poiName: string;
  requestId: string;
  source: RequestSource;
  type: RequestType;
  city: string;
  district: string;
  licenseNumber?: string;
  submittedAt: string;
  slaHours: number;
  slaRemaining: number;
  status: RequestStatus;
  priority: 'high' | 'medium' | 'low';
  lat: number;
  lng: number;
  currentData?: POIData;
  incomingData?: Partial<POIData>;
  googleData?: Partial<POIData>;
  licenseData?: LicenseData;
  userNote?: string;
}

export interface POIData {
  nameAr: string;
  nameEn: string;
  brandName?: string;
  branchName?: string;
  mainCategory: string;
  subCategory: string;
  coordinates: string;
  address: string;
  region: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  workingDays?: string;
  openTime?: string;
  closeTime?: string;
  breakTime?: string;
  paymentMethods?: string;
  parking?: string;
  valetParking?: string;
  status: 'open' | 'closed' | 'pending';
}

export interface LicenseData {
  applicantPhone: string;
  establishmentName: string;
  unifiedNumber: string;
  isicCategory: string;
  activityDescription: string;
  shopArea: string;
  establishmentType: string;
  region: string;
  city: string;
  district: string;
  municipality: string;
  landNumber: string;
  planNumber: string;
  streetName: string;
  coordinates: string;
  brandName: string;
  officialName: string;
  signageName: string;
  shopNumber: string;
  propertyNumber: string;
  entrancesCount: string;
  floorsCount: string;
  signageType: string;
  totalSignageArea: string;
}

export const mockRequests: POIRequest[] = [
  {
    id: '1',
    poiName: 'مطعم الوادي العربي',
    requestId: 'BB-2024-00142',
    source: 'balady-business',
    type: 'renew-license',
    city: 'الرياض',
    district: 'العليا',
    licenseNumber: '6010123456',
    submittedAt: '2024-06-10T09:23:00',
    slaHours: 48,
    slaRemaining: 12,
    status: 'new',
    priority: 'high',
    lat: 24.7136,
    lng: 46.6753,
    currentData: {
      nameAr: 'مطعم الوادي العربي',
      nameEn: 'Al-Wadi Arabian Restaurant',
      brandName: 'الوادي',
      mainCategory: 'مطاعم وكافيهات',
      subCategory: 'مطعم عربي',
      coordinates: '24.7136, 46.6753',
      address: 'حي العليا، شارع العروبة',
      region: 'الرياض',
      city: 'الرياض',
      district: 'العليا',
      street: 'شارع العروبة',
      buildingNumber: '3421',
      phone: '0114567890',
      workingDays: 'السبت - الخميس',
      openTime: '07:00',
      closeTime: '01:00',
      paymentMethods: 'نقد، بطاقة ائتمان، مدى',
      status: 'open',
    },
    incomingData: {
      nameAr: 'مطعم الوادي العربي الأصيل',
      nameEn: 'Al-Wadi Authentic Arabian Restaurant',
      phone: '0554567890',
      workingDays: 'يومياً',
      openTime: '06:30',
      closeTime: '02:00',
    },
    googleData: {
      nameAr: 'مطعم الوادي العربي',
      nameEn: 'Al-Wadi Arabian Restaurant',
      phone: '0114567890',
      website: 'www.alwadi-rest.sa',
      workingDays: 'السبت - الخميس',
      openTime: '07:00',
      closeTime: '01:00',
    },
    licenseData: {
      applicantPhone: '0554567890',
      establishmentName: 'مطعم الوادي العربي الأصيل',
      unifiedNumber: '7002345678',
      isicCategory: 'I5610 - مطاعم وخدمات الطعام المتنقلة',
      activityDescription: 'تقديم وجبات الطعام العربية الأصيلة للأفراد والعائلات',
      shopArea: '450 م²',
      establishmentType: 'مطعم تجاري',
      region: 'منطقة الرياض',
      city: 'الرياض',
      district: 'العليا',
      municipality: 'أمانة الرياض',
      landNumber: '3421',
      planNumber: 'العليا-42',
      streetName: 'شارع العروبة',
      coordinates: '24.7136, 46.6753',
      brandName: 'الوادي',
      officialName: 'مطعم الوادي العربي الأصيل',
      signageName: 'الوادي',
      shopNumber: 'A-12',
      propertyNumber: '3421',
      entrancesCount: '2',
      floorsCount: '1',
      signageType: 'لافتة مضيئة',
      totalSignageArea: '6 م²',
    },
  },
  {
    id: '2',
    poiName: 'صيدلية الشفاء',
    requestId: 'BP-2024-00891',
    source: 'balady-plus',
    type: 'edit-phone',
    city: 'الرياض',
    district: 'النخيل',
    submittedAt: '2024-06-10T11:45:00',
    slaHours: 24,
    slaRemaining: 8,
    status: 'under-review',
    priority: 'medium',
    lat: 24.7741,
    lng: 46.7386,
    currentData: {
      nameAr: 'صيدلية الشفاء',
      nameEn: 'Al-Shifa Pharmacy',
      mainCategory: 'صحة وطب',
      subCategory: 'صيدلية',
      coordinates: '24.7741, 46.7386',
      address: 'حي النخيل، شارع الأمير سلطان',
      region: 'الرياض',
      city: 'الرياض',
      district: 'النخيل',
      street: 'شارع الأمير سلطان',
      buildingNumber: '1205',
      phone: '0112233445',
      status: 'open',
    },
    incomingData: { phone: '0561122334' },
    googleData: { phone: '0112233445', website: 'www.alshifa-pharmacy.sa' },
  },
  {
    id: '3',
    poiName: 'فندق قصر الضيافة',
    requestId: 'BB-2024-00143',
    source: 'balady-business',
    type: 'issue-license',
    city: 'جدة',
    district: 'الحمراء',
    licenseNumber: '4030789012',
    submittedAt: '2024-06-09T14:00:00',
    slaHours: 72,
    slaRemaining: 36,
    status: 'needs-edit',
    priority: 'high',
    lat: 21.5433,
    lng: 39.1728,
    currentData: {
      nameAr: 'فندق قصر الضيافة',
      nameEn: 'Qasr Al-Diyafa Hotel',
      mainCategory: 'فنادق وإقامة',
      subCategory: 'فندق 4 نجوم',
      coordinates: '21.5433, 39.1728',
      address: 'حي الحمراء، كورنيش جدة',
      region: 'مكة المكرمة',
      city: 'جدة',
      district: 'الحمراء',
      street: 'كورنيش جدة',
      buildingNumber: '872',
      phone: '0126789012',
      status: 'open',
    },
    incomingData: {
      nameAr: 'فندق قصر الضيافة الفاخر',
      nameEn: 'Qasr Al-Diyafa Luxury Hotel',
      email: 'info@qasr-hotel.sa',
      website: 'www.qasr-hotel.sa',
    },
  },
  {
    id: '4',
    poiName: 'مجمع السيف التجاري',
    requestId: 'BP-2024-00892',
    source: 'balady-plus',
    type: 'add-place',
    city: 'الدمام',
    district: 'الشاطئ',
    submittedAt: '2024-06-10T08:00:00',
    slaHours: 48,
    slaRemaining: 40,
    status: 'new',
    priority: 'low',
    lat: 26.4207,
    lng: 50.0888,
    incomingData: {
      nameAr: 'مجمع السيف التجاري',
      nameEn: 'Al-Saif Commercial Complex',
      mainCategory: 'تسوق',
      subCategory: 'مجمع تجاري',
      city: 'الدمام',
      district: 'الشاطئ',
      street: 'شارع الملك فهد',
      phone: '0138901234',
      status: 'open',
    },
    googleData: {
      nameAr: 'مجمع السيف',
      nameEn: 'Al-Saif Mall',
      phone: '0138901234',
      website: 'www.alsaif-mall.com',
    },
  },
  {
    id: '5',
    poiName: 'مركز بدر الطبي',
    requestId: 'BP-2024-00893',
    source: 'balady-plus',
    type: 'correct-location',
    city: 'الرياض',
    district: 'بدر',
    submittedAt: '2024-06-09T16:30:00',
    slaHours: 24,
    slaRemaining: 2,
    status: 'under-review',
    priority: 'high',
    lat: 24.6408,
    lng: 46.7124,
    currentData: {
      nameAr: 'مركز بدر الطبي',
      nameEn: 'Badr Medical Center',
      mainCategory: 'صحة وطب',
      subCategory: 'مركز طبي',
      coordinates: '24.6408, 46.7124',
      address: 'حي بدر، شارع عمر بن الخطاب',
      region: 'الرياض',
      city: 'الرياض',
      district: 'بدر',
      street: 'شارع عمر بن الخطاب',
      buildingNumber: '558',
      phone: '0113456789',
      status: 'open',
    },
    incomingData: {
      coordinates: '24.6441, 46.7156',
      address: 'حي بدر، شارع الإمام محمد بن سعود',
    },
    userNote: 'الموقع المحدد على الخريطة غير صحيح، المبنى الفعلي يبعد حوالي 400 متر عن الموقع المسجل',
  },
  {
    id: '6',
    poiName: 'محل النور للاتصالات',
    requestId: 'BB-2024-00144',
    source: 'balady-business',
    type: 'cancel-license',
    city: 'الرياض',
    district: 'الملز',
    licenseNumber: '6010234567',
    submittedAt: '2024-06-08T10:15:00',
    slaHours: 24,
    slaRemaining: 0,
    status: 'needs-edit',
    priority: 'high',
    lat: 24.6877,
    lng: 46.7219,
    currentData: {
      nameAr: 'محل النور للاتصالات',
      nameEn: 'Al-Nour Telecom',
      mainCategory: 'تقنية واتصالات',
      subCategory: 'محل اتصالات',
      coordinates: '24.6877, 46.7219',
      address: 'حي الملز، شارع الملك عبدالله',
      region: 'الرياض',
      city: 'الرياض',
      district: 'الملز',
      street: 'شارع الملك عبدالله',
      buildingNumber: '2341',
      phone: '0115678901',
      status: 'open',
    },
    incomingData: { status: 'closed' },
  },
];

export const statusLabels: Record<RequestStatus, string> = {
  new: 'جديد',
  'under-review': 'قيد المراجعة',
  'needs-edit': 'يتطلب تعديل',
  approved: 'معتمد',
  rejected: 'مرفوض',
};

export const statusColors: Record<RequestStatus, string> = {
  new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'under-review': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'needs-edit': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export const sourceLabels: Record<RequestSource, string> = {
  'balady-business': 'بلدي أعمال',
  'balady-plus': 'بلدي+',
};

export const sourceColors: Record<RequestSource, string> = {
  'balady-business': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'balady-plus': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export const requestTypeLabels: Record<RequestType, string> = {
  'issue-license': 'إصدار رخصة',
  'renew-license': 'تجديد رخصة',
  'cancel-license': 'إلغاء رخصة',
  'add-place': 'إضافة مكان',
  'edit-name': 'تعديل اسم المعلم',
  'edit-building-name': 'تعديل اسم المبنى',
  'edit-building-address': 'تعديل عنوان المبنى',
  'correct-location': 'تصحيح الموقع',
  'edit-phone': 'تعديل رقم الهاتف',
  'edit-website': 'تعديل الموقع الإلكتروني',
  'edit-activity': 'تعديل نوع النشاط',
  'edit-hours': 'تعديل ساعات العمل',
  'change-status-closed': 'تغيير الحالة إلى مغلق',
  'building-not-found': 'المبنى غير موجود',
  'report-missing': 'الإبلاغ عن بيانات ناقصة',
};

export const comparisonFields = [
  { key: 'nameAr', label: 'اسم المعلم بالعربية', required: true },
  { key: 'nameEn', label: 'اسم المعلم بالإنجليزية', required: true },
  { key: 'brandName', label: 'اسم العلامة التجارية', required: false },
  { key: 'branchName', label: 'اسم الفرع', required: false },
  { key: 'mainCategory', label: 'التصنيف الرئيسي', required: true },
  { key: 'subCategory', label: 'التصنيف التفصيلي', required: false },
  { key: 'coordinates', label: 'الإحداثيات', required: true },
  { key: 'address', label: 'العنوان', required: true },
  { key: 'region', label: 'المنطقة', required: true },
  { key: 'city', label: 'المدينة', required: true },
  { key: 'district', label: 'الحي', required: true },
  { key: 'street', label: 'الشارع', required: true },
  { key: 'buildingNumber', label: 'رقم المبنى', required: true },
  { key: 'phone', label: 'رقم الجوال', required: false },
  { key: 'whatsapp', label: 'WhatsApp', required: false },
  { key: 'email', label: 'البريد الإلكتروني', required: false },
  { key: 'website', label: 'الموقع الإلكتروني', required: false },
  { key: 'workingDays', label: 'أيام العمل', required: false },
  { key: 'openTime', label: 'وقت الفتح', required: false },
  { key: 'closeTime', label: 'وقت الإغلاق', required: false },
  { key: 'paymentMethods', label: 'وسائل الدفع', required: false },
  { key: 'parking', label: 'مواقف السيارات', required: false },
];

export interface GoogleMapsPOI {
  id: string;
  nameAr: string;
  nameEn: string;
  rating: number;
  reviews: number;
  category: string;
  lat: number;
  lng: number;
  mapX: string; // percentage position on simulated map
  mapY: string;
  data: Partial<POIData>;
}

export const googleMapsPOIs: GoogleMapsPOI[] = [
  {
    id: 'g1',
    nameAr: 'مطعم الوادي العربي',
    nameEn: 'Al-Wadi Arabian Restaurant',
    rating: 4.2,
    reviews: 342,
    category: 'مطعم عربي',
    lat: 24.7136,
    lng: 46.6753,
    mapX: '48%',
    mapY: '46%',
    data: {
      nameAr: 'مطعم الوادي العربي',
      nameEn: 'Al-Wadi Arabian Restaurant',
      mainCategory: 'مطاعم وكافيهات',
      subCategory: 'مطعم عربي',
      coordinates: '24.7136, 46.6753',
      address: 'شارع العروبة، العليا، الرياض',
      city: 'الرياض',
      district: 'العليا',
      street: 'شارع العروبة',
      buildingNumber: '3421',
      phone: '0114567890',
      website: 'www.alwadi-rest.sa',
      workingDays: 'السبت - الخميس',
      openTime: '07:00',
      closeTime: '01:00',
    },
  },
  {
    id: 'g2',
    nameAr: 'الوادي العربي الأصيل',
    nameEn: 'Al-Wadi Authentic Arabian',
    rating: 3.9,
    reviews: 118,
    category: 'مطعم شعبي',
    lat: 24.7139,
    lng: 46.6756,
    mapX: '38%',
    mapY: '50%',
    data: {
      nameAr: 'الوادي العربي الأصيل',
      nameEn: 'Al-Wadi Authentic Arabian',
      mainCategory: 'مطاعم وكافيهات',
      subCategory: 'مطعم شعبي',
      coordinates: '24.7139, 46.6756',
      city: 'الرياض',
      district: 'العليا',
      phone: '0554567890',
      openTime: '06:30',
      closeTime: '02:00',
    },
  },
  {
    id: 'g3',
    nameAr: 'وادي العرب',
    nameEn: 'Wadi Al-Arab Restaurant',
    rating: 4.5,
    reviews: 67,
    category: 'مطعم',
    lat: 24.7142,
    lng: 46.6748,
    mapX: '58%',
    mapY: '42%',
    data: {
      nameAr: 'وادي العرب',
      nameEn: 'Wadi Al-Arab Restaurant',
      mainCategory: 'مطاعم وكافيهات',
      coordinates: '24.7142, 46.6748',
      city: 'الرياض',
      district: 'العليا',
      phone: '0501234567',
      website: 'www.wadi-alarab.com',
      workingDays: 'يومياً',
    },
  },
];
