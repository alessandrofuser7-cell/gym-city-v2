# Placeholder - real server runs via /app/frontend
import time
import http.server
import socketserver

# Simple health check server on port 8001
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health' or self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", 8001), Handler) as httpd:
    print("Backend placeholder on 8001")
    httpd.serve_forever()
