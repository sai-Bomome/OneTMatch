"""Local-only static server for the OneT Match workbench; no dependencies."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse,json
from tools.icon_catalog import discover
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.mjs':'text/javascript'}
    def do_GET(self):
        if self.path.split('?')[0]=='/icons/catalog.json':
            data=json.dumps(discover()).encode('utf-8')
            self.send_response(200);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        super().end_headers()
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=5188);args=p.parse_args()
    root=str(Path(__file__).resolve().parent)
    print(f'OneT Match: http://127.0.0.1:{args.port}/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),lambda *a,**kw:Handler(*a,directory=root,**kw)).serve_forever()
