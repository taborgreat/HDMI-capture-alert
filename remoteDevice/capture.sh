#!/bin/bash

SERVER_URL="http://192.168.1.50:9669/upload"
CAPTURE_PATH="/tmp/frame.jpg"
CAPTURE_DEVICE="/dev/video0"
INTERVAL=60

while true; do
    ffmpeg -f v4l2 -i "$CAPTURE_DEVICE" \
        -vframes 1 \
        -vf scale=1280:720 \
        -q:v 5 \
        "$CAPTURE_PATH" \
        -y -loglevel error

    curl -s -X POST -F "file=@$CAPTURE_PATH" "$SERVER_URL" > /dev/null

    sleep $INTERVAL
done
