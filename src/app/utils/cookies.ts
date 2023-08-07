// Use this because we can't use middleware cookie-parse in socket io middleware
export const parseCookies = (cookieString) => {
  const list = {};
  const cookieHeader = cookieString;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    // eslint-disable-next-line prefer-const
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
};
