module.exports = function(req, res, next) {
  res.success = (obj) => {
    res.send(Object.assign({status: 'Ok', message: 'Success'}, obj));
  };

  res.fail = (err, statusCode) => {
    if (statusCode) {
      res.status(statusCode);
    }
    const errMsg = typeof err === 'string' ? err : JSON.stringify(err);
    const response = {status: 'Failed', message: errMsg};
    if (typeof err === 'object') {
      response.errors = err;
    }
    res.send(response);
  }

  next();
}
