
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "your_wifi";
const char* password = "your_password";
const char* serverUrl = "http://<your-server-ip>:3000/api/register-esp32"; // IP của thiết bị host server

#define relayPin 3 

const char* serverName = "http://192.168.1.100:3000/control?/bed=Giường1"; // IP của esp32

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);  // relay tắt ban đầu

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

void loop() {
  String response = "";
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) {
      response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Lỗi khi gửi yêu cầu: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi không kết nối");
  }
  delay(10000); // gửi dữ liệu mỗi 10 giây
  if (response == "ON") {
    digitalWrite(relayPin, HIGH); // Bật relay
  } else if (response == "OFF") {
    digitalWrite(relayPin, LOW); // Tắt relay
  }
}


