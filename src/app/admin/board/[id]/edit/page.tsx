import { getBoardMemberById } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditBoardMemberForm } from "./edit-form";

export default async function EditBoardMemberPage({ params }: { params: { id: string } }) {
  const member = await getBoardMemberById(params.id);

  if (!member) {
    notFound();
  }

  return <EditBoardMemberForm member={member} />;
}
