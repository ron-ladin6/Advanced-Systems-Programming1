#include "TcpSocket.h"
#include <sys/socket.h>
#include <unistd.h>
#include <iostream>
#include <cstring>

using namespace std;
void TcpSocket::send_data(const string &data){
    const char* data_ptr = data.c_str(); // return pointer to the first char in the string
    int length = data.length();
    int sent = 0;
    // check that all the data sent. somtimes in one send call not all the data sent so we loop until we sure all the 
    // data sent , even if its take more the one send call.

    while (sent < length){
        //data_ptr + sent is pointer to thr first byte that not sent.
        //length - sent is the number of bytes left to send.
        int send_in_this_call = send(sock_id, data_ptr + sent, length - sent,0);
        if (send_in_this_call < 0){
            close_socket();
            return;
        }
        //update the number of bytes that really sent for now.
        sent += send_in_this_call;
    }
}
// simple func that close the socket and set the sock_id to -1.
void TcpSocket :: close_socket(){
    if(sock_id < 0){
        return;
    }
    close(sock_id);
    sock_id = -1;
}
string TcpSocket::receive_data(){
    string result = "";
    char c;
    while(true){
        //read char char until we get '\n'
        int rec = recv(sock_id, &c, 1,0);
        if (rec <= 0){
            //we failde to receive data, close the socket.
            close_socket();
            //return empty string because valid command should end with '\n'
            return "";
        }
        //if we get here we finish the command.
        if(c == '\n'){
            break;
        }
        //else add the char to the curr command (result)
        result += c;
    }
    return result;
}