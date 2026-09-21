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
    thumbsUp?: number;
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

export interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
}

export interface CommentItemType {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  isEdited?: boolean;
  author: CommentAuthor;
  replies?: CommentItemType[];
}

export interface AdminCommentItem {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
  post: {
    id: string;
    title: string;
    slug: string;
  };
  parent?: {
    id: string;
    content: string;
    author: {
      name: string | null;
    };
  } | null;
  _count?: {
    replies: number;
  };
}

export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "ADMIN" | "READER";
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
    comments: number;
    likes: number;
  };
}

