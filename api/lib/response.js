function jsonResponse(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(statusCode).json(data);
}

function success(res, data, statusCode = 200) {
  jsonResponse(res, statusCode, { success: true, data });
}

function error(res, message, statusCode = 400) {
  jsonResponse(res, statusCode, { success: false, error: message });
}

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return req.body || null;
}

module.exports = { jsonResponse, success, error, parseBody };
