from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            update = json.loads(post_data)
            
            # Bot logic here
            if 'message' in update:
                chat_id = update['message']['chat']['id']
                text = update['message'].get('text', '')
                
                if text == '/start':
                    response = {
                        'method': 'sendMessage',
                        'chat_id': chat_id,
                        'text': 'Welcome to your calculator bot!',
                        'reply_markup': {
                            'inline_keyboard': [[{
                                'text': 'Open Calculator',
                                'web_app': {'url': 'https://calculator-ten-iota-15.vercel.app'}
                            }]]
                        }
                    }
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(response).encode())
                    return
                    
            self.send_response(200)
            self.end_headers()
