import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { formatNoteDate, getAllFieldNotes } from "@/lib/notes";
import { Inspectable } from "@/components/xray/Inspectable";

import styles from "./FieldNotes.module.css";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Engineering notes on event systems, local AI, reliability, infrastructure, and observable software behavior."
};

export default function FieldNotesPage() {
  const notes = getAllFieldNotes();

  return (
    <Inspectable as="main" metadata={{ id: "field-notes-index", component: "FieldNotesPage", route: "/field-notes", execution: "static", source: "repository MDX registry" }} className={styles.notesPage} id="main-content" data-xray="field-notes-index">
      <header className={styles.indexIntro}>
        <div>
          <span className={styles.eyebrow}>TECHNICAL RECORD / STATIC MDX</span>
          <h1>Field Notes</h1>
        </div>
        <div>
          <span className={styles.notesCount}>{notes.length} NOTES / SOURCE: REPOSITORY</span>
          <p>
            Working explanations of system boundaries, transport choices, retrieval behavior, and
            failure modes. Written to make the decisions inspectable.
          </p>
        </div>
      </header>

      <ol className={styles.noteIndex}>
        {notes.map((note) => (
          <li className={styles.indexItem} key={note.slug}>
            <Link className={styles.indexLink} href={`/field-notes/${note.slug}`}>
              <span className={styles.indexSequence}>{note.sequence}</span>
              <span className={styles.indexMeta}>
                <time dateTime={note.publishedAt}>{formatNoteDate(note.publishedAt)}</time>
                <span>{note.readingTime} READ</span>
                <span>{note.tags.join(" / ")}</span>
              </span>
              <span className={styles.indexCopy}>
                <h2>{note.title}</h2>
                <p>{note.thesis}</p>
              </span>
              <ArrowUpRight className={styles.indexArrow} size={18} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </Inspectable>
  );
}
