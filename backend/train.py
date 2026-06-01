from ultralytics import YOLO

model = YOLO("../model/yolov8n.pt")

model.train(
    data="../DATASET/data.yaml",
    epochs=20,
    imgsz=640
)