export const MAX_FILE_SIZE = 200 * 1024; // 200KB

export const commonPatterns = {
  mobile: /^[6-9]\d{9}$/,
  pincode: /^[0-9]{6}$/,
  pan: /^[A-Z]{3}P[A-Z]{1}[0-9]{4}[A-Z]{1}$/,
  aadhaar: /^[2-9]\d{11}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  passport: /^[A-Z][0-9]{7}$/,
  uan: /^\d{12}$/,
  license: /^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}$/,
  bankAccount: /^\d{9,18}$/,
  email:
    /^(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._]{0,62}[A-Za-z0-9]@(?:gmail|example|vakrangee|admin|hotmail|yahoo|zohomail|outlook|live|icloud|aol|proton|protonmail|rediff|zoho)\.(?:com|co\.in|io|co|in)$/,
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char, no spaces
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])\S{8,}$/,
  // Address patterns (per spec)
  address1: /^[a-zA-Z0-9\s,.\-\/()]{3,200}$/, // letters, digits, space, comma, hyphen, slash, brackets
  address2: /^[a-zA-Z0-9\s.,\-\/()]{3,200}$/, // letters, digits, space, comma, hyphen, slash, brackets
  landmark: /^[a-zA-Z\s.]{3,200}$/, // letters and space only
};
