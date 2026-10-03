// Vefat ilanı tipi. Şehir hizmetleri örnek verileri (noter, taksi, otobüs, yemek, iş ilanı, etkinlik) kaldırıldı.
export interface DeceasedItem {
  id: string;
  fullName: string;
  age?: number;
  family: string;
  mosque: string;
  prayerTime: string;
  cemetery: string;
  dateStr: string;
  uid?: string;
  authorName?: string;
  createdAt?: any;
  status?: 'pending' | 'published' | 'rejected';
  publishedAt?: any;
}
