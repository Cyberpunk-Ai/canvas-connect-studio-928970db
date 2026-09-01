import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "@/lib/social";

/** Applies a patch to every cached post, in every list or detail query. */
function patchPostEverywhere(
  queryClient: QueryClient,
  postId: string,
  patch: (post: FeedPost) => FeedPost,
) {
  queryClient.setQueriesData<unknown>({ queryKey: ["posts"] }, (current) => {
    if (Array.isArray(current)) {
      return (current as FeedPost[]).map((p) => (p.id === postId ? patch(p) : p));
    }
    const single = current as FeedPost | null | undefined;
    if (single && typeof single === "object" && single.id === postId) return patch(single);
    return current;
  });
}

function removePostEverywhere(queryClient: QueryClient, postId: string) {
  queryClient.setQueriesData<unknown>({ queryKey: ["posts"] }, (current) => {
    if (Array.isArray(current)) return (current as FeedPost[]).filter((p) => p.id !== postId);
    return current;
  });
}

export function useToggleLike(viewerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: FeedPost) => {
      if (!viewerId) throw new Error("Not signed in");
      if (post.likedByMe) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", viewerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: post.id, user_id: viewerId });
        if (error) throw error;
      }
    },
    onMutate: async (post) => {
      patchPostEverywhere(queryClient, post.id, (p) => ({
        ...p,
        likedByMe: !p.likedByMe,
        likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
      }));
    },
    onError: (_err, post) => {
      patchPostEverywhere(queryClient, post.id, (p) => ({
        ...p,
        likedByMe: !p.likedByMe,
        likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
      }));
      toast.error("Couldn't update your like");
    },
  });
}

export function useToggleRepost(viewerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: FeedPost) => {
      if (!viewerId) throw new Error("Not signed in");
      if (post.repostedByMe) {
        const { error } = await supabase
          .from("post_reposts")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", viewerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_reposts")
          .insert({ post_id: post.id, user_id: viewerId });
        if (error) throw error;
      }
      return post;
    },
    onMutate: async (post) => {
      patchPostEverywhere(queryClient, post.id, (p) => ({
        ...p,
        repostedByMe: !p.repostedByMe,
        repostCount: p.repostCount + (p.repostedByMe ? -1 : 1),
      }));
    },
    onSuccess: (post) => {
      toast.success(post.repostedByMe ? "Repost removed" : "Reposted to your followers");
    },
    onError: (_err, post) => {
      patchPostEverywhere(queryClient, post.id, (p) => ({
        ...p,
        repostedByMe: !p.repostedByMe,
        repostCount: p.repostCount + (p.repostedByMe ? -1 : 1),
      }));
      toast.error("Couldn't update your repost");
    },
  });
}

export function useToggleBookmark(viewerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: FeedPost) => {
      if (!viewerId) throw new Error("Not signed in");
      if (post.bookmarkedByMe) {
        const { error } = await supabase
          .from("post_bookmarks")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", viewerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_bookmarks")
          .insert({ post_id: post.id, user_id: viewerId });
        if (error) throw error;
      }
      return post;
    },
    onMutate: async (post) => {
      patchPostEverywhere(queryClient, post.id, (p) => ({
        ...p,
        bookmarkedByMe: !p.bookmarkedByMe,
      }));
    },
    onSuccess: (post) => {
      toast.success(post.bookmarkedByMe ? "Removed from saved" : "Saved to your bookmarks");
      void queryClient.invalidateQueries({ queryKey: ["posts", "bookmarks"] });
    },
    onError: (_err, post) => {
      patchPostEverywhere(queryClient, post.id, (p) => ({
        ...p,
        bookmarkedByMe: !p.bookmarkedByMe,
      }));
      toast.error("Couldn't update your bookmark");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      removePostEverywhere(queryClient, postId);
      toast.success("Post deleted");
    },
    onError: () => toast.error("Couldn't delete that post"),
  });
}

export function useToggleFollow(viewerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, following }: { targetId: string; following: boolean }) => {
      if (!viewerId) throw new Error("Not signed in");
      if (following) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", viewerId)
          .eq("following_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: viewerId, following_id: targetId });
        if (error) throw error;
      }
      return !following;
    },
    onSuccess: (nowFollowing) => {
      toast.success(nowFollowing ? "Followed" : "Unfollowed");
      void queryClient.invalidateQueries({ queryKey: ["follow"] });
      void queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      void queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
    onError: () => toast.error("Couldn't update follow"),
  });
}

export function useAddComment(viewerId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!viewerId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: postId, user_id: viewerId, content });
      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      patchPostEverywhere(queryClient, postId, (p) => ({ ...p, commentCount: p.commentCount + 1 }));
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: () => toast.error("Couldn't post your reply"),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      patchPostEverywhere(queryClient, postId, (p) => ({
        ...p,
        commentCount: Math.max(0, p.commentCount - 1),
      }));
      void queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Reply deleted");
    },
    onError: () => toast.error("Couldn't delete that reply"),
  });
}
