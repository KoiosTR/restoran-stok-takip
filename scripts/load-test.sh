#!/bin/bash
# HPA'yı tetiklemek için API'ye yoğun istek gönderir

API_IP=$1
if [ -z "$API_IP" ]; then
  echo "Kullanım: ./load-test.sh <API_LOADBALANCER_IP>"
  echo "Örnek: ./load-test.sh 34.12.34.56"
  exit 1
fi

echo "Yük testi başlatılıyor... Hedef: http://$API_IP:8000/simulate-load"
echo "Durdurmak için Ctrl+C'ye basın."

# Sonsuz döngüde paralel istekler atıyoruz
while true; do
  curl -s "http://$API_IP:8000/simulate-load" > /dev/null &
  curl -s "http://$API_IP:8000/simulate-load" > /dev/null &
  curl -s "http://$API_IP:8000/simulate-load" > /dev/null &
  sleep 0.1
done
