export function mapResponseLogin(data: any) {
  return {
    type: data.user.type,
    name: data.user?.name,
    phone: data.user?.phone,
    email: data.user?.email,
    photoURL: data.user?.photoURL,
    branches: data.user?.branches,
    shops: data.user?.shops,
  };
}
