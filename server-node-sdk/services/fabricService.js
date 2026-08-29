const invoke = require('../invoke');
const query = require('../query');

exports.invoke = async (fnName, payloadObj, userId) => {
  return await invoke.invokeTransaction(fnName, payloadObj, userId);
};

exports.query = async (fnName, payloadObj, userId) => {
  return await query.getQuery(fnName, payloadObj, userId);
};
