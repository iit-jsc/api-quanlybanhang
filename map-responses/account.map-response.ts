export function mapResponseLogin(data: any) {
  return {
    type: data.type,
    name: data.user?.name,
    phone: data.user?.phone,
    email: data.user?.email,
    photoURL: data.user?.photoURL,
    branch: data.branches?.[0],
  };
}
