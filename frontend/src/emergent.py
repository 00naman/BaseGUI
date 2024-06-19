import os
import cv2
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from ultralytics import YOLO
import torch
import time

class Classifier:
    def __init__(self, general_weights='best.pt', additional_weights='yolov8n.pt', pose_weights='yolov8n-pose.pt'):
        self.general_model = YOLO(general_weights)
        self.additional_model = YOLO(additional_weights)
        self.pose_model = YOLO(pose_weights)

        if torch.cuda.is_available():
            self.general_model.cuda()
            self.additional_model.cuda()
            self.pose_model.cuda()

        print('Models loaded successfully')

    def classify(self, img_path, output_folder='yoloimages', bbox_folder='../public/boundingbox', folder_counter=1):
        general_results = self.general_model.predict(img_path, conf=0.1, iou=0.1)
        img = cv2.imread(img_path)
        height, width, _ = img.shape

        detections = []
        boxes_drawn = False

        for result in general_results:
            for i, box in enumerate(result.boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                padding = 10
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(width, x2 + padding)
                y2 = min(height, y2 + padding)

                cropped_img = img[int(y1):int(y2), int(x1):int(x2)]

                cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                boxes_drawn = True
                cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
                detections.append((cropped_img, i, cx, cy))


        # Apply additional model on the image
        additional_results = self.additional_model(img_path, classes = 0, conf=0.01, iou=0.1, max_det=1)

        for result in additional_results:
            for i, box in enumerate(result.boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                padding = 10
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(width, x2 + padding)
                y2 = min(height, y2 + padding)

                cropped_img = img[int(y1):int(y2), int(x1):int(x2)]

                print("yolo only")

                # Depending on results, apply pose model
                pose_results = self.pose_model(cropped_img, conf=0.03,verbose = False, save = False)
                # Handle pose results accordingly

                keypts = pose_results[0].keypoints
                if (keypts.has_visible):
                    final_boxes = pose_results[0].boxes

                    for x,y,w,h in final_boxes.xywh:
                        x_pixel = int(x)
                        y_pixel = int(y)
                        w_pixel = int(w) + 5 #padding
                        h_pixel = int(h) + 5 #padding

                        roi_final = cropped_img[y_pixel - h_pixel:y_pixel + h_pixel, x_pixel - w_pixel:x_pixel + w_pixel]

                        if(y_pixel- h_pixel >=0 ):
                            if(x_pixel - w_pixel >= 0):
                                roi_final = cropped_img[y_pixel - h_pixel:y_pixel + h_pixel, x_pixel - w_pixel:x_pixel + w_pixel]
                            else:
                                roi_final = cropped_img[y_pixel - h_pixel:y_pixel + h_pixel, 0:x_pixel + w_pixel]
                        else:
                            if(x_pixel - w_pixel >= 0):
                                roi_final = cropped_img[0:y_pixel + h_pixel, x_pixel - w_pixel:x_pixel + w_pixel]
                            else:
                                roi_final = cropped_img[0:y_pixel + h_pixel, 0:x_pixel + w_pixel]

                        cv2.rectangle(img, (x_pixel - w_pixel, y_pixel - h_pixel), (x_pixel + w_pixel, y_pixel + h_pixel), (0, 0, 255), 2)
                        print("pose done")

                        boxes_drawn = True
                        #cx, cy = int((x1 + x2) / 2), int((y1 + y2) / 2)
                        detections.append((roi_final, i, x_pixel, y_pixel))


        if detections:
            image_specific_folder = os.path.join(bbox_folder, str(folder_counter))
            os.makedirs(image_specific_folder, exist_ok=True)

            for cropped_img, i, cx, cy in detections:
                bbox_path = os.path.join(image_specific_folder, f'{os.path.splitext(os.path.basename(img_path))[0]}_bbox_{i}_center_{cx}_{cy}.jpg')
                cv2.imwrite(bbox_path, cropped_img)

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
            return False

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
    classifier = Classifier('best.pt', 'yolov8n.pt', 'yolov8n-pose.pt')
    watcher = FileWatcher('images', classifier)
    watcher.run()