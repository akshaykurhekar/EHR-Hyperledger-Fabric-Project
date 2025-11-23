module.exports = (req, res, next) => {
  const userId = req.headers['x-userid'] || req.body.userId || req.query.userId;
  if(!userId) return res.status(401).send({ success:false, message: 'Missing userId (x-userid header or body.userId)' });
  req.user = { id: userId };
  next();
};
