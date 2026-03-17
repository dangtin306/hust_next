import ProfileNav from "@/app/shop/resources/ProfileNav";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AccountsProductPlaySlugPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-[60vh] py-2">
      <ProfileNav slug={slug} />
    </div>
  );
}
