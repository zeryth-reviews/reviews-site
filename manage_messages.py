import datetime
import json
import os

def add_message(message):
    file_path = "messages.json"
    
    # Get current GMT time
    current_time = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    # Create a new message object
    new_message = {
        "date": current_time,
        "message": message
    }
    
    # Read existing messages from JSON file (if it doesn't exist, create it)
    if os.path.exists(file_path):
        with open(file_path, "r") as file:
            try:
                messages = json.load(file)
            except json.JSONDecodeError:
                messages = []
    else:
        messages = []
    
    # Add the new message to the list
    messages.append(new_message)
    
    # Keep only the last 50 messages
    if len(messages) > 50:
        messages = messages[-50:]
    
    # Write the updated messages back to the JSON file
    with open(file_path, "w") as file:
        json.dump(messages, file, indent=4)

if __name__ == "__main__":
    # Test the function by adding a message
    message = input("Enter your new message: ")
    add_message(message)
    print("Message added successfully!")
