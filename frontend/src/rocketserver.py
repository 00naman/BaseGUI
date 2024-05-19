import socket
import os

# Define server host and port
HOST = '0.0.0.0'  # Use 0.0.0.0 to listen on all available interfaces
PORT = 12346
# Create socket object
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind socket to address and port
server_socket.bind((HOST, PORT))

# Listen for incoming connections
server_socket.listen(1)
print("Server listening on port", PORT)

# Create a directory to store images if it doesn't exist
if not os.path.exists("images"):
    os.makedirs("images")

counter = 1  # Initialize counter for images

while True:
    # Accept incoming connection
    client_socket, client_address = server_socket.accept()
    print("Connection from:", client_address)

    # Receive images
    while True:
        # Receive image name length
        name_length_bytes = client_socket.recv(4)
        if not name_length_bytes:
            break  # End of images
        name_length = int.from_bytes(name_length_bytes, byteorder='big')
        # Receive image name
        image_name = client_socket.recv(name_length).decode('utf-8')
        # Receive image size
        image_size = int.from_bytes(client_socket.recv(4), byteorder='big')
        # Receive image data
        image_data = b""
        while len(image_data) < image_size:
            packet = client_socket.recv(image_size - len(image_data))
            if not packet:
                break  # Connection closed
            image_data += packet
        
        # Save the image with counter
        counter_padded = str(counter).zfill(4)  # Pad counter with zeros
        counter += 1  # Increment counter for the next image
        counter_name = f"{counter_padded}_{image_name}"
        with open(os.path.join("images", counter_name), 'wb') as f:
            f.write(image_data)
            print("Received:", counter_name)

    # Close the client connection
    client_socket.close()

# Close the server socket
server_socket.close()
