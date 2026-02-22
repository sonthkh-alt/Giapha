
export type Gender = 'Male' | 'Female' | 'Other';

export type MemberStatus = 'approved' | 'pending';

export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  birthYear?: string;
  deathDate?: string;
  deathYear?: string;
  isDeceased: boolean;
  hometown?: string;
  photoUrl?: string;
  gender: Gender;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  bio?: string;
  status?: MemberStatus;
}

export interface SystemSettings {
  version: string;
  email: string;
  hotline: string;
  website: string;
  securityTerms: string;
}

export interface FamilyData {
  members: FamilyMember[];
  lastUpdated: string;
  settings?: SystemSettings;
}

export interface TreeDataNode {
  id: string;
  name: string;
  member: FamilyMember;
  children: TreeDataNode[];
}