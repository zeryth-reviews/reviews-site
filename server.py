from http.server import SimpleHTTPRequestHandler, HTTPServer
import datetime

def add_message(message):
    file_path = "messages.txt"
    
    current_time = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    
    new_message = f"{current_time} | {message}\n"
    
    try:
        with open(file_path, "r") as file:
            messages = file.readlines()
    except FileNotFoundError:
        messages = []
    
    messages.append(new_message)
    
    if len(messages) > 50:
        messages = messages[-50:]
    
    with open(file_path, "w") as file:
        file.writelines(messages)

class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/add_message':
            content_length = int(self.headers['Content-Length'])
            message = self.rfile.read(content_length).decode('utf-8')
            
            add_message(message)

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
