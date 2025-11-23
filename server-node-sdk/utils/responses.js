exports.ok = (data) => ({ success: true, data });
exports.error = (msg) => ({ success: false, message: msg });
