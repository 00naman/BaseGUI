import os
import cv2
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from ultralytics import YOLO
import torch
import time

class Classifier:
    def __init__(self, weights_path='best.pt'):
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

                # Calculate center pixel coordinates
                cx = int((x1 + x2) / 2)
                cy = int((y1 + y2) / 2)

                # Draw bounding boxes on the original image
                cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                boxes_drawn = True

                # Crop the bounding box region
                cropped_img = img[int(y1):int(y2), int(x1):int(x2)]
                detections.append((cropped_img, i, cx, cy))

        # Create a folder and save detections only if there are any
        if detections:
            image_specific_folder = os.path.join(bbox_folder, str(folder_counter))
            os.makedirs(image_specific_folder, exist_ok=True)

            for cropped_img, i, cx, cy in detections:
                bbox_path = os.path.join(image_specific_folder, f'{os.path.splitext(os.path.basename(img_path))[0]}_bbox_{i}_center_{cx}_{cy}.jpg')
                cv2.imwrite(bbox_path, cropped_img)

            # Save processed image with boxes drawn
            os.makedirs(output_folder, exist_ok=True)
            output_path = os.path.join(output_folder, os.path.basename(img_path))
            if boxes_drawn:
                cv2.imwrite(output_path, img)
                print(f'Processed image with bounding boxes saved to {output_path}')
                return True
            else:   
                print('No bounding boxes detected, folder not created.')
                return False
        else:
            print('No bounding boxes detected, folder not created.')

class FileWatcher:
    def __init__(self, input_folder, classifier):
        self.input_folder = input_folder
        self.classifier = classifier
        self.observer = Observer()
        self.folder_counter = 1  # Initialize counter to manage output directories

    def run(self):
        self.process_existing_files()  # Process existing files first
        event_handler = NewImageHandler(self.input_folder, self.classifier, self.folder_counter)
        self.observer.schedule(event_handler, self.input_folder, recursive=False)
        self.observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.observer.stop()
            print("Observer stopped")
        self.observer.join()

    def process_existing_files(self):
        for filename in os.listdir(self.input_folder):
            filepath = os.path.join(self.input_folder, filename)
            if os.path.isfile(filepath) and filepath.lower().endswith(('.png', '.jpg', '.jpeg')):
                print(f'Processing existing image: {filepath}')
                if self.classifier.classify(filepath, 'yoloimages', '../public/boundingbox', self.folder_counter):
                    self.folder_counter += 1

class NewImageHandler(FileSystemEventHandler):
    def __init__(self, input_folder, classifier, folder_counter):
        self.input_folder = input_folder
        self.classifier = classifier
        self.folder_counter = folder_counter

    def on_created(self, event):
        if not event.is_directory and any(event.src_path.endswith(ext) for ext in ['.jpg', '.jpeg', '.png']):
            print(f'New image detected: {event.src_path}')
            if self.classifier.classify(event.src_path, 'yoloimages', '../public/boundingbox', self.folder_counter):
                self.folder_counter += 1

if __name__ == '__main__':
    classifier = Classifier('best.pt')
    watcher = FileWatcher('images', classifier)
    watcher.run()
