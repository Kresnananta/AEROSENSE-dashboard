#pragma once

#define NODE_ID "NODE_SIDOMORO_01"
#define SEND_INTERVAL_S 300

#define DUST_WARNING 35.0
#define DUST_DANGER 55.0

#define SGP_SDA 8
#define SGP_SCL 9

#define DHT_PIN 5
#define DHT_TYPE DHT21

#define SHARP_LED_PIN 4
#define SHARP_LED_ACTIVE_LOW true
#define SHARP_VO_PIN 1
#define SHARP_DIVIDER 1.0
#define SHARP_ZERO_V 0.60

#define LORA_RX 18
#define LORA_TX 17
#define LORA_AUX 16
#define LORA_BAUD 9600

#define BATTERY_PIN 2
#define BATTERY_DIVIDER 2.0

#define TFT_SCK 12
#define TFT_MOSI 11
#define TFT_CS 10
#define TFT_DC 13
#define TFT_RST 14
#define TFT_BL 21
#define TFT_TAB INITR_BLACKTAB
#define TFT_INVERT 0
#define TFT_ROTATION 0

#define ACK_MODE 0
#define ACK_TIMEOUT_MS 2500
#define LORA_LOST_AFTER 3
#define LORA_WEAK_BELOW -105
