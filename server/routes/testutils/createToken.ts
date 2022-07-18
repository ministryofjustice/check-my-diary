import jwt from 'jsonwebtoken'

export default function createToken(username = 'ITAG_USER', employeeName = 'Sarah Itag', authorities: string[] = []) {
  const payload = {
    sub: username,
    user_name: username,
    name: employeeName,
    scope: ['read', 'write'],
    auth_source: 'nomis',
    authorities,
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'my-diary',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}
