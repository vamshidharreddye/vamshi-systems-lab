import type { Metadata } from "next";
import { SystemsExperience } from "@/components/systems/SystemsExperience";

export const metadata: Metadata = { title: "Systems", description: "Five interactive engineering-system explorations by Vamshi Endurthi." };
export default function SystemsPage() { return <SystemsExperience />; }
