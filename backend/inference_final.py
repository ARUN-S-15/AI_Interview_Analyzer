from ultralytics import YOLO
import json
from pathlib import Path

MODEL_PATH = 'yolov8n.pt'

# Load trained model

model = YOLO("../model/best_emotion_model.pt")

# Predict on images
print("Running inference on DATASET/frames/1001_DFA_ANG_XX/")
results = model.predict(source='DATASET/frames/1001_DFA_ANG_XX/', conf=0.5)

# Save results to JSON
output_dir = Path('inference_results')
output_dir.mkdir(exist_ok=True)

detections_list = []
for idx, result in enumerate(results):
    detections = []
    for box in result.boxes:
        detections.append({
            'class': result.names[int(box.cls)],
            'confidence': float(box.conf),
            'bbox': box.xyxy[0].tolist()  # [x1, y1, x2, y2]
        })
    
    detections_list.append({
        'frame': idx,
        'image': str(result.path),
        'detections': detections
    })
    
    print(f"Frame {idx}: {len(detections)} detection(s)")

# Save to JSON
output_file = output_dir / 'detections.json'
with open(output_file, 'w') as f:
    json.dump(detections_list, f, indent=2)

print(f"\n✓ Inference complete! Results saved to {output_file}")
print(f"✓ Annotated images saved to runs/detect/predict/")
