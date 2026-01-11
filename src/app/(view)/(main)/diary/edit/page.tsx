import DiaryEdit from '@/features/diary/components/diaryEdit';

export default async function EditPage({ searchParams }: any) {
  // const date = searchParams.date; // "YYYY-MM-DD"
  // const res = await getDiaryByDateAction(date);
  // if (!res.ok) return <div>Not found</div>;

  return <DiaryEdit />;
}
