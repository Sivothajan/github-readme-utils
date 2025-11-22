import blacklistJson from '@/config/blacklist.json';

type BlacklistType = {
  bots: string[];
  github_users: string[];
  github_organizations: string[];
  domains: string[];
};

const blacklist = blacklistJson as BlacklistType;

export const isBlacklisted = (
  item: string,
  type: keyof BlacklistType
): boolean => {
  return blacklist[type].includes(item);
};

export const getBlacklist = (type: keyof BlacklistType): string[] => {
  return blacklist[type];
};

export default blacklist;
