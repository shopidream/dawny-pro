import { authenticate } from "../shopify.server.js";

export async function debugAdmin(request) {
  const { admin } = await authenticate.admin(request);
  console.log('Admin object keys:', Object.keys(admin));
  console.log('Admin type:', typeof admin);
  console.log('Admin.rest:', admin.rest ? Object.keys(admin.rest) : 'undefined');
  console.log('Admin.session:', admin.session ? Object.keys(admin.session) : 'undefined');
  return admin;
}
