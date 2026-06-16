import { TransportistaCargaDetailPage } from "@/components/pages/transportista-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <TransportistaCargaDetailPage id={Number(params.id)} />;
}
