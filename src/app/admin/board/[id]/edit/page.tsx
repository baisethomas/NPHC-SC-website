import { getBoardMemberById } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditBoardMemberForm } from "./edit-form";

export default async function EditBoardMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getBoardMemberById(id);

  if (!member) {
    notFound();
  }

  return <EditBoardMemberForm member={member} />;
}
