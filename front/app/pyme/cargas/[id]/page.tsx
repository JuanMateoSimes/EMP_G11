import { PymeCargaDetailPage } from "@/components/pages/pyme-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <PymeCargaDetailPage id={Number(params.id)} />;
}
