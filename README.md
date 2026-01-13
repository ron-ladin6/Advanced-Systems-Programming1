# Advanced-Programming-Project – Exercise 4
https://github.com/Advanced-Programming-Project-Ron-Dan/Advanced-Programming-Project--ex4

This project is a full system that includes a **React client** + a **Node.js REST API server** (MVC style),
which acts as a web wrapper for the **C++ TCP file-storage server from Exercise 2**.

---

## System components
- **ex2 (C++ TCP Server)** – Stores file content and supports content search via TCP.
- **web (Node.js / Express API)** – Exposes REST endpoints for users and files and communicates with the TCP server.
- **client (React)** – UI for register/login and file management.

---

## Main features
- **User Authentication:** Register + Login (JWT token).
- **File Management:** Create, Read, Update, Delete files and folders (delete to Trash + permanent delete from Trash).
- **File Actions:** Rename files and folders, edit text files, replace file content, replace images.
- **Views:** My Files, Recent, Starred, Trash, Shared.
- **Permissions (Sharing):** Share files with other users (**viewer** role).
- **Search:** Search by file name (Node side) and by content (delegated to the C++ server).
- **Theme:** Clicking the **sun/moon** icon toggles **Light mode / Dark mode**.
- **Upload limit:** Maximum file size is **up to 100MB**.

---

## Project structure (high level)
- **client/** – React application (UI).
- **web/** – Express API (Routes + Services + Gateways).
- **ex2/** – C++ TCP file-storage server.

---

## Running the project (required flow)

### 0. Requirements
- Docker Desktop installed and running.
- Node.js is only needed if you want to run the client locally without Docker.

### 1. Start servers using Docker Compose
Open a terminal in the project root folder and run:

docker-compose up --build

What this does:
Builds and runs the C++ TCP server on port 8080 (internal Docker network).
Builds the Node.js server, exposing port 5000. It connects to ex2 via the internal hostname ex2.
frontend: Builds the React app and serves it on port 3000.

### 2. Open your browser and navigate to:
http://localhost:3000

### 3. Stopping the Server
docker-compose down

# How to use the UI (React client)
## Navigation basics
Folders are opened by clicking the folder item in the list.
Actions such as Upload, New Folder, and Move Here always apply to the current folder you are inside.
Use the breadcrumbs at the top to jump back to previous folders.

## Home page (My Files)
This page shows your files and folders in the current directory.

#### Top icons:
- ★ / ☆ – Star / Unstar the item.
- 📁 – Folder
- 🖼️ – Image file
- 📕 – PDF file
- 📝 – Text file
#### Other hover(mouse over) actions:
- ↔ – Move
- ⤴ – Share
- ✎ – Edit
- ✏️ – Rename (files & folders)
- 🗑 – Delete *(moves item to Trash)*
- ↩ – Restore
- 🗑(in red) Delete Forever

### Create folder
1.Click New Folder
2.Enter a folder name and confirm

### Rename(you can in edit page and also in homepage)
1.Mouse over the item card
2.Click the ✏️ Rename button
3.Enter the new name and confirm

### Upload file
1.Click Upload File
2.Choose any file (images are supported)
3.The file will be uploaded to the current folder

*Note: Max upload size is 100MB.*

### Open folder
1.Click a folder to enter it
2.Use the breadcrumbs at the top to go back to parent folders

### Moving files between folders
1.Navigate to the folder that currently contains the file
2.Click Move on the file you want to move
3.A banner will appear indicating the selected file
4.Navigate to the destination folder
5.Click Confirm - Move Here to complete the move
6.Click Cancel to stop the move

### Star / Unstar
1.Click the star action to toggle Starred state.
2.Starred files appear in the Starred view.

### Sharing a file
1.Click Share on a file
2.Enter the username of another user (not an ID and not display name)
3.Click Share

The Shared page shows files that were shared with the current user.
The file will appear in the other user's Shared view.

### Delete / Restore / Delete Forever
1.Clicking Delete moves the item to Trash.
2.In Trash, you can Restore items back to My Files.
3.Delete Forever is available only in the Trash view and permanently removes the file.

## File page (view / edit)
### Rename a file
1.Edit the file name in the name input
2.Click Save Name

### Edit a text file
1.Change the content in the text area
2.Click Save Changes
3.After saving, the page navigates back automatically

### Replace a text file
1.Click Replace File
2.Pick a .txt file
3.The file content will be replaced

*Note: Max upload size is 100MB.*

### Replace an image
1.For image files, click Replace Image
2.Pick an image file
3.The image will be replaced

*Note: Max upload size is 100MB.*

### How it should look:
#### 1:
![example1](screenshots/example1.png)
#### 2:
![example2](screenshots/example2.png)
#### 3:
![example3](screenshots/example3.png)
#### 4:
![example4](screenshots/example4.png)