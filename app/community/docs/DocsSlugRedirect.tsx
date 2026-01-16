import { redirect } from "next/navigation";

export default async function DocsSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/community/docs/${slug}`);
}
