import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { SERVER_DOMAIN } from 'store/constant';

export const socket = io(SERVER_DOMAIN, {
  withCredentials: true,
  query: {
    accessToken: Cookies.get('accessToken')
  }
});
