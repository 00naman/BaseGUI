import os
import time
import shutil

def move_images(source_folder, destination_folder, interval=2):
    # Ensure destination folder exists
    os.makedirs(destination_folder, exist_ok=True)

    # List all files in the source folder
    files = os.listdir(source_folder)

    # Move each file from the source to the destination
    for file_name in files:
        source_path = os.path.join(source_folder, file_name)
        destination_path = os.path.join(destination_folder, file_name)

        if os.path.isfile(source_path):
            shutil.move(source_path, destination_path)
            print(f"Moved: {file_name}")
            time.sleep(interval)

if __name__ == "__main__":
    source_folder = 'images1'
    destination_folder = 'images'
    interval = 2  # seconds

    move_images(source_folder, destination_folder, interval)
