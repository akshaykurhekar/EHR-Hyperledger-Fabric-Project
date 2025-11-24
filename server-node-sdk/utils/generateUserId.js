const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique userId based on role
 * Format: {role}-{short-uuid}
 * Example: patient-a1b2c3d4, doctor-e5f6g7h8
 */
function generateUserId(role) {
  const shortUuid = uuidv4().replace(/-/g, '').substring(0, 12);
  const rolePrefix = role === 'insuranceAgent' ? 'agent' : role;
  return `${rolePrefix}-${shortUuid}`;
}

module.exports = generateUserId;

