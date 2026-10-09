"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BadgeCheck, Megaphone, Newspaper, Pin } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const OFFICIAL_STORE_ID = "store-noormexa-official";
const OFFICIAL_STORE_PATH = "/store/noormexa-flagship-direct";

type OfficialPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean | null;
  created_at: string | null;
};

export default function OfficialStoreUpdates({ isAr }: { isAr: boolean }) {
  const [posts, setPosts] = useState<OfficialPost[]>([]);

  useEffect(() => {
    let active = true;

    // Published rows from the official store are the sole content authority.
    // Do not fill the section with local demo/fixture offers on empty/error.
    void supabase
      .from("marketing_posts")
      .select("id,title,content,image_url,is_pinned,created_at")
      .eq("store_id", OFFICIAL_STORE_ID)
      .eq("status", "published")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Could not load official NOORMEXA updates:", error.message);
          return;
        }
        setPosts((data ?? []) as OfficialPost[]);
      });

    return () => { active = false; };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="noormexa-official-news-title" className="py-12 md:py-16 border-b border-line bg-surface">
      <div className="noormexa-container space-y-7">
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 font-black text-xs border border-orange-500/20">
              <BadgeCheck size={13} />
              {isAr ? "متجر NOORMEXA الرسمي" : "NOORMEXA Official Store"}
            </span>
            <h2 id="noormexa-official-news-title" className="text-2xl sm:text-3xl font-black text-foreground">
              {isAr ? "مستجدات NOORMEXA الرسمية" : "Official NOORMEXA Updates"}
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              {isAr ? "آخر المنشورات المعتمدة من فريق المتجر الرسمي" : "Latest published updates from the official store team"}
            </p>
          </div>
          <Link href={OFFICIAL_STORE_PATH} className="inline-flex items-center gap-2 px-4 py-2.5 border border-line bg-surface-soft hover:border-orange-500 rounded-xl font-black text-xs text-foreground transition-colors">
            {isAr ? "زيارة المتجر الرسمي" : "Visit Official Store"}
            {isAr ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface-soft shadow-xs">
              {post.image_url ? (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image src={post.image_url} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div aria-hidden="true" className="h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-600 flex items-center justify-center">
                  <Newspaper size={32} className="text-white/80" />
                </div>
              )}
              <div className="flex-1 p-5 space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <Megaphone size={13} className="text-orange-500" />
                  <span>{isAr ? "من المتجر الرسمي" : "Official Store"}</span>
                  {post.is_pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-600 font-bold">
                      <Pin size={11} /> {isAr ? "مثبت" : "Pinned"}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black text-foreground leading-relaxed">{post.title}</h3>
                <p className="text-xs text-muted leading-6">{post.content}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
