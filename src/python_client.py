import socket
import sys

#expect python3 python_client.py <ip> <port>
if len(sys.argv) != 3:
    sys.exit(1)
ip = sys.argv[1]
try:
    port = int(sys.argv[2])
except ValueError:
    sys.exit(1)
def read_line(sock):
    """Read a single '\n'-terminated line from the socket, without the '\n'."""
    chunks = []
    while True:
        ch = sock.recv(1)
        if not ch:
            break
        if ch == b"\n":
            break
        chunks.append(ch)
    return b"".join(chunks).decode("utf-8")
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((ip, port))
try:
    for line in sys.stdin:
        if not line.strip():
            continue  # skip empty lines
        # send the command (line) to the server
        #strip to remove extrta spaces in the line
        sock.sendall((line.strip() + "\n").encode("utf-8"))
        # wait for the response
        status = read_line(sock)
        sys.stdout.write(status + "\n")
        # 200 its means Search or get so we need to read and print more data (file content or file names)
        if status.startswith("200 "):
            #skip the empty separator line
            empty_line = read_line(sock)
            sys.stdout.write(empty_line + "\n")
            #this the data that we get from the sever (file names that we get from search or file content from get)
            content = read_line(sock)
            sys.stdout.write(content + "\n")
            
        sys.stdout.flush()
finally:
    sock.close()