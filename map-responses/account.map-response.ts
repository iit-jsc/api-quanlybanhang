export function mapResponseLogin(data: any) {
  return {
    username: data.username,
    name: data.user?.name,
    phone: data.user?.phone,
    email: data.user?.email,
    photoURL: data.user?.photoURL,
    address: data.user?.address,
    cardId: data.user?.cardId,
    cardDate: data.user?.cardDate,
    cardAddress: data.user?.cardAddress,
    birthday: data.user?.birthday,
    sex: data.user?.sex,
    startDate: data.user?.startDate,
    branches: data.user?.branches,
    shops: data.user?.shops,
  };
}
