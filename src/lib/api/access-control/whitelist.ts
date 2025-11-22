import whitelistJson from '@/config/whitelist.json';

type WhitelistType = {
  bots: string[];
  github_users: string[];
  github_organizations: string[];
  domains: string[];
};

const whitelist = whitelistJson as WhitelistType;

export const isWhitelisted = (
  item: string,
  type: keyof WhitelistType
): boolean => {
  return whitelist[type].includes(item);
};

export const getWhitelist = (type: keyof WhitelistType): string[] => {
  return whitelist[type];
};

export default whitelist;
