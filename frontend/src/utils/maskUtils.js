export const getMaskedEmail = (email) => {
  if (!email) return "";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (name.length <= 4) return name[0] + "***@" + domain;
  return name.substring(0, 2) + "******" + name.substring(name.length - 2) + "@" + domain;
};
