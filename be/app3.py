import cv2 as cv
import json
import base64
import os
import numpy as np
from dotenv import load_dotenv
from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")
net = cv.dnn.readNet(os.getenv("MODEL_PATH"), os.getenv("CONFIG_PATH"))
classes = []
cameras = [
    # (1,"rtsp://admin:rastek123@10.50.0.13/cam/realmonitor?channel=1&subtype=00"),
    # (2,"rtsp://admin:ipcam@reog39@10.50.0.14/cam/realmonitor?channel=1&subtype=00"),
    (3,"rtsp://admin:rastek123@10.50.0.13/cam/realmonitor?channel=1&subtype=00"),
    # (4,"rtsp://admin:ipcam@reog39@10.50.0.14/cam/realmonitor?channel=1&subtype=00"),
]
with open(os.getenv("NAMES_PATH"), "r") as f:
    classes = f.read().strip().split('\n')\

def startCamera(index, path):
    cap = cv.VideoCapture(path)
    width = int(cap.get(3))
    height = int(cap.get(4))

    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            # Perform object detection
            blob = cv.dnn.blobFromImage(frame, 0.00392, (416, 416), swapRB=True, crop=False)
            net.setInput(blob)
            outputLayers = net.getUnconnectedOutLayersNames()
            outs = net.forward(outputLayers)

            boxes = []
            class_ids = []
            confidences = []

            for out in outs:
                for detection in out:
                    scores = detection[5:]
                    classId = np.argmax(scores)
                    confidence = scores[classId]
                    if confidence > 0.5:
                        centerX = int(detection[0] * width)
                        centerY = int(detection[1] * height)
                        w = int(detection[2] * width)
                        h = int(detection[3] * height)

                        x = int(centerX - w / 2)
                        y = int(centerY - h / 2)

                        boxes.append([x, y, w, h])
                        class_ids.append(classId)
                        confidences.append(float(confidence))
            
            indices = cv.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

            for i in indices:
                x, y, w, h = boxes[i]
                classId = class_ids[i]
                label = classes[classId]
                confidence = confidences[i]

                cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv.putText(frame, label, (x, y - 10), cv.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            frame = cv.imencode('.jpg', frame)[1].tobytes()
            frame = base64.encodebytes(frame).decode("utf-8")

            socketio.emit(f'image-{index}', frame)
            socketio.sleep(0)
        else:
            break

@socketio.on('camera')
def handle_camera(data):
    for camera in cameras:
        startCamera(camera[0],camera[1])

if __name__ == '__main__':
    socketio.run(app, port=4043, debug=True)
    
