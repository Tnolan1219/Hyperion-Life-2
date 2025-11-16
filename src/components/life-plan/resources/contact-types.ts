export type ContactCategory = 'Career' | 'Mentor' | 'Financial' | 'Personal';

export type Contact = {
  id?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  category: ContactCategory;
  notes?: string;
  userId?: string;
};
