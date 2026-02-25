
export type ID = string | number;

export interface Category {
  id: ID;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: string;
}

export interface Proposal {
  id: ID;
  categoryId: ID;
  title: string;
  description?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdBy?: ID;
  createdAt?: string;
}

export interface Media {
  id: ID;
  url: string;
  alt?: string;
}

export interface PollOption {
  id: ID;
  text: string;
  votes: number;
}

export interface Poll {
  id: ID;
  question: string;
  options: PollOption[];
  userVotedOptionId?: ID | null;
  endsAt?: string | null;
}

export interface Post {
  id: ID;
  authorName: string;
  text?: string;
  media?: Media[];
  poll?: Poll | null;
  createdAt: string;
}
