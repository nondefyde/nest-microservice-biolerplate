import * as mongoose from 'mongoose';

export const AuthUserSub = {
  _id: new mongoose.Types.ObjectId(),
  publicId: 'rtghytrgfdwdfd',
  email: 'test@gmail.com',
  mobile: {
    phoneNumber: '2348061738278',
    isoCode: 'NG',
  },
  bvn: '12354211222',
  password: 'jhkefnvirjewjfinojkw',
  verifications: {
    email: true,
    mobile: true,
    bvn: true,
  },
};

export const signUpStub = {
  _id: new mongoose.Types.ObjectId(),
  email: 'test@gmail.com',
  bvn: '12354211222',
  password: 'abcd1234',
};

export const signInStub = {
  email: 'kehindeibukun@gmail.com',
  mobile: {
    phoneNumber: '2348061738278',
    isoCode: 'NG',
  },
  password: 'password',
};

// export const verifyMobileStub = {
//   mobile: {
//     phoneNumber: '2348075889776',
//     isoCode: 'NG',
//   },
//   password: 'abcd1234',
//   verificationCode: '1234',
// };

// export const verifyEmailStub = {
//   email: 'test@gmail.com',
//   password: 'abcd1234',
//   verificationCode: '1234',
// };

// export const bvn = '12345067891';
