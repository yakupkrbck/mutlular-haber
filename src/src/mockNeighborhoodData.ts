// Haber öğesi tipi. (Dosya adı eski; örnek/sahte veri kaldırıldı, yalnızca tip kaldı.)
import { type NewsItem } from './firebase';

export interface SampleNewsItem extends NewsItem {
  kategori: string;
  okunmaSayisi: number;
  begeniSayisi: number;
  tarihStr: string;
}
