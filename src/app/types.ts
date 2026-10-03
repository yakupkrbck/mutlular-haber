// App içinde yerel tanımlı olan tipler (ekran sekmeleri, anket, haber yorumu).


export type MainTab = 'home' | 'explore' | 'news' | 'davet' | 'market' | 'pazar' | 'lostfound' | 'services' | 'esnaf' | 'meclis' | 'notifications' | 'profile' | 'yemek';

export interface PollItem {
    id: string;
    soru: string;
    kategori: 'ulasim' | 'cevre' | 'sosyal' | 'genel';
    secenekler: string[];
    aktif: boolean;
    toplam: number;
    sayilar: number[];
    endsAtMs: number;
    createdAtMs: number;
    authorName?: string;
  }

export interface NewsComment { id: string; uid: string; authorName: string; authorPhoto?: string; text: string; createdAtMs: number }
