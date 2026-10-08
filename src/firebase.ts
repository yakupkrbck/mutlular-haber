import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocFromServer,
  getDocs, 
  setDoc as firestoreSetDoc, 
  addDoc as firestoreAddDoc, 
  updateDoc as firestoreUpdateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  runTransaction, 
  increment,
  getCountFromServer,
  type Timestamp 
} from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  measurementId: firebaseConfigJson.measurementId || undefined,
};

// Initialize App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore (connecting to designated database instance with long-polling fallback for robust sandbox/preview connectivity)
const firestoreDbId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    }, firestoreDbId);
  } catch {
    return firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);
  }
})();

// Firestore undefined değerleri kabul etmez; yazmadan önce undefined alanları temizler.
// serverTimestamp(), increment(), Timestamp, Date ve referanslar olduğu gibi korunur.
function stripUndefined(value: any): any {
  if (Array.isArray(value)) {
    return value.filter((v) => v !== undefined).map(stripUndefined);
  }
  if (value && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto === Object.prototype || proto === null) {
      const out: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        if (value[key] !== undefined) out[key] = stripUndefined(value[key]);
      }
      return out;
    }
  }
  return value;
}

const setDoc: (ref: any, data: any, options?: any) => Promise<void> = (ref, data, options) =>
  options === undefined
    ? firestoreSetDoc(ref, stripUndefined(data))
    : firestoreSetDoc(ref, stripUndefined(data), options);

const addDoc: (ref: any, data: any) => Promise<any> = (ref, data) =>
  firestoreAddDoc(ref, stripUndefined(data));

const updateDoc: (ref: any, ...args: any[]) => Promise<void> = (ref, ...args) => {
  if (args.length === 1) {
    return (firestoreUpdateDoc as any)(ref, stripUndefined(args[0]));
  }
  const cleaned: any[] = [];
  for (let i = 0; i < args.length; i += 2) {
    if (args[i + 1] !== undefined) cleaned.push(args[i], args[i + 1]);
  }
  return (firestoreUpdateDoc as any)(ref, ...cleaned);
};

// Error Handler definitions adhering to Firebase Integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  // Gracefully log offline / unavailable errors without crashing client
  if (errMessage.includes('unavailable') || errMessage.includes('client is offline')) {
    console.warn(`Firestore [${operationType}] offline/unavailable for path: ${path || 'unknown'}`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Connection check with server
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore operating in offline/cached mode.");
    }
  }
}
testConnection();

// Types
export type UserRole = 'sakin' | 'esnaf' | 'editor' | 'admin';

export interface NewsNotificationPreferences {
  enabled: boolean; // Anlık bildirimler açık mı?
  sonDakikaOnly: boolean; // Sadece "Son Dakika" haberleri için bildirim al
  soundAlert: boolean; // Sesli uyarı
  browserPush: boolean; // Tarayıcı / cihaz anlık bildirimi
  vibration?: boolean; // Mobil titreşim uyarısı
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  telefon?: string;
  photoURL?: string;
  isApproved?: boolean;
  credits?: number;
  welcomeBonusGiven?: boolean;
  hesapTipi?: 'usta' | 'esnaf';
  esnafKategori?: string;
  /** Usta/esnafın seçtiği tüm faaliyet alanları (ilk eleman ana alan = esnafKategori) */
  faaliyetAlanlari?: string[];
  isyeri?: string;
  businessName?: string;
  adres?: string;
  calismaSaatleri?: string;
  vergiLevhasiFoto?: string;
  uzmanlikEtiketleri?: string[];
  esnafAciklama?: string;
  newsNotificationPreferences?: NewsNotificationPreferences;
  notifSeenAt?: number;
  notifPrefs?: Record<string, boolean>;
  notifReadIds?: string[];
  ornekCalismalar?: string[];
  passwordHash?: string;
  createdAt?: Timestamp | Date;
}

export interface MahalleKursusuItem {
  id?: string;
  uid?: string;
  authorName: string;
  authorPhotoURL?: string;
  role?: string;
  kategori: 'Sorun & Şikayet' | 'Öneri & Fikir' | 'Teşekkür & Tebrik' | 'Dilek & Talep';
  baslik: string;
  icerik: string;
  konum?: string;
  fotolar?: string[];
  fotoUrl?: string;
  destekSayisi: number;
  destekleyenler?: string[];
  yorumlar?: {
    id: string;
    authorName: string;
    authorPhotoURL?: string;
    mesaj: string;
    tarihStr: string;
  }[];
  tarihStr: string;
  durum?: 'acik' | 'belediyeye_iletildi' | 'cozuldu';
  createdAt?: Timestamp | Date;
}

export interface ServiceRequest {
  id?: string;
  uid?: string;
  authorName: string;
  telefon?: string;
  authorPhone?: string;
  kategori: string;
  altKategori?: string;
  baslik: string;
  aciklama: string;
  adres?: string;
  konum?: string;
  urgent?: boolean;
  fotolar: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  offerCount: number;
  kategoriId?: string;
  acceptedOfferId?: string;
  createdAt?: Timestamp | Date;
}

export interface ServiceOffer {
  id?: string;
  requestId: string;
  esnafUid: string;
  esnafIsyeri: string;
  // ESKİ kayıtlarda bulunur; yeni tekliflerde telefon offers/{id}/private/iletisim altındadır (FAZ 5A).
  esnafTelefon?: string;
  fiyat: number;
  mesaj: string;
  tahminiSure?: string;
  creditCost: number;
  status: 'pending' | 'accepted' | 'rejected';
  requestOwnerUid?: string;
  requestTitle?: string;
  acceptedAt?: Timestamp | Date;
  musteriTelefon?: string;
  musteriAdi?: string;
  createdAt?: Timestamp | Date;
}

export interface MarketplaceItem {
  id?: string;
  uid?: string;
  ilanTuru?: 'emlak' | 'ikinci_el'; // Emlak vs 2. El Eşya ayrımı
  saticiAdi: string;
  saticiTelefon: string;
  baslik: string;
  aciklama: string;
  fiyat: number;
  kategori: string;
  durum?: 'sifir' | 'az_kullanilmis' | 'ikinci_el';
  fotolar: string[];
  status: 'active' | 'sold' | 'removed';
  // Emlak Detayları
  emlakTuru?: 'kiralik' | 'satilik' | 'devren';
  odaSayisi?: string; // örn: 3+1, 2+1, 1+1, Dükkan
  metrekare?: number; // m²
  kat?: string; // örn: 3. Kat, Giriş Kat
  isitma?: string; // Doğalgaz (Kombi), Yerden Isıtma vb.
  binaYasi?: string; // Sıfır, 5 Yaşında vb.
  aidat?: number;
  balkon?: boolean;
  asansor?: boolean;
  otopark?: boolean;
  createdAt?: Timestamp | Date;
}

export interface MahalleDavetTebrik {
  id: string;
  isim: string;
  mesaj: string;
  tarihStr: string;
  katilimDurumu?: 'katilacagim' | 'tebrik_ederim' | 'mutluluklar';
}

export interface MahalleDavetItem {
  id?: string;
  uid?: string;
  tur: 'dugun' | 'nisan' | 'kina' | 'sunnet' | 'nikah' | 'mevlit' | 'kutlama' | 'diger';
  turEtiketi: string; // "💍 Düğün Töreni", "💐 Nişan Merasimi", "🪔 Kına Gecesi", "👑 Sünnet Düğünü" vb.
  baslik: string; // örn: "Fatma Çetin & Burak Kaya Düğün Töreni"
  davetSahipleri: string; // örn: "Çetin ve Kaya Aileleri"
  gelinDamat?: string; // örn: "Fatma & Burak"
  tarih: string; // örn: "28 Eylül 2024 Cumartesi"
  saat: string; // örn: "19:30"
  mekanAdi: string; // örn: "Mutlular Saray Düğün Salonu"
  salonBilgisi?: string; // örn: "Büyük Balo Salonu (Kat 2)"
  adres: string; // Mahalle veya tam adres
  haritaUrl?: string;
  davetiyeFoto?: string;
  aciklama?: string;
  ozellikler?: string[]; // ['🍽️ Yemekli', '🎻 Canlı Müzik', '🚗 Otopark', '🎈 Çocuk Alanı']
  iletisimKisi: string;
  iletisimTelefon: string;
  katilanSayisi: number;
  tebrikler?: MahalleDavetTebrik[];
  createdAt?: Timestamp | Date;
}

export interface LostFoundItem {
  id?: string;
  uid?: string;
  tur: 'kayip' | 'bulundu';
  baslik: string;
  aciklama: string;
  kategori: string;
  isCritical: boolean;
  iletisimKisi: string;
  iletisimTelefon: string;
  konum?: string;
  fotolar: string[];
  status: 'published';
  createdAt?: Timestamp | Date;
}

export interface NewsItem {
  id?: string;
  baslik: string;
  ozet: string;
  icerik?: string;
  kategori?: string;
  sonDakika?: boolean;
  bildirimKategorisi?: 'sondakika' | 'haber' | 'duyuru' | 'etkinlik';
  imageURL?: string;
  status: 'pending' | 'approved' | 'rejected';
  authorName?: string;
  authorUid?: string;
  authorRole?: string;
  authorPhone?: string;
  isTip?: boolean;
  tipStatusNote?: string;
  okunmaSayisi?: number;
  begeniSayisi?: number;
  tarihStr?: string;
  createdAt?: Timestamp | Date;
}

export interface EsnafCampaign {
  id?: string;
  status?: 'pending' | 'published' | 'rejected';
  reviewNote?: string;
  reviewedAt?: Timestamp | Date;
  isyeriAdi: string;
  kategori: string;
  baslik: string;
  aciklama: string;
  indirimOrani?: string;
  fotolar?: string[];
  fotoUrl?: string;
  telefon: string;
  adres: string;
  gecerlilikTarihi?: string;
  rozet?: string;
  authorName?: string;
  uid?: string;
  esnafId?: string;
  createdAt?: Timestamp | Date;
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  increment,
  getCountFromServer,
  type User
};

export interface HizmetAlani {
  id: string;
  ad: string;
  adNorm?: string;
  ekleyenUid?: string;
  createdAt?: Timestamp | Date;
}

export interface Business {
  id: string; // belge kimliği = sahibinin uid'si
  ownerUid: string;
  isyeri: string;
  kategori: string;
  aciklama: string;
  logoUrl?: string;
  fotolar?: string[];
  adres: string;
  calismaSaatleri: string;
  telefon: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  reviewedAt?: Timestamp | Date;
}
