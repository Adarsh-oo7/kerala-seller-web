#!/usr/bin/env python3
"""Local POS print bridge for silent thermal printing.

Browsers cannot send bytes to a USB/LAN printer without a user print dialog.
Run this on the shop computer, then the billing page can POST ESC/POS here.

  python print_bridge.py

Optional:
  POS_PRINTER='My_Thermal'   CUPS/lp printer name
  POS_BRIDGE_PORT=17890
"""

from __future__ import annotations

import base64
import json
import os
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


HOST = '127.0.0.1'
PORT = int(os.environ.get('POS_BRIDGE_PORT', '17890'))
PRINTER = os.environ.get('POS_PRINTER', '')


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write('pos-bridge: ' + (fmt % args) + '\n')

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        body = json.dumps({'ok': True, 'printer': PRINTER or None, 'port': PORT}).encode()
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.rstrip('/') != '/print':
            self.send_response(404)
            self._cors()
            self.end_headers()
            return
        length = int(self.headers.get('Content-Length') or 0)
        payload = json.loads(self.rfile.read(length) or b'{}')
        raw = base64.b64decode(payload.get('escpos_base64') or b'')
        if not raw:
            self.send_response(400)
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"error":"missing escpos_base64"}')
            return
        printer = payload.get('printer') or PRINTER
        if printer:
            subprocess.run(['lp', '-d', printer, '-o', 'raw'], input=raw, check=False)
        else:
            sys.stdout.buffer.write(raw)
            sys.stdout.buffer.flush()
        body = b'{"ok":true}'
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f'POS print bridge on http://{HOST}:{PORT}  printer={PRINTER or "(stdout / no CUPS printer)"}')
    server.serve_forever()
