#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <ArduinoJson.h>
const char* ssid = "GiaKhanhT2";
const char* password = "giakhanh20112006";
const char* serverUrl = "http://192.168.55.106:3000/api/register-esp32"; // IP của thiết bị host server
#define LED_PIN 16
const char* serverAPI = "http://192.168.55.106:3000/api/toggle-light";
WebServer server(80);  
void handleToggle() {
  if (server.method() != HTTP_POST) {
    server.send(405, "text/plain", "Method Not Allowed");
    return;
  }
  DynamicJsonDocument doc(512);
  deserializeJson(doc, server.arg("plain"));
  String action = doc["action"];
  if (action == "TOGGLE") {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // bật/tắt relay
    server.send(200, "application/json", "{\"status\":\"OK\"}");
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid action\"}");
  }
}
void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  server.on("/toggle", HTTP_POST, handleToggle);
  server.begin();
  digitalWrite(LED_PIN, LOW);  // relay tắt ban đầu
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
    Serial.println();
    Serial.println("Đã kết nối WiFi.");
    Serial.print("IP ESP32: ");
    Serial.println(WiFi.localIP());
    // Send IP to server
    if (WiFi.status() == WL_CONNECTED) {  
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      String payload = "{\"ip\":\"" + WiFi.localIP().toString() + "\"}";
      int httpResponseCode = http.POST(payload);
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      http.end();
    }
  }
unsigned long lastPost = 0;
const unsigned long interval = 10000;
String response = "";
bool wifiConnected = false;
void loop() {
  server.handleClient();
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnected) {
      Serial.print("WiFi đã kết nối, IP: ");
      Serial.println(WiFi.localIP());
      wifiConnected = true;
    }
    unsigned long now = millis();
  }
  else {
    if (wifiConnected) { // chỉ in khi trạng thái thực sự thay đổi
      Serial.println("WiFi không kết nối");
      wifiConnected = false;
    }
  }
}





