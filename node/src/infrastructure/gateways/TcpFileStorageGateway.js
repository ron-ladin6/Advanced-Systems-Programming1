const TcpClient = require("../tcp/TcpClient");

//made queue to serialize requests
class TcpFileStorageGateway {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.queue = Promise.resolve();
    console.log(
      `[DEBUG GATEWAY] Initialized with Target: ${this.host}:${this.port}`
    );
  }

  //serialize requests
  _enqueue(fn) {
    this.queue = this.queue.then(fn, fn);
    return this.queue;
  }

  //make a request
  async _request(cmd, expectBody, type) {
    console.log(`[DEBUG GATEWAY] Connecting to ${this.host}:${this.port}...`);
    console.log(
      `[DEBUG GATEWAY] Sending Command: "${cmd.substring(0, 50)}..."`
    );

    const client = new TcpClient(this.host, this.port);
    try {
      await client.connect();
      console.log(`[DEBUG GATEWAY] Connected successfully!`);

      client.sendLine(cmd);
      const status = await client.readLine();
      console.log(`[DEBUG GATEWAY] Received Status: ${status}`);

      //if no body expected or error status
      if (!expectBody || !status.startsWith("200")) {
        return { status };
      }

      let content = await client.readLine();
      if (content === "") {
        content = await client.readLine();
      }

      console.log(
        `[DEBUG GATEWAY] Received Content length: ${
          content ? content.length : 0
        }`
      );

      // SEARCH returns a list of IDs
      if (type === "SEARCH") {
        return { status, content };
      }

      // GET: support TXT
      if (!content) {
        return { status, content: "" };
      }

      //text payload
      if (content.startsWith("TXT:")) {
        const text = content.substring(4).replace(/__NL__/g, "\n");
        return { status, content: text };
      }

      //treat as plain text
      return { status, content };
    } catch (err) {
      console.error(
        `[DEBUG GATEWAY ERROR] Failed to communicate with C++ Server at ${this.host}:${this.port}`
      );
      console.error(`Error Details:`, err.message);

      throw err;
    } finally {
      client.close();
    }
  }

  post(fileId, content = "") {
    //enqueue the request
    return this._enqueue(() => {
      //convert content to string
      const strContent = String(content || "");

      //escape newlines
      const safeText = strContent.replace(/\n/g, "__NL__");
      const payload = `TXT:${safeText}`;
      console.log(
        `[DEBUG GATEWAY] Preparing POST. Payload size: ${payload.length}`
      );

      const cmd = `post ${fileId} ${payload}`;
      //return the request
      return this._request(cmd, false);
    });
  }

  //get file by id
  get(fileId) {
    return this._enqueue(() => this._request(`get ${fileId}`, true, "GET"));
  }

  // delete file by id
  delete(fileId) {
    return this._enqueue(() => this._request(`delete ${fileId}`, false));
  }

  //search files by query
  search(query) {
    return this._enqueue(() =>
      this._request(`search ${query}`, true, "SEARCH")
    );
  }
}

//make available for import
module.exports = TcpFileStorageGateway;
