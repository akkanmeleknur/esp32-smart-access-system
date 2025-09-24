#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

// ======== Wi-Fi ve Firestore Ayarları ========
const char* ssid = "~~";
const char* password = "~~";

const String FIREBASE_PROJECT_ID = "sistem-~~";
const String FIREBASE_API_KEY = "~~";
const String KARTLAR_COLLECTION = "Kartlar";
const String HAREKETLER_COLLECTION = "Hareketler";

// ========== Donanım Pinleri ==========
#define SS_PIN_1    2
#define RST_PIN_1   4
#define SS_PIN_2    15
#define RST_PIN_2   16
#define SERVO_PIN   27
#define GREEN_LED   13
#define RED_LED     12
#define BUZZER_PIN  14

MFRC522 rfid1(SS_PIN_1, RST_PIN_1);
MFRC522 rfid2(SS_PIN_2, RST_PIN_2);
Servo doorServo;

bool doorOpen = false;
unsigned long doorOpenTime = 0;

void setup() {
  Serial.begin(115200);
  SPI.begin(18, 19, 23); // SCK, MISO, MOSI

  rfid1.PCD_Init(); delay(50);
  rfid2.PCD_Init(); delay(50);

  doorServo.attach(SERVO_PIN);
  doorServo.write(0); // Başlangıçta kapalı

  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // WiFi bağlantısı
  WiFi.begin(ssid, password);
  Serial.print("WiFi bağlanıyor");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" Bağlandı!");

  // Saat ayarı
  configTime(3 * 3600, 0, "pool.ntp.org", "time.nist.gov"); // Türkiye UTC+3
}

void loop() {
  if (doorOpen && millis() - doorOpenTime >= 10000) {
    closeDoor();
  }

  readCard(rfid1, "RFID-1", "giriş");
  readCard(rfid2, "RFID-2", "çıkış");

  delay(100);
}

void readCard(MFRC522 &rfid, const char* readerName, const char* islemTuru) {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uidStr = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uidStr += "0";
    uidStr += String(rfid.uid.uidByte[i], HEX);
  }
  uidStr.toUpperCase();

  Serial.printf("%s - UID: %s\n", readerName, uidStr.c_str());

  kontrolEtFirestoredan(uidStr, readerName, islemTuru);

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void kontrolEtFirestoredan(String uid, String kaynak, String islem) {
  if (WiFi.status() != WL_CONNECTED) return;

  String docPath = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID +
                   "/databases/(default)/documents/" + KARTLAR_COLLECTION + "/" + uid + "?key=" + FIREBASE_API_KEY;

  HTTPClient http;
  http.begin(docPath);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String response = http.getString();
    bool yetkiDurumu = response.indexOf("\"booleanValue\": true") > -1;

    // Kullanıcı adı ve meslek çıkar
    String kullaniciAdi = "Bilinmiyor";
    String meslek = "Bilinmiyor";

    int idxK = response.indexOf("\"Kullanıcı\"");
    if (idxK != -1) {
      int start = response.indexOf("\"", response.indexOf("\"stringValue\"", idxK) + 14) + 1;
      int end = response.indexOf("\"", start);
      kullaniciAdi = response.substring(start, end);
    }

    int idxM = response.indexOf("\"Meslek\"");
    if (idxM != -1) {
      int start = response.indexOf("\"", response.indexOf("\"stringValue\"", idxM) + 14) + 1;
      int end = response.indexOf("\"", start);
      meslek = response.substring(start, end);
    }

    if (yetkiDurumu) {
      Serial.println("--> Yetkili kart. Kapı açılıyor.");
      openDoor();
      sendToFirestore(uid, kullaniciAdi, "yetkili", kaynak, islem, meslek);
    } else {
      Serial.println("--> Yetkisiz kart!");
      denyAccess();
      sendToFirestore(uid, kullaniciAdi, "yetkisiz", kaynak, islem, meslek);
    }

  } else if (httpCode == 404) {
    Serial.println("--> Bu kart kayıtlı değil.");
    denyAccess();
    sendToFirestore(uid, "Bilinmiyor", "kayıtlı değil", kaynak, islem, "Bilinmiyor");
  } else {
    Serial.printf("Firestore hata: %d\n", httpCode);
  }

  http.end();
}

void openDoor() {
  doorServo.write(90);
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(RED_LED, LOW);
  doorOpen = true;
  doorOpenTime = millis();
}

void closeDoor() {
  doorServo.write(0);
  digitalWrite(GREEN_LED, LOW);
  doorOpen = false;
  Serial.println("--> Kapı kapandı.");
}

void denyAccess() {
  digitalWrite(RED_LED, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(1000);
  digitalWrite(RED_LED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void sendToFirestore(String uid, String kullanici, String yetki, String kaynak, String islem, String meslek) {
  if (WiFi.status() != WL_CONNECTED) return;

  time_t now;
  struct tm timeinfo;
  time(&now);
  localtime_r(&now, &timeinfo);
  char datetime[30];
  strftime(datetime, sizeof(datetime), "%Y-%m-%d %H:%M:%S", &timeinfo);

  String url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID +
               "/databases/(default)/documents/" + HAREKETLER_COLLECTION + "?key=" + FIREBASE_API_KEY;

  String payload = "{"
                   "\"fields\": {"
                   "\"uid\": {\"stringValue\": \"" + uid + "\"},"
                   "\"kullanici\": {\"stringValue\": \"" + kullanici + "\"},"
                   "\"meslek\": {\"stringValue\": \"" + meslek + "\"},"
                   "\"tarih_saat\": {\"stringValue\": \"" + String(datetime) + "\"},"
                   "\"yetki\": {\"stringValue\": \"" + yetki + "\"},"
                   "\"kaynak\": {\"stringValue\": \"" + kaynak + "\"},"
                   "\"islem\": {\"stringValue\": \"" + islem + "\"}"
                   "}}";

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    Serial.println("Hareket Firestore'a kaydedildi.");
  } else {
    Serial.printf("Firestore gönderim hatası: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
