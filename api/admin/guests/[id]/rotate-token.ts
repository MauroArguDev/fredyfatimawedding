import { withAdminAuth } from '../../../_lib/adminAuth';
import { rotateGuestToken } from '../../../_lib/guests';
import { extractRouteParam } from '../../../_lib/httpParams';

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_METHOD_NOT_ALLOWED = 405;

export default withAdminAuth(async (request, response) => {
  if (request.method !== 'POST') {
    response.status(HTTP_METHOD_NOT_ALLOWED).json({ code: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const id = extractRouteParam(request.query, 'id');
  const updated = id === null ? null : await rotateGuestToken(id);

  if (updated === null) {
    response.status(HTTP_NOT_FOUND).json({ code: 'NOT_FOUND' });
    return;
  }

  response.status(HTTP_OK).json({ id, ...updated.data });
});
