import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'beautyx_secret_jwt_key_2026_fit_and_comfortable', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

export default generateToken;
