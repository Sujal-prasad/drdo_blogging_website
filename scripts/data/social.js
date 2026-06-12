/* =========================================================
   SOCIAL — comments (responses) + follows, backed by Supabase.
   Requires the comments + follows tables from supabase/schema.sql.
   ========================================================= */

window.Social = (function () {
  const live = window.isSupabaseConfigured();
  const sb = () => window.sb;

  async function uid() {
    if (!live || !sb()) return null;
    const { data: { user } } = await sb().auth.getUser();
    return user ? user.id : null;
  }

  /* ---- comments ---- */
  async function getComments(articleId) {
    if (!live || !sb()) return [];
    const { data, error } = await sb().from("comments")
      .select("*").eq("article_id", articleId).order("created_at", { ascending: true });
    return error ? [] : (data || []);
  }
  async function addComment(articleId, body, authorName) {
    if (!live || !sb()) throw new Error("Sign in to respond.");
    const me = await uid();
    const { data, error } = await sb().from("comments")
      .insert({ article_id: articleId, user_id: me, author_name: authorName, body }).select().single();
    if (error) throw error;
    return data;
  }
  async function deleteComment(commentId) {
    if (!live || !sb()) return;
    await sb().from("comments").delete().eq("id", commentId);
  }

  /* ---- follows ---- */
  async function isFollowing(authorId) {
    if (!live || !sb() || !authorId) return false;
    const me = await uid(); if (!me) return false;
    const { data } = await sb().from("follows")
      .select("author_id").eq("follower_id", me).eq("author_id", authorId).maybeSingle();
    return !!data;
  }
  async function follow(authorId) {
    const me = await uid(); if (!me || !sb()) return;
    await sb().from("follows").insert({ follower_id: me, author_id: authorId });
  }
  async function unfollow(authorId) {
    const me = await uid(); if (!me || !sb()) return;
    await sb().from("follows").delete().eq("follower_id", me).eq("author_id", authorId);
  }
  async function followerCount(authorId) {
    if (!live || !sb() || !authorId) return 0;
    const { count } = await sb().from("follows")
      .select("*", { count: "exact", head: true }).eq("author_id", authorId);
    return count || 0;
  }

  return { uid, getComments, addComment, deleteComment, isFollowing, follow, unfollow, followerCount };
})();
