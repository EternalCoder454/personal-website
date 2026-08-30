"""Local preview server.

`python -m http.server` sends no cache headers, so browsers fall back to
heuristic caching and will happily keep serving a stale script.js or
styles.css after you've edited it - sometimes without even revalidating.
This sends no-store and ignores conditional requests, so a refresh always
shows the current files.

    python serve.py [port]        # default 5599
"""

import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    # keep-alive, so the browser isn't reconnecting for every asset
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def send_head(self):
        # drop conditional headers so we never answer with 304
        for header in ("If-Modified-Since", "If-None-Match"):
            if header in self.headers:
                del self.headers[header]
        return super().send_head()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5599
    print(f"serving on http://localhost:{port}  (ctrl-c to stop)")

    # Threading matters: a plain HTTPServer handles one connection at a time, and
    # browsers open several in parallel, so every page load stalls behind the queue.
    server = ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    server.daemon_threads = True
    server.serve_forever()
