import { getMissionById } from "@/lib/firestore";
import { notFound } from "next/navigation";
import { MissionDetail } from "@/components/missions/MissionDetail";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MissionPage({ params }: PageProps) {
  const mission = await getMissionById(params.id);

  if (!mission) {
    notFound();
  }

  return <MissionDetail initialMission={mission} />;
}
