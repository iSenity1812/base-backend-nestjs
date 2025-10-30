export function maskSensitiveFields(obj, sensitiveFields, mask = '****') {
  // create a shallow copy of the object to avoid mutating the original
  const maskedObj = { ...obj };

  // iterate over each sensitive field and mask its value if it exists in the object
  for (const field of sensitiveFields) {
    if (Object.prototype.hasOwnProperty.call(maskedObj, field)) {
      maskedObj[field] = mask;
    }
  }
  return maskedObj;
}
