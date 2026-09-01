import { supabase } from "@/integrations/supabase/client";

/* --------------------------------- types --------------------------------- */

export type Author = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export type FeedPost = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  author: Author | null;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  repostedByMe: boolean;
};

type RawPost = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  author: Author | Author[] | null;
  post_likes: { user_id: string }[] | null;
  post_comments: { id: string }[] | null;
  post_reposts: { user_id: string }[] | null;
  post_bookmarks: { user_id: string }[] | null;
};

export const POST_SELECT =
  "id, content, image_url, created_at, user_id, author:profiles(id, username, display_name, avatar_url), post_likes(user_id), post_comments(id), post_reposts(user_id), post_bookmarks(user_id)";

export function normalizePost(raw: RawPost, viewerId: string | null): FeedPost {
  const likes = raw.post_likes ?? [];
  const reposts = raw.post_reposts ?? [];
  const bookmarks = raw.post_bookmarks ?? [];
  const author = Array.isArray(raw.author) ? (raw.author[0] ?? null) : raw.author;
  return {
    id: raw.id,
    content: raw.content,
    image_url: raw.image_url,
    created_at: raw.created_at,
    user_id: raw.user_id,
    author,
    likeCount: likes.length,
    commentCount: (raw.post_comments ?? []).length,
    repostCount: reposts.length,
    likedByMe: !!viewerId && likes.some((l) => l.user_id === viewerId),
    repostedByMe: !!viewerId && reposts.some((r) => r.user_id === viewerId),
    // RLS restricts post_bookmarks to the viewer's own rows.
    bookmarkedByMe: bookmarks.length > 0,
  };
}

/* -------------------------------- queries -------------------------------- */

export async function fetchFeed(viewerId: string, scope: "for-you" | "following") {
  let followingIds: string[] = [];
  if (scope === "following") {
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", viewerId);
    followingIds = (data ?? []).map((f) => f.following_id);
    followingIds.push(viewerId);
  }

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .limit(60);

  if (scope === "following") {
    query = query.in("user_id", followingIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as unknown as RawPost[]).map((p) => normalizePost(p, viewerId));
}

export async function fetchPost(postId: string, viewerId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", postId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizePost(data as unknown as RawPost, viewerId);
}

export async function fetchUserPosts(userId: string, viewerId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data as unknown as RawPost[]).map((p) => normalizePost(p, viewerId));
}

export async function fetchLikedPosts(viewerId: string) {
  const { data: likes, error } = await supabase
    .from("post_likes")
    .select("post_id, created_at")
    .eq("user_id", viewerId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  const ids = (likes ?? []).map((l) => l.post_id);
  if (ids.length === 0) return [];
  const { data, error: postErr } = await supabase.from("posts").select(POST_SELECT).in("id", ids);
  if (postErr) throw postErr;
  const posts = (data as unknown as RawPost[]).map((p) => normalizePost(p, viewerId));
  return ids.map((id) => posts.find((p) => p.id === id)).filter((p): p is FeedPost => !!p);
}

export async function fetchBookmarkedPosts(viewerId: string) {
  const { data: rows, error } = await supabase
    .from("post_bookmarks")
    .select("post_id, created_at")
    .eq("user_id", viewerId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  const ids = (rows ?? []).map((r) => r.post_id);
  if (ids.length === 0) return [];
  const { data, error: postErr } = await supabase.from("posts").select(POST_SELECT).in("id", ids);
  if (postErr) throw postErr;
  const posts = (data as unknown as RawPost[]).map((p) => normalizePost(p, viewerId));
  return ids.map((id) => posts.find((p) => p.id === id)).filter((p): p is FeedPost => !!p);
}

/* ------------------------------- hashtags -------------------------------- */

export const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;

export function extractHashtags(text: string): string[] {
  return (text.match(HASHTAG_RE) ?? []).map((t) => t.toLowerCase());
}

export type TrendingTag = { tag: string; count: number };

export function computeTrending(posts: { content: string }[], limit = 5): TrendingTag[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of new Set(extractHashtags(post.content))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

/* ------------------------------- formatting ------------------------------ */

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
