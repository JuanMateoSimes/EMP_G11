import { PymeViajeDetailPage } from "@/components/pages/pyme-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <PymeViajeDetailPage id={Number(params.id)} />;
}
