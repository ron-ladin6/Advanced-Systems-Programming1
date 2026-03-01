import Constants from 'expo-constants';

//the port defined in docker-compose for the 'web' service
const PORT = '5000';

//dynamically retrieve the host IP
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

const LAN_IP = debuggerHost
  ? debuggerHost.split(':').shift()
  : 'localhost';

//construct the API URL
export const API_BASE = `http://${LAN_IP}:${PORT}/api`;