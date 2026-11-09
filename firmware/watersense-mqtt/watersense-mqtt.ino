// WATERSENSE Wi-Fi/MQTT. ESP32-S3, GPIO4 MOSFET active HIGH, battery GPIO1, local button GPIO21.
// Automatic 15-second cycling from the hardware test is intentionally removed.
#include <WiFi.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <esp_timer.h>
#include <time.h>
#include "config.example.h"
#include "network_setup.h"
#include "watersense_logic.h"
WiFiClient net;
PubSubClient mqtt(net);
Preferences prefs;
NetworkSettings networkSettings{};
mist::State state{};
esp_timer_handle_t offTimer;
volatile bool timerExpired=false;
bool outputOn=false,remoteActive=false,batteryLow=true;
float batteryV=0;
uint32_t pulseStart=0,pulseDuration=0,lastBattery=0,lastStatus=0,lastConnect=0,lastDiag=0,lastButtonChange=0,lastLocalStart=0;
uint32_t sessionStart=0, sessionDuration=0, pauseStart=0;
int64_t sessionCooldown=mist::MIN_COOLDOWN_S;
bool localUsed=false,buttonRaw=HIGH,buttonStable=HIGH;
char activeCommand[96]="",lastAck[500]="",lastDoneId[96]="",lastDoneAck[500]="";
char commandTopic[100],ackTopic[100],statusTopic[100];
void setPompa(bool on){outputOn=on;digitalWrite(PUMP_PIN,(on==PUMP_ACTIVE_HIGH)?HIGH:LOW);}
void timerOff(void*){digitalWrite(PUMP_PIN,PUMP_ACTIVE_HIGH?LOW:HIGH);timerExpired=true;}
void saveState(){prefs.putBytes("state",&state,sizeof(state));}
bool waterOk(){
#if WATER_OK_PIN >= 0
 return digitalRead(WATER_OK_PIN)==WATER_OK_LEVEL;
#else
 return true;
#endif
}
void readBattery(){uint32_t sum=0;for(int i=0;i<16;i++)sum+=analogReadMilliVolts(BATTERY_PIN);batteryV=(sum/16.f)/1000.f*BATTERY_RATIO;if(batteryV<5.f||batteryV<BATTERY_STOP_V)batteryLow=true;else if(batteryV>BATTERY_RESUME_V)batteryLow=false;}
void isoNow(char* out){time_t now=time(nullptr);tm utc;gmtime_r(&now,&utc);strftime(out,25,"%Y-%m-%dT%H:%M:%SZ",&utc);}
void ack(const char* id,const char* status,const char* reason,uint32_t duration=0){
 char at[25];isoNow(at);snprintf(lastAck,sizeof(lastAck),"{\"actuator_id\":\"%s\",\"command_id\":\"%s\",\"state\":\"%s\",\"reason\":\"%s\",\"duration_ms\":%lu,\"at\":\"%s\"}",networkSettings.id,id,status,reason,(unsigned long)duration,at);
 if(strcmp(status,"completed")==0||strcmp(status,"fault")==0){strlcpy(lastDoneId,id,sizeof(lastDoneId));strlcpy(lastDoneAck,lastAck,sizeof(lastDoneAck));}
 if(mqtt.connected())mqtt.publish(ackTopic,lastAck,true);
}
void publishStatus(){
 if(!mqtt.connected())return;
 char at[25],body[650];isoNow(at);
 snprintf(body,sizeof(body),"{\"state\":\"online\",\"actuator_id\":\"%s\",\"output\":\"%s\",\"active_command_id\":\"%s\",\"battery_v\":%.2f,\"battery_ok\":%s,\"water_ok\":%s,\"manual_off\":false,\"clock_synced\":%s,\"max_session_duration_ms\":%lu,\"session_active\":%s,\"uptime_s\":%lu,\"at\":\"%s\"}",networkSettings.id,outputOn?"on":"off",activeCommand,batteryV,batteryLow?"false":"true",waterOk()?"true":"false",time(nullptr)>=mist::SYNCED_AFTER?"true":"false",(unsigned long)mist::MAX_SESSION_MS,sessionDuration?"true":"false",(unsigned long)(millis()/1000),at);
 mqtt.publish(statusTopic,body,true);lastStatus=millis();
}
void pumpOff(){
 esp_timer_stop(offTimer);timerExpired=false;
 setPompa(false);
}
void finishCommand(const char* status,const char* reason){
 pumpOff();
 if(!activeCommand[0])return;
 const uint32_t elapsed=millis()-(sessionDuration?sessionStart:pulseStart);
 if(sessionDuration){
  const time_t now=time(nullptr);
  if(now>=mist::SYNCED_AFTER){
   state.lastPulseEpoch=now;
   state.cooldownS=sessionCooldown;
   saveState();
  }
 }
 sessionDuration=0;
 ack(activeCommand,status,reason,elapsed);
 activeCommand[0]=0;
 remoteActive=false;
 publishStatus();
}
bool startBurst(uint32_t duration){
 pulseStart=millis();
 pulseDuration=duration;
 timerExpired=false;
 if(esp_timer_start_once(offTimer,(uint64_t)duration*1000)!=ESP_OK)return false;
 setPompa(true);
 return true;
}
void startCommand(const char* id,uint32_t duration,bool remote,const char* reason,bool session=false){
 strlcpy(activeCommand,id,sizeof(activeCommand));
 remoteActive=remote;
 sessionStart=millis();
 sessionDuration=session?duration:0;
 if(!startBurst(session?mist::MAX_PULSE_MS:duration)){
  finishCommand("fault","timer_error");
  return;
 }
 ack(id,"accepted",reason,duration);
 publishStatus();
}
void updateCommand(){
 if(!activeCommand[0])return;
 if(batteryLow){finishCommand("fault","battery_low");return;}
 if(!waterOk()){finishCommand("fault","water_low");return;}
 if(remoteActive&&(WiFi.status()!=WL_CONNECTED||!mqtt.connected())){
  finishCommand("fault","connection_lost");return;
 }
 const uint32_t now=millis();
 if(!sessionDuration){
  if(timerExpired||now-pulseStart>=pulseDuration)finishCommand("completed","timer");
  return;
 }
 const uint32_t remaining=mist::sessionRemaining(sessionStart,sessionDuration,now);
 if(!remaining){finishCommand("completed","session_timer");return;}
 if(outputOn&&(timerExpired||now-pulseStart>=pulseDuration)){
  pumpOff();
  pauseStart=now;
  publishStatus();
 }else if(!outputOn&&now-pauseStart>=mist::SESSION_PAUSE_MS){
  if(startBurst(remaining<mist::MAX_PULSE_MS?remaining:mist::MAX_PULSE_MS))publishStatus();
  else finishCommand("fault","timer_error");
 }
}
void onMessage(char* topic,byte* payload,unsigned int length){
 if(strcmp(topic,commandTopic)!=0)return;
 mist::Inputs inputs{networkSettings.id,(int64_t)time(nullptr),activeCommand[0]!=0,false,waterOk(),!batteryLow};
 auto d=mist::evaluate((const char*)payload,length,inputs,state);
 if(!d.accept){
  if(strcmp(d.reason,"duplicate")==0){
   if(activeCommand[0]&&strcmp(d.commandId,activeCommand)==0)ack(d.commandId,"accepted","duplicate_active",sessionDuration?sessionDuration:pulseDuration);
   else if(strcmp(d.commandId,lastDoneId)==0&&mqtt.connected())mqtt.publish(ackTopic,lastDoneAck,true);
   return;
  }
  if(d.commandId[0]&&strcmp(d.reason,"wrong_actuator")!=0){mist::rememberId(state,d.commandId);saveState();ack(d.commandId,"rejected",d.reason);}
  return;
 }
 if(!d.stop&&localUsed&&millis()-lastLocalStart<600000){mist::rememberId(state,d.commandId);saveState();ack(d.commandId,"rejected","cooldown");return;}
 mist::rememberId(state,d.commandId);
 if(d.stop){state.lastStopEpoch=d.stopEpoch;saveState();finishCommand("completed","remote_stop");ack(d.commandId,"completed","remote_stop");publishStatus();return;}
 mist::rememberPulse(state,d,inputs.now);
 if(d.session){
  sessionCooldown=d.cooldownS;
  state.cooldownS+=d.durationMs/1000;
 }
 saveState();
 startCommand(d.commandId,d.durationMs,true,d.status,d.session);
}
void network(){
 if(activeCommand[0])return;
 // begin() is called once in setup; the ESP32 core owns automatic Wi-Fi retries.
 // Repeated begin() while associating causes "sta is connecting, cannot set config".
 if(WiFi.status()!=WL_CONNECTED)return;
 if(mqtt.connected()||(lastConnect&&millis()-lastConnect<5000))return;
 lastConnect=millis();char offline[100];snprintf(offline,sizeof(offline),"{\"state\":\"offline\",\"actuator_id\":\"%s\"}",networkSettings.id);
 // Allow a slower LAN handshake only while the pump is OFF.
 mqtt.setSocketTimeout(10);
 bool connected=mqtt.connect(networkSettings.id,networkSettings.id,networkSettings.mqttPassword,statusTopic,1,true,offline,true);
 mqtt.setSocketTimeout(1);lastConnect=millis();
 if(connected){
  mqtt.subscribe(commandTopic,1);if(lastAck[0])mqtt.publish(ackTopic,lastAck,true);publishStatus();Serial.println("WATERSENSE MQTT terhubung");
 }else Serial.printf("MQTT belum terhubung: host=%s port=%u kode=%d\n",networkSettings.broker,networkSettings.port,mqtt.state());
}
void diagnostics(){
 if(millis()-lastDiag<5000)return;
 lastDiag=millis();
 if(WiFi.status()!=WL_CONNECTED){Serial.printf("Wi-Fi belum terhubung: status=%d (1=SSID tidak ditemukan, 4=gagal koneksi, 6=terputus). Periksa Wi-Fi 2.4 GHz dan password.\n",(int)WiFi.status());return;}
 Serial.printf("Wi-Fi terhubung: IP=%s RSSI=%d dBm | MQTT=%s | NTP=%s | Baterai=%.2f V %s\n",WiFi.localIP().toString().c_str(),WiFi.RSSI(),mqtt.connected()?"terhubung":"belum terhubung",time(nullptr)>=mist::SYNCED_AFTER?"siap":"menunggu",batteryV,batteryLow?"belum siap":"siap");
}
void localButton(){
 bool raw=digitalRead(BUTTON_PIN);
 if(raw!=buttonRaw){buttonRaw=raw;lastButtonChange=millis();}
 if(millis()-lastButtonChange<40||raw==buttonStable)return;
 buttonStable=raw;if(raw!=LOW)return;
 if(activeCommand[0]){finishCommand("completed","local_stop");return;}
 if(batteryLow||!waterOk()||(localUsed&&millis()-lastLocalStart<600000))return;
 if(state.lastPulseEpoch>0&&time(nullptr)-state.lastPulseEpoch<state.cooldownS)return;
 localUsed=true;lastLocalStart=millis();state.lastPulseEpoch=time(nullptr)>=mist::SYNCED_AFTER?time(nullptr):0;state.cooldownS=mist::MIN_COOLDOWN_S;saveState();
 char id[80];snprintf(id,sizeof(id),"local-%lu",(unsigned long)millis());startCommand(id,LOCAL_PULSE_MS,false,"local_button");
}
void setup(){
 digitalWrite(PUMP_PIN,PUMP_ACTIVE_HIGH?LOW:HIGH);pinMode(PUMP_PIN,OUTPUT);setPompa(false);pinMode(BUTTON_PIN,INPUT_PULLUP);
#if WATER_OK_PIN >= 0
 pinMode(WATER_OK_PIN,INPUT_PULLUP);
#endif
 Serial.begin(115200);analogSetPinAttenuation(BATTERY_PIN,ADC_11db);readBattery();
 esp_timer_create_args_t timerArgs={};timerArgs.callback=timerOff;timerArgs.name="pump-off";ESP_ERROR_CHECK(esp_timer_create(&timerArgs,&offTimer));
 prefs.begin("watersense-v2",false);if(prefs.getBytesLength("state")==sizeof(state))prefs.getBytes("state",&state,sizeof(state));if(state.next>=mist::RECENT_IDS)state.next=0;
 const bool configured=loadNetwork(prefs,networkSettings);
 const uint32_t heldSince=millis();
 while(digitalRead(BUTTON_PIN)==LOW&&millis()-heldSince<2000)delay(10);
 if(!configured||digitalRead(BUTTON_PIN)==LOW)configureNetwork(prefs,networkSettings);
 snprintf(commandTopic,sizeof(commandTopic),"aerosense/actuators/%s/command",networkSettings.id);snprintf(ackTopic,sizeof(ackTopic),"aerosense/actuators/%s/ack",networkSettings.id);snprintf(statusTopic,sizeof(statusTopic),"aerosense/actuators/%s/status",networkSettings.id);
 WiFi.mode(WIFI_STA);WiFi.setAutoReconnect(true);WiFi.begin(networkSettings.ssid,networkSettings.wifiPassword);
 configTime(0,0,"pool.ntp.org","time.google.com");
 mqtt.setServer(networkSettings.broker,networkSettings.port);mqtt.setCallback(onMessage);mqtt.setBufferSize(1200);mqtt.setKeepAlive(15);mqtt.setSocketTimeout(1);
 Serial.println("WATERSENSE siap. Pompa OFF.");
}
void loop(){
 if(millis()-lastBattery>=100){lastBattery=millis();readBattery();}
 updateCommand();
 localButton();network();if(mqtt.connected())mqtt.loop();if(millis()-lastStatus>=(outputOn?2000:15000))publishStatus();diagnostics();delay(5);
}
