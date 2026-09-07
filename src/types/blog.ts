export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage: string | null;
  published: boolean;
  isFeatured: boolean;
  views: number;
  readingTime: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    bio?: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    posts: number;
  };
}

export interface PostsApiResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}
