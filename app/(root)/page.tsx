/* eslint-disable @typescript-eslint/no-explicit-any */
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/components/Header";
import AddDocumentBtn from "@/components/AddDocumentBtn";
import { getDocuments } from "@/lib/actions/room.actions";
import Link from "next/link";
import { dateConverter } from "@/lib/utils";

const Home = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const documents = await getDocuments(
    clerkUser.emailAddresses[0].emailAddress
  );

  return (
    <main className="home-container">
      <Header className="sticky top-0 left-0">
        <div className="flex items-center gap-2 lg:gap-4">
          Notification
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {documents.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold ">All Documents</h3>
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>
          <ul className="document-ul">
            {documents.data.map((document: any) => (
              <li key={document.id} className="document-list-item">
                <Link
                  href={`/documents/${document.id}`}
                  className="flex flex-1 items-center gap-4"
                >
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image
                      src="/assets/icons/doc.svg"
                      alt="file"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-lg">
                      {document.metadata.title}
                    </p>
                    <p className="text-sm font-light text-blue-100">
                      Created about {dateConverter(document.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.svg"
            alt="document"
            width={40}
            height={40}
            className="mx-auto"
          />
          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
};

export default Home;
