import { TransportistaViajeDetailPage } from "@/components/pages/transportista-pages";

export default function Page({ params }: { params: { id: string } }) {
  return <TransportistaViajeDetailPage id={Number(params.id)} />;
}
