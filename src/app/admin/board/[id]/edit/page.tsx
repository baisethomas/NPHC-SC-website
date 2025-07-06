import { getBoardMemberById } from "@/lib/data";
import { notFound } from 'next/navigation';
import { EditBoardMemberForm } from "./edit-form";

export default function EditBoardMemberPage({ params }: { params: { id: string } }) {
  const member = getBoardMemberById(params.id);

  if (!member) {
    notFound();
  }

  return <EditBoardMemberForm member={member} />;
}
