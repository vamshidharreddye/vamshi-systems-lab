import type { Metadata } from "next";

import { LabExperience } from "@/components/lab/LabExperience";
import { isExperimentId } from "@/lib/lab/models";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Interactive engineering instruments for retries, backpressure, retrieval, routing, and latency budgets.",
};

interface LabPageProps {
  searchParams: Promise<{ experiment?: string | string[] }>;
}

export default async function LabPage({ searchParams }: LabPageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.experiment)
    ? params.experiment[0]
    : params.experiment;
  const initialExperiment = isExperimentId(requested)
    ? requested
    : "retry-storm";

  return <LabExperience initialExperiment={initialExperiment} />;
}
