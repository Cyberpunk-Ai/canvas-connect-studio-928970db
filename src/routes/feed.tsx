import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Home,
  Compass,
  Radio,
  MessagesSquare,
  Bell,
  Bookmark,
  User,
  Settings,
  Plus,
  Search,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
  LogOut,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Profile } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Your Lumen Feed — Moments, Spaces & Creators" },
      {
        name: "description",
        content:
          "Your personal Lumen home: share a moment, follow live Spaces, track your activity, and discover trending creators.",
      },
      { property: "og:title", content: "Your Lumen Feed" },
      {
        property: "og:description",
        content: "Share moments, join live Spaces, and discover creators on Lumen.",
      },
    ],
  }),
  component: FeedPage,
});

type Post = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: Pick<Profile, "username" | "display_name" | "avatar_url"> | null;
  post_likes: { user_id: string }[];
};

const navItems = [
  { label: "Home", icon: Home, badge: null as string | null },
  { label: "Explore", icon: Compass, badge: null },
  { label: "Spaces", icon: Radio, badge: null },
  { label: "Messages", icon: MessagesSquare, badge: "3" },
  { label: "Notifications", icon: Bell, badge: "9+" },
  { label: "Bookmarks", icon: Bookmark, badge: null },
  { label: "Profile", icon: User, badge: null },
  { label: "Settings", icon: Settings, badge: null },
];

const stories = ["Clara", "Marcus", "Yuki", "Diego", "Priya", "Tomás"];
const trending = [
  { cat: "Design · Trending", tag: "#LumenDesign", count: "12.4k posts" },
  { cat: "Tech · Trending", tag: "#SpatialComputing", count: "8.2k posts" },
  { cat: "Photography", tag: "#GoldenHour", count: "6.9k posts" },
];
const suggestions = [
  { name: "Liam Vance", handle: "@liamv", meta: "24 mutual" },
  { name: "Mara Solis", handle: "@marasolis", meta: "11 mutual" },
  { name: "Noah Kim", handle: "@noahkim", meta: "9 mutual" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Ava({ name, url, size = "h-10 w-10 text-xs" }: { name: string; url?: string | null | undefined; size?: string }) {
  if (url) return <img src={url} alt={name} className={`${size} shrink-0 rounded-full object-cover`} />;
  return (
    <span
      className={`${size} inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-pink font-bold text-white`}
    >
      {initials(name)}
    </span>
  );
}

function FeedPage() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [active, setActive] = useState("Home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, content, image_url, created_at, user_id, profiles(username, display_name, avatar_url), post_likes(user_id)")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts((data as unknown as Post[]) ?? []);
    setFeedLoading(false);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, content: draft.trim() });
    if (error) {
      toast.error("Couldn't publish your post", { description: error.message });
      setPosting(false);
      return;
    }
    setDraft("");
    await load();
    setPosting(false);
    toast.success("Posted to your feed");
  }

  async function toggleLike(post: Post) {
    if (!user) return;
    const liked = post.post_likes.some((l) => l.user_id === user.id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              post_likes: liked
                ? p.post_likes.filter((l) => l.user_id !== user.id)
                : [...p.post_likes, { user_id: user.id }],
            }
          : p
      )
    );
    const { error } = liked
      ? await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id)
      : await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    if (error) {
      toast.error("Couldn't update your like");
      await load();
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const me = profile?.display_name ?? "You";

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-pink">
              <Zap className="h-5 w-5 fill-white text-white" />
            </span>
            <span className="text-2xl font-extrabold tracking-tight">Lumen</span>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActive(item.label)}
                className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  active === item.label
                    ? "bg-gradient-to-r from-brand to-brand-pink text-white shadow-glow"
                    : "text-gray-600 hover:bg-card"
                }`}
              >
                <span className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.badge && (
                    <span className="absolute -right-2 -top-2 rounded-full bg-brand-pink px-1.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
          <button className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-brand-pink py-3.5 font-bold text-white shadow-glow transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Create post
          </button>

          <div className="glass-panel mt-auto flex items-center gap-3 rounded-2xl p-3 shadow-soft">
            <Ava name={me} url={profile?.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{me}</p>
              <p className="truncate text-xs text-gray-500">@{profile?.username ?? "you"}</p>
            </div>
            <button onClick={() => signOut()} aria-label="Sign out" className="p-2 text-gray-400 hover:text-brand">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1 space-y-6">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-soft">
            <h1 className="text-2xl font-extrabold tracking-tight">{active}</h1>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-brand-pink">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-pink" /> Live (3)
              </span>
              <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-card px-4 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search Lumen..."
                  className="w-24 bg-transparent text-sm outline-none placeholder:text-gray-400 sm:w-44"
                />
              </label>
              <button onClick={() => signOut()} className="text-sm font-semibold text-gray-500 hover:text-brand lg:hidden">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stories */}
          <div className="glass-panel flex gap-5 overflow-x-auto rounded-3xl px-5 py-4 shadow-soft">
            <button className="flex shrink-0 flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-brand/40 bg-card text-brand">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-medium text-gray-500">Your moment</span>
            </button>
            {stories.map((s) => (
              <button key={s} className="flex shrink-0 flex-col items-center gap-2">
                <span className="rounded-full bg-gradient-to-tr from-brand via-brand-pink to-brand-orange p-[2px]">
                  <span className="block rounded-full bg-card p-[2px]">
                    <Ava name={s} size="h-12 w-12 text-xs" />
                  </span>
                </span>
                <span className="text-[11px] font-medium text-gray-600">{s}</span>
              </button>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={submitPost} className="glass-panel rounded-3xl p-5 shadow-soft">
            <div className="flex gap-4">
              <Ava name={me} url={profile?.avatar_url} />
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share a moment..."
                rows={2}
                className="flex-1 resize-none bg-transparent pt-2 text-base outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-200/70 pt-3">
              <div className="flex gap-2 text-gray-400">
                <span className="rounded-xl p-2 transition-colors hover:bg-card hover:text-brand">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <span className="rounded-xl p-2 transition-colors hover:bg-card hover:text-brand">
                  <Radio className="h-5 w-5" />
                </span>
                <span className="rounded-xl p-2 transition-colors hover:bg-card hover:text-brand">
                  <Compass className="h-5 w-5" />
                </span>
              </div>
              <button
                type="submit"
                disabled={posting || !draft.trim()}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-pink px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {posting && <Loader2 className="h-4 w-4 animate-spin" />} Post
              </button>
            </div>
          </form>

          {/* Feed */}
          {feedLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center shadow-soft">
              <p className="text-lg font-bold">Your feed is quiet</p>
              <p className="mt-2 text-gray-500">Share your first moment above and it will show up right here.</p>
            </div>
          ) : (
            posts.map((post) => {
              const name = post.profiles?.display_name ?? "Member";
              const liked = post.post_likes.some((l) => l.user_id === user.id);
              return (
                <article key={post.id} className="glass-panel rounded-3xl p-5 shadow-soft sm:p-6">
                  <div className="flex gap-4">
                    <Ava name={name} url={post.profiles?.avatar_url} size="h-11 w-11 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-bold">{name}</span>
                        <span className="text-gray-500">@{post.profiles?.username ?? "member"}</span>
                        <span className="text-gray-400">· {timeAgo(post.created_at)}</span>
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
                        {post.content}
                      </p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt=""
                          loading="lazy"
                          className="mt-4 w-full rounded-2xl object-cover"
                        />
                      )}
                      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                        <button
                          onClick={() => toggleLike(post)}
                          className={`flex items-center gap-1.5 transition-colors ${liked ? "text-brand-pink" : "hover:text-brand-pink"}`}
                        >
                          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                          {post.post_likes.length}
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" /> 0
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Repeat2 className="h-4 w-4" /> 0
                        </span>
                        <span className="ml-auto flex items-center gap-1.5">
                          <Eye className="h-4 w-4" /> {post.post_likes.length * 37 + 12}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </main>

        {/* Right rail */}
        <aside className="sticky top-6 hidden h-fit w-80 shrink-0 space-y-6 xl:block">
          <section className="glass-panel rounded-3xl p-5 shadow-soft">
            <h2 className="mb-4 font-bold">Your Activity</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { v: "4,289", l: "Followers" },
                { v: "982", l: "Profile Views" },
                { v: "88.4%", l: "Engagement" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-lg font-extrabold gradient-text">{s.v}</p>
                  <p className="text-[11px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 shadow-soft">
            <h2 className="mb-4 font-bold">Trending Now</h2>
            <div className="space-y-3">
              {trending.map((t) => (
                <div key={t.tag} className="flex items-center justify-between rounded-2xl px-2 py-2 hover:bg-card">
                  <div>
                    <p className="text-[11px] text-gray-400">{t.cat}</p>
                    <p className="text-sm font-bold">{t.tag}</p>
                    <p className="text-[11px] text-gray-500">{t.count}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 font-bold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-pink" /> Live Spaces
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {["Clara", "Kai", "Ines"].map((n) => (
                  <Ava key={n} name={n} size="h-8 w-8 text-[10px]" />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">Design Critique w/ Clara</p>
                <p className="text-[11px] text-gray-500">128 listening</p>
              </div>
              <button className="rounded-full bg-gradient-to-r from-brand to-brand-pink px-4 py-1.5 text-xs font-bold text-white">
                Join
              </button>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 shadow-soft">
            <h2 className="mb-4 font-bold">Who to Follow</h2>
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s.handle} className="flex items-center gap-3">
                  <Ava name={s.name} size="h-9 w-9 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{s.name}</p>
                    <p className="truncate text-[11px] text-gray-500">
                      {s.handle} · {s.meta}
                    </p>
                  </div>
                  <button className="rounded-full bg-gradient-to-r from-brand to-brand-pink px-4 py-1.5 text-xs font-bold text-white">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass-panel fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-3 shadow-lift lg:hidden">
        {[navItems[0], navItems[1], null, navItems[3], navItems[6]].map((item, i) =>
          item ? (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              aria-label={item.label}
              className={active === item.label ? "text-brand" : "text-gray-400"}
            >
              <item.icon className="h-6 w-6" />
            </button>
          ) : (
            <button
              key={i}
              aria-label="Create post"
              className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-brand to-brand-pink text-white shadow-glow"
            >
              <Plus className="h-6 w-6" />
            </button>
          )
        )}
      </nav>
    </div>
  );
}
