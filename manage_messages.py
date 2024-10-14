import datetime

def add_message(message):
    file_path = "messages.txt"
    
    # Get current GMT time
    current_time = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    # Format the message with the timestamp
    new_message = f"{current_time} | {message}\n"
    
    # Read existing messages (if the file doesn't exist, create it)
    try:
        with open(file_path, "r") as file:
            messages = file.readlines()
    except FileNotFoundError:
        messages = []
    
    # Add the new message to the list
    messages.append(new_message)
    
    # Keep only the last 50 messages
    if len(messages) > 50:
        messages = messages[-50:]
    
    # Write the updated messages back to the file
    with open(file_path, "w") as file:
        file.writelines(messages)

if __name__ == "__main__":
    # Test the function by adding a message
    message = input("Enter your new message: ")
    add_message(message)
    print("Message added successfully!")
