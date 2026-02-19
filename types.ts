
export type Gender = 'Male' | 'Female' | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  // Thêm birthYear để tương thích với dữ liệu trong constants.tsx
  birthYear?: string;
  deathDate?: string; // Dùng cho ngày cụ thể nếu cần
  deathYear?: string; // Năm mất
  isDeceased: boolean;
  // Chuyển hometown thành optional vì nhiều bản ghi trong INITIAL_DATA thiếu trường này
  hometown?: string;
  photoUrl?: string;
  gender: Gender;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  bio?: string;
}

export interface FamilyData {
  members: FamilyMember[];
  lastUpdated: string;
}

export interface TreeDataNode {
  id: string;
  name: string;
  member: FamilyMember;
  children: TreeDataNode[];
}