import os
import cv2
import time
from ultralytics import YOLO
import torch

class Classifier:
    def __init__(self, weights_path='best.pt'):
        # Load model
        self.model = YOLO(weights_path)
        if torch.cuda.is_available():
            self.model.cuda()
        print('Model loaded successfully')

    def classify(self, img_path, output_folder='yoloimages', bbox_folder='../public/boundingbox', folder_counter=1):
        results = self.model.predict(img_path, conf=0.1, iou=0.1)
        img = cv2.imread(img_path)
        height, width, _ = img.shape

        detections = []
        boxes_drawn = False  # Track if any boxes are drawn

        for result in results:
            for i, box in enumerate(result.boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                padding = 10
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(width, x2 + padding)
                y2 = min(height, y2 + padding)

                # Draw bounding boxes on the original image
                cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                boxes_drawn = True

                # Crop the bounding box region
                cropped_img = img[int(y1):int(y2), int(x1):int(x2)]
                detections.append((cropped_img, i))

        # Create a folder and save detections only if there are any
        if detections:
            image_specific_folder = os.path.join(bbox_folder, str(folder_counter))
            os.makedirs(image_specific_folder, exist_ok=True)

            for cropped_img, i in detections:
                bbox_path = os.path.join(image_specific_folder, f'{os.path.splitext(os.path.basename(img_path))[0]}_bbox_{i}.jpg')
                cv2.imwrite(bbox_path, cropped_img)

            # Save processed image with boxes drawn
            os.makedirs(output_folder, exist_ok=True)
            output_path = os.path.join(output_folder, os.path.basename(img_path))
            if boxes_drawn:
                cv2.imwrite(output_path, img)
                print(f'Processed image with bounding boxes saved to {output_path}')
            else:
                print('No bounding boxes detected, folder not created.')
        else:
            print('No bounding boxes detected, folder not created.')

def process_new_images(classifier, input_folder='images', output_folder='yoloimages', bbox_folder='../public/boundingbox'):
    processed_files = set()
    folder_counter = 1  # Initialize folder counter

    while True:
        files = os.listdir(input_folder)
        new_files = [f for f in files if f not in processed_files]

        for file in new_files:
            file_path = os.path.join(input_folder, file)
            if os.path.isfile(file_path):
                try:
                    classifier.classify(file_path, output_folder, bbox_folder, folder_counter)
                    if os.path.exists(os.path.join(bbox_folder, str(folder_counter))):  # Check if a folder was created
                        processed_files.add(file)
                        folder_counter += 1  # Increment only if a folder was actually created
                except Exception as e:
                    print(f"Failed to process {file_path}: {e}")
        time.sleep(1)

if __name__ == '__main__':
    classifier = Classifier('best.pt')
    process_new_images(classifier)
