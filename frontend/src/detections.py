from ultralytics import YOLO
import torch
import os
import time
import cv2

class Classifier:
    model = None
    def __init__(self, weights_path='best.pt'):
        # Load model
        self.model = YOLO(weights_path)
        print(torch.cuda.is_available())
        if torch.cuda.is_available():
            self.model.cuda()
        print('Model loaded successfully')

    def classify(self, img_path, output_folder='yoloimages'):
        # Use model.predict on image and save it to folder 'output', conf = 0.1 and bounding box threshold = 0.1
        results = self.model.predict(img_path, conf=0.1, iou=0.1)

        # Load the original image
        img = cv2.imread(img_path)
        height, width, _ = img.shape
        boxes_drawn = False

        # Draw the bounding boxes on the image with padding and less bold lines, and without names
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                # If bounding box coordinates are found, set flag to True
                boxes_drawn = True

                # Add padding to the bounding box
                padding = 10  # Adjust padding as needed
                x1 = max(0, x1 - padding)
                y1 = max(0, y1 - padding)
                x2 = min(width, x2 + padding)
                y2 = min(height, y2 + padding)

                # Draw the bounding box
                color = (0, 0, 255)  # Red color for bounding box
                thickness = 4  # Adjust thickness as needed
                cv2.rectangle(img, (int(x1), int(y1)), (int(x2), int(y2)), color, thickness)

        # Save the image with bounding boxes to the output folder if boxes were drawn
        if boxes_drawn:
            # Ensure the output folder exists
            os.makedirs(output_folder, exist_ok=True)

            output_path = os.path.join(output_folder, os.path.basename(img_path))
            cv2.imwrite(output_path, img)
            print(f'Processed image saved to {output_path}')
        else:
            print('No bounding boxes detected, image not saved.')

def ensure_folder_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

def process_new_images(classifier, input_folder='images', output_folder='yoloimages'):
    processed_files = set()
    ensure_folder_exists(output_folder)
    
    while True:
        # Get the list of all files in the input folder
        files = os.listdir(input_folder)
        
        # Filter out files that have been already processed
        new_files = [f for f in files if f not in processed_files]
        
        for file in new_files:
            file_path = os.path.join(input_folder, file)
            if os.path.isfile(file_path):
                try:
                    classifier.classify(file_path, output_folder)
                    processed_files.add(file)
                except Exception as e:
                    print(f"Failed to process {file_path}: {e}")

        # Sleep for a while before checking for new images again
        time.sleep(1)

if __name__ == '__main__':
    classifier = Classifier('best.pt')
    process_new_images(classifier)
