import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatNoteDate, getAllFieldNotes, getFieldNote } from "@/lib/notes";
import { Inspectable } from "@/components/xray/Inspectable";

import styles from "../FieldNotes.module.css";

interface FieldNotePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllFieldNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: FieldNotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getFieldNote(slug);
  if (!note) return {};

  return {
    title: `${note.title} | Field Notes`,
    description: note.thesis,
    alternates: { canonical: `/field-notes/${note.slug}` },
    openGraph: {
      type: "article",
      title: note.title,
      description: note.thesis,
      publishedTime: `${note.publishedAt}T00:00:00.000Z`,
      tags: note.tags
    }
  };
}

export default async function FieldNotePage({ params }: FieldNotePageProps) {
  const { slug } = await params;
  const note = getFieldNote(slug);
  if (!note) notFound();

  const NoteBody = note.Component;

  return (
    <Inspectable as="main" metadata={{ id: "field-note-mdx", component: "FieldNotePage", route: `/field-notes/${note.slug}`, execution: "static", source: "compiled repository MDX" }} className={styles.notePage} id="main-content" data-xray="field-note-mdx">
      <header className={styles.articleHeader}>
        <span className={styles.articleSequence}>{note.sequence}</span>
        <div>
          <Link className={styles.backLink} href="/field-notes">
            <ArrowLeft size={13} aria-hidden="true" /> All field notes
          </Link>
          <h1>{note.title}</h1>
          <p className={styles.articleThesis}>{note.thesis}</p>
          <div className={styles.articleMeta}>
            <time dateTime={note.publishedAt}>{formatNoteDate(note.publishedAt)}</time>
            <span>{note.readingTime} READ</span>
            <span>{note.tags.join(" / ")}</span>
            <span>CONTENT: MDX</span>
          </div>
        </div>
      </header>

      <div className={styles.articleFrame}>
        <span className={styles.readingRail}>STATIC CONTENT / ENGINEERING NOTE</span>
        <article className={styles.prose}>
          <NoteBody />
        </article>
        <aside className={styles.articleAside} aria-label="Content architecture">
          <strong>Content path</strong>
          <span>Repository</span>
          <span>MDX compile</span>
          <span>Static route</span>
          <span>Browser</span>
        </aside>
      </div>

      <nav className={styles.related} aria-label="Related systems and notes">
        <span>RELATED</span>
        <div className={styles.relatedLinks}>
          {note.related.map((link) => (
            <Link href={link.href} key={link.href}>
              <span className={styles.relatedKind}>{link.kind}</span>
              <span>{link.label}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </nav>
    </Inspectable>
  );
}
