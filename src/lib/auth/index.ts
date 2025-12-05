import NextAuth from 'next-auth';
import { authConfig } from './config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

// 현재 세션 가져오기 헬퍼
export { auth as getSession } from './index';
