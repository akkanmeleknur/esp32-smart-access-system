# ESP32 Tabanlı Geçiş Kontrollü Sistem Odası Takip Sistemi

Bu proje, ESP32 tabanlı RFID geçiş kontrol sistemi ile çevresel sensör verilerinin gerçek zamanlı izlenmesini sağlayan bir web uygulamasını içerir. Firebase Firestore ve Realtime Database kullanılarak veriler bulutta saklanır ve React tabanlı web arayüzü ile kullanıcılar tarafından görüntülenir.

## Özellikler

- RFID kartların yetkili/yetkisiz olarak kontrolü ve kayıt altına alınması
- Kart ekleme, düzenleme, silme işlemleri (CRUD)
- Gerçek zamanlı sıcaklık, nem, alev ve su seviyesi sensör verilerinin izlenmesi
- Firebase Firestore ve Realtime Database entegrasyonu
- React ve Material UI kullanarak oluşturulmuş kullanıcı dostu web arayüzü
- Geçiş hareketlerinin detaylı filtrelenmesi ve görüntülenmesi
- ESP32’den Firebase’e REST API kullanarak veri gönderimi

## Teknolojiler

- ESP32 (Arduino IDE)
- React.js
- Firebase Firestore & Realtime Database
- Material UI
- REST API ve HTTPClient

## Kurulum ve Çalıştırma


Bağımlılıkları yükleyin:
npm install
Firebase yapılandırma bilgilerinizi src/firebase.js dosyasına veya .env dosyasına ekleyin.

React uygulamasını başlatın:
npm start
Arduino IDE ile ESP32 kodunu yükleyin ve gerekli Wi-Fi ile Firebase ayarlarını yapın.
