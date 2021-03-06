import jwt from 'jsonwebtoken';
import { devConErr } from './devCon';
import { refreshTokenSecret } from '../constants';

export const verifyRefreshToken = refreshToken => {
  try {
    jwt.verify(refreshToken, refreshTokenSecret);
  } catch (error) {
    devConErr(['Refresh token verify error: ', error]);
  }
};
