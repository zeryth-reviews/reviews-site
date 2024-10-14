from http.server import SimpleHTTPRequestHandler, HTTPServer
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

class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/add_message':
            # Read the message from the request body
            content_length = int(self.headers['Content-Length'])
            message = self.rfile.read(content_length).decode('utf-8')
            
            # Call the function to add the message
            add_message(message)

            # Send response
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Message added')

        else:
            self.send_error(404, "File not found.")

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Serving on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
