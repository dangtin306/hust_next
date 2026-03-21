import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AccountsProductPlaySlugPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/resources/play/${encodeURIComponent(slug)}`);
}
