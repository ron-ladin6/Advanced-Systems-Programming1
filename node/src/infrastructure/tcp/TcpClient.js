const net = require("net");

class TcpClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.buffer = "";
    //one waiter at a time
    this.waiter = null;
  }
  connect() {
      //if already connected
      if (this.socket) 
          return Promise.resolve();
      //else
      return new Promise((resolve, reject) => {
      //create socket
      this.socket = new net.Socket();
      //handle incoming data
      this.socket.on("data", (data) => {
          this.buffer += data.toString("utf8");
          this._tryResolve();
      });
      //handle errors
      this.socket.once("error", (err) => {
          if (this.waiter) {
              const w = this.waiter;
              this.waiter = null;
              w.reject(err);
          }
          reject(err);
      });
      //connect
      this.socket.connect(this.port, this.host, resolve);
      });
  }
  //add newline if needed
  sendLine(line) {
      if (line.endsWith("\n")) {
          this.socket.write(line);
      } else {
        this.socket.write(line + "\n");
      }
  }
  //read until new line
  readLine() {
      //if we already have a complete line
      const idx = this.buffer.indexOf("\n");
      if (idx !== -1) {
        const line = this.buffer.slice(0, idx);
        this.buffer = this.buffer.slice(idx + 1);
        return Promise.resolve(line);
      } else {
        //else wait for data
        return new Promise((resolve, reject) => {
        this.waiter = { resolve, reject };
        })
      };
    }

  _tryResolve() {
    if (!this.waiter) 
        return;
    const idx = this.buffer.indexOf("\n");
    if (idx === -1) 
        return;
    const line = this.buffer.slice(0, idx);
    this.buffer = this.buffer.slice(idx + 1);
    const w = this.waiter;
    this.waiter = null;
    w.resolve(line);
  }

  close() {
    if (this.socket) {
      this.socket.end();
      this.socket.destroy();
      this.socket = null;
    }
    this.buffer = "";
    this.waiter = null;
  }
}
//make available for import
module.exports = TcpClient;