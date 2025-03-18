import { io } from 'socket.io-client';
import { SERVER_URL } from 'store/constant';

export const socket = io({
  url: SERVER_URL,
  withCredentials: true,
  upgrade: false,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
});
